import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CommissionStatus } from '@prisma/client';

@Injectable()
export class CommissionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * List commission records for authenticated seller
   */
  async getCommissions(
    sellerId: string,
    options: {
      status?: CommissionStatus;
      page?: number;
      limit?: number;
    } = {},
  ) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = { sellerId };
    if (options.status) {
      where.status = options.status;
    }

    const [items, total] = await Promise.all([
      this.prisma.commissionRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          orderItem: {
            select: {
              nameSnapshot: true,
              skuSnapshot: true,
              quantity: true,
              priceSnapshot: true,
              fulfillmentStatus: true,
              order: {
                select: {
                  orderNumber: true,
                  createdAt: true,
                },
              },
            },
          },
          payout: {
            select: {
              payoutNumber: true,
              status: true,
              processedAt: true,
            },
          },
        },
      }),
      this.prisma.commissionRecord.count({ where }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Calculate aggregated financial earnings breakdown for seller
   */
  async getFinancialSummary(sellerId: string) {
    const seller = await this.prisma.sellerProfile.findUnique({
      where: { id: sellerId },
      select: { commissionRate: true },
    });

    if (!seller) {
      throw new NotFoundException('Seller profile not found.');
    }

    const records = await this.prisma.commissionRecord.findMany({
      where: { sellerId },
    });

    let grossSales = 0;
    let totalCommissionDeducted = 0;
    let netEarnings = 0;
    let availableForPayout = 0;
    let pendingSettlement = 0;
    let totalPaidOut = 0;

    for (const r of records) {
      const gross = Number(r.grossAmount);
      const comm = Number(r.commissionAmount);
      const net = Number(r.netSellerAmount);

      grossSales += gross;
      totalCommissionDeducted += comm;
      netEarnings += net;

      if (r.status === CommissionStatus.AVAILABLE) {
        availableForPayout += net;
      } else if (r.status === CommissionStatus.PENDING) {
        pendingSettlement += net;
      } else if (r.status === CommissionStatus.PAID) {
        totalPaidOut += net;
      }
    }

    return {
      commissionRate: Number(seller.commissionRate),
      grossSales: Math.round(grossSales * 100) / 100,
      totalCommissionDeducted: Math.round(totalCommissionDeducted * 100) / 100,
      netEarnings: Math.round(netEarnings * 100) / 100,
      availableForPayout: Math.round(availableForPayout * 100) / 100,
      pendingSettlement: Math.round(pendingSettlement * 100) / 100,
      totalPaidOut: Math.round(totalPaidOut * 100) / 100,
      totalTransactions: records.length,
    };
  }
}
