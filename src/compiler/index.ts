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

const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);
const LOOPBACK_ORIGINS = new Set([
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://[::1]:3000',
]);
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

export async function bootstrap() {
  const app = express();
  const PORT = 3000;

  app.disable('x-powered-by');

  // Loopback APIs are still vulnerable to DNS rebinding if Host is trusted blindly.
  // Refuse requests whose Host does not resolve to an explicit local UI hostname.
  app.use((req, res, next) => {
    const hostname = req.hostname?.toLowerCase();
    if (!hostname || !LOOPBACK_HOSTS.has(hostname)) {
      return res.status(403).json({ error: 'Local control plane only.' });
    }
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    if (req.path.startsWith('/api/')) res.setHeader('Cache-Control', 'no-store');
    next();
  });

  app.use(cors(function (req, callback) {
    const origin = req.header('origin');
    // Native/local non-browser clients may omit Origin. Browser callers must be
    // the loopback UI served by this process. Cookies are not part of this API.
    if (!origin) return callback(null, { origin: false, credentials: false });
    if (LOOPBACK_ORIGINS.has(origin)) {
      return callback(null, { origin: true, credentials: false });
    }
    return callback(new Error('CORS Policy Rejected Request'), { origin: false });
  }));

  app.use(express.json({ limit: '100kb' }));

  const globalApiLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Global API limit exceeded. Too many requests." }
  });
  app.use('/api/', globalApiLimiter);

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/sessions", async (_req, res) => {
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
      res.json(sanitizeForRenderer({ id: session.id, name: session.name, status: session.status, created_at: session.created_at }));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  const sessionAuthLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many authentication tracking attempts."}
  });

  app.post("/api/sessions/:id/verify", sessionAuthLimiter, async (req, res) => {
    const { id } = req.params;
    const { phoneCode, password } = req.body;
    try {
      const session = await sessionManager.verifySession(Number(id), phoneCode, password);
      res.json(sanitizeForRenderer({ id: session.id, name: session.name, status: session.status, created_at: session.created_at, is_authenticated: true }));
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
    try {
      await db.deleteKeyword(Number(req.params.id));
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
    const { sessionId, groupId } = req.body;
    try {
      await scraper.scrapeGroup(sessionId, groupId);
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
    res.json(accounts.map(a => ({ id: a.id, name: a.name, status: a.status, created_at: a.created_at })));
  });

  app.post("/api/twitter/accounts", async (req, res) => {
    const { name, authToken, ct0 } = req.body;
    try {
      const account = await db.addTwitterAccount(name, authToken, ct0);
      res.json(sanitizeForRenderer({ id: account.id, name: account.name, status: account.status, created_at: account.created_at }));
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
    res.json(sanitizeForRenderer(await db.getScheduledTwitterActions()));
  });

  app.post("/api/twitter/scheduled", async (req, res) => {
    const { account, target, action, scheduledAt, content, proxy, rateLimitResets, userAgentConfig, aiConfig } = req.body;
    try {
      const scheduledAction = await db.addScheduledTwitterAction(account, target, action, scheduledAt, content, proxy, rateLimitResets, userAgentConfig, aiConfig);
      res.json(sanitizeForRenderer(scheduledAction));
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
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, '../../dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  await db.init();

  app.listen(PORT, "127.0.0.1", () => {
    console.log(`Server (Compiler Layer) running on http://127.0.0.1:${PORT}`);

    sessionManager.init().catch(e => console.error('Failed to init session manager:', e));

    // Background action execution is opt-in. A fresh install must not silently
    // begin social actions simply because persisted schedules exist.
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
