import { sessionManager } from "./sessionManager.js";
import { db } from "./db.js";
import { NewMessage, NewMessageEvent } from "telegram/events/index.js";
import { Api } from "telegram";

class Listener {
  private activeSessionId: number | null = null;
  private handler: ((event: NewMessageEvent) => Promise<void>) | null = null;

  async start(sessionId: number) {
    if (this.activeSessionId) {
      await this.stop();
    }

    const client = sessionManager.getClient(sessionId);
    if (!client) throw new Error("Client not connected");

    const keywords = (await db.getKeywords())?.map(k => k.keyword.toLowerCase()) || [];
    const groups = (await db.getGroups())?.map(g => g.group_id) || [];

    if (keywords.length === 0) {
      throw new Error("No keywords defined");
    }

    this.handler = async (event: NewMessageEvent) => {
      const message = event.message;
      if (!message.text) return;

      const textLower = message.text.toLowerCase();
      const matchedKeyword = keywords.find(k => textLower.includes(k));

      if (matchedKeyword) {
        let senderName = "Unknown";
        let senderId = "";

        if (message.sender instanceof Api.User) {
          senderName = message.sender.username || message.sender.firstName || "Unknown";
          senderId = message.sender.id.toString();
        }

        let groupName = "Unknown Group";
        if (message.chat instanceof Api.Channel || message.chat instanceof Api.Chat) {
          groupName = message.chat.title || "Unknown Group";
        }

        db.addLog('signal', `Keyword "${matchedKeyword}" detected in ${groupName}`, {
          sender: senderName,
          senderId,
          text: message.text
        });

        // Optionally add the user to scraped users if they are a good lead
        if (senderId) {
          await db.addScrapedUser(senderId, senderName, new Date(), groupName);
        }
      }
    };

    client.addEventHandler(this.handler, new NewMessage({ chats: groups.length > 0 ? groups : undefined }));
    this.activeSessionId = sessionId;
    db.addLog('system', `Listener started on session ${sessionId}`);
  }

  async stop() {
    if (this.activeSessionId && this.handler) {
      const client = sessionManager.getClient(this.activeSessionId);
      if (client) {
        client.removeEventHandler(this.handler, new NewMessage({}));
      }
      this.activeSessionId = null;
      this.handler = null;
      db.addLog('system', `Listener stopped`);
    }
  }
}

export const listener = new Listener();
