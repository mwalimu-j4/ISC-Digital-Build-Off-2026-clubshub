/**
 * Client-safe Cloudinary URL utilities.
 * No Node.js-only imports — safe for 'use client' components.
 */

export function getOptimizedUrl(url: string, options: { width?: number; height?: number; quality?: string } = {}): string {
  if (!url.includes('cloudinary.com')) return url;

  const { width, height, quality = 'auto' } = options;
  const transforms = [`q_${quality}`, 'f_auto'];
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  transforms.push('c_limit');

  return url.replace('/upload/', `/upload/${transforms.join(',')}/`);
}
