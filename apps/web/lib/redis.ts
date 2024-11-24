import { createClient } from 'redis';
import { config } from './config';

// Initialize Redis client
const redisClient = createClient({
  url: config.redis.url,
});

redisClient.on('error', (err: Error) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

// Connect to Redis
redisClient.connect().catch(console.error);

export class RedisService {
  /**
   * Set a key with expiration
   */
  static async set(key: string, value: string, expirationInSeconds: number) {
    try {
      await redisClient.set(key, value, {
        EX: expirationInSeconds,
      });
    } catch (error) {
      console.error('Redis set error:', error);
      throw error;
    }
  }

  /**
   * Get a value by key
   */
  static async get(key: string) {
    try {
      return await redisClient.get(key);
    } catch (error) {
      console.error('Redis get error:', error);
      throw error;
    }
  }

  /**
   * Delete a key
   */
  static async del(key: string) {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error('Redis del error:', error);
      throw error;
    }
  }

  /**
   * Increment a counter
   */
  static async incr(key: string) {
    try {
      return await redisClient.incr(key);
    } catch (error) {
      console.error('Redis incr error:', error);
      throw error;
    }
  }

  /**
   * Check rate limit
   */
  static async checkRateLimit(
    key: string,
    limit: number,
    windowInSeconds: number
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetIn: number;
  }> {
    const current = await this.incr(key);
    
    // If this is the first request, set expiration
    if (current === 1) {
      await redisClient.expire(key, windowInSeconds);
    }

    const ttl = await redisClient.ttl(key);
    
    return {
      allowed: current <= limit,
      remaining: Math.max(0, limit - current),
      resetIn: ttl,
    };
  }

  /**
   * Cache API response
   */
  static async cacheResponse<T>(key: string, data: T, expirationInSeconds: number) {
    try {
      await this.set(key, JSON.stringify(data), expirationInSeconds);
    } catch (error) {
      console.error('Redis cache set error:', error);
      throw error;
    }
  }

  /**
   * Get cached response
   */
  static async getCachedResponse<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Redis cache get error:', error);
      throw error;
    }
  }

  /**
   * Clear cache by pattern
   */
  static async clearCacheByPattern(pattern: string) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (error) {
      console.error('Redis clear cache error:', error);
      throw error;
    }
  }

  /**
   * Store user session
   */
  static async storeSession<T>(sessionId: string, data: T, expirationInSeconds: number) {
    try {
      await this.set(`session:${sessionId}`, JSON.stringify(data), expirationInSeconds);
    } catch (error) {
      console.error('Redis session store error:', error);
      throw error;
    }
  }

  /**
   * Get user session
   */
  static async getSession<T>(sessionId: string): Promise<T | null> {
    try {
      const session = await this.get(`session:${sessionId}`);
      return session ? JSON.parse(session) : null;
    } catch (error) {
      console.error('Redis session get error:', error);
      throw error;
    }
  }

  /**
   * Delete user session
   */
  static async deleteSession(sessionId: string) {
    try {
      await this.del(`session:${sessionId}`);
    } catch (error) {
      console.error('Redis session delete error:', error);
      throw error;
    }
  }

  /**
   * Store chat history
   */
  static async storeChatHistory<T>(chatId: string, message: T) {
    try {
      const key = `chat:${chatId}:history`;
      await redisClient.rPush(key, JSON.stringify(message));
      // Keep only last 100 messages
      await redisClient.lTrim(key, -100, -1);
    } catch (error) {
      console.error('Redis chat history store error:', error);
      throw error;
    }
  }

  /**
   * Get chat history
   */
  static async getChatHistory<T>(chatId: string, limit: number = 50): Promise<T[]> {
    try {
      const key = `chat:${chatId}:history`;
      const messages = await redisClient.lRange(key, -limit, -1);
      return messages.map(msg => JSON.parse(msg));
    } catch (error) {
      console.error('Redis chat history get error:', error);
      throw error;
    }
  }

  /**
   * Clear chat history
   */
  static async clearChatHistory(chatId: string) {
    try {
      await this.del(`chat:${chatId}:history`);
    } catch (error) {
      console.error('Redis chat history clear error:', error);
      throw error;
    }
  }
}

export default RedisService;
