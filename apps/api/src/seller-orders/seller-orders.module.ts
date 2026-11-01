import { Module } from '@nestjs/common';
import { SellerOrdersController } from './seller-orders.controller';
import { SellerOrdersService } from './seller-orders.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SellerOrdersController],
  providers: [SellerOrdersService],
  exports: [SellerOrdersService],
})
export class SellerOrdersModule {}
