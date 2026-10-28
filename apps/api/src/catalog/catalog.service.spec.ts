import { Test, TestingModule } from '@nestjs/testing';
import { CatalogService } from './catalog.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ProductSortOption, QueryProductsDto } from './dto/query-products.dto';
import { Prisma, ProductStatus } from '@prisma/client';

describe('CatalogService', () => {
  let service: CatalogService;
  let prisma: PrismaService;

  const mockProduct = {
    id: 'prod-123',
    name: 'Wireless ANC Headphones',
    slug: 'wireless-anc-headphones',
    description: 'Noise canceling headphones',
    price: new Prisma.Decimal('18999.00'),
    compareAtPrice: new Prisma.Decimal('22999.00'),
    status: ProductStatus.ACTIVE,
    categoryId: 'cat-1',
    category: { id: 'cat-1', name: 'Audio', slug: 'audio' },
    images: [{ id: 'img-1', url: 'https://img.com/1.jpg', sortOrder: 0 }],
    variants: [{ id: 'var-1', sku: 'NEX-1', attributes: {}, priceOverride: null, stockQuantity: 10 }],
    reviews: [{ rating: 5 }, { rating: 4 }],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatalogService,
        {
          provide: PrismaService,
          useValue: {
            product: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              count: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            category: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CatalogService>(CatalogService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findProducts', () => {
    it('should return paginated list of active products with calculated rating and stock', async () => {
      (prisma.product.findMany as jest.Mock).mockResolvedValueOnce([mockProduct]);
      (prisma.product.count as jest.Mock).mockResolvedValueOnce(1);

      const query: QueryProductsDto = {
        page: 1,
        limit: 12,
        sort: ProductSortOption.NEWEST,
        skip: 0,
        take: 12,
      };

      const result = await service.findProducts(query);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].rating).toBe(4.5);
      expect(result.items[0].reviewCount).toBe(2);
      expect(result.items[0].inStock).toBe(true);
      expect(result.items[0].totalStock).toBe(10);
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });

    it('should apply search, category, and price filters in where clause', async () => {
      (prisma.product.findMany as jest.Mock).mockResolvedValueOnce([]);
      (prisma.product.count as jest.Mock).mockResolvedValueOnce(0);

      const query: QueryProductsDto = {
        page: 1,
        limit: 10,
        search: 'studio',
        category: 'audio',
        minPrice: 5000,
        maxPrice: 20000,
        sort: ProductSortOption.PRICE_ASC,
        skip: 0,
        take: 10,
      };

      await service.findProducts(query);
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: ProductStatus.ACTIVE,
            category: { slug: 'audio' },
            OR: [
              { name: { contains: 'studio', mode: 'insensitive' } },
              { description: { contains: 'studio', mode: 'insensitive' } },
            ],
          }),
          orderBy: { price: 'asc' },
        }),
      );
    });
  });

  describe('findProductBySlug', () => {
    it('should return product detail when slug exists', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValueOnce(mockProduct);

      const result = await service.findProductBySlug('wireless-anc-headphones');
      expect(result.id).toBe('prod-123');
      expect(result.name).toBe('Wireless ANC Headphones');
      expect(result.rating).toBe(4.5);
    });

    it('should throw NotFoundException when product slug is not found', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.findProductBySlug('non-existent-product')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAllCategories', () => {
    it('should return categories with product counts', async () => {
      (prisma.category.findMany as jest.Mock).mockResolvedValueOnce([
        {
          id: 'cat-1',
          name: 'Audio',
          slug: 'audio',
          description: 'Sound gear',
          image: null,
          _count: { products: 5 },
        },
      ]);

      const result = await service.findAllCategories();
      expect(result).toHaveLength(1);
      expect(result[0].productCount).toBe(5);
    });
  });

  describe('createCategory', () => {
    it('should create new category successfully', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (prisma.category.create as jest.Mock).mockResolvedValueOnce({
        id: 'cat-new',
        name: 'Footwear',
        slug: 'footwear',
      });

      const result = await service.createCategory({ name: 'Footwear' });
      expect(result.slug).toBe('footwear');
    });

    it('should throw ConflictException if category slug already exists', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'cat-existing' });

      await expect(service.createCategory({ name: 'Footwear', slug: 'footwear' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('createProduct', () => {
    it('should create product with formatted decimal prices', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (prisma.product.create as jest.Mock).mockResolvedValueOnce(mockProduct);

      const dto = {
        name: 'Wireless ANC Headphones',
        description: 'Noise canceling',
        price: 18999,
        categoryId: 'cat-1',
      };

      const result = await service.createProduct(dto as any);
      expect(result.id).toBe('prod-123');
    });

    it('should throw ConflictException if product slug is already taken', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'existing-id' });

      await expect(
        service.createProduct({
          name: 'Wireless ANC Headphones',
          slug: 'wireless-anc-headphones',
          description: 'Test',
          price: 1000,
          categoryId: 'cat-1',
        } as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('deleteProduct', () => {
    it('should throw NotFoundException when deleting non-existent product', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.deleteProduct('unknown-id')).rejects.toThrow(NotFoundException);
    });

    it('should delete product when found', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValueOnce(mockProduct);
      (prisma.product.delete as jest.Mock).mockResolvedValueOnce(mockProduct);

      const result = await service.deleteProduct('prod-123');
      expect(result.id).toBe('prod-123');
    });
  });
});
