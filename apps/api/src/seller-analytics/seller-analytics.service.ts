import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductStatus, FulfillmentStatus } from '@prisma/client';

@Injectable()
export class SellerAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get seller dashboard overview metrics
   */
  async getOverview(sellerId: string) {
    const [
      totalProducts,
      activeProducts,
      pendingProducts,
      commissions,
      sellerOrderItems,
    ] = await Promise.all([
      this.prisma.product.count({ where: { sellerId } }),
      this.prisma.product.count({
        where: { sellerId, status: ProductStatus.ACTIVE },
      }),
      this.prisma.product.count({
        where: { sellerId, status: ProductStatus.PENDING_APPROVAL },
      }),
      this.prisma.commissionRecord.findMany({
        where: { sellerId },
        select: {
          grossAmount: true,
          commissionAmount: true,
          netSellerAmount: true,
          status: true,
        },
      }),
      this.prisma.orderItem.findMany({
        where: { sellerId },
        select: {
          orderId: true,
          fulfillmentStatus: true,
        },
      }),
    ]);

    const distinctOrderIds = new Set(sellerOrderItems.map((i) => i.orderId));
    const totalOrders = distinctOrderIds.size;
    const pendingOrders = sellerOrderItems.filter(
      (i) => i.fulfillmentStatus === FulfillmentStatus.PENDING,
    ).length;

    let grossSales = 0;
    let totalCommissionDeducted = 0;
    let netEarnings = 0;

    for (const c of commissions) {
      grossSales += Number(c.grossAmount);
      totalCommissionDeducted += Number(c.commissionAmount);
      netEarnings += Number(c.netSellerAmount);
    }

    return {
      totalProducts,
      activeProducts,
      pendingProducts,
      totalOrders,
      pendingOrders,
      grossSales: Math.round(grossSales * 100) / 100,
      totalCommissionDeducted: Math.round(totalCommissionDeducted * 100) / 100,
      netEarnings: Math.round(netEarnings * 100) / 100,
    };
  }

  /**
   * Get sales trend chart data (daily for 7/30 days, or monthly for 12 months)
   */
  async getSalesChart(sellerId: string, period: '7d' | '30d' | '12m' = '7d') {
    const days = period === '30d' ? 30 : period === '12m' ? 365 : 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const commissions = await this.prisma.commissionRecord.findMany({
      where: {
        sellerId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Bucket into dates
    const dataPoints: Record<
      string,
      { date: string; sales: number; netEarnings: number; commission: number; orders: number }
    > = {};

    // Initialize buckets
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = period === '12m' 
        ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        : d.toISOString().split('T')[0];

      if (!dataPoints[key]) {
        dataPoints[key] = {
          date: key,
          sales: 0,
          netEarnings: 0,
          commission: 0,
          orders: 0,
        };
      }
    }

    for (const c of commissions) {
      const d = new Date(c.createdAt);
      const key = period === '12m'
        ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        : d.toISOString().split('T')[0];

      if (dataPoints[key]) {
        dataPoints[key].sales += Number(c.grossAmount);
        dataPoints[key].commission += Number(c.commissionAmount);
        dataPoints[key].netEarnings += Number(c.netSellerAmount);
        dataPoints[key].orders += 1;
      }
    }

    return Object.values(dataPoints);
  }

  /**
   * Get top-selling products by quantity and revenue for seller
   */
  async getBestSellers(sellerId: string, limit: number = 5) {
    const items = await this.prisma.orderItem.findMany({
      where: { sellerId },
      select: {
        nameSnapshot: true,
        skuSnapshot: true,
        imageSnapshot: true,
        priceSnapshot: true,
        quantity: true,
      },
    });

    const productMap = new Map<
      string,
      { name: string; sku: string; image: string | null; totalQuantity: number; totalRevenue: number }
    >();

    for (const item of items) {
      const existing = productMap.get(item.nameSnapshot) || {
        name: item.nameSnapshot,
        sku: item.skuSnapshot || 'N/A',
        image: item.imageSnapshot,
        totalQuantity: 0,
        totalRevenue: 0,
      };

      existing.totalQuantity += item.quantity;
      existing.totalRevenue += Number(item.priceSnapshot) * item.quantity;
      productMap.set(item.nameSnapshot, existing);
    }

    return Array.from(productMap.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);
  }
}
