/**
 * Cloudflare R2 File Storage Helper
 * 
 * S3-compatible object storage with zero egress fees
 * Free tier: 10GB storage, 1M Class A ops, 10M Class B ops
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl?: string; // e.g., https://pub-xxx.r2.dev
}

let r2Client: S3Client | null = null;

/**
 * Initialize R2 client
 */
export function initR2(config: R2Config): S3Client {
  if (!r2Client) {
    r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }
  return r2Client;
}

/**
 * Upload a file to R2
 */
export async function uploadFile(
  config: R2Config,
  options: {
    key: string;
    body: Buffer | Uint8Array | string;
    contentType?: string;
    metadata?: Record<string, string>;
  }
): Promise<{ key: string; url: string }> {
  const client = initR2(config);
  
  await client.send(new PutObjectCommand({
    Bucket: config.bucketName,
    Key: options.key,
    Body: options.body,
    ContentType: options.contentType || 'application/octet-stream',
    Metadata: options.metadata,
  }));

  const url = config.publicUrl 
    ? `${config.publicUrl}/${options.key}`
    : `https://${config.accountId}.r2.cloudflarestorage.com/${config.bucketName}/${options.key}`;

  return { key: options.key, url };
}

/**
 * Generate a presigned upload URL (for client-side uploads)
 */
export async function getPresignedUploadUrl(
  config: R2Config,
  options: {
    key: string;
    contentType: string;
    expiresIn?: number; // seconds, default 3600
  }
): Promise<{ url: string; key: string }> {
  const client = initR2(config);
  
  const url = await getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: options.key,
      ContentType: options.contentType,
    }),
    { expiresIn: options.expiresIn || 3600 }
  );

  return { url, key: options.key };
}

/**
 * Generate a presigned download URL
 */
export async function getPresignedDownloadUrl(
  config: R2Config,
  key: string,
  expiresIn?: number
): Promise<string> {
  const client = initR2(config);
  
  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    }),
    { expiresIn: expiresIn || 3600 }
  );
}

/**
 * Delete a file from R2
 */
export async function deleteFile(config: R2Config, key: string): Promise<void> {
  const client = initR2(config);
  
  await client.send(new DeleteObjectCommand({
    Bucket: config.bucketName,
    Key: key,
  }));
}

/**
 * List files in a prefix
 */
export async function listFiles(
  config: R2Config,
  prefix: string = '',
  options: { maxKeys?: number; continuationToken?: string } = {}
): Promise<{
  files: Array<{ key: string; size: number; lastModified: Date }>;
  nextToken?: string;
  isTruncated: boolean;
}> {
  const client = initR2(config);
  
  const result = await client.send(new ListObjectsV2Command({
    Bucket: config.bucketName,
    Prefix: prefix,
    MaxKeys: options.maxKeys || 100,
    ContinuationToken: options.continuationToken,
  }));

  return {
    files: (result.Contents || []).map(item => ({
      key: item.Key!,
      size: item.Size || 0,
      lastModified: item.LastModified || new Date(),
    })),
    nextToken: result.NextContinuationToken,
    isTruncated: result.IsTruncated || false,
  };
}

/**
 * Helper to generate unique file key
 */
export function generateFileKey(
  userId: string,
  filename: string,
  folder: string = 'uploads'
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = filename.split('.').pop();
  return `${folder}/${userId}/${timestamp}-${random}.${ext}`;
}

/**
 * File size validation (in bytes)
 */
export const FILE_SIZE_LIMITS = {
  avatar: 5 * 1024 * 1024, // 5MB
  document: 25 * 1024 * 1024, // 25MB
  media: 100 * 1024 * 1024, // 100MB
} as const;

/**
 * Validate file type
 */
export function isAllowedFileType(
  filename: string,
  allowed: string[] = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx', 'txt']
): boolean {
  const ext = filename.split('.').pop()?.toLowerCase();
  return allowed.includes(ext || '');
}
