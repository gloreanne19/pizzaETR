import { z } from 'zod';

const nodeEnv = z
  .enum(['development', 'production', 'test'])
  .default('development');

const portSchema = (defaultPort: number) =>
  z.preprocess((val) => {
    if (val === undefined || val === null || val === '') return defaultPort;
    const num = Number(val);
    return isNaN(num) ? defaultPort : num;
  }, z.number().default(defaultPort));

export const serverSchema = z.object({
  NODE_ENV: nodeEnv,
  PORT: portSchema(3000),
  APP_URL: z.string().url().default('http://localhost:3000'),

  // Database settings
  DB_HOST: z.string().default('127.0.0.1'),
  DB_NAME: z.string().default('pizza_pizza'),
  DB_USER: z.string().default('root'),
  DB_PASS: z.string().optional().default(''),
  DB_PASSWORD: z.string().optional(),
  DB_PORT: portSchema(3306),

  // Authentication
  JWT_SECRET: z.string().default('dev_jwt_secret_key_super_secure_12345'),
  JWT_USER_COOKIE: z.string().default('pizza_user_token'),
  JWT_ADMIN_COOKIE: z.string().default('pizza_admin_token'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // Email / SMTP
  EMAIL_HOST: z.string().optional().default('smtp.gmail.com'),
  SMTP_HOST: z.string().optional(),
  EMAIL_PORT: portSchema(587),
  SMTP_PORT: portSchema(587).optional(),
  EMAIL_USER: z.string().optional().default(''),
  SMTP_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional().default(''),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM_NAME: z.string().default("Paquito's Pizza"),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),
  CLOUDINARY_UPLOAD_PRESET: z.string().optional().default(''),
});

export const clientSchema = z.object({
  NODE_ENV: nodeEnv,
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_API_URL: z.string().optional(),
});

export type ServerSchema = z.infer<typeof serverSchema>;
export type ClientSchema = z.infer<typeof clientSchema>;

