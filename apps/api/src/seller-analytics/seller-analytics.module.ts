import { Module } from '@nestjs/common';
import { SellerAnalyticsController } from './seller-analytics.controller';
import { SellerAnalyticsService } from './seller-analytics.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SellerAnalyticsController],
  providers: [SellerAnalyticsService],
  exports: [SellerAnalyticsService],
})
export class SellerAnalyticsModule {}
