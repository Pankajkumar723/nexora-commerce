import { Test, TestingModule } from '@nestjs/testing';
import { CouponsService } from './coupons.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DiscountType, Prisma } from '@prisma/client';

describe('CouponsService', () => {
  let service: CouponsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponsService,
        {
          provide: PrismaService,
          useValue: {
            coupon: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CouponsService>(CouponsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateCoupon', () => {
    it('should throw BadRequestException when code is empty', async () => {
      await expect(service.validateCoupon('', 1000)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when coupon is not found', async () => {
      (prisma.coupon.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.validateCoupon('UNKNOWN', 1000)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when coupon is inactive', async () => {
      (prisma.coupon.findUnique as jest.Mock).mockResolvedValueOnce({
        code: 'INACTIVE',
        active: false,
      });

      await expect(service.validateCoupon('INACTIVE', 1000)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when coupon has expired', async () => {
      (prisma.coupon.findUnique as jest.Mock).mockResolvedValueOnce({
        code: 'EXPIRED',
        active: true,
        startsAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
        expiresAt: new Date(Date.now() - 1000 * 60), // Expired
      });

      await expect(service.validateCoupon('EXPIRED', 1000)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when usage limit is reached', async () => {
      (prisma.coupon.findUnique as jest.Mock).mockResolvedValueOnce({
        code: 'MAXED',
        active: true,
        startsAt: new Date(Date.now() - 1000 * 60),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        usageLimit: 10,
        usedCount: 10,
      });

      await expect(service.validateCoupon('MAXED', 1000)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when order subtotal is below minimum required', async () => {
      (prisma.coupon.findUnique as jest.Mock).mockResolvedValueOnce({
        code: 'MINREQ',
        active: true,
        startsAt: new Date(Date.now() - 1000 * 60),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        usageLimit: 100,
        usedCount: 5,
        minOrderAmount: new Prisma.Decimal('2000.00'),
      });

      await expect(service.validateCoupon('MINREQ', 1500)).rejects.toThrow(BadRequestException);
    });

    it('should calculate percentage discount correctly', async () => {
      (prisma.coupon.findUnique as jest.Mock).mockResolvedValueOnce({
        code: 'NEXORA10',
        active: true,
        startsAt: new Date(Date.now() - 1000 * 60),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        usageLimit: 100,
        usedCount: 0,
        discountType: DiscountType.PERCENTAGE,
        value: new Prisma.Decimal('10.00'),
        minOrderAmount: new Prisma.Decimal('1000.00'),
      });

      const res = await service.validateCoupon('NEXORA10', 5000);
      expect(res.valid).toBe(true);
      expect(res.discountAmount).toBe(500); // 10% of 5000
    });

    it('should calculate fixed amount discount correctly', async () => {
      (prisma.coupon.findUnique as jest.Mock).mockResolvedValueOnce({
        code: 'WELCOME500',
        active: true,
        startsAt: new Date(Date.now() - 1000 * 60),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        usageLimit: 50,
        usedCount: 0,
        discountType: DiscountType.FIXED_AMOUNT,
        value: new Prisma.Decimal('500.00'),
        minOrderAmount: new Prisma.Decimal('2000.00'),
      });

      const res = await service.validateCoupon('WELCOME500', 3000);
      expect(res.valid).toBe(true);
      expect(res.discountAmount).toBe(500);
    });
  });

  describe('incrementUsage', () => {
    it('should increment coupon used count', async () => {
      (prisma.coupon.update as jest.Mock).mockResolvedValueOnce({ code: 'TEST', usedCount: 1 });

      await service.incrementUsage('TEST');
      expect(prisma.coupon.update).toHaveBeenCalledWith({
        where: { code: 'TEST' },
        data: { usedCount: { increment: 1 } },
      });
    });
  });
});
