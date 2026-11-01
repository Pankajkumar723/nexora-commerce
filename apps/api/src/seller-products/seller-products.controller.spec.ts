import { Test, TestingModule } from '@nestjs/testing';
import { SellerProductsController } from './seller-products.controller';
import { SellerProductsService } from './seller-products.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SellerApprovalGuard } from '../common/guards/seller-approval.guard';

describe('SellerProductsController', () => {
  let controller: SellerProductsController;
  let service: SellerProductsService;

  const mockSellerProductsService = {
    getProducts: jest.fn(),
    getProductById: jest.fn(),
    createProduct: jest.fn(),
    updateProduct: jest.fn(),
    deleteProduct: jest.fn(),
    adjustStock: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SellerProductsController],
      providers: [
        {
          provide: SellerProductsService,
          useValue: mockSellerProductsService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(SellerApprovalGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SellerProductsController>(SellerProductsController);
    service = module.get<SellerProductsService>(SellerProductsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should list seller products', async () => {
    mockSellerProductsService.getProducts.mockResolvedValueOnce({
      items: [{ id: 'p-1' }],
      meta: { total: 1 },
    });

    const res = await controller.getProducts('seller-1');
    expect(res.success).toBe(true);
    expect(res.data).toEqual([{ id: 'p-1' }]);
    expect(mockSellerProductsService.getProducts).toHaveBeenCalledWith(
      'seller-1',
      expect.objectContaining({ page: 1, limit: 20 }),
    );
  });

  it('should get product by id', async () => {
    mockSellerProductsService.getProductById.mockResolvedValueOnce({ id: 'p-1' });

    const res = await controller.getProductById('seller-1', 'p-1');
    expect(res.success).toBe(true);
    expect(res.data).toEqual({ id: 'p-1' });
    expect(mockSellerProductsService.getProductById).toHaveBeenCalledWith(
      'seller-1',
      'p-1',
    );
  });

  it('should create product', async () => {
    const dto = {
      name: 'Item',
      slug: 'item',
      description: 'Desc',
      price: 100,
      categoryId: 'c-1',
      images: [{ url: 'http://img.jpg' }],
    };
    mockSellerProductsService.createProduct.mockResolvedValueOnce({ id: 'p-new', ...dto });

    const res = await controller.createProduct('seller-1', dto);
    expect(res.success).toBe(true);
    expect(res.data.id).toBe('p-new');
  });

  it('should update product', async () => {
    mockSellerProductsService.updateProduct.mockResolvedValueOnce({
      id: 'p-1',
      name: 'Updated',
    });

    const res = await controller.updateProduct('seller-1', 'p-1', { name: 'Updated' });
    expect(res.success).toBe(true);
    expect(res.data.name).toBe('Updated');
  });

  it('should delete product', async () => {
    mockSellerProductsService.deleteProduct.mockResolvedValueOnce({ id: 'p-1' });

    const res = await controller.deleteProduct('seller-1', 'p-1');
    expect(res.success).toBe(true);
    expect(mockSellerProductsService.deleteProduct).toHaveBeenCalledWith(
      'seller-1',
      'p-1',
    );
  });

  it('should adjust stock', async () => {
    mockSellerProductsService.adjustStock.mockResolvedValueOnce({
      id: 'v-1',
      stockQuantity: 15,
    });

    const res = await controller.adjustStock('seller-1', 'p-1', {
      variantId: 'v-1',
      quantityDelta: 5,
    });
    expect(res.success).toBe(true);
    expect(res.data.stockQuantity).toBe(15);
  });
});
