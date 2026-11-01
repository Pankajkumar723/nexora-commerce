import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { CatalogModule } from './catalog/catalog.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { CartModule } from './cart/cart.module';
import { CouponsModule } from './coupons/coupons.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { AdminModule } from './admin/admin.module';
import { AiModule } from './ai/ai.module';
import { SellersModule } from './sellers/sellers.module';
import { SellerProductsModule } from './seller-products/seller-products.module';
import { SellerOrdersModule } from './seller-orders/seller-orders.module';
import { CommissionsModule } from './commissions/commissions.module';
import { PayoutsModule } from './payouts/payouts.module';
import { SellerAnalyticsModule } from './seller-analytics/seller-analytics.module';
import { SellerNotificationsModule } from './seller-notifications/seller-notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule,
    HealthModule,
    CatalogModule,
    AuthModule,
    UsersModule,
    WishlistModule,
    CartModule,
    CouponsModule,
    OrdersModule,
    PaymentsModule,
    AdminModule,
    AiModule,
    SellersModule,
    SellerProductsModule,
    SellerOrdersModule,
    CommissionsModule,
    PayoutsModule,
    SellerAnalyticsModule,
    SellerNotificationsModule,
  ],
})
export class AppModule {}
