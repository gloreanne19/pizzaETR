import { serverEnv } from '@/lib/env';

export interface AppEnv {
  NODE_ENV: 'development' | 'production' | 'test';
  isProduction: boolean;
  isDevelopment: boolean;
  isTest: boolean;
  app: {
    url: string;
    port: number;
  };
  db: {
    host: string;
    name: string;
    user: string;
    password?: string;
    port: number;
  };
  jwt: {
    secret: string;
    userCookie: string;
    adminCookie: string;
    expiresIn: string;
  };
  email: {
    host: string;
    port: number;
    user: string;
    pass: string;
    fromName: string;
  };
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
    uploadPreset?: string;
  };
}

export const env: AppEnv = {
  get NODE_ENV() {
    return serverEnv.NODE_ENV;
  },
  get isProduction() {
    return serverEnv.isProd;
  },
  get isDevelopment() {
    return serverEnv.isDev;
  },
  get isTest() {
    return serverEnv.isTest;
  },

  get app() {
    return {
      url: serverEnv.APP_URL,
      port: serverEnv.PORT,
    };
  },

  get db() {
    return {
      host: serverEnv.DB_HOST,
      name: serverEnv.DB_NAME,
      user: serverEnv.DB_USER,
      password: serverEnv.DB_PASSWORD || serverEnv.DB_PASS || '',
      port: serverEnv.DB_PORT,
    };
  },

  get jwt() {
    return {
      secret: serverEnv.JWT_SECRET,
      userCookie: serverEnv.JWT_USER_COOKIE,
      adminCookie: serverEnv.JWT_ADMIN_COOKIE,
      expiresIn: serverEnv.JWT_EXPIRES_IN,
    };
  },

  get email() {
    return {
      host: serverEnv.SMTP_HOST || serverEnv.EMAIL_HOST || 'smtp.gmail.com',
      port: serverEnv.SMTP_PORT || serverEnv.EMAIL_PORT || 587,
      user: serverEnv.SMTP_USER || serverEnv.EMAIL_USER || '',
      pass: serverEnv.SMTP_PASS || serverEnv.EMAIL_PASS || '',
      fromName: serverEnv.EMAIL_FROM_NAME,
    };
  },

  get cloudinary() {
    return {
      cloudName: serverEnv.CLOUDINARY_CLOUD_NAME || '',
      apiKey: serverEnv.CLOUDINARY_API_KEY || '',
      apiSecret: serverEnv.CLOUDINARY_API_SECRET || '',
      uploadPreset: serverEnv.CLOUDINARY_UPLOAD_PRESET || '',
    };
  },
};

// Print Environment Notification on Server Startup (only once per process)
if (typeof window === 'undefined' && !(global as any).__ENV_LOGGED__) {
  (global as any).__ENV_LOGGED__ = true;

  const isProd = serverEnv.isProd;
  const isTest = serverEnv.isTest;
  const envColor = isProd ? '\x1b[31m' : isTest ? '\x1b[33m' : '\x1b[32m';
  const resetColor = '\x1b[0m';
  const bold = '\x1b[1m';

  console.log('\n======================================================');
  console.log(`${bold}PAQUITO'S PIZZA SYSTEM INITIALIZATION${resetColor}`);
  console.log(`Active Environment: ${envColor}${bold}${serverEnv.NODE_ENV.toUpperCase()}${resetColor}`);
  console.log(`Application URL:    ${serverEnv.APP_URL} (Port: ${serverEnv.PORT})`);
  console.log(`Database Target:    ${serverEnv.DB_USER}@${serverEnv.DB_HOST}:${serverEnv.DB_PORT}/${serverEnv.DB_NAME}`);
  console.log('======================================================\n');
}

export default env;
