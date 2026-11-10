import { describe, expect, it } from 'vitest';

import { getVercelBuildSteps } from '../../scripts/vercel-build.mjs';

describe('Vercel build steps', () => {
  it('runs migrations and admin seeding only for Production', () => {
    expect(getVercelBuildSteps('production')).toEqual([
      'db:generate',
      'db:migrate:deploy',
      'db:seed:super-admin',
      'build:app',
    ]);
  });

  it.each(['preview', 'development', undefined])(
    'skips database writes in the %s environment',
    (environment) => {
      expect(getVercelBuildSteps(environment)).toEqual(['db:generate', 'build:app']);
    },
  );
});
