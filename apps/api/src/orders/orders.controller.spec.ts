import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { BadRequestException } from '@nestjs/common';
import { Role } from '@prisma/client';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  const mockOrder = {
    id: 'ord-1',
    orderNumber: 'NEX-20261028-ABC123',
    total: 18999,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: {
            createOrder: jest.fn(),
            getCustomerOrders: jest.fn(),
            getOrderById: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createOrder', () => {
    it('should throw BadRequestException if profileId is missing', async () => {
      await expect(controller.createOrder(null as any, { addressId: 'a-1' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create order and return apiSuccess envelope', async () => {
      (service.createOrder as jest.Mock).mockResolvedValueOnce(mockOrder);

      const res = await controller.createOrder('prof-1', { addressId: 'a-1' });
      expect(res.success).toBe(true);
      expect(res.data).toEqual(mockOrder);
    });
  });

  describe('getCustomerOrders', () => {
    it('should return list of orders', async () => {
      (service.getCustomerOrders as jest.Mock).mockResolvedValueOnce([mockOrder]);

      const res = await controller.getCustomerOrders('prof-1');
      expect(res.success).toBe(true);
      expect(res.data).toEqual([mockOrder]);
    });
  });

  describe('getOrderById', () => {
    it('should return order details by ID', async () => {
      (service.getOrderById as jest.Mock).mockResolvedValueOnce(mockOrder);

      const res = await controller.getOrderById('ord-1', 'prof-1', Role.CUSTOMER);
      expect(res.success).toBe(true);
      expect(res.data).toEqual(mockOrder);
    });
  });
});
