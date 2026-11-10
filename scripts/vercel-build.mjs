import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function getVercelBuildSteps(vercelEnvironment) {
  return vercelEnvironment === 'production'
    ? ['db:generate', 'db:migrate:deploy', 'db:seed:super-admin', 'build:app']
    : ['db:generate', 'build:app'];
}

export function runVercelBuild(vercelEnvironment = process.env.VERCEL_ENV) {
  const packageManager = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

  for (const script of getVercelBuildSteps(vercelEnvironment)) {
    console.info(`\n> pnpm ${script}`);
    const result = spawnSync(packageManager, ['run', script], {
      env: process.env,
      shell: process.platform === 'win32',
      stdio: 'inherit',
    });

    if (result.error) {
      console.error(result.error.message);
      process.exit(1);
    }
    if (result.status !== 0) process.exit(result.status ?? 1);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runVercelBuild();
}
