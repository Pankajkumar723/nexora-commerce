import { Test, TestingModule } from '@nestjs/testing';
import { CommissionsController } from './commissions.controller';
import { CommissionsService } from './commissions.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SellerApprovalGuard } from '../common/guards/seller-approval.guard';

describe('CommissionsController', () => {
  let controller: CommissionsController;
  let service: CommissionsService;

  const mockCommissionsService = {
    getCommissions: jest.fn(),
    getFinancialSummary: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommissionsController],
      providers: [
        {
          provide: CommissionsService,
          useValue: mockCommissionsService,
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

    controller = module.get<CommissionsController>(CommissionsController);
    service = module.get<CommissionsService>(CommissionsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get commissions list', async () => {
    mockCommissionsService.getCommissions.mockResolvedValueOnce({
      items: [{ id: 'comm-1' }],
      meta: { total: 1 },
    });

    const res = await controller.getCommissions('seller-1');
    expect(res.success).toBe(true);
    expect(res.data).toEqual([{ id: 'comm-1' }]);
  });

  it('should get financial summary', async () => {
    const mockSummary = { grossSales: 5000, netEarnings: 4500 };
    mockCommissionsService.getFinancialSummary.mockResolvedValueOnce(mockSummary);

    const res = await controller.getFinancialSummary('seller-1');
    expect(res.success).toBe(true);
    expect(res.data).toEqual(mockSummary);
  });
});
