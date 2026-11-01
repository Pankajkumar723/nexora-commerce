import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RequestPayoutDto } from './dto/request-payout.dto';
import { CommissionStatus, PayoutStatus } from '@prisma/client';
import { randomBytes } from 'crypto';

@Injectable()
export class PayoutsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * List payouts for authenticated seller
   */
  async getPayouts(
    sellerId: string,
    options: {
      status?: PayoutStatus;
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
      this.prisma.payout.findMany({
        where,
        skip,
        take: limit,
        orderBy: { requestedAt: 'desc' },
        include: {
          seller: {
            select: {
              bankAccountName: true,
              bankAccountNumber: true,
              bankIfscCode: true,
              bankName: true,
            },
          },
          _count: { select: { commissions: true } },
        },
      }),
      this.prisma.payout.count({ where }),
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
   * Get single payout with ownership verification
   */
  async getPayoutById(sellerId: string, payoutId: string) {
    const payout = await this.prisma.payout.findUnique({
      where: { id: payoutId },
      include: {
        seller: {
          select: {
            storeName: true,
            bankAccountName: true,
            bankAccountNumber: true,
            bankIfscCode: true,
            bankName: true,
          },
        },
        commissions: {
          include: {
            orderItem: {
              select: {
                nameSnapshot: true,
                order: { select: { orderNumber: true } },
              },
            },
          },
        },
      },
    });

    if (!payout) {
      throw new NotFoundException(`Payout with ID "${payoutId}" not found.`);
    }

    if (payout.sellerId !== sellerId) {
      throw new ForbiddenException('Access denied: You do not own this payout record.');
    }

    return payout;
  }

  /**
   * Request a payout against available commission earnings
   */
  async requestPayout(sellerId: string, dto: RequestPayoutDto) {
    // Check available commissions
    const availableRecords = await this.prisma.commissionRecord.findMany({
      where: {
        sellerId,
        status: CommissionStatus.AVAILABLE,
      },
      orderBy: { createdAt: 'asc' },
    });

    const totalAvailable = availableRecords.reduce(
      (sum, r) => sum + Number(r.netSellerAmount),
      0,
    );

    if (dto.amount > totalAvailable) {
      throw new BadRequestException(
        `Insufficient available earnings. Requested: ₹${dto.amount}, Available: ₹${totalAvailable.toFixed(2)}`,
      );
    }

    // Select records to link up to the requested amount
    let accumulated = 0;
    const recordsToLink: string[] = [];
    for (const r of availableRecords) {
      recordsToLink.push(r.id);
      accumulated += Number(r.netSellerAmount);
      if (accumulated >= dto.amount) break;
    }

    const payoutNumber = `PAY-${Date.now().toString(36).toUpperCase()}-${randomBytes(3)
      .toString('hex')
      .toUpperCase()}`;

    return this.prisma.$transaction(async (tx) => {
      const payout = await tx.payout.create({
        data: {
          payoutNumber,
          sellerId,
          amount: dto.amount,
          status: PayoutStatus.PENDING,
          notes: dto.notes,
        },
      });

      // Link records and set status to PAID
      await tx.commissionRecord.updateMany({
        where: { id: { in: recordsToLink } },
        data: {
          payoutId: payout.id,
          status: CommissionStatus.PAID,
        },
      });

      // Notify seller
      await tx.sellerNotification.create({
        data: {
          sellerId,
          title: 'Payout Request Submitted',
          message: `Your withdrawal request #${payoutNumber} for ₹${dto.amount} has been received and is queued for processing.`,
          type: 'PAYOUT',
        },
      });

      return payout;
    });
  }
}
