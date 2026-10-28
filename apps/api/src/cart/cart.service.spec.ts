import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('CartService', () => {
  let service: CartService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: PrismaService,
          useValue: {
            cart: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            cartItem: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              deleteMany: jest.fn(),
            },
            productVariant: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateCartTotals', () => {
    it('should calculate free shipping for subtotal >= 1999', () => {
      const mockCart = {
        id: 'c-1',
        customerId: 'cust-1',
        items: [
          {
            id: 'ci-1',
            quantity: 2,
            productVariant: {
              sku: 'SKU-1',
              priceOverride: new Prisma.Decimal('1000.00'),
              stockQuantity: 10,
              product: {
                id: 'p-1',
                name: 'Test Product',
                price: new Prisma.Decimal('1000.00'),
                images: [],
              },
            },
          },
        ],
      };

      const result = service.calculateCartTotals(mockCart);
      expect(result.subtotal).toBe(2000);
      expect(result.shipping).toBe(0); // Free shipping threshold met
      expect(result.total).toBe(2000);
    });

    it('should calculate ₹150 shipping for subtotal < 1999', () => {
      const mockCart = {
        id: 'c-1',
        customerId: 'cust-1',
        items: [
          {
            id: 'ci-1',
            quantity: 1,
            productVariant: {
              sku: 'SKU-1',
              priceOverride: null,
              stockQuantity: 10,
              product: {
                id: 'p-1',
                name: 'Affordable Item',
                price: new Prisma.Decimal('800.00'),
                images: [],
              },
            },
          },
        ],
      };

      const result = service.calculateCartTotals(mockCart);
      expect(result.subtotal).toBe(800);
      expect(result.shipping).toBe(150);
      expect(result.total).toBe(950);
    });
  });

  describe('addItem', () => {
    it('should throw NotFoundException if variant does not exist', async () => {
      (prisma.productVariant.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        service.addItem('cust-1', { productVariantId: 'unknown-var', quantity: 1 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if requested quantity exceeds variant stock', async () => {
      (prisma.productVariant.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'var-1',
        sku: 'SKU-1',
        stockQuantity: 2,
      });

      (prisma.cart.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'c-1' });
      (prisma.cartItem.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        service.addItem('cust-1', { productVariantId: 'var-1', quantity: 5 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should add item and return updated cart when stock is sufficient', async () => {
      (prisma.productVariant.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'var-1',
        sku: 'SKU-1',
        stockQuantity: 10,
      });

      (prisma.cart.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'c-1' });
      (prisma.cartItem.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (prisma.cartItem.create as jest.Mock).mockResolvedValueOnce({ id: 'ci-1' });

      // Mock getOrCreateCart response
      jest.spyOn(service, 'getOrCreateCart').mockResolvedValueOnce({
        id: 'c-1',
        customerId: 'cust-1',
        items: [],
        itemCount: 1,
        subtotal: 1000,
        shipping: 150,
        tax: 180,
        total: 1150,
      });

      const result = await service.addItem('cust-1', { productVariantId: 'var-1', quantity: 1 });
      expect(result.itemCount).toBe(1);
    });
  });

  describe('updateItem', () => {
    it('should throw NotFoundException if item does not belong to customer', async () => {
      (prisma.cartItem.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'ci-1',
        cart: { customerId: 'different-customer' },
      });

      await expect(
        service.updateItem('cust-1', 'ci-1', { quantity: 2 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeItem', () => {
    it('should throw NotFoundException if cart item not found', async () => {
      (prisma.cartItem.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.removeItem('cust-1', 'ci-unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
