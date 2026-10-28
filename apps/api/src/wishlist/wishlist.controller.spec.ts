import { Test, TestingModule } from '@nestjs/testing';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { BadRequestException } from '@nestjs/common';

describe('WishlistController', () => {
  let controller: WishlistController;
  let service: WishlistService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WishlistController],
      providers: [
        {
          provide: WishlistService,
          useValue: {
            getWishlist: jest.fn(),
            addItem: jest.fn(),
            removeItem: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<WishlistController>(WishlistController);
    service = module.get<WishlistService>(WishlistService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getWishlist', () => {
    it('should throw BadRequestException if profileId is missing', async () => {
      await expect(controller.getWishlist(null as any)).rejects.toThrow(BadRequestException);
    });

    it('should return wishlist wrapped in apiSuccess', async () => {
      const mockWishlist = { id: 'w-1', items: [] };
      (service.getWishlist as jest.Mock).mockResolvedValueOnce(mockWishlist);

      const res = await controller.getWishlist('prof-1');
      expect(res.success).toBe(true);
      expect(res.data).toEqual(mockWishlist);
    });
  });

  describe('addToWishlist', () => {
    it('should add item and return apiSuccess', async () => {
      const mockItem = { id: 'wi-1', productId: 'p-1' };
      (service.addItem as jest.Mock).mockResolvedValueOnce(mockItem);

      const res = await controller.addToWishlist('prof-1', { productId: 'p-1' });
      expect(res.success).toBe(true);
      expect(res.data).toEqual(mockItem);
    });
  });

  describe('removeFromWishlist', () => {
    it('should remove item and return apiSuccess', async () => {
      (service.removeItem as jest.Mock).mockResolvedValueOnce({ success: true });

      const res = await controller.removeFromWishlist('prof-1', 'p-1');
      expect(res.success).toBe(true);
    });
  });
});
