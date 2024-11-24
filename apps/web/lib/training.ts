import { S3Service } from './s3';
import { OpenAIService } from './openai';
import { prisma } from './prisma';
import { RedisService } from './redis';
import {
  KnowledgeFile,
  KnowledgeUrl,
  FileData,
  UrlData,
  ProcessFileResult,
  ProcessUrlResult,
} from './types';

export class TrainingService {
  private static readonly CACHE_PREFIX = 'training:';
  private static readonly CACHE_TTL = 3600; // 1 hour

  /**
   * Process and store a training file
   */
  static async processFile(
    chatbotId: string,
    file: File,
    userId: string
  ): Promise<ProcessFileResult> {
    try {
      // Validate file
      S3Service.validateFile(file);

      // Check user's plan limits
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const fileCount = await prisma.knowledgeFile.count({
        where: { chatbot: { userId } },
      });

      const planLimits = await prisma.$queryRaw`
        SELECT * FROM plan_limits WHERE plan_type = ${user.planType}
      `;

      if (fileCount >= planLimits.max_file_uploads) {
        throw new Error('File upload limit reached for your plan');
      }

      // Upload file to S3
      const { uploadUrl, fileKey } = await S3Service.getPresignedUploadUrl({
        fileName: file.name,
        fileType: file.type,
        prefix: `training/${chatbotId}`,
      });

      // Process file content
      const fileContent = await file.text();
      const summary = await OpenAIService.processFile(fileContent, file.type);
      const embedding = await OpenAIService.generateEmbedding(summary);

      // Store file record
      const knowledgeFile = await prisma.knowledgeFile.create({
        data: {
          chatbotId,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileUrl: S3Service.getPublicUrl(fileKey),
          status: 'READY',
        },
      });

      // Cache the processed content
      await RedisService.cacheResponse(
        `${this.CACHE_PREFIX}file:${knowledgeFile.id}`,
        { summary, embedding },
        this.CACHE_TTL
      );

      return {
        fileId: knowledgeFile.id,
        summary,
        embedding,
      };
    } catch (error) {
      console.error('Process file error:', error);
      throw error;
    }
  }

  /**
   * Process and store a URL
   */
  static async processUrl(
    chatbotId: string,
    url: string,
    userId: string
  ): Promise<ProcessUrlResult> {
    try {
      // Check user's plan limits
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const urlCount = await prisma.knowledgeUrl.count({
        where: { chatbot: { userId } },
      });

      const planLimits = await prisma.$queryRaw`
        SELECT * FROM plan_limits WHERE plan_type = ${user.planType}
      `;

      if (urlCount >= planLimits.max_web_pages) {
        throw new Error('URL limit reached for your plan');
      }

      // Fetch and process URL content
      const response = await fetch(url);
      const content = await response.text();
      const embedding = await OpenAIService.generateEmbedding(content);

      // Store URL record
      const knowledgeUrl = await prisma.knowledgeUrl.create({
        data: {
          chatbotId,
          url,
          status: 'READY',
          lastCrawledAt: new Date(),
        },
      });

      // Cache the processed content
      await RedisService.cacheResponse(
        `${this.CACHE_PREFIX}url:${knowledgeUrl.id}`,
        { content, embedding },
        this.CACHE_TTL
      );

      return {
        urlId: knowledgeUrl.id,
        content,
        embedding,
      };
    } catch (error) {
      console.error('Process URL error:', error);
      throw error;
    }
  }

  /**
   * Get training data for a chatbot
   */
  static async getChatbotTrainingData(chatbotId: string): Promise<{
    files: FileData[];
    urls: UrlData[];
  }> {
    try {
      const [files, urls] = await Promise.all([
        prisma.knowledgeFile.findMany({
          where: { chatbotId, status: 'READY' },
        }) as Promise<KnowledgeFile[]>,
        prisma.knowledgeUrl.findMany({
          where: { chatbotId, status: 'READY' },
        }) as Promise<KnowledgeUrl[]>,
      ]);

      const fileData = await Promise.all(
        files.map(async (file: KnowledgeFile) => {
          const cached = await RedisService.getCachedResponse<{
            summary: string;
            embedding: number[];
          }>(`${this.CACHE_PREFIX}file:${file.id}`);
          return {
            ...file,
            ...cached,
          } as FileData;
        })
      );

      const urlData = await Promise.all(
        urls.map(async (url: KnowledgeUrl) => {
          const cached = await RedisService.getCachedResponse<{
            content: string;
            embedding: number[];
          }>(`${this.CACHE_PREFIX}url:${url.id}`);
          return {
            ...url,
            ...cached,
          } as UrlData;
        })
      );

      return {
        files: fileData,
        urls: urlData,
      };
    } catch (error) {
      console.error('Get chatbot training data error:', error);
      throw error;
    }
  }

  /**
   * Delete training data
   */
  static async deleteTrainingData(
    type: 'file' | 'url',
    id: string,
    userId: string
  ) {
    try {
      if (type === 'file') {
        const file = await prisma.knowledgeFile.findFirst({
          where: {
            id,
            chatbot: { userId },
          },
        });

        if (!file) {
          throw new Error('File not found');
        }

        // Delete from S3
        const fileKey = file.fileUrl.split('/').pop();
        if (fileKey) {
          await S3Service.deleteFile(fileKey);
        }

        // Delete from database
        await prisma.knowledgeFile.delete({
          where: { id },
        });

        // Clear cache
        await RedisService.del(`${this.CACHE_PREFIX}file:${id}`);
      } else {
        const url = await prisma.knowledgeUrl.findFirst({
          where: {
            id,
            chatbot: { userId },
          },
        });

        if (!url) {
          throw new Error('URL not found');
        }

        // Delete from database
        await prisma.knowledgeUrl.delete({
          where: { id },
        });

        // Clear cache
        await RedisService.del(`${this.CACHE_PREFIX}url:${id}`);
      }
    } catch (error) {
      console.error('Delete training data error:', error);
      throw error;
    }
  }
}

export default TrainingService;
