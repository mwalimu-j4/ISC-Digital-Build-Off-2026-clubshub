import { createHash } from 'node:crypto';

import { z } from 'zod';

export class CloudinaryUploadError extends Error {
  constructor(message = 'Media upload failed. Please try again.') {
    super(message);
    this.name = 'CloudinaryUploadError';
  }
}

function getConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new CloudinaryUploadError();
  }

  return { cloudName, apiKey, apiSecret };
}

export function generateCloudinarySignature(
  params: Record<string, string>,
  apiSecret: string,
): string {
  const sortedKeys = Object.keys(params).sort();
  const stringToSign = sortedKeys.map((k) => `${k}=${params[k]}`).join('&');
  return createHash('sha1').update(`${stringToSign}${apiSecret}`).digest('hex');
}

const cloudinaryUploadResponseSchema = z.object({
  secure_url: z.string().url(),
  public_id: z.string().min(1),
  width: z.number().optional(),
  height: z.number().optional(),
  bytes: z.number().optional(),
  duration: z.number().optional(),
});

export async function uploadToCloudinary(
  buffer: Buffer,
  options: { folder?: string; resourceType?: string } = {},
): Promise<{
  url: string;
  publicId: string;
  width: number;
  height: number;
  bytes: number;
  durationSeconds: number | null;
}> {
  const { cloudName, apiKey, apiSecret } = getConfig();
  const folder = options.folder ?? 'clubshub/lost-found';
  const resourceType = options.resourceType ?? 'image';
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const params: Record<string, string> = {
    folder,
    timestamp,
  };

  const signature = generateCloudinarySignature(params, apiSecret);

  const formData = new FormData();
  formData.append('file', new Blob([new Uint8Array(buffer)]));
  for (const [key, value] of Object.entries(params)) {
    formData.append(key, value);
  }
  formData.append('api_key', apiKey);
  formData.append('signature', signature);

  let response: Response;
  try {
    response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
      method: 'POST',
      body: formData,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Cloudinary upload request failed:', error);
    throw new CloudinaryUploadError();
  }

  if (!response.ok) {
    const providerError = await response.text();
    // eslint-disable-next-line no-console
    console.error('Cloudinary upload failed:', providerError);
    throw new CloudinaryUploadError();
  }

  let responseBody: unknown;
  try {
    responseBody = JSON.parse(await response.text());
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Cloudinary returned an unreadable upload response:', error);
    throw new CloudinaryUploadError();
  }
  const parsedResult = cloudinaryUploadResponseSchema.safeParse(responseBody);
  if (!parsedResult.success) {
    // eslint-disable-next-line no-console
    console.error('Cloudinary returned an invalid upload response:', parsedResult.error);
    throw new CloudinaryUploadError();
  }
  const result = parsedResult.data;

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width ?? 0,
    height: result.height ?? 0,
    bytes: result.bytes ?? 0,
    durationSeconds: result.duration ? Math.ceil(result.duration) : null,
  };
}

// Re-export client-safe URL utility for server-side consumers
export { getOptimizedUrl } from './cloudinary-url';
