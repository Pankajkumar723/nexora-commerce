export interface AppConfig {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  betterAuthSecret: string;
  betterAuthUrl: string;
  storeUrl: string;
  adminUrl: string;
  sellerUrl: string;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  razorpayWebhookSecret: string;
  aiProviderApiKey: string;
  aiModel: string;
}

export default (): { app: AppConfig } => ({
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '4000', 10),
    databaseUrl: process.env.DATABASE_URL || 'postgresql://nexora_user:nexora_password@localhost:5432/nexora?schema=public',
    betterAuthSecret: process.env.BETTER_AUTH_SECRET || 'dev-secret-key-32-chars-long-placeholder',
    betterAuthUrl: process.env.BETTER_AUTH_URL || 'http://localhost:4000',
    storeUrl: process.env.STORE_URL || 'http://localhost:3000',
    adminUrl: process.env.ADMIN_URL || 'http://localhost:3001',
    sellerUrl: process.env.SELLER_URL || 'http://localhost:3002',
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_sample',
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || 'secret_mock',
    razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || 'webhook_secret_mock',
    aiProviderApiKey: process.env.AI_PROVIDER_API_KEY || '',
    aiModel: process.env.AI_MODEL || 'gemini-1.5-flash',
  },
});
