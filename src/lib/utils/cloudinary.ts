import { createHmac } from 'node:crypto';

function getConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary environment variables are not configured');
  }

  return { cloudName, apiKey, apiSecret };
}

function generateSignature(params: Record<string, string>, apiSecret: string): string {
  const sortedKeys = Object.keys(params).sort();
  const stringToSign = sortedKeys.map((k) => `${k}=${params[k]}`).join('&');
  return createHmac('sha256', apiSecret).update(stringToSign).digest('hex');
}

export async function uploadToCloudinary(
  buffer: Buffer,
  options: { folder?: string; resourceType?: string } = {},
): Promise<{ url: string; publicId: string; width: number; height: number }> {
  const { cloudName, apiKey, apiSecret } = getConfig();
  const folder = options.folder ?? 'clubshub/lost-found';
  const resourceType = options.resourceType ?? 'image';
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const params: Record<string, string> = {
    folder,
    timestamp,
  };

  const signature = generateSignature(params, apiSecret);

  const formData = new FormData();
  formData.append('file', new Blob([new Uint8Array(buffer)]));
  formData.append('folder', folder);
  formData.append('timestamp', timestamp);
  formData.append('api_key', apiKey);
  formData.append('signature', signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    { method: 'POST', body: formData },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cloudinary upload failed: ${error}`);
  }

  const result = await response.json();

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width ?? 0,
    height: result.height ?? 0,
  };
}

// Re-export client-safe URL utility for server-side consumers
export { getOptimizedUrl } from './cloudinary-url';
