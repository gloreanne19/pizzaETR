export {
  serverEnv,
  getServerEnv,
  resetServerEnv,
  type ServerEnv,
} from './server';

export {
  clientEnv,
  getClientEnv,
  resetClientEnv,
  type ClientEnv,
} from './client';

export {
  serverSchema,
  clientSchema,
  type ServerSchema,
  type ClientSchema,
} from './schemas';

export { EnvValidationError } from './error';

export function validateEnv(): void {
  if (typeof window === 'undefined') {
    const { getServerEnv } = require('./server');
    getServerEnv();
  }

  const { getClientEnv } = require('./client');
  getClientEnv();
}

