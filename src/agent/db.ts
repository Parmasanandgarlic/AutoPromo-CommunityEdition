import fs from 'fs/promises';
import path from 'path';

interface Session {
  id: number;
  name: string;
  api_id: number;
  api_hash: string;
  phone_number: string;
  session_string?: string;
  status: string;
  created_at: string;
}

interface Keyword {
  id: number;
  keyword: string;
}

interface Group {
  id: number;
  group_id: string;
  name: string;
}

interface ScrapedUser {
  id: number;
  user_id: string;
  username: string | null;
  last_seen: string | null;
  source_group: string;
  contacted: boolean;
  contacted_at: string | null;
  created_at: string;
}

interface Log {
  id: number;
  type: string;
  message: string;
  data: string | null;
  created_at: string;
}

interface TwitterAccount {
  id: number;
  name: string;
  auth_token: string;
  ct0: string;
  status: string;
  created_at: string;
}

interface ProxyConfig {
  host: string;
  port: string;
  user?: string;
  pass?: string;
  type: string;
}

interface ScheduledTwitterAction {
  id: number;
  account: string;
  target: string;
  action: string;
  content?: string;
  proxy?: ProxyConfig;
  rateLimitResets?: Record<string, number>;
  userAgentConfig?: { enabled: boolean; customUAs: string[] };
  aiConfig?: { enabled: boolean; provider: string; apiKey: string; prompt: string };
  scheduled_at: string;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
  created_at: string;
}

interface DBSchema {
  sessions: Session[];
  keywords: Keyword[];
  groups: Group[];
  scraped_users: ScrapedUser[];
  logs: Log[];
  twitter_accounts: TwitterAccount[];
  scheduled_twitter_actions: ScheduledTwitterAction[];
}

class DB {
  private dbPath = process.env.USER_DATA_PATH 
    ? path.join(process.env.USER_DATA_PATH, 'agent_db.json')
    : path.join(process.cwd(), 'agent_db.json');
  private data: DBSchema = {
    sessions: [],
    keywords: [],
    groups: [],
    scraped_users: [],
    logs: [],
    twitter_accounts: [],
    scheduled_twitter_actions: []
  };

  private initPromise: Promise<void> | null = null;
  private saveTimeout: NodeJS.Timeout | null = null;
  private savePromise: Promise<void> | null = null;
  private resolveSave: (() => void) | null = null;

  async init() {
    if (this.initPromise) return this.initPromise;
    this.initPromise = (async () => {
      try {
        const fileData = await fs.readFile(this.dbPath, 'utf-8');
        if (!fileData.trim()) {
          await this.forceSave();
          return;
        }
        this.data = JSON.parse(fileData);
      } catch (e: any) {
        if (e.code === 'ENOENT') {
          await this.forceSave();
        } else {
          console.error('Failed to load DB:', e);
          try {
            await fs.rename(this.dbPath, `${this.dbPath}.bak`);
            await this.forceSave();
          } catch (renameError) {
            console.error('Failed to backup corrupted DB:', renameError);
          }
        }
      }
    })();
    return this.initPromise;
  }

  private async forceSave() {
    await fs.writeFile(this.dbPath, JSON.stringify(this.data, null, 2));
  }

  private async save() {
    if (!this.savePromise) {
      this.savePromise = new Promise(resolve => {
        this.resolveSave = resolve;
        this.saveTimeout = setTimeout(async () => {
          try {
            await this.forceSave();
          } catch(e) {
            console.error('Failed to save db (debounce)', e);
          } finally {
            this.savePromise = null;
            if (this.resolveSave) this.resolveSave();
          }
        }, 300); // 300ms batched debounce
      });
    }
    return this.savePromise;
  }

  private generateId(collection: any[]): number {
    return collection.length > 0 ? Math.max(...collection.map(i => i.id)) + 1 : 1;
  }

  // Sessions
  async getSessions() {
    return this.data.sessions;
  }

