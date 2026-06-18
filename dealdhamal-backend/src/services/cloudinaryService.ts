/**
 * Cloudinary Storage service.
 * Uses Cloudinary Upload API with standard fetch for compatibility with Cloudflare Workers.
 */
export class CloudinaryService {
  private cloudName: string;
  private apiKey: string;
  private apiSecret: string;

  constructor(cloudName: string, apiKey: string, apiSecret: string) {
    this.cloudName = cloudName;
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  /**
   * Helper to sign request parameters for Cloudinary secure endpoints.
   */
  private async generateSignature(params: Record<string, string | number>): Promise<string> {
    const sortedKeys = Object.keys(params).sort();
    const sortedParams = sortedKeys.map(key => `${key}=${params[key]}`).join('&');
    const stringToSign = `${sortedParams}${this.apiSecret}`;

    const encoder = new TextEncoder();
    const data = encoder.encode(stringToSign);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Upload a file buffer to Cloudinary.
   * @param key - The destination storage path/key (e.g. 'stores/logos/amazon.png')
   * @param file - The file content as ArrayBuffer
   * @param contentType - MIME type
   * @returns The secure public URL of the uploaded image
   */
  async uploadFile(key: string, file: ArrayBuffer, contentType: string): Promise<string> {
    // Strip file extension to get the clean public_id (as Cloudinary appends the extension automatically)
    const dotIndex = key.lastIndexOf('.');
    const publicId = dotIndex !== -1 ? key.slice(0, dotIndex) : key;
    const timestamp = Math.round(Date.now() / 1000);

    const params = {
      public_id: publicId,
      timestamp: timestamp,
    };

    const signature = await this.generateSignature(params);

    const formData = new FormData();
    formData.append('file', new Blob([file], { type: contentType }));
    formData.append('api_key', this.apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('public_id', publicId);
    formData.append('signature', signature);

    const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloudinary upload failed: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json() as { secure_url: string };
    return data.secure_url;
  }

  /**
   * Delete an image from Cloudinary using its public_id.
   * @param key - The storage key or public_id
   */
  async deleteFile(key: string): Promise<void> {
    const dotIndex = key.lastIndexOf('.');
    const publicId = dotIndex !== -1 ? key.slice(0, dotIndex) : key;
    const timestamp = Math.round(Date.now() / 1000);

    const params = {
      public_id: publicId,
      timestamp: timestamp,
    };

    const signature = await this.generateSignature(params);

    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('api_key', this.apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);

    const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/destroy`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloudinary delete failed: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json() as { result: string };
    if (data.result !== 'ok' && data.result !== 'not found') {
      throw new Error(`Cloudinary delete failed with result: ${data.result}`);
    }
  }

  /**
   * Parse a Cloudinary URL to retrieve the original public ID.
   * @param url - Cloudinary image URL
   */
  getKeyFromUrl(url: string): string | null {
    const prefix = `https://res.cloudinary.com/${this.cloudName}/image/upload/`;
    if (!url.startsWith(prefix)) return null;

    let path = url.slice(prefix.length);

    // Remove the version segment (e.g. v1234567890/)
    const versionRegex = /^v\d+\//;
    path = path.replace(versionRegex, '');

    // Strip the extension
    const dotIndex = path.lastIndexOf('.');
    if (dotIndex !== -1) {
      path = path.slice(0, dotIndex);
    }

    return path;
  }
}

export function createCloudinaryService(cloudName: string, apiKey: string, apiSecret: string): CloudinaryService {
  return new CloudinaryService(cloudName, apiKey, apiSecret);
}
