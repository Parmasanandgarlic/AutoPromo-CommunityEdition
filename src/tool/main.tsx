import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import '../index.css';

const REDACTED_ADVANCED_KEYS = new Set(['proxyPass', 'twitterProxyPass', 'aiApiKey']);

function sanitizeAdvancedConfig(raw: string | null): string | null {
  if (!raw) return raw;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return raw;
    for (const key of REDACTED_ADVANCED_KEYS) delete parsed[key];
    return JSON.stringify(parsed);
  } catch {
    return null;
  }
}

// Remove credentials persisted by older builds before App state is initialized.
const existingAdvancedConfig = sanitizeAdvancedConfig(localStorage.getItem('advancedConfig'));
if (existingAdvancedConfig === null) {
  localStorage.removeItem('advancedConfig');
} else {
  localStorage.setItem('advancedConfig', existingAdvancedConfig);
}

// Preserve non-secret advanced preferences while preventing sensitive fields from
// being written back to browser storage by current or future renderer call sites.
const nativeSetItem = Storage.prototype.setItem;
Storage.prototype.setItem = function secureSetItem(key: string, value: string): void {
  if (this === window.localStorage && key === 'advancedConfig') {
    const sanitized = sanitizeAdvancedConfig(value);
    if (sanitized === null) {
      Storage.prototype.removeItem.call(this, key);
      return;
    }
    nativeSetItem.call(this, key, sanitized);
    return;
  }
  nativeSetItem.call(this, key, value);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
