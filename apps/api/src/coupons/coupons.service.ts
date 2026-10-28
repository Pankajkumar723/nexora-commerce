import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DiscountType, Prisma } from '@prisma/client';

export interface ValidatedCouponResult {
  valid: boolean;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  minOrderAmount?: number;
}

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Validate coupon code against server rules and subtotal
   */
  async validateCoupon(code: string, orderSubtotal: number): Promise<ValidatedCouponResult> {
    if (!code || code.trim() === '') {
      throw new BadRequestException('Coupon code is required.');
    }

    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon) {
      throw new NotFoundException(`Coupon code "${code}" is invalid or does not exist.`);
    }

    if (!coupon.active) {
      throw new BadRequestException(`Coupon "${coupon.code}" is no longer active.`);
    }

    const now = new Date();
    if (coupon.startsAt > now) {
      throw new BadRequestException(`Coupon "${coupon.code}" is not active yet.`);
    }

    if (coupon.expiresAt < now) {
      throw new BadRequestException(`Coupon "${coupon.code}" has expired.`);
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException(`Coupon "${coupon.code}" usage limit has been reached.`);
    }

    const subtotalDecimal = new Prisma.Decimal(orderSubtotal || 0);

    if (coupon.minOrderAmount && subtotalDecimal.lessThan(coupon.minOrderAmount)) {
      throw new BadRequestException(
        `Coupon "${coupon.code}" requires a minimum order subtotal of ₹${coupon.minOrderAmount}. Current subtotal is ₹${orderSubtotal}.`,
      );
    }

    let discountAmountDecimal = new Prisma.Decimal(0);
    if (coupon.discountType === DiscountType.PERCENTAGE) {
      discountAmountDecimal = subtotalDecimal.mul(coupon.value).div(100);
    } else {
      // Fixed amount discount cannot exceed order subtotal
      discountAmountDecimal = subtotalDecimal.lessThan(coupon.value)
        ? subtotalDecimal
        : coupon.value;
    }

    const discountAmount = Number(discountAmountDecimal.toFixed(2));

    return {
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: Number(coupon.value),
      discountAmount,
      minOrderAmount: coupon.minOrderAmount ? Number(coupon.minOrderAmount) : undefined,
    };
  }

  /**
   * Increment coupon used count in transaction
   */
  async incrementUsage(code: string, tx?: any) {
    const client = tx || this.prisma;
    return client.coupon.update({
      where: { code: code.toUpperCase() },
      data: { usedCount: { increment: 1 } },
    });
  }
}
