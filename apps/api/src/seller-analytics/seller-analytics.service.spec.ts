import { Test, TestingModule } from '@nestjs/testing';
import { SellerAnalyticsService } from './seller-analytics.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SellerAnalyticsService', () => {
  let service: SellerAnalyticsService;
  let prisma: PrismaService;

  const mockPrisma = {
    product: {
      count: jest.fn(),
    },
    commissionRecord: {
      findMany: jest.fn(),
    },
    orderItem: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SellerAnalyticsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<SellerAnalyticsService>(SellerAnalyticsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOverview', () => {
    it('should aggregate KPI counts, orders, and financial metrics', async () => {
      mockPrisma.product.count
        .mockResolvedValueOnce(15) // total
        .mockResolvedValueOnce(12) // active
        .mockResolvedValueOnce(3); // pending

      mockPrisma.commissionRecord.findMany.mockResolvedValueOnce([
        { grossAmount: 1000, commissionAmount: 100, netSellerAmount: 900 },
        { grossAmount: 2000, commissionAmount: 200, netSellerAmount: 1800 },
      ]);

      mockPrisma.orderItem.findMany.mockResolvedValueOnce([
        { orderId: 'ord-1', fulfillmentStatus: 'PENDING' },
        { orderId: 'ord-1', fulfillmentStatus: 'SHIPPED' },
        { orderId: 'ord-2', fulfillmentStatus: 'DELIVERED' },
      ]);

      const res = await service.getOverview('seller-1');
      expect(res.totalProducts).toBe(15);
      expect(res.activeProducts).toBe(12);
      expect(res.pendingProducts).toBe(3);
      expect(res.totalOrders).toBe(2);
      expect(res.pendingOrders).toBe(1);
      expect(res.grossSales).toBe(3000);
      expect(res.totalCommissionDeducted).toBe(300);
      expect(res.netEarnings).toBe(2700);
    });
  });

  describe('getSalesChart', () => {
    it('should bucket revenue and order counts into time periods', async () => {
      mockPrisma.commissionRecord.findMany.mockResolvedValueOnce([
        {
          grossAmount: 1500,
          commissionAmount: 150,
          netSellerAmount: 1350,
          createdAt: new Date(),
        },
      ]);

      const res = await service.getSalesChart('seller-1', '7d');
      expect(Array.isArray(res)).toBe(true);
      expect(res.length).toBe(7);
    });
  });

  describe('getBestSellers', () => {
    it('should aggregate and rank top-selling products by revenue', async () => {
      mockPrisma.orderItem.findMany.mockResolvedValueOnce([
        {
          nameSnapshot: 'Smart Watch',
          skuSnapshot: 'SW-1',
          imageSnapshot: 'img.jpg',
          priceSnapshot: 2000,
          quantity: 3,
        },
        {
          nameSnapshot: 'Bluetooth Speaker',
          skuSnapshot: 'BS-1',
          imageSnapshot: 'spk.jpg',
          priceSnapshot: 1500,
          quantity: 1,
        },
      ]);

      const res = await service.getBestSellers('seller-1', 2);
      expect(res.length).toBe(2);
      expect(res[0].name).toBe('Smart Watch');
      expect(res[0].totalRevenue).toBe(6000);
      expect(res[0].totalQuantity).toBe(3);
    });
  });
});
