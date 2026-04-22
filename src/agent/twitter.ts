import { db } from "./db.js";

interface RateLimit {
  count: number;
  limit: number;
  resetTime: number;
}

class TwitterAutomation {
  private rateLimits: Map<string, Map<string, RateLimit>> = new Map();

  private getRateLimit(account: string, action: string, customResets?: Record<string, number>): RateLimit {
    if (!this.rateLimits.has(account)) {
      this.rateLimits.set(account, new Map());
    }
    const accountLimits = this.rateLimits.get(account)!;
    
    const resetMins = customResets?.[action] || 15;
    
    if (!accountLimits.has(action)) {
      // Default limits for the demo
      const limits: Record<string, number> = {
        'like': 50,
        'retweet': 30,
        'follow': 20,
        'reply': 40
      };
      accountLimits.set(action, {
        count: 0,
        limit: limits[action] || 50,
        resetTime: Date.now() + resetMins * 60 * 1000
      });
    }
    
    const limit = accountLimits.get(action)!;
    if (Date.now() > limit.resetTime) {
      limit.count = 0;
      limit.resetTime = Date.now() + resetMins * 60 * 1000;
    }
    
    return limit;
  }

  async executeAction(account: string, target: string, action: string, credentials: { authToken: string, ct0: string }, content?: string, proxy?: any, rateLimitResets?: Record<string, number>, userAgentConfig?: { enabled: boolean; customUAs: string[] }, aiConfig?: { enabled: boolean; provider: string; apiKey: string; prompt: string }) {
    const limit = this.getRateLimit(account, action, rateLimitResets);
    
    if (limit.count >= limit.limit) {
      const waitMins = Math.ceil((limit.resetTime - Date.now()) / 60000);
      throw new Error(`Twitter Rate Limit Hit for ${action}. Please wait ${waitMins} minutes.`);
    }

    if (!credentials.authToken || !credentials.ct0) {
      throw new Error(`Missing credentials for Twitter account: ${account}`);
    }

    const proxyMsg = proxy ? ` [via Proxy: ${proxy.host}:${proxy.port}]` : '';
    let uaMsg = '';
    if (userAgentConfig && userAgentConfig.enabled) {
      const uas = userAgentConfig.customUAs && userAgentConfig.customUAs.length > 0 
        ? userAgentConfig.customUAs 
        : ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/537.36'];
      const rotatedUa = uas[Math.floor(Math.random() * uas.length)];
      uaMsg = ` [UA: ${rotatedUa.substring(0, 20)}...]`;
    }

    let finalContent = content;

    if (action === 'reply' && aiConfig && aiConfig.enabled && aiConfig.apiKey) {
      try {
        db.addLog('system', `[AI] Generating contextual reply using ${aiConfig.provider} (${(aiConfig as any).model || 'default model'})...`);
        // In a real scenario, we would scrape the target's recent tweets. We mock the bio/tweet context here:
        const mockContext = `Target user ${target} just tweeted: "Thinking about automating my marketing workflows today."`;
        const fullPrompt = `${aiConfig.prompt}\n\nContext to reply to:\n${mockContext}`;
        const modelToUse = (aiConfig as any).model;
        
        if (aiConfig.provider === 'gemini') {
          // Dynamic import to avoid crash if env vars not perfectly set elsewhere
          const { GoogleGenAI } = await import('@google/genai');
          const ai = new GoogleGenAI({ apiKey: aiConfig.apiKey });
          const response = await ai.models.generateContent({
            model: modelToUse || 'gemini-2.5-flash',
            contents: fullPrompt,
            config: { maxOutputTokens: 100 }
          });
          finalContent = (response.text || '').replace(/^["']|["']$/g, '').trim();
        } else if (aiConfig.provider === 'openai') {
          const { OpenAI } = await import('openai');
          const openai = new OpenAI({ apiKey: aiConfig.apiKey });
          const response = await openai.chat.completions.create({
            model: modelToUse || "gpt-4o-mini",
            messages: [{ role: "system", content: aiConfig.prompt }, { role: "user", content: `Context to reply to:\n${mockContext}` }],
            max_tokens: 100
          });
          finalContent = (response.choices[0].message.content || '').replace(/^["']|["']$/g, '').trim();
        } else if (aiConfig.provider === 'anthropic') {
          const { Anthropic } = await import('@anthropic-ai/sdk');
          const anthropic = new Anthropic({ apiKey: aiConfig.apiKey });
          const response = await anthropic.messages.create({
            model: modelToUse || "claude-3-5-sonnet-20241022",
            system: aiConfig.prompt,
            messages: [{ role: "user", content: `Context to reply to:\n${mockContext}` }],
            max_tokens: 100
          });
          finalContent = ((response.content[0] as any).text || '').replace(/^["']|["']$/g, '').trim();
        }
        db.addLog('system', `[AI] Generated: "${finalContent}"`);
      } catch (err: any) {
         db.addLog('system', `[AI Error] Failed to generate: ${err.message}. Falling back to default content if available.`);
         finalContent = content || 'Great insights! Automation is definitely the future.';
      }
    }

    db.addLog('system', `[Twitter] Initiating ${action} on ${target} using ${account}${proxyMsg}${uaMsg} (Token: ${credentials.authToken.substring(0, 4)}...)`);
    
    // Pre-emptively increment rate limit to prevent concurrency racing
    limit.count++;
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let message = '';
    switch (action) {
      case 'like':
        message = `Successfully liked tweet: ${target}`;
        break;
      case 'retweet':
        message = `Successfully retweeted: ${target}`;
        break;
      case 'follow':
        message = `Successfully followed user: ${target}`;
        break;
      case 'reply':
        message = `Successfully replied to ${target} with: "${finalContent}"`;
        break;
      default:
        throw new Error(`Unknown Twitter action: ${action}`);
    }

    db.addLog('system', `[Twitter] ${message}`);
    return { 
      success: true, 
      message,
      rateLimit: {
        count: limit.count,
        limit: limit.limit,
        remaining: limit.limit - limit.count,
        resetTime: limit.resetTime
      }
    };
  }

  getAccountStatus(account: string) {
    const actions = ['like', 'retweet', 'follow', 'reply'];
    const status: Record<string, any> = {};
    actions.forEach(action => {
      const limit = this.getRateLimit(account, action);
      status[action] = {
        count: limit.count,
        limit: limit.limit,
        remaining: limit.limit - limit.count,
        resetTime: limit.resetTime,
        isApproaching: (limit.limit - limit.count) <= (limit.limit * 0.2),
        isHit: limit.count >= limit.limit
      };
    });
    return status;
  }
}

export const twitterAutomation = new TwitterAutomation();
