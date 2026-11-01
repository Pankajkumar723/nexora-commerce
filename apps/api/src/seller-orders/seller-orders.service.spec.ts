import { Test, TestingModule } from '@nestjs/testing';
import { SellerOrdersService } from './seller-orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { FulfillmentStatus, CommissionStatus } from '@prisma/client';

describe('SellerOrdersService', () => {
  let service: SellerOrdersService;
  let prisma: PrismaService;

  const mockPrisma = {
    order: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
    },
    orderItem: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    commissionRecord: {
      update: jest.fn(),
    },
    sellerNotification: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrisma)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SellerOrdersService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<SellerOrdersService>(SellerOrdersService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOrders', () => {
    it('should query orders and compute seller-specific subtotal', async () => {
      mockPrisma.order.findMany.mockResolvedValueOnce([
        {
          id: 'ord-1',
          orderNumber: 'NEX-1001',
          customer: { name: 'Customer A', phone: '1234567890' },
          addressSnapshot: { city: 'Mumbai' },
          status: 'CONFIRMED',
          createdAt: new Date(),
          items: [
            {
              id: 'item-1',
              sellerId: 'seller-1',
              priceSnapshot: 500,
              quantity: 2,
            },
          ],
        },
      ]);
      mockPrisma.order.count.mockResolvedValueOnce(1);

      const res = await service.getOrders('seller-1');
      expect(res.items.length).toBe(1);
      expect(res.items[0].sellerSubtotal).toBe(1000);
      expect(res.items[0].items.length).toBe(1);
    });
  });

  describe('getOrderById', () => {
    it('should return sanitized order if seller has items', async () => {
      mockPrisma.order.findUnique.mockResolvedValueOnce({
        id: 'ord-1',
        orderNumber: 'NEX-1001',
        customer: { name: 'Customer A', phone: '123' },
        addressSnapshot: {},
        status: 'CONFIRMED',
        createdAt: new Date(),
        items: [
          {
            id: 'item-1',
            sellerId: 'seller-1',
            priceSnapshot: 200,
            quantity: 3,
          },
        ],
      });

      const res = await service.getOrderById('seller-1', 'ord-1');
      expect(res.sellerSubtotal).toBe(600);
      expect(res.items.length).toBe(1);
    });

    it('should throw NotFoundException if order does not exist', async () => {
      mockPrisma.order.findUnique.mockResolvedValueOnce(null);

      await expect(service.getOrderById('seller-1', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if order contains no items for this seller', async () => {
      mockPrisma.order.findUnique.mockResolvedValueOnce({
        id: 'ord-1',
        items: [],
      });

      await expect(service.getOrderById('seller-1', 'ord-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('updateItemFulfillment', () => {
    it('should update fulfillment status to SHIPPED and record timestamp', async () => {
      mockPrisma.orderItem.findUnique.mockResolvedValueOnce({
        id: 'item-1',
        sellerId: 'seller-1',
        shippedAt: null,
        order: { orderNumber: 'NEX-1001' },
        nameSnapshot: 'Shirt',
        commission: null,
      });
      mockPrisma.orderItem.update.mockResolvedValueOnce({
        id: 'item-1',
        fulfillmentStatus: FulfillmentStatus.SHIPPED,
        trackingNumber: 'AWB123',
      });

      const res = await service.updateItemFulfillment('seller-1', 'item-1', {
        status: FulfillmentStatus.SHIPPED,
        trackingNumber: 'AWB123',
        shippingCarrier: 'Delhivery',
      });

      expect(res.fulfillmentStatus).toBe(FulfillmentStatus.SHIPPED);
      expect(mockPrisma.orderItem.update).toHaveBeenCalled();
    });

    it('should update commission status to AVAILABLE when item is DELIVERED', async () => {
      mockPrisma.orderItem.findUnique.mockResolvedValueOnce({
        id: 'item-1',
        sellerId: 'seller-1',
        order: { orderNumber: 'NEX-1001' },
        nameSnapshot: 'Shirt',
        commission: { id: 'comm-1', status: CommissionStatus.PENDING },
      });
      mockPrisma.orderItem.update.mockResolvedValueOnce({
        id: 'item-1',
        fulfillmentStatus: FulfillmentStatus.DELIVERED,
      });

      await service.updateItemFulfillment('seller-1', 'item-1', {
        status: FulfillmentStatus.DELIVERED,
      });

      expect(mockPrisma.commissionRecord.update).toHaveBeenCalledWith({
        where: { id: 'comm-1' },
        data: { status: CommissionStatus.AVAILABLE },
      });
    });

    it('should throw ForbiddenException if item belongs to another seller', async () => {
      mockPrisma.orderItem.findUnique.mockResolvedValueOnce({
        id: 'item-1',
        sellerId: 'other-seller',
      });

      await expect(
        service.updateItemFulfillment('seller-1', 'item-1', {
          status: FulfillmentStatus.SHIPPED,
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
