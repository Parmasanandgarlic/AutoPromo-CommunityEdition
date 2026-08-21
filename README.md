# AutoPromo Community Edition

AutoPromo Community Edition is a **local-first desktop automation workspace** for operating a single social account stack from one machine. It combines Telegram audience workflows, X/Twitter engagement actions, scheduling, configurable rate controls, and optional AI-assisted copy generation behind a loopback-only local control plane.

This repository is the open-source Community Edition of AutoPromo. It is intended to be inspectable, self-hosted software for an individual operator—not a remotely exposed multi-tenant service.

## What it demonstrates

- **Desktop application architecture:** React + Vite renderer packaged with Electron.
- **Local automation control plane:** Express API bound to loopback rather than a public interface.
- **Telegram workflows:** authenticated sessions, group discovery/scraping, listening, spintax-assisted outreach and operator controls.
- **X/Twitter workflows:** account state, engagement actions, scheduled actions, configurable pacing and proxy/user-agent options.
- **Pluggable AI:** OpenAI, Anthropic and Google providers can be supplied by the operator for assisted content generation.
- **Stateful agents:** local persistence for sessions, targets, schedules, logs and execution state.
- **Security boundaries:** renderer responses redact credential material; packaged runtime state lives outside the application bundle; browser access is restricted to explicit loopback origins and hosts.

## Architecture

```text
┌───────────────────────────────────────────────────────────┐
│ Electron desktop shell                                    │
│  └─ React / Vite renderer                                 │
│       │  HTTP on loopback only                            │
│       ▼                                                   │
│ Express control plane (127.0.0.1:3000)                    │
│  ├─ session / configuration APIs                          │
│  ├─ Telegram scraper, listener, engagement, operator      │
│  ├─ X/Twitter action + scheduling layer                   │
│  └─ credential redaction + rate / origin / host controls  │
│       │                                                   │
│       ▼                                                   │
│ Local runtime database + external platform connections     │
└───────────────────────────────────────────────────────────┘
```

The important trust decision is that **Community Edition is local software**. The API can initiate privileged automation and may hold platform/session credentials, so it is deliberately not designed as an unauthenticated internet-facing backend. A hosted or multi-user edition requires a separate identity, authorization and secret-management boundary.

## Safety model

The current hardening follows four principles:

1. **Loopback only.** The control API binds to `127.0.0.1` and rejects unexpected Host/origin access rather than treating CORS as authentication.
2. **Secrets stay out of renderer responses and browser persistence.** Telegram session material, X/Twitter credentials, AI keys and proxy passwords are removed from renderer-facing data; older sensitive `localStorage` fields are scrubbed on startup.
3. **Runtime state is not packaged.** Local account/session data belongs in Electron's per-user data directory, not inside the distributable application.
4. **Scheduled execution is opt-in.** Persisted schedules do not execute on a fresh install unless `SOCIAL_AUTOMATION_ENABLED=true` is explicitly configured.

These controls reduce accidental exposure; they do not make automation risk-free. Operators remain responsible for platform terms, account permissions, message content, rate limits and applicable law.

## Project structure

```text
src/
├── agent/
│   ├── db.ts               # local persistence
│   ├── sessionManager.ts   # Telegram session lifecycle
│   ├── scraper.ts          # Telegram audience discovery
│   ├── listener.ts         # Telegram event listener
│   ├── operator.ts         # outbound campaign loop
│   ├── engagement.ts       # Telegram engagement actions
│   └── twitter.ts          # X/Twitter execution layer
├── compiler/
│   └── index.ts            # local Express control plane
└── tool/
    ├── App.tsx             # desktop renderer
    └── main.tsx            # renderer bootstrap + persistence guard

electron-main.ts            # Electron process / navigation boundary
server.ts                   # application server entry point
tests/                      # unit, integration, security and browser tests
```

### Maintainability note

`src/tool/App.tsx` is currently the largest remaining concentration of technical debt. It grew with the product and still owns substantial UI state and orchestration. The preferred future refactor is behavioral decomposition—API client, persisted configuration hooks, campaign controls and tab-level feature components—rather than a cosmetic file split. That work should be landed incrementally behind the existing test suite.

## Development

### Requirements

- Node.js 20+
- npm

```bash
git clone https://github.com/Parmasanandgarlic/AutoPromo-CommunityEdition.git
cd AutoPromo-CommunityEdition
npm ci
npm run dev
```

The local UI and API run at `http://127.0.0.1:3000` / `http://localhost:3000` during development.

### Verification

```bash
npm run lint
npm test
npm run build
npm run build:server
npm run build:electron
npm run test:e2e
```

The repository CI also runs dependency/security checks and validates the desktop/control-plane boundaries.

## Desktop build

```bash
npm run electron:build:win
```

Generated `server.js` and `electron-main.js` bundles are build artifacts and are intentionally not tracked in Git. Electron Builder regenerates them before packaging.

## Configuration

Copy `.env.example` to `.env` for environment-level settings. Account/session credentials are entered through the local application where applicable rather than committed to source control.

Background scheduled execution is disabled by default. Enable it explicitly only when intended:

```env
SOCIAL_AUTOMATION_ENABLED=true
```

## Community Edition vs. AutoPromo

Community Edition is the inspectable, local-first single-operator implementation. Product information and other AutoPromo offerings are available at [autopromo.xyz](https://autopromo.xyz).

The public repository is intentionally useful on its own; the README does not depend on an upgrade to explain what the software is or how it works.

## Responsible use

Use only accounts and data you are authorized to operate. Respect platform terms, anti-spam requirements, privacy obligations and rate limits. Automation should augment accountable human operation, not bypass access controls or conceal abusive behavior.

## License

See the repository license metadata and source headers applicable to your checkout. If redistributing the project, verify the intended license terms before release.
