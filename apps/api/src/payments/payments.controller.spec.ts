import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { BadRequestException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let service: PaymentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: {
            createRazorpayOrder: jest.fn(),
            verifyPayment: jest.fn(),
            processWebhook: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PaymentsController>(PaymentsController);
    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createRazorpayOrder', () => {
    it('should throw BadRequestException if profileId is missing', async () => {
      await expect(
        controller.createRazorpayOrder(null as any, { orderId: 'ord-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create Razorpay order and return apiSuccess', async () => {
      const mockResult = {
        orderId: 'ord-1',
        razorpayOrderId: 'order_123',
        keyId: 'rzp_test',
        amount: 500000,
        currency: 'INR',
      };

      (service.createRazorpayOrder as jest.Mock).mockResolvedValueOnce(mockResult);

      const res = await controller.createRazorpayOrder('prof-1', { orderId: 'ord-1' });
      expect(res.success).toBe(true);
      expect(res.data).toEqual(mockResult);
    });
  });

  describe('verifyPayment', () => {
    it('should verify signature and return confirmed order status', async () => {
      const mockResult = {
        verified: true,
        orderId: 'ord-1',
        status: OrderStatus.CONFIRMED,
      };

      (service.verifyPayment as jest.Mock).mockResolvedValueOnce(mockResult);

      const dto = {
        orderId: 'ord-1',
        razorpayOrderId: 'order_123',
        razorpayPaymentId: 'pay_456',
        razorpaySignature: 'sig_valid',
      };

      const res = await controller.verifyPayment('prof-1', dto);
      expect(res.success).toBe(true);
      expect(res.data).toEqual(mockResult);
    });
  });

  describe('handleWebhook', () => {
    it('should process webhook and return apiSuccess', async () => {
      (service.processWebhook as jest.Mock).mockResolvedValueOnce({ processed: true });

      const mockReq = { body: { id: 'evt_1' } } as any;
      const res = await controller.handleWebhook('mock_sig', mockReq, { id: 'evt_1' });
      expect(res.success).toBe(true);
      expect(res.data).toEqual({ processed: true });
    });
  });
});
