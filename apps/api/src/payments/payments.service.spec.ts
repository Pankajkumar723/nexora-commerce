import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: PrismaService;
  let cartService: CartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: PrismaService,
          useValue: {
            order: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            payment: {
              create: jest.fn(),
              updateMany: jest.fn(),
            },
            webhookEvent: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            productVariant: {
              update: jest.fn(),
            },
            inventoryMovement: {
              create: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
        {
          provide: CartService,
          useValue: {
            clearCart: jest.fn().mockResolvedValue({ cleared: true }),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'app.razorpayKeyId') return 'rzp_test_123';
              if (key === 'app.razorpayKeySecret') return 'test_secret_key';
              if (key === 'app.razorpayWebhookSecret') return 'test_webhook_secret';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    prisma = module.get<PrismaService>(PrismaService);
    cartService = module.get<CartService>(CartService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('HMAC Signature verification', () => {
    it('should generate valid SHA-256 HMAC and perform secure constant-time comparison', () => {
      const data = 'order_123|pay_456';
      const secret = 'test_secret_key';
      const signature = service.generateSignature(data, secret);

      expect(signature).toBeDefined();
      expect(service.secureCompare(signature, signature)).toBe(true);
      expect(service.secureCompare(signature, 'tampered_signature')).toBe(false);
    });
  });

  describe('createRazorpayOrder', () => {
    it('should throw NotFoundException if order does not exist', async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        service.createRazorpayOrder('cust-1', { orderId: 'ord-unknown' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if order belongs to a different customer', async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'ord-1',
        customerId: 'other-customer',
      });

      await expect(
        service.createRazorpayOrder('cust-1', { orderId: 'ord-1' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if order status is not PENDING', async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'ord-1',
        customerId: 'cust-1',
        status: OrderStatus.CONFIRMED,
      });

      await expect(
        service.createRazorpayOrder('cust-1', { orderId: 'ord-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create payment record and return Razorpay order details with public keyId', async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'ord-1',
        customerId: 'cust-1',
        orderNumber: 'NEX-20261028-1234',
        status: OrderStatus.PENDING,
        total: new Prisma.Decimal('18999.00'),
      });

      const res = await service.createRazorpayOrder('cust-1', { orderId: 'ord-1' });
      expect(res.orderId).toBe('ord-1');
      expect(res.razorpayOrderId).toMatch(/^order_[a-f0-9]{16}$/);
      expect(res.keyId).toBe('rzp_test_123');
      expect(res.amount).toBe(1899900); // Amount in paise
      expect(res.currency).toBe('INR');
      expect(prisma.payment.create).toHaveBeenCalled();
    });
  });

  describe('verifyPayment', () => {
    it('should throw BadRequestException if signature is invalid or tampered', async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'ord-1',
        customerId: 'cust-1',
        status: OrderStatus.PENDING,
        items: [],
      });

      await expect(
        service.verifyPayment('cust-1', {
          orderId: 'ord-1',
          razorpayOrderId: 'order_123',
          razorpayPaymentId: 'pay_456',
          razorpaySignature: 'invalid_tampered_signature',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should verify signature, confirm order, decrement stock, and clear cart', async () => {
      const razorpayOrderId = 'order_valid_123';
      const razorpayPaymentId = 'pay_valid_456';
      const validSignature = service.generateSignature(
        `${razorpayOrderId}|${razorpayPaymentId}`,
        'test_secret_key',
      );

      (prisma.order.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'ord-1',
        customerId: 'cust-1',
        orderNumber: 'NEX-1234',
        status: OrderStatus.PENDING,
        items: [
          {
            productVariantId: 'var-1',
            quantity: 2,
          },
        ],
      });

      (prisma.$transaction as jest.Mock).mockImplementationOnce(async (callback) => {
        return callback({
          payment: { updateMany: jest.fn().mockResolvedValue({}) },
          order: { update: jest.fn().mockResolvedValue({}) },
          productVariant: { update: jest.fn().mockResolvedValue({}) },
          inventoryMovement: { create: jest.fn().mockResolvedValue({}) },
        });
      });

      const result = await service.verifyPayment('cust-1', {
        orderId: 'ord-1',
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature: validSignature,
      });

      expect(result.verified).toBe(true);
      expect(result.status).toBe(OrderStatus.CONFIRMED);
      expect(cartService.clearCart).toHaveBeenCalledWith('cust-1');
    });
  });

  describe('processWebhook', () => {
    it('should throw BadRequestException if webhook signature is invalid', async () => {
      await expect(
        service.processWebhook('{"event":"payment.captured"}', 'invalid_sig', {}),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return duplicate: true if webhook event was already processed', async () => {
      const rawBody = '{"id":"evt_123","event":"payment.captured"}';
      const signature = service.generateSignature(rawBody, 'test_webhook_secret');

      (prisma.webhookEvent.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'we-1',
        providerEventId: 'evt_123',
      });

      const res = await service.processWebhook(rawBody, signature, { id: 'evt_123' });
      expect(res.processed).toBe(true);
      expect(res.duplicate).toBe(true);
    });
  });
});
