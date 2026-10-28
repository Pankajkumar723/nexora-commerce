import { Test, TestingModule } from '@nestjs/testing';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { ProductSortOption, QueryProductsDto } from './dto/query-products.dto';

describe('CatalogController', () => {
  let controller: CatalogController;
  let service: CatalogService;

  const mockProduct = {
    id: 'prod-1',
    name: 'ANC Headphones',
    slug: 'anc-headphones',
    price: 18999,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatalogController],
      providers: [
        {
          provide: CatalogService,
          useValue: {
            findProducts: jest.fn(),
            findProductBySlug: jest.fn(),
            findAllCategories: jest.fn(),
            createCategory: jest.fn(),
            createProduct: jest.fn(),
            updateProduct: jest.fn(),
            deleteProduct: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CatalogController>(CatalogController);
    service = module.get<CatalogService>(CatalogService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProducts', () => {
    it('should return products wrapped in apiSuccess envelope with meta', async () => {
      const mockResult = {
        items: [mockProduct],
        meta: { total: 1, page: 1, limit: 12, totalPages: 1 },
      };

      (service.findProducts as jest.Mock).mockResolvedValueOnce(mockResult);

      const query: QueryProductsDto = {
        page: 1,
        limit: 12,
        sort: ProductSortOption.NEWEST,
        skip: 0,
        take: 12,
      };

      const result = await controller.getProducts(query);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockProduct]);
      expect(result.meta).toEqual(mockResult.meta);
    });
  });

  describe('getProductBySlug', () => {
    it('should return product by slug', async () => {
      (service.findProductBySlug as jest.Mock).mockResolvedValueOnce(mockProduct);

      const result = await controller.getProductBySlug('anc-headphones');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProduct);
    });
  });

  describe('getCategories', () => {
    it('should return all categories', async () => {
      const mockCategories = [{ id: 'cat-1', name: 'Audio', slug: 'audio', productCount: 4 }];
      (service.findAllCategories as jest.Mock).mockResolvedValueOnce(mockCategories);

      const result = await controller.getCategories();
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCategories);
    });
  });

  describe('createProduct', () => {
    it('should create product and return apiSuccess', async () => {
      (service.createProduct as jest.Mock).mockResolvedValueOnce(mockProduct);

      const dto = {
        name: 'ANC Headphones',
        description: 'Test description',
        price: 18999,
        categoryId: 'cat-1',
      };

      const result = await controller.createProduct(dto as any);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProduct);
    });
  });

  describe('deleteProduct', () => {
    it('should delete product and return apiSuccess', async () => {
      (service.deleteProduct as jest.Mock).mockResolvedValueOnce(mockProduct);

      const result = await controller.deleteProduct('prod-1');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProduct);
    });
  });
});
