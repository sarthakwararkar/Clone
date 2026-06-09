/**
 * R2 Storage service for Cloudflare R2.
 * Uses the R2 Worker binding for in-Worker operations.
 * Falls back to S3 SDK for GitHub Actions jobs.
 */
export class R2Service {
  private bucket: R2Bucket | null;
  private publicUrl: string;

  constructor(bucket: R2Bucket | null, publicUrl: string) {
    this.bucket = bucket;
    this.publicUrl = publicUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  /**
   * Upload a file to R2 and return the public URL.
   * @param key - The storage key (e.g. 'stores/logos/amazon.png')
   * @param file - The file content as ArrayBuffer
   * @param contentType - MIME type (e.g. 'image/png')
   * @returns The public URL of the uploaded file
   */
  async uploadFile(key: string, file: ArrayBuffer, contentType: string): Promise<string> {
    if (!this.bucket) {
      throw new Error('R2 bucket binding not available');
    }

    await this.bucket.put(key, file, {
      httpMetadata: {
        contentType,
        cacheControl: 'public, max-age=31536000, immutable',
      },
    });

    return `${this.publicUrl}/${key}`;
  }

  /**
   * Delete a file from R2.
   * @param key - The storage key to delete
   */
  async deleteFile(key: string): Promise<void> {
    if (!this.bucket) {
      throw new Error('R2 bucket binding not available');
    }

    await this.bucket.delete(key);
  }

  /**
   * Extract the R2 key from a public URL.
   * @param url - The public URL of the file
   * @returns The R2 storage key
   */
  getKeyFromUrl(url: string): string | null {
    if (!url.startsWith(this.publicUrl)) return null;
    return url.slice(this.publicUrl.length + 1); // +1 for the /
  }
}

/**
 * Factory function to create an R2Service instance from Worker bindings.
 */
export function createR2Service(bucket: R2Bucket | null, publicUrl: string): R2Service {
  return new R2Service(bucket, publicUrl);
}

// ─── S3 Fallback for GitHub Actions ─────────────────────────────────────────

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

/**
 * R2 Storage service using S3-compatible API.
 * Used in GitHub Actions jobs where R2 Worker bindings are unavailable.
 */
export class R2ServiceS3 {
  private s3: S3Client;
  private bucketName: string;
  private publicUrl: string;

  constructor(
    accountId: string,
    accessKeyId: string,
    secretAccessKey: string,
    bucketName: string,
    publicUrl: string
  ) {
    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
    this.bucketName = bucketName;
    this.publicUrl = publicUrl.replace(/\/$/, '');
  }

  async uploadFile(key: string, file: ArrayBuffer, contentType: string): Promise<string> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: new Uint8Array(file),
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      })
    );

    return `${this.publicUrl}/${key}`;
  }

  async deleteFile(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      })
    );
  }
}
