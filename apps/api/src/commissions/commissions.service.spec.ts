import { Test, TestingModule } from '@nestjs/testing';
import { CommissionsService } from './commissions.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CommissionStatus } from '@prisma/client';

describe('CommissionsService', () => {
  let service: CommissionsService;
  let prisma: PrismaService;

  const mockPrisma = {
    sellerProfile: {
      findUnique: jest.fn(),
    },
    commissionRecord: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommissionsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<CommissionsService>(CommissionsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCommissions', () => {
    it('should list commission records for seller', async () => {
      mockPrisma.commissionRecord.findMany.mockResolvedValueOnce([
        { id: 'c-1', grossAmount: 1000, commissionAmount: 100, netSellerAmount: 900 },
      ]);
      mockPrisma.commissionRecord.count.mockResolvedValueOnce(1);

      const res = await service.getCommissions('seller-1');
      expect(res.items.length).toBe(1);
      expect(res.meta.total).toBe(1);
    });
  });

  describe('getFinancialSummary', () => {
    it('should calculate gross, commission deductions, net and available payout balance', async () => {
      mockPrisma.sellerProfile.findUnique.mockResolvedValueOnce({
        id: 'seller-1',
        commissionRate: 10.0,
      });

      mockPrisma.commissionRecord.findMany.mockResolvedValueOnce([
        {
          grossAmount: 1000,
          commissionAmount: 100,
          netSellerAmount: 900,
          status: CommissionStatus.AVAILABLE,
        },
        {
          grossAmount: 2000,
          commissionAmount: 200,
          netSellerAmount: 1800,
          status: CommissionStatus.PENDING,
        },
        {
          grossAmount: 500,
          commissionAmount: 50,
          netSellerAmount: 450,
          status: CommissionStatus.PAID,
        },
      ]);

      const res = await service.getFinancialSummary('seller-1');
      expect(res.grossSales).toBe(3500);
      expect(res.totalCommissionDeducted).toBe(350);
      expect(res.netEarnings).toBe(3150);
      expect(res.availableForPayout).toBe(900);
      expect(res.pendingSettlement).toBe(1800);
      expect(res.totalPaidOut).toBe(450);
      expect(res.totalTransactions).toBe(3);
    });

    it('should throw NotFoundException if seller profile not found', async () => {
      mockPrisma.sellerProfile.findUnique.mockResolvedValueOnce(null);

      await expect(service.getFinancialSummary('seller-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
