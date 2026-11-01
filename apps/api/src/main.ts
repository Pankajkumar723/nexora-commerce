import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const logger = new Logger('NexoraBootstrap');
  const app = await NestFactory.create(AppModule);

  // Allow larger payload for image uploads
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') || 4000;
  const storeUrl = configService.get<string>('app.storeUrl') || 'http://localhost:3000';
  const adminUrl = configService.get<string>('app.adminUrl') || 'http://localhost:3001';

  // 1. Route Prefixing: /api/v1
  app.setGlobalPrefix('api/v1');

  // 2. Global Exception Filter & Validation Pipe
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const sellerUrl = configService.get<string>('app.sellerUrl') || 'http://localhost:3002';

  // 3. CORS Configuration
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      const explicitOrigins = [
        storeUrl,
        adminUrl,
        sellerUrl,
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3002',
      ];

      if (
        explicitOrigins.includes(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1):[0-9]+$/.test(origin)
      ) {
        return callback(null, true);
      }

      return callback(new Error(`CORS origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // 4. Swagger OpenAPI Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Nexora Commerce API')
    .setDescription('Canonical REST API for Nexora Commerce e-commerce platform and AI assistant')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Health', 'System uptime and status endpoints')
    .addTag('Catalog', 'Products, categories, search, filtering, and variants')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
  logger.log(`🚀 Nexora API server running at: http://localhost:${port}/api/v1`);
  logger.log(`📚 OpenAPI / Swagger documentation at: http://localhost:${port}/api/docs`);
}

bootstrap();
