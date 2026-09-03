import { EnvValidationError } from './error';
import { clientSchema, type ClientSchema } from './schemas';

const clientEnvVars = {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
} as const;

export type ClientEnv = ClientSchema & {
  readonly isDev: boolean;
  readonly isProd: boolean;
  readonly isTest: boolean;
};

let cachedClientEnv: ClientEnv | null = null;

export function getClientEnv(): ClientEnv {
  if (cachedClientEnv) {
    return cachedClientEnv;
  }

  const result = clientSchema.safeParse(clientEnvVars);

  if (!result.success) {
    throw new EnvValidationError('Client Environment Validation Failed', result.error);
  }

  cachedClientEnv = {
    ...result.data,
    isDev: result.data.NODE_ENV === 'development',
    isProd: result.data.NODE_ENV === 'production',
    isTest: result.data.NODE_ENV === 'test',
  };

  return cachedClientEnv;
}

export function resetClientEnv(): void {
  cachedClientEnv = null;
}

export const clientEnv = new Proxy({} as ClientEnv, {
  get(_target, prop: keyof ClientEnv) {
    return getClientEnv()[prop];
  },
});

