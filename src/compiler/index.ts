import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';
import rateLimit from "express-rate-limit";
import { db } from "../agent/db.js";
import { sessionManager } from "../agent/sessionManager.js";
import { listener } from "../agent/listener.js";
import { scraper } from "../agent/scraper.js";
import { operator } from "../agent/operator.js";
import { engagement } from "../agent/engagement.js";
import { twitterAutomation } from "../agent/twitter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCAL_ORIGINS = new Set([
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

function safeSession(session: any) {
  return {
    id: session.id,
    name: session.name,
    phone_number: session.phone_number
      ? `${String(session.phone_number).substring(0, 4)}****${String(session.phone_number).slice(-2)}`
      : 'hidden',
    status: session.status,
    created_at: session.created_at,
    is_authenticated: !!session.session_string,
  };
}

function safeTwitterAccount(account: any) {
  return {
    id: account.id,
    name: account.name,
    status: account.status,
    created_at: account.created_at,
  };
}

function safeScheduledAction(action: any) {
  const safeAction: any = { ...action };
  if (safeAction.aiConfig) {
    const { apiKey: _apiKey, ...safeAiConfig } = safeAction.aiConfig;
    safeAction.aiConfig = {
      ...safeAiConfig,
      apiKeyConfigured: Boolean(_apiKey),
    };
  }
  if (safeAction.proxy) {
    const { pass: _pass, ...safeProxy } = safeAction.proxy;
    safeAction.proxy = {
      ...safeProxy,
      passwordConfigured: Boolean(_pass),
    };
  }
  return safeAction;
}

function isLoopbackAddress(value: string | undefined): boolean {
  if (!value) return false;
  const normalized = value.replace(/^::ffff:/, '');
  return normalized === '127.0.0.1' || normalized === '::1';
}

