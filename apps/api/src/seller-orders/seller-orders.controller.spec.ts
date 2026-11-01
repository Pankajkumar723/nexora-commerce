import { Test, TestingModule } from '@nestjs/testing';
import { SellerOrdersController } from './seller-orders.controller';
import { SellerOrdersService } from './seller-orders.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SellerApprovalGuard } from '../common/guards/seller-approval.guard';
import { FulfillmentStatus } from '@prisma/client';

describe('SellerOrdersController', () => {
  let controller: SellerOrdersController;
  let service: SellerOrdersService;

  const mockSellerOrdersService = {
    getOrders: jest.fn(),
    getOrderById: jest.fn(),
    updateItemFulfillment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SellerOrdersController],
      providers: [
        {
          provide: SellerOrdersService,
          useValue: mockSellerOrdersService,
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

    controller = module.get<SellerOrdersController>(SellerOrdersController);
    service = module.get<SellerOrdersService>(SellerOrdersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should list seller orders', async () => {
    mockSellerOrdersService.getOrders.mockResolvedValueOnce({
      items: [{ id: 'ord-1' }],
      meta: { total: 1 },
    });

    const res = await controller.getOrders('seller-1');
    expect(res.success).toBe(true);
    expect(res.data).toEqual([{ id: 'ord-1' }]);
    expect(mockSellerOrdersService.getOrders).toHaveBeenCalledWith(
      'seller-1',
      expect.objectContaining({ page: 1, limit: 20 }),
    );
  });

  it('should get order details by id', async () => {
    mockSellerOrdersService.getOrderById.mockResolvedValueOnce({ id: 'ord-1' });

    const res = await controller.getOrderById('seller-1', 'ord-1');
    expect(res.success).toBe(true);
    expect(res.data).toEqual({ id: 'ord-1' });
    expect(mockSellerOrdersService.getOrderById).toHaveBeenCalledWith(
      'seller-1',
      'ord-1',
    );
  });

  it('should update item fulfillment status', async () => {
    mockSellerOrdersService.updateItemFulfillment.mockResolvedValueOnce({
      id: 'item-1',
      fulfillmentStatus: FulfillmentStatus.SHIPPED,
    });

    const res = await controller.updateItemFulfillment('seller-1', 'item-1', {
      status: FulfillmentStatus.SHIPPED,
      trackingNumber: 'TRACK123',
    });

    expect(res.success).toBe(true);
    expect(mockSellerOrdersService.updateItemFulfillment).toHaveBeenCalledWith(
      'seller-1',
      'item-1',
      { status: FulfillmentStatus.SHIPPED, trackingNumber: 'TRACK123' },
    );
  });
});
