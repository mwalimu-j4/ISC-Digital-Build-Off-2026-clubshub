import { z } from 'zod';

import { DISCOVERY_INTEREST_SLUGS } from '@/modules/discovery/constants';

const interestSlugSchema = z.enum(DISCOVERY_INTEREST_SLUGS);

export const discoveryQuerySchema = z
  .object({
    interests: z.string().max(240).optional(),
    category: z.string().trim().max(80).optional(),
    sort: z.enum(['match', 'active', 'newest']).default('match'),
    verified: z.enum(['0', '1', 'true', 'false']).default('0'),
    q: z.string().trim().max(80).optional(),
    page: z.coerce.number().int().min(1).max(100).default(1),
  })
  .transform((query) => ({
    interests: query.interests
      ? [
          ...new Set(
            query.interests.split(',').map((slug) => interestSlugSchema.parse(slug.trim())),
          ),
        ].slice(0, 8)
      : [],
    category: query.category || undefined,
    sort: query.sort,
    verifiedOnly: query.verified === '1' || query.verified === 'true',
    q: query.q || undefined,
    page: query.page,
  }));

export type DiscoveryQueryInput = z.input<typeof discoveryQuerySchema>;
export type DiscoveryQuery = z.output<typeof discoveryQuerySchema>;

export function parseDiscoveryQuery(input: Record<string, string | string[] | undefined>) {
  const scalar = (key: string) => (Array.isArray(input[key]) ? input[key][0] : input[key]);
  return discoveryQuerySchema.parse({
    interests: scalar('interests'),
    category: scalar('category'),
    sort: scalar('sort'),
    verified: scalar('verified'),
    q: scalar('q'),
    page: scalar('page'),
  });
}