export async function bootstrap() {
  const app = express();
  const PORT = 3000;
  const BIND_HOST = '127.0.0.1';

  // This service holds privileged Telegram/Twitter/AI credentials and can
  // trigger automation actions. Community Edition therefore exposes it only as
  // a loopback desktop control plane. A remotely reachable deployment needs a
  // real authenticated multi-user boundary, not a permissive CORS rule.
  app.set('trust proxy', false);
  app.disable('x-powered-by');

  app.use(cors((req, callback) => {
    const origin = req.header('origin');
    if (!origin) return callback(null, { origin: false });
    if (LOCAL_ORIGINS.has(origin)) {
      return callback(null, { origin: true, credentials: false });
    }
    return callback(new Error('CORS Policy Rejected Request'), { origin: false });
  }));

  app.use(express.json({ limit: '100kb' }));

  // Browser CORS is not an authorization primitive. Independently require API
  // traffic to arrive over loopback and reject cross-site browser requests.
  app.use('/api/', (req, res, next) => {
    if (!isLoopbackAddress(req.socket.remoteAddress)) {
      return res.status(403).json({ error: 'Local API access only.' });
    }
    const origin = req.header('origin');
    if (origin && !LOCAL_ORIGINS.has(origin)) {
      return res.status(403).json({ error: 'Cross-origin API access denied.' });
    }
    if (req.header('sec-fetch-site') === 'cross-site') {
      return res.status(403).json({ error: 'Cross-site API access denied.' });
    }
    next();
  });

  const globalApiLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 100,
    message: { error: "Global API limit exceeded. Too many requests." },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', globalApiLimiter);

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/sessions", async (_req, res) => {
    const sessions = await db.getSessions();
    res.json(sessions.map(safeSession));
  });

  app.post("/api/sessions", async (req, res) => {
    const { name, apiId, apiHash, phoneNumber } = req.body;
    try {
      const session = await sessionManager.createSession(name, apiId, apiHash, phoneNumber);
      res.json(safeSession(session));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  const sessionAuthLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 15,
    message: { error: "Too many authentication tracking attempts." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.post("/api/sessions/:id/verify", sessionAuthLimiter, async (req, res) => {
    const { id } = req.params;
    const { phoneCode, password } = req.body;
    try {
      const session = await sessionManager.verifySession(Number(id), phoneCode, password);
      res.json(safeSession(session));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/sessions/:id", async (req, res) => {
    const { id } = req.params;
    try {
      await sessionManager.deleteSession(Number(id));
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/keywords", async (_req, res) => {
    res.json(await db.getKeywords());
  });

  app.post("/api/keywords", async (req, res) => {
    const { keyword } = req.body;
    try {
      await db.addKeyword(keyword);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/keywords/:id", async (req, res) => {
    const { id } = req.params;
    try {
      await db.deleteKeyword(Number(id));
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/groups", async (_req, res) => {
    res.json(await db.getGroups());
  });

  app.post("/api/groups", async (req, res) => {
    const { groupId, name } = req.body;
    try {
      await db.addGroup(groupId, name);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/groups/:id", async (req, res) => {
    const { id } = req.params;
    try {
      await db.deleteGroup(Number(id));
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/users", async (_req, res) => {
    res.json(await db.getScrapedUsers());
  });

  app.get("/api/logs", async (_req, res) => {
    res.json(await db.getLogs());
  });

  app.post("/api/actions/scrape", async (req, res) => {
    const { sessionId, groupId } = req.body;
    try {
      await scraper.scrapeGroup(sessionId, groupId);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/actions/start-listener", async (req, res) => {
    const { sessionId } = req.body;
    try {
      await listener.start(sessionId);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/actions/stop-listener", async (_req, res) => {
    try {
      await listener.stop();
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/actions/start-operator", async (req, res) => {
    const { sessionId, template, maxPerDay } = req.body;
    try {
      await operator.start(sessionId, template, maxPerDay);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/actions/stop-operator", async (_req, res) => {
    try {
      await operator.stop();
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/actions/engage", async (req, res) => {
    const { sessionId, target, action, emoji } = req.body;
    try {
      await engagement.engage(sessionId, target, action, emoji);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/twitter/action", async (req, res) => {
    const { account, target, action, content, proxy, rateLimitResets, userAgentConfig, aiConfig } = req.body;
    try {
      const accounts = await db.getTwitterAccounts();
      const accountData = accounts.find(a => a.name === account);
      if (!accountData) throw new Error(`Twitter account ${account} not found in database.`);

      const result = await twitterAutomation.executeAction(
        account,
        target,
        action,
        { authToken: accountData.auth_token, ct0: accountData.ct0 },
        content,
        proxy,
        rateLimitResets,
        userAgentConfig,
        aiConfig
      );
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/twitter/status", async (_req, res) => {
    try {
      const accounts = await db.getTwitterAccounts();
      const statuses: Record<string, any> = {};
      for (const account of accounts) {
        statuses[account.name] = twitterAutomation.getAccountStatus(account.name);
      }
      res.json(statuses);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/twitter/status/:account", async (req, res) => {
    const { account } = req.params;
    try {
      res.json(twitterAutomation.getAccountStatus(account));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/twitter/accounts", async (_req, res) => {
    const accounts = await db.getTwitterAccounts();
    res.json(accounts.map(safeTwitterAccount));
  });

  app.post("/api/twitter/accounts", async (req, res) => {
    const { name, authToken, ct0 } = req.body;
    try {
      const account = await db.addTwitterAccount(name, authToken, ct0);
      res.json(safeTwitterAccount(account));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/twitter/accounts/:id", async (req, res) => {
    const { id } = req.params;
    try {
      await db.deleteTwitterAccount(Number(id));
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/twitter/scheduled", async (_req, res) => {
    const actions = await db.getScheduledTwitterActions();
    res.json(actions.map(safeScheduledAction));
  });

  app.post("/api/twitter/scheduled", async (req, res) => {
    const { account, target, action, scheduledAt, content, proxy, rateLimitResets, userAgentConfig, aiConfig } = req.body;
    try {
      const scheduledAction = await db.addScheduledTwitterAction(
        account,
        target,
        action,
        scheduledAt,
        content,
        proxy,
        rateLimitResets,
        userAgentConfig,
        aiConfig
      );
      res.json(safeScheduledAction(scheduledAction));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/twitter/scheduled/:id", async (req, res) => {
    const { id } = req.params;
    try {
      await db.deleteScheduledTwitterAction(Number(id));
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // server.js is emitted beside the packaged dist/ directory.
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  await db.init();

  app.listen(PORT, BIND_HOST, () => {
    console.log(`Server (Compiler Layer) running on http://${BIND_HOST}:${PORT}`);

    sessionManager.init().catch(e => console.error('Failed to init session manager:', e));

    setInterval(async () => {
      try {
        const pendingActions = await db.getPendingScheduledTwitterActions();
        for (const action of pendingActions) {
          try {
            const accounts = await db.getTwitterAccounts();
            const accountData = accounts.find(a => a.name === action.account);
            if (!accountData) throw new Error(`Twitter account ${action.account} not found.`);

            await twitterAutomation.executeAction(
              action.account,
              action.target,
              action.action,
              { authToken: accountData.auth_token, ct0: accountData.ct0 },
              action.content,
              action.proxy,
              action.rateLimitResets,
              action.userAgentConfig,
              action.aiConfig
            );
            await db.updateScheduledTwitterActionStatus(action.id, 'completed');
          } catch (e: any) {
            console.error(`Failed to execute scheduled action ${action.id}:`, e.message);
            await db.updateScheduledTwitterActionStatus(action.id, 'failed', e.message);
          }
        }
      } catch (e: any) {
        console.error('Scheduled actions worker error:', e.message);
      }
    }, 60000);
  });
}
