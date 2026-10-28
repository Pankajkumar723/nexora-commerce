import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { CouponsService } from '../coupons/coupons.service';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DiscountType, OrderStatus, Prisma, Role } from '@prisma/client';

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: PrismaService;
  let couponsService: CouponsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: {
            cart: {
              findUnique: jest.fn(),
            },
            address: {
              findFirst: jest.fn(),
            },
            order: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: CouponsService,
          useValue: {
            validateCoupon: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prisma = module.get<PrismaService>(PrismaService);
    couponsService = module.get<CouponsService>(CouponsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    it('should throw BadRequestException if cart is empty', async () => {
      (prisma.cart.findUnique as jest.Mock).mockResolvedValueOnce({ items: [] });

      await expect(
        service.createOrder('cust-1', { addressId: 'addr-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if shipping address is invalid', async () => {
      (prisma.cart.findUnique as jest.Mock).mockResolvedValueOnce({
        items: [{ quantity: 1, productVariant: { stockQuantity: 5, product: { price: 100 } } }],
      });
      (prisma.address.findFirst as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        service.createOrder('cust-1', { addressId: 'addr-invalid' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if requested item quantity exceeds stock', async () => {
      (prisma.cart.findUnique as jest.Mock).mockResolvedValueOnce({
        items: [
          {
            quantity: 10,
            productVariant: {
              sku: 'SKU-LOW',
              stockQuantity: 2,
              product: { name: 'Limited Item', price: new Prisma.Decimal(500) },
            },
          },
        ],
      });
      (prisma.address.findFirst as jest.Mock).mockResolvedValueOnce({ id: 'addr-1' });

      await expect(
        service.createOrder('cust-1', { addressId: 'addr-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should calculate totals, apply coupon, and snapshot items on order creation', async () => {
      (prisma.cart.findUnique as jest.Mock).mockResolvedValueOnce({
        items: [
          {
            quantity: 1,
            productVariant: {
              id: 'var-1',
              sku: 'NEX-HP',
              priceOverride: null,
              stockQuantity: 10,
              product: {
                id: 'p-1',
                name: 'Studio Headphones',
                price: new Prisma.Decimal('18999.00'),
                images: [{ url: 'https://img.com/1.jpg' }],
              },
            },
          },
        ],
      });

      (prisma.address.findFirst as jest.Mock).mockResolvedValueOnce({
        id: 'addr-1',
        label: 'Home',
        line1: '402 Cyber Heights',
        city: 'Gurugram',
        state: 'Haryana',
        postalCode: '122002',
        country: 'India',
      });

      (couponsService.validateCoupon as jest.Mock).mockResolvedValueOnce({
        valid: true,
        code: 'NEXORA10',
        discountType: DiscountType.PERCENTAGE,
        discountAmount: 1899.9,
      });

      (prisma.order.create as jest.Mock).mockImplementationOnce((args) => ({
        id: 'ord-123',
        ...args.data,
        items: args.data.items?.create || [],
      }));

      const order = await service.createOrder('cust-1', {
        addressId: 'addr-1',
        couponCode: 'NEXORA10',
      });

      expect(order.id).toBe('ord-123');
      expect(order.orderNumber).toMatch(/^NEX-\d+-[A-F0-9]{6}$/);
      expect(order.status).toBe(OrderStatus.PENDING);
      expect(order.items).toHaveLength(1);
      expect(order.items[0].nameSnapshot).toBe('Studio Headphones');
    });
  });

  describe('getOrderById', () => {
    it('should throw NotFoundException if order does not exist', async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.getOrderById('ord-unknown', 'cust-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if order belongs to another customer', async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'ord-1',
        customerId: 'different-customer',
      });

      await expect(
        service.getOrderById('ord-1', 'cust-1', Role.CUSTOMER),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow customer to access their own order', async () => {
      const mockOrder = { id: 'ord-1', customerId: 'cust-1', total: 5000 };
      (prisma.order.findUnique as jest.Mock).mockResolvedValueOnce(mockOrder);

      const res = await service.getOrderById('ord-1', 'cust-1', Role.CUSTOMER);
      expect(res).toEqual(mockOrder);
    });

    it('should allow ADMIN to access any order', async () => {
      const mockOrder = { id: 'ord-1', customerId: 'other-user', total: 5000 };
      (prisma.order.findUnique as jest.Mock).mockResolvedValueOnce(mockOrder);

      const res = await service.getOrderById('ord-1', 'admin-id', Role.ADMIN);
      expect(res).toEqual(mockOrder);
    });
  });
});
