import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { DiscountType, OrderStatus, Prisma } from '@prisma/client';

describe('AdminService', () => {
  let service: AdminService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: PrismaService,
          useValue: {
            order: {
              findMany: jest.fn(),
              count: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            product: {
              count: jest.fn(),
            },
            customerProfile: {
              count: jest.fn(),
              findMany: jest.fn(),
            },
            productVariant: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            inventoryMovement: {
              create: jest.fn(),
            },
            coupon: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAnalytics', () => {
    it('should aggregate revenue and counts correctly', async () => {
      (prisma.order.findMany as jest.Mock)
        .mockResolvedValueOnce([{ total: new Prisma.Decimal('1000') }, { total: new Prisma.Decimal('2000') }]) // revenue orders
        .mockResolvedValueOnce([]); // recent orders
      (prisma.product.count as jest.Mock).mockResolvedValueOnce(15);
      (prisma.customerProfile.count as jest.Mock).mockResolvedValueOnce(40);
      (prisma.productVariant.findMany as jest.Mock).mockResolvedValueOnce([
        { id: 'v-1', sku: 'SKU-LOW', stockQuantity: 2, product: { name: 'Watch', slug: 'watch' } },
      ]);
      (prisma.order.count as jest.Mock).mockResolvedValueOnce(5);

      const res = await service.getAnalytics();
      expect(res.revenue).toBe(3000);
      expect(res.totalProducts).toBe(15);
      expect(res.totalCustomers).toBe(40);
      expect(res.lowStockCount).toBe(1);
      expect(res.totalOrders).toBe(5);
    });
  });

  describe('updateOrderStatus', () => {
    it('should throw NotFoundException if order missing', async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        service.updateOrderStatus('ord-unknown', OrderStatus.SHIPPED),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update order status', async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'ord-1' });
      (prisma.order.update as jest.Mock).mockResolvedValueOnce({
        id: 'ord-1',
        status: OrderStatus.SHIPPED,
      });

      const res = await service.updateOrderStatus('ord-1', OrderStatus.SHIPPED);
      expect(res.status).toBe(OrderStatus.SHIPPED);
    });
  });

  describe('adjustStock', () => {
    it('should throw NotFoundException if variant does not exist', async () => {
      (prisma.productVariant.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        service.adjustStock({ variantId: 'var-unknown', quantityDelta: 10, reason: 'RESTOCK' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if adjustment results in negative stock', async () => {
      (prisma.productVariant.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'var-1',
        stockQuantity: 5,
        product: { name: 'Item' },
      });

      await expect(
        service.adjustStock({ variantId: 'var-1', quantityDelta: -10, reason: 'CORRECTION' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update variant stock and create inventory movement within transaction', async () => {
      (prisma.productVariant.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'var-1',
        sku: 'SKU-1',
        stockQuantity: 10,
        product: { name: 'Item' },
      });

      (prisma.$transaction as jest.Mock).mockImplementationOnce(async (callback) => {
        return callback({
          productVariant: {
            update: jest.fn().mockResolvedValue({ id: 'var-1', sku: 'SKU-1', stockQuantity: 25 }),
          },
          inventoryMovement: {
            create: jest.fn().mockResolvedValue({}),
          },
        });
      });

      const res = await service.adjustStock(
        { variantId: 'var-1', quantityDelta: 15, reason: 'RESTOCK_SHIPMENT' },
        'admin-1',
      );

      expect(res.previousStock).toBe(10);
      expect(res.newStock).toBe(25);
      expect(res.delta).toBe(15);
    });
  });

  describe('createCoupon', () => {
    it('should throw ConflictException if coupon code already exists', async () => {
      (prisma.coupon.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'cp-1', code: 'EXISTS' });

      await expect(
        service.createCoupon({
          code: 'EXISTS',
          discountType: DiscountType.PERCENTAGE,
          value: 10,
          expiresAt: new Date(),
        }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