  async getSession(id: number) {
    return this.data.sessions.find(s => s.id === id);
  }

  async addSession(name: string, apiId: number, apiHash: string, phoneNumber: string) {
    const session: Session = {
      id: this.generateId(this.data.sessions),
      name,
      api_id: apiId,
      api_hash: apiHash,
      phone_number: phoneNumber,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    this.data.sessions.push(session);
    await this.save();
    return session;
  }

  async updateSessionString(id: number, sessionString: string, status: string = 'active') {
    const session = this.data.sessions.find(s => s.id === id);
    if (session) {
      session.session_string = sessionString;
      session.status = status;
      await this.save();
    }
  }

  async deleteSession(id: number) {
    this.data.sessions = this.data.sessions.filter(s => s.id !== id);
    await this.save();
  }

  // Keywords
  async getKeywords() {
    return this.data.keywords;
  }

  async addKeyword(keyword: string) {
    if (!this.data.keywords.find(k => k.keyword === keyword)) {
      this.data.keywords.push({
        id: this.generateId(this.data.keywords),
        keyword
      });
      await this.save();
    }
  }

  async deleteKeyword(id: number) {
    this.data.keywords = this.data.keywords.filter(k => k.id !== id);
    await this.save();
  }

  // Groups
  async getGroups() {
    return this.data.groups;
  }

  async addGroup(groupId: string, name: string) {
    if (!this.data.groups.find(g => g.group_id === groupId)) {
      this.data.groups.push({
        id: this.generateId(this.data.groups),
        group_id: groupId,
        name
      });
      await this.save();
    }
  }

  async deleteGroup(id: number) {
    this.data.groups = this.data.groups.filter(g => g.id !== id);
    await this.save();
  }

  // Scraped Users
  async getScrapedUsers() {
    const len = this.data.scraped_users.length;
    const start = Math.max(0, len - 1000);
    return this.data.scraped_users.slice(start, len).reverse();
  }

  async addScrapedUsers(users: {userId: string, username: string | null, lastSeen: Date | null, sourceGroup: string}[]) {
    // Create a lookup map for faster existing checks
    const existingMap = new Map(this.data.scraped_users.map((u, i) => [u.user_id, i]));
    
    for (const u of users) {
      const existingIndex = existingMap.get(u.userId);
      if (existingIndex !== undefined) {
        const user = this.data.scraped_users[existingIndex];
        user.username = u.username || user.username;
        user.last_seen = u.lastSeen ? u.lastSeen.toISOString() : user.last_seen;
        user.source_group = u.sourceGroup;
      } else {
        const newId = this.generateId(this.data.scraped_users);
        const newUser = {
          id: newId,
          user_id: u.userId,
          username: u.username,
          last_seen: u.lastSeen ? u.lastSeen.toISOString() : null,
          source_group: u.sourceGroup,
          contacted: false,
          contacted_at: null,
          created_at: new Date().toISOString()
        };
        this.data.scraped_users.push(newUser);
        existingMap.set(u.userId, this.data.scraped_users.length - 1);
      }
    }
    
    // SECURITY LIMITER: Deep 3-month scan resolution.
    // If scraped users array balloons past 50,000, dump the oldest 10,000 to save Node memory from cratering via stringification load.
    if (this.data.scraped_users.length > 50000) {
      this.data.scraped_users = this.data.scraped_users.slice(-40000);
    }
    await this.save();
  }

  async addScrapedUser(userId: string, username: string | null, lastSeen: Date | null, sourceGroup: string) {
    const existingIndex = this.data.scraped_users.findIndex(u => u.user_id === userId);
    if (existingIndex !== -1) {
      // Update existing user info
      const user = this.data.scraped_users[existingIndex];
      user.username = username || user.username;
      user.last_seen = lastSeen ? lastSeen.toISOString() : user.last_seen;
      user.source_group = sourceGroup;
    } else {
      this.data.scraped_users.push({
        id: this.generateId(this.data.scraped_users),
        user_id: userId,
        username,
        last_seen: lastSeen ? lastSeen.toISOString() : null,
        source_group: sourceGroup,
        contacted: false,
        contacted_at: null,
        created_at: new Date().toISOString()
      });
    }
    
    // SECURITY LIMITER: Garbage collection memory management
    if (this.data.scraped_users.length > 50000) {
      this.data.scraped_users = this.data.scraped_users.slice(-40000);
    }
    await this.save();
  }

  async markUserContacted(userId: string) {
    const user = this.data.scraped_users.find(u => u.user_id === userId);
    if (user) {
      user.contacted = true;
      user.contacted_at = new Date().toISOString();
      await this.save();
    }
  }

  async getUncontactedUsers(limit: number = 10) {
    return this.data.scraped_users
      .filter(u => !u.contacted)
      .sort((a, b) => {
        const timeA = a.last_seen ? new Date(a.last_seen).getTime() : 0;
        const timeB = b.last_seen ? new Date(b.last_seen).getTime() : 0;
        return timeB - timeA;
      })
      .slice(0, limit);
  }

  // Logs
  async getLogs() {
    const len = this.data.logs.length;
    const start = Math.max(0, len - 500);
    return this.data.logs.slice(start, len).reverse();
  }

  async addLog(type: string, message: string, data?: any) {
    this.data.logs.push({
      id: this.generateId(this.data.logs),
      type,
      message,
      data: data ? JSON.stringify(data) : null,
      created_at: new Date().toISOString()
    });
    // Keep logs bounded
    if (this.data.logs.length > 1000) {
      this.data.logs = this.data.logs.slice(-1000);
    }
    await this.save();
  }

  // Twitter Accounts
  async getTwitterAccounts() {
    return this.data.twitter_accounts;
  }

  async addTwitterAccount(name: string, authToken: string, ct0: string) {
    const account: TwitterAccount = {
      id: this.generateId(this.data.twitter_accounts),
      name,
      auth_token: authToken,
      ct0,
      status: 'active',
      created_at: new Date().toISOString()
    };
    this.data.twitter_accounts.push(account);
    await this.save();
    return account;
  }

  async deleteTwitterAccount(id: number) {
    this.data.twitter_accounts = this.data.twitter_accounts.filter(a => a.id !== id);
    await this.save();
  }

  // Scheduled Twitter Actions
  async getScheduledTwitterActions() {
    return this.data.scheduled_twitter_actions;
  }

  async addScheduledTwitterAction(account: string, target: string, action: string, scheduledAt: string, content?: string, proxy?: ProxyConfig, rateLimitResets?: Record<string, number>, userAgentConfig?: { enabled: boolean; customUAs: string[] }, aiConfig?: { enabled: boolean; provider: string; apiKey: string; prompt: string }) {
    const scheduledAction: ScheduledTwitterAction = {
      id: this.generateId(this.data.scheduled_twitter_actions),
      account,
      target,
      action,
      content,
      proxy,
      rateLimitResets,
      userAgentConfig,
      aiConfig,
      scheduled_at: scheduledAt,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    this.data.scheduled_twitter_actions.push(scheduledAction);
    await this.save();
    return scheduledAction;
  }

  async updateScheduledTwitterActionStatus(id: number, status: 'completed' | 'failed', error?: string) {
    const action = this.data.scheduled_twitter_actions.find(a => a.id === id);
    if (action) {
      action.status = status;
      if (error) action.error = error;
      await this.save();
    }
  }

  async deleteScheduledTwitterAction(id: number) {
    this.data.scheduled_twitter_actions = this.data.scheduled_twitter_actions.filter(a => a.id !== id);
    await this.save();
  }

  async getPendingScheduledTwitterActions() {
    const now = new Date().toISOString();
    return this.data.scheduled_twitter_actions.filter(a => a.status === 'pending' && a.scheduled_at <= now);
  }
}

export const db = new DB();
