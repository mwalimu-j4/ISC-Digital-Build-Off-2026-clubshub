import { NextResponse } from 'next/server';

import { getCurrentSession } from '@/lib/auth/session';
import { uploadToCloudinary } from '@/lib/utils/cloudinary';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_MB } from '@/modules/lost-found/constants';

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' }, { status: 400 });
    }

    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      return NextResponse.json({ error: `File too large. Maximum size is ${MAX_IMAGE_SIZE_MB}MB.` }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadToCloudinary(buffer);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Upload failed:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }
}
