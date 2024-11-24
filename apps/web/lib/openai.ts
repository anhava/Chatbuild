import OpenAI from 'openai';
import { config } from './config';
import { RedisService } from './redis';

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatContext {
  threadId: string;
  messages: ChatMessage[];
  systemPrompt?: string;
}

export class OpenAIService {
  private static readonly DEFAULT_SYSTEM_PROMPT = `You are a helpful AI assistant. 
  - Provide clear, concise, and accurate responses
  - If you're not sure about something, say so
  - Keep responses professional and friendly
  - Format responses using markdown when appropriate`;

  private static readonly CACHE_TTL = 3600; // 1 hour

  /**
   * Generate a chat response
   */
  static async generateResponse(
    context: ChatContext
  ): Promise<{ response: string; usage: { tokens: number } }> {
    try {
      const messages = [
        {
          role: 'system',
          content: context.systemPrompt || this.DEFAULT_SYSTEM_PROMPT,
        },
        ...context.messages,
      ] as ChatMessage[];

      const completion = await openai.chat.completions.create({
        model: config.openai.model,
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content || '';
      const usage = {
        tokens: completion.usage?.total_tokens || 0,
      };

      // Store in chat history
      await RedisService.storeChatHistory(context.threadId, {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      });

      return { response, usage };
    } catch (error) {
      console.error('OpenAI generate response error:', error);
      throw error;
    }
  }

  /**
   * Process a file for training
   */
  static async processFile(fileContent: string, fileType: string): Promise<string> {
    try {
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: 'Extract and summarize the key information from this document.',
        },
        {
          role: 'user',
          content: `Please process this ${fileType} content and extract the key information: ${fileContent}`,
        },
      ];

      const completion = await openai.chat.completions.create({
        model: config.openai.model,
        messages,
        temperature: 0.3,
        max_tokens: 2000,
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI process file error:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings for text
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('OpenAI generate embedding error:', error);
      throw error;
    }
  }

  /**
   * Analyze sentiment
   */
  static async analyzeSentiment(text: string): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral';
    score: number;
  }> {
    try {
      const cacheKey = `sentiment:${Buffer.from(text).toString('base64')}`;
      const cached = await RedisService.getCachedResponse<{
        sentiment: 'positive' | 'negative' | 'neutral';
        score: number;
      }>(cacheKey);

      if (cached) {
        return cached;
      }

      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: 'Analyze the sentiment of the following text and respond with only "positive", "negative", or "neutral", followed by a confidence score between 0 and 1.',
        },
        {
          role: 'user',
          content: text,
        },
      ];

      const completion = await openai.chat.completions.create({
        model: config.openai.model,
        messages,
        temperature: 0,
        max_tokens: 50,
      });

      const response = completion.choices[0]?.message?.content || '';
      const [sentiment, scoreStr] = response.split(' ');
      const score = parseFloat(scoreStr);

      const result = {
        sentiment: sentiment as 'positive' | 'negative' | 'neutral',
        score: isNaN(score) ? 0.5 : score,
      };

      await RedisService.cacheResponse(cacheKey, result, this.CACHE_TTL);

      return result;
    } catch (error) {
      console.error('OpenAI analyze sentiment error:', error);
      throw error;
    }
  }

  /**
   * Generate suggestions based on chat history
   */
  static async generateSuggestions(
    context: ChatContext
  ): Promise<string[]> {
    try {
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: 'Based on the conversation history, generate 3 relevant follow-up questions or suggestions. Respond with only the questions/suggestions, separated by newlines.',
        },
        ...context.messages,
      ];

      const completion = await openai.chat.completions.create({
        model: config.openai.model,
        messages,
        temperature: 0.7,
        max_tokens: 200,
      });

      const response = completion.choices[0]?.message?.content || '';
      return response.split('\n').filter(Boolean);
    } catch (error) {
      console.error('OpenAI generate suggestions error:', error);
      throw error;
    }
  }

  /**
   * Moderate content
   */
  static async moderateContent(text: string): Promise<{
    flagged: boolean;
    categories: string[];
  }> {
    try {
      const response = await openai.moderations.create({
        input: text,
      });

      const result = response.results[0];
      const flaggedCategories = Object.entries(result.categories)
        .filter(([_, flagged]) => flagged)
        .map(([category]) => category);

      return {
        flagged: result.flagged,
        categories: flaggedCategories,
      };
    } catch (error) {
      console.error('OpenAI moderate content error:', error);
      throw error;
    }
  }
}

export default OpenAIService;
