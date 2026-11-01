import { Test, TestingModule } from '@nestjs/testing';
import { PayoutsController } from './payouts.controller';
import { PayoutsService } from './payouts.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SellerApprovalGuard } from '../common/guards/seller-approval.guard';

describe('PayoutsController', () => {
  let controller: PayoutsController;
  let service: PayoutsService;

  const mockPayoutsService = {
    getPayouts: jest.fn(),
    getPayoutById: jest.fn(),
    requestPayout: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayoutsController],
      providers: [
        {
          provide: PayoutsService,
          useValue: mockPayoutsService,
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

    controller = module.get<PayoutsController>(PayoutsController);
    service = module.get<PayoutsService>(PayoutsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should list payouts', async () => {
    mockPayoutsService.getPayouts.mockResolvedValueOnce({
      items: [{ id: 'pay-1' }],
      meta: { total: 1 },
    });

    const res = await controller.getPayouts('seller-1');
    expect(res.success).toBe(true);
    expect(res.data).toEqual([{ id: 'pay-1' }]);
  });

  it('should get payout by id', async () => {
    mockPayoutsService.getPayoutById.mockResolvedValueOnce({ id: 'pay-1' });

    const res = await controller.getPayoutById('seller-1', 'pay-1');
    expect(res.success).toBe(true);
    expect(res.data).toEqual({ id: 'pay-1' });
  });

  it('should request payout', async () => {
    mockPayoutsService.requestPayout.mockResolvedValueOnce({
      id: 'pay-1',
      payoutNumber: 'PAY-100',
      amount: 1500,
    });

    const res = await controller.requestPayout('seller-1', { amount: 1500 });
    expect(res.success).toBe(true);
    expect(res.data.id).toBe('pay-1');
  });
});
