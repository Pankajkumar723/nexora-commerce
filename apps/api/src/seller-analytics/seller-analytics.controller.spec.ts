import { Test, TestingModule } from '@nestjs/testing';
import { SellerAnalyticsController } from './seller-analytics.controller';
import { SellerAnalyticsService } from './seller-analytics.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SellerApprovalGuard } from '../common/guards/seller-approval.guard';

describe('SellerAnalyticsController', () => {
  let controller: SellerAnalyticsController;
  let service: SellerAnalyticsService;

  const mockAnalyticsService = {
    getOverview: jest.fn(),
    getSalesChart: jest.fn(),
    getBestSellers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SellerAnalyticsController],
      providers: [
        {
          provide: SellerAnalyticsService,
          useValue: mockAnalyticsService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(SellerApprovalGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SellerAnalyticsController>(SellerAnalyticsController);
    service = module.get<SellerAnalyticsService>(SellerAnalyticsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get overview KPIs', async () => {
    const mockOverview = { totalProducts: 10, totalOrders: 5 };
    mockAnalyticsService.getOverview.mockResolvedValueOnce(mockOverview);

    const res = await controller.getOverview('seller-1');
    expect(res.success).toBe(true);
    expect(res.data).toEqual(mockOverview);
  });

  it('should get sales chart series', async () => {
    const mockChart = [{ date: '2026-10-31', sales: 1000 }];
    mockAnalyticsService.getSalesChart.mockResolvedValueOnce(mockChart);

    const res = await controller.getSalesChart('seller-1', '7d');
    expect(res.success).toBe(true);
    expect(res.data).toEqual(mockChart);
  });

  it('should get best sellers list', async () => {
    const mockSellers = [{ name: 'Top Item', totalRevenue: 5000 }];
    mockAnalyticsService.getBestSellers.mockResolvedValueOnce(mockSellers);

    const res = await controller.getBestSellers('seller-1', '5');
    expect(res.success).toBe(true);
    expect(res.data).toEqual(mockSellers);
  });
});
