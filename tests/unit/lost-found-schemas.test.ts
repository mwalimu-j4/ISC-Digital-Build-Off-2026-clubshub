import { describe, expect, it } from 'vitest';

import { foundReportSchema, lostReportSchema } from '@/modules/lost-found/schemas';

describe('lost and found report schemas', () => {
  it('accepts a lost report without a description or photo', () => {
    const result = lostReportSchema.safeParse({
      name: 'Student ID',
      location: 'Main Library',
      dateOccurred: '2026-11-05',
    });

    expect(result.success).toBe(true);
  });

  it('requires the current holding location for found reports', () => {
    const result = foundReportSchema.safeParse({
      name: 'Wallet',
      location: 'Student Centre',
      dateOccurred: '2026-11-05',
    });

    expect(result.success).toBe(false);
  });

  it('accepts an optional photo reference', () => {
    const result = foundReportSchema.safeParse({
      name: 'Wallet',
      location: 'Student Centre',
      dateOccurred: '2026-11-05',
      currentHolding: 'Main Reception',
      images: [
        { url: 'https://res.cloudinary.com/demo/image/upload/wallet.jpg', publicId: 'wallet' },
      ],
    });

    expect(result.success).toBe(true);
  });
});
