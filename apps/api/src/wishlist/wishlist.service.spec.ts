import { Test, TestingModule } from '@nestjs/testing';
import { WishlistService } from './wishlist.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('WishlistService', () => {
  let service: WishlistService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WishlistService,
        {
          provide: PrismaService,
          useValue: {
            wishlist: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            wishlistItem: {
              findUnique: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
            },
            product: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<WishlistService>(WishlistService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getWishlist', () => {
    it('should return existing customer wishlist', async () => {
      const mockWishlist = { id: 'w-1', customerId: 'cust-1', items: [] };
      (prisma.wishlist.findUnique as jest.Mock).mockResolvedValueOnce(mockWishlist);

      const res = await service.getWishlist('cust-1');
      expect(res).toEqual(mockWishlist);
    });

    it('should create new wishlist if none exists for customer', async () => {
      (prisma.wishlist.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (prisma.wishlist.create as jest.Mock).mockResolvedValueOnce({
        id: 'w-new',
        customerId: 'cust-1',
        items: [],
      });

      const res = await service.getWishlist('cust-1');
      expect(res.id).toBe('w-new');
    });
  });

  describe('addItem', () => {
    it('should throw NotFoundException if product does not exist', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.addItem('cust-1', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should add item if product exists and not already in wishlist', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'p-1' });
      (prisma.wishlist.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'w-1', items: [] });
      (prisma.wishlistItem.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (prisma.wishlistItem.create as jest.Mock).mockResolvedValueOnce({
        id: 'wi-1',
        wishlistId: 'w-1',
        productId: 'p-1',
      });

      const res = await service.addItem('cust-1', 'p-1');
      expect(res.id).toBe('wi-1');
    });
  });

  describe('removeItem', () => {
    it('should remove item from wishlist', async () => {
      (prisma.wishlist.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'w-1' });
      (prisma.wishlistItem.delete as jest.Mock).mockResolvedValueOnce({});

      const res = await service.removeItem('cust-1', 'p-1');
      expect(res.success).toBe(true);
    });
  });
});
