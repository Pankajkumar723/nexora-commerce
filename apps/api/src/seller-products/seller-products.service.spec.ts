import { Test, TestingModule } from '@nestjs/testing';
import { SellerProductsService } from './seller-products.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ProductStatus } from '@prisma/client';

describe('SellerProductsService', () => {
  let service: SellerProductsService;
  let prisma: PrismaService;

  const mockPrisma = {
    product: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
    },
    productImage: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    productVariant: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
    },
    inventoryMovement: {
      create: jest.fn(),
    },
    sellerNotification: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrisma)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SellerProductsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<SellerProductsService>(SellerProductsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProducts', () => {
    it('should query products filtered by sellerId', async () => {
      mockPrisma.product.findMany.mockResolvedValueOnce([
        { id: 'p-1', name: 'Product 1', sellerId: 'seller-1' },
      ]);
      mockPrisma.product.count.mockResolvedValueOnce(1);

      const res = await service.getProducts('seller-1', { page: 1, limit: 10 });
      expect(res.items.length).toBe(1);
      expect(res.meta.total).toBe(1);
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ sellerId: 'seller-1' }),
        }),
      );
    });
  });

  describe('getProductById', () => {
    it('should return product if seller matches', async () => {
      mockPrisma.product.findUnique.mockResolvedValueOnce({
        id: 'p-1',
        sellerId: 'seller-1',
        name: 'My Product',
      });

      const res = await service.getProductById('seller-1', 'p-1');
      expect(res.id).toBe('p-1');
    });

    it('should throw NotFoundException if product does not exist', async () => {
      mockPrisma.product.findUnique.mockResolvedValueOnce(null);

      await expect(service.getProductById('seller-1', 'p-none')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if seller is not owner', async () => {
      mockPrisma.product.findUnique.mockResolvedValueOnce({
        id: 'p-1',
        sellerId: 'other-seller',
        name: 'Competitor Product',
      });

      await expect(service.getProductById('seller-1', 'p-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('createProduct', () => {
    const createDto = {
      name: 'Wireless Mouse',
      slug: 'wireless-mouse',
      description: 'Ergonomic mouse',
      price: 1499,
      categoryId: 'cat-1',
      images: [{ url: 'https://example.com/img1.jpg' }],
    };

    it('should create product with PENDING_APPROVAL status', async () => {
      mockPrisma.product.findUnique.mockResolvedValueOnce(null); // slug available
      mockPrisma.category.findUnique.mockResolvedValueOnce({ id: 'cat-1' }); // cat exists
      mockPrisma.product.create.mockResolvedValueOnce({
        id: 'p-1',
        ...createDto,
        sellerId: 'seller-1',
        status: ProductStatus.PENDING_APPROVAL,
      });

      const res = await service.createProduct('seller-1', createDto);
      expect(res.status).toBe(ProductStatus.PENDING_APPROVAL);
      expect(mockPrisma.product.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if slug exists', async () => {
      mockPrisma.product.findUnique.mockResolvedValueOnce({ id: 'p-existing' });

      await expect(service.createProduct('seller-1', createDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException if category does not exist', async () => {
      mockPrisma.product.findUnique.mockResolvedValueOnce(null);
      mockPrisma.category.findUnique.mockResolvedValueOnce(null);

      await expect(service.createProduct('seller-1', createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateProduct', () => {
    it('should update product if owned by seller', async () => {
      mockPrisma.product.findUnique.mockResolvedValueOnce({
        id: 'p-1',
        sellerId: 'seller-1',
      });
      mockPrisma.product.update.mockResolvedValueOnce({
        id: 'p-1',
        name: 'Updated Name',
      });

      const res = await service.updateProduct('seller-1', 'p-1', {
        name: 'Updated Name',
      });
      expect(res.name).toBe('Updated Name');
    });

    it('should throw ForbiddenException if trying to update another seller product', async () => {
      mockPrisma.product.findUnique.mockResolvedValueOnce({
        id: 'p-1',
        sellerId: 'diff-seller',
      });

      await expect(
        service.updateProduct('seller-1', 'p-1', { name: 'Hack' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteProduct', () => {
    it('should archive product if owned by seller', async () => {
      mockPrisma.product.findUnique.mockResolvedValueOnce({
        id: 'p-1',
        sellerId: 'seller-1',
      });
      mockPrisma.product.update.mockResolvedValueOnce({
        id: 'p-1',
        status: ProductStatus.ARCHIVED,
      });

      const res = await service.deleteProduct('seller-1', 'p-1');
      expect(res.status).toBe(ProductStatus.ARCHIVED);
    });

    it('should throw ForbiddenException if not owner on delete', async () => {
      mockPrisma.product.findUnique.mockResolvedValueOnce({
        id: 'p-1',
        sellerId: 'someone-else',
      });

      await expect(service.deleteProduct('seller-1', 'p-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('adjustStock', () => {
    it('should adjust variant stock and create inventory movement', async () => {
      mockPrisma.product.findUnique.mockResolvedValueOnce({
        id: 'p-1',
        sellerId: 'seller-1',
        variants: [{ id: 'v-1', stockQuantity: 20 }],
      });
      mockPrisma.productVariant.update.mockResolvedValueOnce({
        id: 'v-1',
        stockQuantity: 30,
      });

      const res = await service.adjustStock('seller-1', 'p-1', {
        variantId: 'v-1',
        quantityDelta: 10,
      });
      expect(res.stockQuantity).toBe(30);
      expect(mockPrisma.inventoryMovement.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if delta causes negative stock', async () => {
      mockPrisma.product.findUnique.mockResolvedValueOnce({
        id: 'p-1',
        sellerId: 'seller-1',
        variants: [{ id: 'v-1', stockQuantity: 5 }],
      });

      await expect(
        service.adjustStock('seller-1', 'p-1', {
          variantId: 'v-1',
          quantityDelta: -10,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
