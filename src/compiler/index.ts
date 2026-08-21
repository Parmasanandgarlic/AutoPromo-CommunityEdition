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

const BIND_HOST = '127.0.0.1';
const LOCAL_ORIGINS = new Set([
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://[::1]:3000',
]);
const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);
const SECRET_RESPONSE_KEYS = new Set([
  'apikey', 'api_key', 'apihash', 'api_hash', 'authtoken', 'auth_token', 'ct0',
  'password', 'pass', 'proxypass', 'proxy_pass', 'privatekey', 'private_key',
  'sessionstring', 'session_string', 'clientsecret', 'client_secret',
  'encryptionkey', 'encryption_key',
]);

function sanitizeForRenderer(value: any): any {
  if (Array.isArray(value)) return value.map(sanitizeForRenderer);
  if (!value || typeof value !== 'object') return value;
  const out: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value)) {
    const normalized = key.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (SECRET_RESPONSE_KEYS.has(normalized)) continue;
    out[key] = sanitizeForRenderer(child);
  }
  return out;
}

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
  const safeAction: any = sanitizeForRenderer(action);
  if (action?.aiConfig) {
    const { apiKey: _apiKey, ...safeAiConfig } = action.aiConfig;
    safeAction.aiConfig = {
      ...sanitizeForRenderer(safeAiConfig),
      apiKeyConfigured: Boolean(_apiKey),
    };
  }
  if (action?.proxy) {
    const { pass: _pass, ...safeProxy } = action.proxy;
    safeAction.proxy = {
      ...sanitizeForRenderer(safeProxy),
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

  // This process can trigger privileged Telegram/Twitter automation and may
  // hold account credentials. Community Edition is a loopback desktop control
  // plane; a remotely reachable deployment requires a separate authenticated
  // multi-user architecture.
  app.set('trust proxy', false);
  app.disable('x-powered-by');

  app.use(cors((req, callback) => {
    const origin = req.header('origin');
    if (!origin) return callback(null, { origin: false, credentials: false });
    if (LOCAL_ORIGINS.has(origin)) {
      return callback(null, { origin: true, credentials: false });
    }
    return callback(new Error('CORS Policy Rejected Request'), { origin: false });
  }));

  app.use(express.json({ limit: '100kb' }));

  // CORS is not an authorization primitive. Independently require loopback
  // transport, an explicit local Host, and non-cross-site browser context.
  app.use('/api/', (req, res, next) => {
    const hostname = req.hostname?.toLowerCase();
    if (!isLoopbackAddress(req.socket.remoteAddress) || !hostname || !LOOPBACK_HOSTS.has(hostname)) {
      return res.status(403).json({ error: 'Local API access only.' });
    }
    const origin = req.header('origin');
    if (origin && !LOCAL_ORIGINS.has(origin)) {
      return res.status(403).json({ error: 'Cross-origin API access denied.' });
    }
    if (req.header('sec-fetch-site') === 'cross-site') {
      return res.status(403).json({ error: 'Cross-site API access denied.' });
    }
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  const globalApiLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Global API limit exceeded. Too many requests." },
  });
  app.use('/api/', globalApiLimiter);

  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

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
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many authentication tracking attempts." },
  });

  app.post("/api/sessions/:id/verify", sessionAuthLimiter, async (req, res) => {
    const { phoneCode, password } = req.body;
    try {
      const session = await sessionManager.verifySession(Number(req.params.id), phoneCode, password);
      res.json(safeSession(session));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/sessions/:id", async (req, res) => {
    try {
      await sessionManager.deleteSession(Number(req.params.id));
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/keywords", async (_req, res) => res.json(await db.getKeywords()));
  app.post("/api/keywords", async (req, res) => {
    try {
      await db.addKeyword(req.body.keyword);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
  app.delete("/api/keywords/:id", async (req, res) => {
    try {
      await db.deleteKeyword(Number(req.params.id));
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/groups", async (_req, res) => res.json(await db.getGroups()));
  app.post("/api/groups", async (req, res) => {
    try {
      await db.addGroup(req.body.groupId, req.body.name);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
  app.delete("/api/groups/:id", async (req, res) => {
    try {
      await db.deleteGroup(Number(req.params.id));
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/users", async (_req, res) => {
    res.json(sanitizeForRenderer(await db.getScrapedUsers()));
  });
  app.get("/api/logs", async (_req, res) => {
    res.json(sanitizeForRenderer(await db.getLogs()));
  });

  app.post("/api/actions/scrape", async (req, res) => {
    try {
      await scraper.scrapeGroup(req.body.sessionId, req.body.groupId);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/actions/start-listener", async (req, res) => {
    try {
      await listener.start(req.body.sessionId);
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
    try {
      await operator.start(req.body.sessionId, req.body.template, req.body.maxPerDay);
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
    try {
      await engagement.engage(req.body.sessionId, req.body.target, req.body.action, req.body.emoji);
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
        aiConfig,
      );
      res.json(sanitizeForRenderer(result));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/twitter/status", async (_req, res) => {
    try {
      const statuses: Record<string, any> = {};
      for (const account of await db.getTwitterAccounts()) {
        statuses[account.name] = twitterAutomation.getAccountStatus(account.name);
      }
      res.json(sanitizeForRenderer(statuses));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
  app.get("/api/twitter/status/:account", async (req, res) => {
    try {
      res.json(sanitizeForRenderer(twitterAutomation.getAccountStatus(req.params.account)));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/twitter/accounts", async (_req, res) => {
    const accounts = await db.getTwitterAccounts();
    res.json(accounts.map(safeTwitterAccount));
  });
  app.post("/api/twitter/accounts", async (req, res) => {
    try {
      const account = await db.addTwitterAccount(req.body.name, req.body.authToken, req.body.ct0);
      res.json(safeTwitterAccount(account));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
  app.delete("/api/twitter/accounts/:id", async (req, res) => {
    try {
      await db.deleteTwitterAccount(Number(req.params.id));
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
        account, target, action, scheduledAt, content, proxy, rateLimitResets, userAgentConfig, aiConfig,
      );
      res.json(safeScheduledAction(scheduledAction));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
  app.delete("/api/twitter/scheduled/:id", async (req, res) => {
    try {
      await db.deleteScheduledTwitterAction(Number(req.params.id));
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    // server.js is emitted beside the packaged dist/ directory.
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  await db.init();

  app.listen(PORT, BIND_HOST, () => {
    console.log(`Server (Compiler Layer) running on http://${BIND_HOST}:${PORT}`);
    sessionManager.init().catch(e => console.error('Failed to init session manager:', e));

    if (process.env.SOCIAL_AUTOMATION_ENABLED !== 'true') {
      console.warn('Background social automation disabled; set SOCIAL_AUTOMATION_ENABLED=true to enable scheduled actions.');
      return;
    }

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
              action.aiConfig,
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
