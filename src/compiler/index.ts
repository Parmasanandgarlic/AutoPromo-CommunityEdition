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

export async function bootstrap() {
  const app = express();
  const PORT = 3000;

  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://autopromo.xyz',
    'https://www.autopromo.xyz'
  ];

  app.use(cors(function (req, callback) {
    const origin = req.header('origin');
    if (!origin) return callback(null, { origin: true, credentials: true });

    const host = req.get('x-forwarded-host') || req.get('host');
    if (origin === `http://${host}` || origin === `https://${host}`) {
      return callback(null, { origin: true, credentials: true });
    }

    if (origin.endsWith('.run.app')) {
      return callback(null, { origin: true, credentials: true });
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, { origin: true, credentials: true });
    }

    return callback(new Error('CORS Policy Rejected Request'), { origin: false });
  }));

  app.use(express.json({ limit: '100kb' }));

  const globalApiLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 100,
    message: { error: "Global API limit exceeded. Too many requests." }
  });
  app.use('/api/', globalApiLimiter);

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/sessions", async (req, res) => {
    const sessions = await db.getSessions();
    const safeSessions = sessions.map(s => ({
      id: s.id,
      name: s.name,
      phone_number: s.phone_number ? s.phone_number.substring(0, 4) + '****' + s.phone_number.slice(-2) : 'hidden',
      status: s.status,
      created_at: s.created_at,
      is_authenticated: !!s.session_string
    }));
    res.json(safeSessions);
  });

  app.post("/api/sessions", async (req, res) => {
    const { name, apiId, apiHash, phoneNumber } = req.body;
    try {
      const session = await sessionManager.createSession(name, apiId, apiHash, phoneNumber);
      res.json(session);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  const sessionAuthLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 15,
    message: { error: "Too many authentication tracking attempts."}
  });

  app.post("/api/sessions/:id/verify", sessionAuthLimiter, async (req, res) => {
    const { id } = req.params;
    const { phoneCode, password } = req.body;
    try {
      const session = await sessionManager.verifySession(Number(id), phoneCode, password);
      res.json(session);
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

  app.get("/api/keywords", async (req, res) => {
    const keywords = await db.getKeywords();
    res.json(keywords);
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

  app.get("/api/groups", async (req, res) => {
    const groups = await db.getGroups();
    res.json(groups);
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

  app.get("/api/users", async (req, res) => {
    const users = await db.getScrapedUsers();
    res.json(users);
  });

  app.get("/api/logs", async (req, res) => {
    const logs = await db.getLogs();
    res.json(logs);
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

  app.post("/api/actions/stop-listener", async (req, res) => {
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

  app.post("/api/actions/stop-operator", async (req, res) => {
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
      if (!accountData) {
        throw new Error(`Twitter account ${account} not found in database.`);
      }

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

  app.get("/api/twitter/status", async (req, res) => {
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
      const status = twitterAutomation.getAccountStatus(account);
      res.json(status);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/twitter/accounts", async (req, res) => {
    const accounts = await db.getTwitterAccounts();
    res.json(accounts.map(a => ({ id: a.id, name: a.name, status: a.status, created_at: a.created_at })));
  });

  app.post("/api/twitter/accounts", async (req, res) => {
    const { name, authToken, ct0 } = req.body;
    try {
      const account = await db.addTwitterAccount(name, authToken, ct0);
      res.json(account);
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

  app.get("/api/twitter/scheduled", async (req, res) => {
    const actions = await db.getScheduledTwitterActions();
    const safeActions = actions.map(a => {
      const safeAction = { ...a };
      if (safeAction.aiConfig && safeAction.aiConfig.apiKey) {
        const key = safeAction.aiConfig.apiKey;
        safeAction.aiConfig.apiKey = key.length > 8 ? `${key.substring(0, 4)}...${key.slice(-4)}` : '****';
      }
      return safeAction;
    });
    res.json(safeActions);
  });

  app.post("/api/twitter/scheduled", async (req, res) => {
    const { account, target, action, scheduledAt, content, proxy, rateLimitResets, userAgentConfig, aiConfig } = req.body;
    try {
      const scheduledAction = await db.addScheduledTwitterAction(account, target, action, scheduledAt, content, proxy, rateLimitResets, userAgentConfig, aiConfig);
      res.json(scheduledAction);
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
    const distPath = path.join(__dirname, '../../dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  await db.init();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server (Compiler Layer) running on http://localhost:${PORT}`);

    sessionManager.init().catch(e => console.error('Failed to init session manager:', e));

    setInterval(async () => {
      try {
        const pendingActions = await db.getPendingScheduledTwitterActions();
        for (const action of pendingActions) {
          try {
            const accounts = await db.getTwitterAccounts();
            const accountData = accounts.find(a => a.name === action.account);
            if (!accountData) {
              throw new Error(`Twitter account ${action.account} not found.`);
            }

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
