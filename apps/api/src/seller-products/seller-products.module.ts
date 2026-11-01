import { Module } from '@nestjs/common';
import { SellerProductsController } from './seller-products.controller';
import { SellerProductsService } from './seller-products.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SellerProductsController],
  providers: [SellerProductsService],
  exports: [SellerProductsService],
})
export class SellerProductsModule {}
