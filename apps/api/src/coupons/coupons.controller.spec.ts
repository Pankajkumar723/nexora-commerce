import { Test, TestingModule } from '@nestjs/testing';
import { CouponsController } from './coupons.controller';
import { CouponsService } from './coupons.service';
import { DiscountType } from '@prisma/client';

describe('CouponsController', () => {
  let controller: CouponsController;
  let service: CouponsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CouponsController],
      providers: [
        {
          provide: CouponsService,
          useValue: {
            validateCoupon: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CouponsController>(CouponsController);
    service = module.get<CouponsService>(CouponsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('validateCoupon', () => {
    it('should validate coupon and return apiSuccess envelope', async () => {
      const mockResult = {
        valid: true,
        code: 'NEXORA10',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
        discountAmount: 200,
      };

      (service.validateCoupon as jest.Mock).mockResolvedValueOnce(mockResult);

      const res = await controller.validateCoupon({ code: 'NEXORA10', orderSubtotal: 2000 });
      expect(res.success).toBe(true);
      expect(res.data).toEqual(mockResult);
    });
  });
});
