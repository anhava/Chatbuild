import { OpenAIService } from './openai';
import { RedisService } from './redis';
import { prisma } from './prisma';
import { ApiError } from './api-utils';
import { ChatMessage, ChatThread, KnowledgeFile, KnowledgeUrl } from './types';

interface SendMessageParams {
  threadId: string;
  content: string;
  type: 'USER' | 'BOT' | 'AGENT';
  senderId?: string;
}

interface CreateThreadParams {
  chatbotId: string;
  visitorId?: string;
  visitorName?: string;
  initialMessage?: string;
}

interface FAQ {
  question: string;
  answer: string;
}

export class ChatService {
  private static readonly CACHE_PREFIX = 'chat:';
  private static readonly CACHE_TTL = 3600; // 1 hour

  /**
   * Create a new chat thread
   */
  static async createThread({
    chatbotId,
    visitorId,
    visitorName,
    initialMessage,
  }: CreateThreadParams): Promise<ChatThread> {
    try {
      const chatbot = await prisma.chatbot.findUnique({
        where: { id: chatbotId },
      });

      if (!chatbot) {
        throw new ApiError(404, 'Chatbot not found');
      }

      const thread = await prisma.chatThread.create({
        data: {
          chatbotId,
          visitorId,
          visitorName,
          status: 'ACTIVE',
        },
        include: {
          messages: true,
        },
      });

      if (initialMessage) {
        await this.sendMessage({
          threadId: thread.id,
          content: initialMessage,
          type: 'USER',
        });

        // Send chatbot's welcome message
        await this.sendMessage({
          threadId: thread.id,
          content: chatbot.welcomeMessage,
          type: 'BOT',
        });
      }

      return thread as ChatThread;
    } catch (error) {
      console.error('Create thread error:', error);
      throw error;
    }
  }

  /**
   * Send a message in a thread
   */
  static async sendMessage({
    threadId,
    content,
    type,
    senderId,
  }: SendMessageParams): Promise<ChatMessage> {
    try {
      const thread = await prisma.chatThread.findUnique({
        where: { id: threadId },
        include: {
          chatbot: true,
        },
      });

      if (!thread) {
        throw new ApiError(404, 'Thread not found');
      }

      if (thread.status !== 'ACTIVE') {
        throw new ApiError(400, 'Thread is not active');
      }

      const message = await prisma.chatMessage.create({
        data: {
          threadId,
          content,
          type,
          senderId,
        },
      });

      // Store in Redis for real-time access
      await RedisService.storeChatHistory(threadId, {
        ...message,
        timestamp: new Date().toISOString(),
      });

      return message as ChatMessage;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }

  /**
   * Get chat history
   */
  static async getChatHistory(threadId: string): Promise<ChatMessage[]> {
    try {
      const messages = await prisma.chatMessage.findMany({
        where: { threadId },
        orderBy: { createdAt: 'asc' },
      });

      return messages as ChatMessage[];
    } catch (error) {
      console.error('Get chat history error:', error);
      throw error;
    }
  }

  /**
   * Generate bot response
   */
  static async generateBotResponse(threadId: string): Promise<ChatMessage> {
    try {
      const thread = await prisma.chatThread.findUnique({
        where: { id: threadId },
        include: {
          chatbot: true,
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!thread) {
        throw new ApiError(404, 'Thread not found');
      }

      // Get training data context
      const trainingContext = await this.getTrainingContext(thread.chatbot.id);

      // Prepare messages for OpenAI
      const messages = thread.messages.reverse().map((msg: ChatMessage) => ({
        role: msg.type.toLowerCase() as 'system' | 'user' | 'assistant',
        content: msg.content,
      }));

      // Generate response
      const { response } = await OpenAIService.generateResponse({
        threadId,
        messages,
        systemPrompt: `You are a helpful AI assistant with the following knowledge:\n${trainingContext}`,
      });

      // Send bot message
      return this.sendMessage({
        threadId,
        content: response,
        type: 'BOT',
      });
    } catch (error) {
      console.error('Generate bot response error:', error);
      throw error;
    }
  }

  /**
   * Archive chat thread
   */
  static async archiveThread(threadId: string): Promise<void> {
    try {
      await prisma.chatThread.update({
        where: { id: threadId },
        data: { status: 'ARCHIVED' },
      });
    } catch (error) {
      console.error('Archive thread error:', error);
      throw error;
    }
  }

  /**
   * Get active threads for a chatbot
   */
  static async getActiveThreads(chatbotId: string): Promise<ChatThread[]> {
    try {
      const threads = await prisma.chatThread.findMany({
        where: {
          chatbotId,
          status: 'ACTIVE',
        },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      return threads as ChatThread[];
    } catch (error) {
      console.error('Get active threads error:', error);
      throw error;
    }
  }

  /**
   * Get training context for a chatbot
   */
  private static async getTrainingContext(chatbotId: string): Promise<string> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}training:${chatbotId}`;
      const cached = await RedisService.get(cacheKey);

      if (cached) {
        return cached;
      }

      const [files, urls, faqs] = await Promise.all([
        prisma.knowledgeFile.findMany({
          where: { chatbotId, status: 'READY' },
        }),
        prisma.knowledgeUrl.findMany({
          where: { chatbotId, status: 'READY' },
        }),
        prisma.faq.findMany({
          where: { chatbotId },
        }),
      ]);

      const context = [
        ...files.map((file: KnowledgeFile) => `File: ${file.fileName}`),
        ...urls.map((url: KnowledgeUrl) => `URL: ${url.url}`),
        ...faqs.map((faq: FAQ) => `Q: ${faq.question}\nA: ${faq.answer}`),
      ].join('\n\n');

      await RedisService.set(cacheKey, context, this.CACHE_TTL);

      return context;
    } catch (error) {
      console.error('Get training context error:', error);
      return '';
    }
  }
}

export default ChatService;
