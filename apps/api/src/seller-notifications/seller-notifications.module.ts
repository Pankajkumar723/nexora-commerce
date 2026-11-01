import { Module } from '@nestjs/common';
import { SellerNotificationsController } from './seller-notifications.controller';
import { SellerNotificationsService } from './seller-notifications.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SellerNotificationsController],
  providers: [SellerNotificationsService],
  exports: [SellerNotificationsService],
})
export class SellerNotificationsModule {}
