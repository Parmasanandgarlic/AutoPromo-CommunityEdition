import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relative: string) => fs.readFileSync(path.join(root, relative), 'utf8');

describe('Community Edition local control-plane security', () => {
  it('never packages the runtime credential database', () => {
    const pkg = JSON.parse(read('package.json'));
    const files = pkg.build?.files ?? [];
    expect(files).not.toContain('agent_db.json');
  });

  it('does not inject server AI credentials into the Vite browser build', () => {
    const vite = read('vite.config.ts');
    expect(vite).not.toContain('GEMINI_API_KEY');
    expect(vite).not.toContain('loadEnv(');
  });

  it('binds the privileged API to loopback and rejects old origin-trust shortcuts', () => {
    const compiler = read('src/compiler/index.ts');
    expect(compiler).toContain("const BIND_HOST = '127.0.0.1'");
    expect(compiler).toContain("app.set('trust proxy', false)");
    expect(compiler).toContain("req.header('sec-fetch-site') === 'cross-site'");
    expect(compiler).not.toContain("origin.endsWith('.run.app')");
    expect(compiler).not.toContain("x-forwarded-host");
    expect(compiler).not.toContain('app.listen(PORT, "0.0.0.0"');
  });

  it('redacts credential-bearing API response objects', () => {
    const compiler = read('src/compiler/index.ts');
    expect(compiler).toContain('res.json(safeSession(session))');
    expect(compiler).toContain('res.json(safeTwitterAccount(account))');
    expect(compiler).toContain('res.json(safeScheduledAction(scheduledAction))');
    expect(compiler).toContain('apiKeyConfigured: Boolean(_apiKey)');
    expect(compiler).toContain('passwordConfigured: Boolean(_pass)');
  });

  it('keeps Electron sandboxed on the loopback application origin', () => {
    const electron = read('electron-main.ts');
    expect(electron).toContain('sandbox: true');
    expect(electron).toContain("const DESKTOP_URL = 'http://127.0.0.1:3000/tool.html'");
    expect(electron).toContain("setWindowOpenHandler(() => ({ action: 'deny' }))");
  });
});
