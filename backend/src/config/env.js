import dotenv from 'dotenv';

dotenv.config();

const requireJwtSecret = () => {
  const jwtSecret =
    typeof process.env.JWT_SECRET === 'string' ? process.env.JWT_SECRET.trim() : '';

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is required');
  }

  return jwtSecret;
};

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  jwtSecret: requireJwtSecret(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
  databaseUrl: process.env.DATABASE_URL || '',
  pg: {
    host: process.env.PGHOST || '127.0.0.1',
    port: Number(process.env.PGPORT) || 5432,
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE || 'hub_freelance',
  },
  smtpHost: typeof process.env.SMTP_HOST === 'string' ? process.env.SMTP_HOST.trim() : '',
  smtpPort: Number(process.env.SMTP_PORT) || 587,
  smtpUser: typeof process.env.SMTP_USER === 'string' ? process.env.SMTP_USER.trim() : '',
  smtpPassword:
    typeof process.env.SMTP_PASSWORD === 'string' ? process.env.SMTP_PASSWORD : '',
  smtpFrom: typeof process.env.SMTP_FROM === 'string' ? process.env.SMTP_FROM.trim() : '',
  publicApiUrl:
    typeof process.env.PUBLIC_API_URL === 'string' ? process.env.PUBLIC_API_URL.trim() : '',
  appBaseUrl:
    typeof process.env.APP_BASE_URL === 'string' ? process.env.APP_BASE_URL.trim() : '',
  geminiApiKey:
    typeof process.env.GEMINI_API_KEY === 'string' &&
    process.env.GEMINI_API_KEY.trim() !== 'your_gemini_api_key_here'
      ? process.env.GEMINI_API_KEY.trim()
      : '',
  geminiModel:
    typeof process.env.GEMINI_MODEL === 'string' && process.env.GEMINI_MODEL.trim()
      ? process.env.GEMINI_MODEL.trim()
      : 'gemini-3.8-flash',
  resendApiKey:
    typeof process.env.RESEND_API_KEY === 'string' ? process.env.RESEND_API_KEY.trim() : '',
  emailFrom: typeof process.env.EMAIL_FROM === 'string' ? process.env.EMAIL_FROM.trim() : '',
  contactEmail:
    typeof process.env.CONTACT_EMAIL === 'string' ? process.env.CONTACT_EMAIL.trim() : '',
};
