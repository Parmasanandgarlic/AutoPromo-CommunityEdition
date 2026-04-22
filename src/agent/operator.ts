import { sessionManager } from "./sessionManager.js";
import { db } from "./db.js";
import { parseSpintax } from "./spintax.js";

class Operator {
  private isRunning = false;
  private currentSessionId: number | null = null;
  private template: string = "";
  private maxPerDay: number = 15;
  private sentToday: number = 0;

  async start(sessionId: number, template: string, maxPerDay: number) {
    if (this.isRunning) throw new Error("Operator is already running");
    
    this.currentSessionId = sessionId;
    this.template = template;
    this.maxPerDay = maxPerDay;
    this.isRunning = true;
    this.sentToday = 0; // In a real app, load this from DB based on current date

    db.addLog('system', `Operator started on session ${sessionId}`);
    this.runLoop();
  }

  async stop() {
    this.isRunning = false;
    this.currentSessionId = null;
    db.addLog('system', `Operator stopped`);
  }

  private async runLoop() {
    while (this.isRunning) {
      if (this.sentToday >= this.maxPerDay) {
        db.addLog('system', `Daily limit reached (${this.maxPerDay}). Sleeping for 24 hours.`);
        // Interruptible sleep
        for (let i = 0; i < 24 * 60; i++) {
          if (!this.isRunning) break;
          await this.sleep(60 * 1000); // Check every minute
        }
        this.sentToday = 0;
        continue;
      }

      const client = sessionManager.getClient(this.currentSessionId!);
      if (!client) {
        this.stop();
        break;
      }

      const users = await db.getUncontactedUsers(1);
      if (!users || users.length === 0) {
        db.addLog('system', `No uncontacted users found. Sleeping for 1 hour.`);
        // Interruptible sleep
        for (let i = 0; i < 60; i++) {
          if (!this.isRunning) break;
          await this.sleep(60 * 1000);
        }
        continue;
      }

      const user = users[0];
      const message = parseSpintax(this.template);

      try {
        // Human-like delay before sending (200-600 seconds)
        const delaySeconds = Math.floor(Math.random() * (600 - 200 + 1) + 200);
        db.addLog('system', `Waiting ${delaySeconds}s before messaging ${user.username || user.user_id}`);
        
        // Interruptible delay
        for (let i = 0; i < delaySeconds; i++) {
          if (!this.isRunning) break;
          await this.sleep(1000);
        }

        if (!this.isRunning) break;

        const targetEntity = user.username ? user.username : user.user_id;
        await client.sendMessage(targetEntity as any, { message });
        await db.markUserContacted(user.user_id);
        this.sentToday++;
        
        db.addLog('operator', `Sent message to ${user.username || user.user_id}`, { message });
      } catch (e: any) {
        db.addLog('error', `Failed to send message to ${user.user_id}: ${e.message}`);
        // Mark as contacted anyway to avoid infinite loops on blocked users
        await db.markUserContacted(user.user_id);
      }
    }
  }

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const operator = new Operator();
