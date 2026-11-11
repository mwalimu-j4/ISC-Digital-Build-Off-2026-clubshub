import { describe, expect, it } from 'vitest';

import { decisionSchema } from '../../src/modules/join-requests/validations/join-request-schema';

describe('join request decisions', () => {
  it('allows an approval without a rejection reason', () => {
    expect(decisionSchema.parse({ decision: 'APPROVE', note: '', reason: '' })).toEqual({
      decision: 'APPROVE',
      note: '',
    });
  });

  it('requires a useful reason when rejecting', () => {
    expect(decisionSchema.safeParse({ decision: 'REJECT', reason: '' }).success).toBe(false);
    expect(decisionSchema.parse({ decision: 'REJECT', reason: 'Not eligible' })).toEqual({
      decision: 'REJECT',
      reason: 'Not eligible',
    });
  });
});
