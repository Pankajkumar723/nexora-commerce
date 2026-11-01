import { Test, TestingModule } from '@nestjs/testing';
import { PayoutsService } from './payouts.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CommissionStatus, PayoutStatus } from '@prisma/client';

describe('PayoutsService', () => {
  let service: PayoutsService;
  let prisma: PrismaService;

  const mockPrisma = {
    payout: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    commissionRecord: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
    sellerNotification: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrisma)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayoutsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<PayoutsService>(PayoutsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPayouts', () => {
    it('should list payouts for seller', async () => {
      mockPrisma.payout.findMany.mockResolvedValueOnce([
        { id: 'pay-1', amount: 5000, status: PayoutStatus.COMPLETED },
      ]);
      mockPrisma.payout.count.mockResolvedValueOnce(1);

      const res = await service.getPayouts('seller-1');
      expect(res.items.length).toBe(1);
      expect(res.meta.total).toBe(1);
    });
  });

  describe('getPayoutById', () => {
    it('should return payout if seller owns it', async () => {
      mockPrisma.payout.findUnique.mockResolvedValueOnce({
        id: 'pay-1',
        sellerId: 'seller-1',
        amount: 2500,
      });

      const res = await service.getPayoutById('seller-1', 'pay-1');
      expect(res.id).toBe('pay-1');
    });

    it('should throw NotFoundException if payout does not exist', async () => {
      mockPrisma.payout.findUnique.mockResolvedValueOnce(null);

      await expect(service.getPayoutById('seller-1', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if seller is not owner', async () => {
      mockPrisma.payout.findUnique.mockResolvedValueOnce({
        id: 'pay-1',
        sellerId: 'diff-seller',
      });

      await expect(service.getPayoutById('seller-1', 'pay-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('requestPayout', () => {
    it('should create payout when balance is sufficient', async () => {
      mockPrisma.commissionRecord.findMany.mockResolvedValueOnce([
        { id: 'comm-1', netSellerAmount: 3000, status: CommissionStatus.AVAILABLE },
        { id: 'comm-2', netSellerAmount: 4000, status: CommissionStatus.AVAILABLE },
      ]);
      mockPrisma.payout.create.mockResolvedValueOnce({
        id: 'pay-new',
        payoutNumber: 'PAY-1234',
        amount: 5000,
        status: PayoutStatus.PENDING,
      });

      const res = await service.requestPayout('seller-1', { amount: 5000 });
      expect(res.amount).toBe(5000);
      expect(mockPrisma.payout.create).toHaveBeenCalled();
      expect(mockPrisma.commissionRecord.updateMany).toHaveBeenCalled();
    });

    it('should throw BadRequestException when requested amount exceeds available balance', async () => {
      mockPrisma.commissionRecord.findMany.mockResolvedValueOnce([
        { id: 'comm-1', netSellerAmount: 1000, status: CommissionStatus.AVAILABLE },
      ]);

      await expect(
        service.requestPayout('seller-1', { amount: 5000 }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
