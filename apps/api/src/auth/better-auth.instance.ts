import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

let cachedAuth: any = null;

export async function getBetterAuth() {
  if (cachedAuth) return cachedAuth;
  // Use dynamic import via Function constructor so TypeScript CommonJS emit doesn't transform it to require()
  const dynamicImport = new Function('specifier', 'return import(specifier)');
  const [{ betterAuth }, { prismaAdapter }] = await Promise.all([
    dynamicImport('better-auth'),
    dynamicImport('better-auth/adapters/prisma'),
  ]);

  cachedAuth = betterAuth({
    database: prismaAdapter(prisma, {
      provider: 'postgresql',
    }),
    basePath: '/api/v1/auth',
    baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:4000',
    secret: process.env.BETTER_AUTH_SECRET || 'nexora-commerce-better-auth-secure-secret-key-32chars',
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      autoSignIn: true,
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID || 'dummy-google-client-id',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-google-client-secret',
      },
    },
    session: {
      expiresIn: 30 * 24 * 60 * 60, // 30 days
      updateAge: 24 * 60 * 60, // 24 hours
    },
    trustedOrigins: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3002',
      (process.env.STORE_URL || 'http://localhost:3000').replace(/\/+$/, ''),
      (process.env.ADMIN_URL || 'http://localhost:3001').replace(/\/+$/, ''),
      (process.env.SELLER_URL || 'http://localhost:3002').replace(/\/+$/, ''),
      ...(process.env.ADDITIONAL_CORS_ORIGINS
        ? process.env.ADDITIONAL_CORS_ORIGINS.split(',').map((o: string) => o.trim().replace(/\/+$/, ''))
        : []),
    ],
  });

  return cachedAuth;
}
