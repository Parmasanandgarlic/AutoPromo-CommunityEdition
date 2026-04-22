import { sessionManager } from "./sessionManager.js";
import { db } from "./db.js";
import { Api } from "telegram";

class Scraper {
  async scrapeGroup(sessionId: number, groupId: string) {
    const client = sessionManager.getClient(sessionId);
    if (!client) throw new Error("Client not connected");

    db.addLog('system', `Starting scrape for group ${groupId}`);

    try {
      let entity;
      try {
        entity = await client.getInputEntity(groupId);
      } catch (entityError) {
        // Try to join if not found or not in group
        db.addLog('system', `Joining group ${groupId} before scraping...`);
        entity = await client.invoke(new Api.channels.JoinChannel({
          channel: groupId as any
        }));
        // Re-fetch entity after joining
        entity = await client.getInputEntity(groupId);
      }

      const participants = await client.invoke(
        new Api.channels.GetParticipants({
          channel: entity as any,
          filter: new Api.ChannelParticipantsRecent(),
          offset: 0,
          limit: 200,
          hash: 0 as any,
        })
      );

      if (participants instanceof Api.channels.ChannelParticipants) {
        let count = 0;
        const batchUsers = [];
        for (const user of participants.users) {
          if (user instanceof Api.User && !user.bot && !user.deleted) {
            let lastSeen = null;
            if (user.status instanceof Api.UserStatusRecently) {
               lastSeen = new Date();
            } else if (user.status instanceof Api.UserStatusOnline) {
               lastSeen = new Date();
            } else if (user.status instanceof Api.UserStatusOffline) {
               lastSeen = new Date(user.status.wasOnline * 1000);
            }

            // Only add if recently active (e.g. within last 7 days)
            if (lastSeen && (new Date().getTime() - lastSeen.getTime()) < 7 * 24 * 60 * 60 * 1000) {
              batchUsers.push({
                userId: user.id.toString(),
                username: user.username || null,
                lastSeen,
                sourceGroup: groupId
              });
              count++;
            }
          }
        }
        if (batchUsers.length > 0) {
          await db.addScrapedUsers(batchUsers);
        }
        db.addLog('system', `Scraped ${count} active users from ${groupId}`);
      } else {
        db.addLog('system', `No new participants found in ${groupId}`);
      }
    } catch (e: any) {
      db.addLog('error', `Failed to scrape group ${groupId}: ${e.message}`);
      throw e;
    }
  }
}

export const scraper = new Scraper();
