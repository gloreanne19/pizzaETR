import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { EnvValidationError } from './error';
import { serverSchema, type ServerSchema } from './schemas';

export type ServerEnv = ServerSchema & {
  readonly isDev: boolean;
  readonly isProd: boolean;
  readonly isTest: boolean;
};

let cachedServerEnv: ServerEnv | null = null;

function loadEnvFiles(): void {
  const nodeEnv = (process.env.NODE_ENV as string) || 'development';
  const candidateFiles = [
    '.env',
    '.env.local',
    nodeEnv === 'development' ? '.env.dev' : null,
    `.env.${nodeEnv}`,
    nodeEnv === 'development' ? '.env.dev.local' : null,
    `.env.${nodeEnv}.local`,
  ].filter(Boolean) as string[];

  for (const file of candidateFiles) {
    const filePath = path.resolve(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      try {
        const fileBuffer = fs.readFileSync(filePath);
        const parsed = dotenv.parse(fileBuffer);
        for (const [k, v] of Object.entries(parsed)) {
          process.env[k] = v;
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  }
}

export function getServerEnv(): ServerEnv {
  if (typeof window !== 'undefined') {
    throw new Error('Server environment variables cannot be accessed from the client.');
  }

  if (cachedServerEnv) {
    return cachedServerEnv;
  }

  loadEnvFiles();

  const result = serverSchema.safeParse(process.env);

  if (!result.success) {
    throw new EnvValidationError('Server Environment Validation Failed', result.error);
  }

  cachedServerEnv = {
    ...result.data,
    isDev: result.data.NODE_ENV === 'development',
    isProd: result.data.NODE_ENV === 'production',
    isTest: result.data.NODE_ENV === 'test',
  };

  return cachedServerEnv;
}

export function resetServerEnv(): void {
  cachedServerEnv = null;
}

export const serverEnv = new Proxy({} as ServerEnv, {
  get(_target, prop: keyof ServerEnv) {
    return getServerEnv()[prop];
  },
});

