import { Api } from "telegram";
import { sessionManager } from "./sessionManager.js";
import { db } from "./db.js";

class Engagement {
  async engage(sessionId: number, target: string, action: string, emoji?: string) {
    const client = sessionManager.getClient(sessionId);
    if (!client) throw new Error("Session not connected");

    try {
      if (action === 'join') {
        const entity = await client.getInputEntity(target);
        await client.invoke(new Api.channels.JoinChannel({
          channel: entity as any
        }));
        db.addLog('system', `Successfully joined channel/group: ${target}`);
      } else if (action === 'react') {
        const entity = await client.getInputEntity(target);
        // Get the latest message to react to
        const history: any = await client.invoke(new Api.messages.GetHistory({
          peer: entity,
          limit: 1,
        }));
        
        if (history && history.messages && history.messages.length > 0) {
          const msgId = history.messages[0].id;
          await client.invoke(new Api.messages.SendReaction({
            peer: entity,
            msgId: msgId,
            reaction: [new Api.ReactionEmoji({ emoticon: emoji || '👍' })],
          }));
          db.addLog('system', `Successfully reacted with ${emoji} to latest message in ${target}`);
        } else {
          throw new Error("No messages found to react to");
        }
      } else if (action === 'forward') {
        const entity = await client.getInputEntity(target);
        // Forward the latest message to Saved Messages (me)
        const history: any = await client.invoke(new Api.messages.GetHistory({
          peer: entity,
          limit: 1,
        }));
        
        if (history && history.messages && history.messages.length > 0) {
          const msgId = history.messages[0].id;
          await client.forwardMessages('me', {
            messages: [msgId],
            fromPeer: entity,
          });
          db.addLog('system', `Successfully forwarded latest message from ${target} to Saved Messages`);
        } else {
          throw new Error("No messages found to forward");
        }
      } else {
        throw new Error("Unknown action");
      }
    } catch (e: any) {
      db.addLog('error', `Engagement failed: ${e.message}`);
      throw e;
    }
  }
}

export const engagement = new Engagement();
