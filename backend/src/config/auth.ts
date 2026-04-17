/**
 * Centralized JWT configuration.
 * In production, JWT_SECRET must be explicitly set — no fallback.
 */

const isProd = process.env.NODE_ENV === 'production';

export const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (isProd) {
      throw new Error('JWT_SECRET is required in production environment');
    }
    return 'dev-secret-change-me-in-production';
  }
  return secret;
};

export const JWT_EXPIRES_IN = '7d';
