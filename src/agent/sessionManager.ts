import { TelegramClient, Api } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { db } from "./db.js";

class SessionManager {
  private clients: Map<number, TelegramClient> = new Map();
  private pendingClients: Map<number, { client: TelegramClient, phoneCodeHash: string }> = new Map();

  async init() {
    const sessions = await db.getSessions();
    if (!sessions) return;

    for (const session of sessions) {
      if (session.status === 'active' && session.session_string) {
        try {
          const client = new TelegramClient(
            new StringSession(session.session_string),
            session.api_id,
            session.api_hash,
            { connectionRetries: 5 }
          );
          await client.connect();
          this.clients.set(session.id, client);
          db.addLog('system', `Session ${session.name} connected successfully.`);
        } catch (e: any) {
          db.addLog('error', `Failed to connect session ${session.name}: ${e.message}`);
        }
      }
    }
  }

  async createSession(name: string, apiId: number, apiHash: string, phoneNumber: string) {
    const session = await db.addSession(name, apiId, apiHash, phoneNumber);
    if (!session) throw new Error("Failed to create session in DB");

    const client = new TelegramClient(new StringSession(""), apiId, apiHash, {
      connectionRetries: 5,
    });

    await client.connect();

    const result = await client.sendCode(
      {
        apiId,
        apiHash,
      },
      phoneNumber
    );

    this.pendingClients.set(session.id, { client, phoneCodeHash: result.phoneCodeHash });
    
    // SECURITY FIX: Sweep orphaned MTProto pending sockets after 10 minutes to prevent RAM consumption DOSing.
    setTimeout(async () => {
        if (this.pendingClients.has(session.id)) {
            const pending = this.pendingClients.get(session.id);
            if (pending) {
                try { await pending.client.disconnect(); } catch (e) {}
                this.pendingClients.delete(session.id);
                db.addLog('system', `Cleaned up unverified session socket ID: ${session.id} after 10m timeout.`);
            }
        }
    }, 10 * 60 * 1000);
    
    return session;
  }

  async verifySession(id: number, phoneCode: string, password?: string) {
    const session = await db.getSession(id);
    if (!session) throw new Error("Session not found");

    const pending = this.pendingClients.get(id);
    if (!pending) throw new Error("No pending authentication for this session");

    const { client, phoneCodeHash } = pending;

    try {
      await client.invoke(new Api.auth.SignIn({
        phoneNumber: session.phone_number,
        phoneCodeHash,
        phoneCode,
      }));
    } catch (e: any) {
      if (e.message?.includes("SESSION_PASSWORD_NEEDED") || e.name === "SessionPasswordNeededError") {
        if (!password) {
          throw new Error("2FA Password required");
        }
        const passwordObj = await client.invoke(new Api.account.GetPassword());
        // GramJS has a helper for password computation, but client.signInWithPassword is the wrapper
        await client.signInWithPassword(
          {
            apiId: session.api_id,
            apiHash: session.api_hash,
          },
          {
            password: async () => password,
            onError: (err: any) => { throw err; }
          }
        );
      } else {
        throw e;
      }
    }

    const sessionString = (client.session as StringSession).save();
    await db.updateSessionString(id, sessionString, 'active');
    
    this.clients.set(id, client);
    this.pendingClients.delete(id);
    
    db.addLog('system', `Session ${session.name} authenticated successfully.`);
    return await db.getSession(id);
  }

  async deleteSession(id: number) {
    const client = this.clients.get(id);
    if (client) {
      await client.disconnect();
      this.clients.delete(id);
    }
    await db.deleteSession(id);
  }

  getClient(id: number): TelegramClient | undefined {
    return this.clients.get(id);
  }

  getAllClients(): TelegramClient[] {
    return Array.from(this.clients.values());
  }
}

export const sessionManager = new SessionManager();
