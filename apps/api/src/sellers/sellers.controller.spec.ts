import { Test, TestingModule } from '@nestjs/testing';
import { SellersController } from './sellers.controller';
import { SellersService } from './sellers.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { SellerStatus } from '@prisma/client';

describe('SellersController', () => {
  let controller: SellersController;
  let service: SellersService;

  const mockSellersService = {
    register: jest.fn(),
    login: jest.fn(),
    submitApplication: jest.fn(),
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    getStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SellersController],
      providers: [
        {
          provide: SellersService,
          useValue: mockSellersService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SellersController>(SellersController);
    service = module.get<SellersService>(SellersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register a seller and return apiSuccess', async () => {
    const mockRes = {
      user: { id: 'u-1', name: 'Seller' },
      session: { token: 'tok-123' },
    };
    mockSellersService.register.mockResolvedValueOnce(mockRes);

    const res = await controller.register({
      name: 'Seller',
      email: 'seller@example.com',
      password: 'Password123!',
    });

    expect(res.success).toBe(true);
    expect(res.data).toEqual(mockRes);
  });

  it('should authenticate a seller via login and return apiSuccess', async () => {
    const mockRes = {
      user: { id: 'u-1', name: 'Seller', email: 'seller@example.com' },
      sellerProfile: { id: 's-1', storeName: 'Test Store' },
      session: { token: 'tok-123' },
    };
    mockSellersService.login.mockResolvedValueOnce(mockRes);

    const res = await controller.login({
      email: 'seller@example.com',
      password: 'Password123!',
    });

    expect(res.success).toBe(true);
    expect(res.data).toEqual(mockRes);
  });

  it('should submit application and return apiSuccess', async () => {
    const mockProfile = { id: 'seller-1', status: SellerStatus.PENDING };
    mockSellersService.submitApplication.mockResolvedValueOnce(mockProfile);

    const dto = {
      storeName: 'Mega Store',
      storeSlug: 'mega-store',
      phone: '+91 9988776655',
      businessAddress: '123 Market St',
      taxId: '29ABCDE1234F1Z5',
      bankAccountName: 'Mega Corp',
      bankAccountNumber: '1234567890',
      bankIfscCode: 'HDFC0001234',
      bankName: 'HDFC Bank',
    };

    const res = await controller.submitApplication('u-1', dto);
    expect(res.success).toBe(true);
    expect(res.data).toEqual(mockProfile);
    expect(mockSellersService.submitApplication).toHaveBeenCalledWith('u-1', dto);
  });

  it('should get authenticated profile', async () => {
    const mockProfile = { id: 'seller-1', storeName: 'Mega Store' };
    mockSellersService.getProfile.mockResolvedValueOnce(mockProfile);

    const res = await controller.getProfile('u-1');
    expect(res.success).toBe(true);
    expect(res.data).toEqual(mockProfile);
  });

  it('should update profile', async () => {
    const mockProfile = { id: 'seller-1', storeName: 'New Name' };
    mockSellersService.updateProfile.mockResolvedValueOnce(mockProfile);

    const res = await controller.updateProfile('u-1', { storeName: 'New Name' });
    expect(res.success).toBe(true);
    expect(res.data).toEqual(mockProfile);
  });

  it('should get seller status', async () => {
    const mockStatus = { hasProfile: true, status: SellerStatus.APPROVED };
    mockSellersService.getStatus.mockResolvedValueOnce(mockStatus);

    const res = await controller.getStatus('u-1');
    expect(res.success).toBe(true);
    expect(res.data).toEqual(mockStatus);
  });
});
