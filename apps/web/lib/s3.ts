import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from './config';

// Initialize S3 client
const s3Client = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

interface UploadParams {
  file: File;
  prefix?: string;
}

interface PresignedUrlParams {
  fileName: string;
  fileType: string;
  prefix?: string;
}

export class S3Service {
  private static generateKey(fileName: string, prefix?: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return prefix 
      ? `${prefix}/${timestamp}-${randomString}-${sanitizedFileName}`
      : `${timestamp}-${randomString}-${sanitizedFileName}`;
  }

  /**
   * Get a presigned URL for direct browser upload
   */
  static async getPresignedUploadUrl({ fileName, fileType, prefix }: PresignedUrlParams) {
    const key = this.generateKey(fileName, prefix);
    const command = new PutObjectCommand({
      Bucket: config.aws.s3Bucket,
      Key: key,
      ContentType: fileType,
      ACL: 'private',
    });

    try {
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      return {
        uploadUrl: signedUrl,
        fileKey: key,
        fileUrl: `https://${config.aws.s3Bucket}.s3.${config.aws.region}.amazonaws.com/${key}`,
      };
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw new Error('Failed to generate upload URL');
    }
  }

  /**
   * Delete a file from S3
   */
  static async deleteFile(fileKey: string) {
    const command = new DeleteObjectCommand({
      Bucket: config.aws.s3Bucket,
      Key: fileKey,
    });

    try {
      await s3Client.send(command);
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw new Error('Failed to delete file');
    }
  }

  /**
   * Get the public URL for a file
   */
  static getPublicUrl(fileKey: string): string {
    return `https://${config.aws.s3Bucket}.s3.${config.aws.region}.amazonaws.com/${fileKey}`;
  }

  /**
   * Validate file before upload
   */
  static validateFile(file: File, maxSizeInBytes: number = 10 * 1024 * 1024) {
    // Check file size (default 10MB)
    if (file.size > maxSizeInBytes) {
      throw new Error(`File size exceeds ${maxSizeInBytes / (1024 * 1024)}MB limit`);
    }

    // Allowed file types
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'text/csv',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
      'application/json',
      'text/markdown',
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error('File type not supported');
    }

    return true;
  }

  /**
   * Generate a unique file name
   */
  static generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop();
    return `${timestamp}-${randomString}.${extension}`;
  }

  /**
   * Get file metadata
   */
  static getFileMetadata(file: File) {
    return {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: new Date(file.lastModified),
    };
  }
}

// Export helper functions for common use cases
export async function getUploadUrl(fileName: string, fileType: string, prefix?: string) {
  return S3Service.getPresignedUploadUrl({ fileName, fileType, prefix });
}

export async function deleteFile(fileKey: string) {
  return S3Service.deleteFile(fileKey);
}

export function validateFile(file: File, maxSize?: number) {
  return S3Service.validateFile(file, maxSize);
}

export function getPublicUrl(fileKey: string) {
  return S3Service.getPublicUrl(fileKey);
}

export default S3Service;
