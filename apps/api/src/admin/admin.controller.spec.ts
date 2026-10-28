import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { OrderStatus } from '@prisma/client';

describe('AdminController', () => {
  let controller: AdminController;
  let service: AdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: {
            getAnalytics: jest.fn(),
            getAllOrders: jest.fn(),
            updateOrderStatus: jest.fn(),
            adjustStock: jest.fn(),
            getAllCoupons: jest.fn(),
            createCoupon: jest.fn(),
            getAllCustomers: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AdminController>(AdminController);
    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAnalytics', () => {
    it('should return analytics metrics wrapped in apiSuccess', async () => {
      const mockData = { revenue: 50000, totalOrders: 10 };
      (service.getAnalytics as jest.Mock).mockResolvedValueOnce(mockData);

      const res = await controller.getAnalytics();
      expect(res.success).toBe(true);
      expect(res.data).toEqual(mockData);
    });
  });

  describe('getOrders', () => {
    it('should return paginated orders', async () => {
      const mockResult = { items: [{ id: 'ord-1' }], meta: { total: 1 } };
      (service.getAllOrders as jest.Mock).mockResolvedValueOnce(mockResult);

      const res = await controller.getOrders();
      expect(res.success).toBe(true);
      expect(res.data).toEqual(mockResult.items);
    });
  });

  describe('updateOrderStatus', () => {
    it('should update status and return apiSuccess', async () => {
      (service.updateOrderStatus as jest.Mock).mockResolvedValueOnce({
        id: 'ord-1',
        status: OrderStatus.SHIPPED,
      });

      const res = await controller.updateOrderStatus('ord-1', { status: OrderStatus.SHIPPED });
      expect(res.success).toBe(true);
    });
  });

  describe('adjustStock', () => {
    it('should adjust inventory stock', async () => {
      (service.adjustStock as jest.Mock).mockResolvedValueOnce({
        variantId: 'var-1',
        newStock: 30,
      });

      const res = await controller.adjustStock('admin-1', {
        variantId: 'var-1',
        quantityDelta: 10,
        reason: 'RESTOCK',
      });
      expect(res.success).toBe(true);
    });
  });
});
