import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { BadRequestException } from '@nestjs/common';

describe('CartController', () => {
  let controller: CartController;
  let service: CartService;

  const mockCart = {
    id: 'cart-1',
    customerId: 'prof-1',
    items: [],
    itemCount: 0,
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        {
          provide: CartService,
          useValue: {
            getOrCreateCart: jest.fn(),
            addItem: jest.fn(),
            updateItem: jest.fn(),
            removeItem: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CartController>(CartController);
    service = module.get<CartService>(CartService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCart', () => {
    it('should throw BadRequestException if profileId is missing', async () => {
      await expect(controller.getCart(null as any)).rejects.toThrow(BadRequestException);
    });

    it('should return cart details wrapped in apiSuccess', async () => {
      (service.getOrCreateCart as jest.Mock).mockResolvedValueOnce(mockCart);

      const res = await controller.getCart('prof-1');
      expect(res.success).toBe(true);
      expect(res.data).toEqual(mockCart);
    });
  });

  describe('addItem', () => {
    it('should add item and return updated cart', async () => {
      (service.addItem as jest.Mock).mockResolvedValueOnce(mockCart);

      const res = await controller.addItem('prof-1', { productVariantId: 'var-1', quantity: 1 });
      expect(res.success).toBe(true);
      expect(res.data).toEqual(mockCart);
    });
  });

  describe('updateItem', () => {
    it('should update item quantity and return updated cart', async () => {
      (service.updateItem as jest.Mock).mockResolvedValueOnce(mockCart);

      const res = await controller.updateItem('prof-1', 'ci-1', { quantity: 2 });
      expect(res.success).toBe(true);
      expect(res.data).toEqual(mockCart);
    });
  });

  describe('removeItem', () => {
    it('should remove item and return updated cart', async () => {
      (service.removeItem as jest.Mock).mockResolvedValueOnce(mockCart);

      const res = await controller.removeItem('prof-1', 'ci-1');
      expect(res.success).toBe(true);
      expect(res.data).toEqual(mockCart);
    });
  });
});
