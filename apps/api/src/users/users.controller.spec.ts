import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { BadRequestException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            getAddresses: jest.fn(),
            createAddress: jest.fn(),
            deleteAddress: jest.fn(),
            updateProfile: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAddresses', () => {
    it('should throw BadRequestException if profileId is missing', async () => {
      await expect(controller.getAddresses(null as any)).rejects.toThrow(BadRequestException);
    });

    it('should return addresses wrapped in apiSuccess', async () => {
      const mockAddresses = [{ id: 'a-1', line1: '402 Cyber Heights' }];
      (service.getAddresses as jest.Mock).mockResolvedValueOnce(mockAddresses);

      const res = await controller.getAddresses('prof-1');
      expect(res.success).toBe(true);
      expect(res.data).toEqual(mockAddresses);
    });
  });

  describe('createAddress', () => {
    it('should create address and return apiSuccess', async () => {
      const mockAddress = { id: 'a-1', line1: '123 Test St' };
      (service.createAddress as jest.Mock).mockResolvedValueOnce(mockAddress);

      const dto = {
        line1: '123 Test St',
        city: 'Gurugram',
        state: 'Haryana',
        postalCode: '122002',
      };
      const res = await controller.createAddress('prof-1', dto as any);
      expect(res.success).toBe(true);
      expect(res.data).toEqual(mockAddress);
    });
  });

  describe('deleteAddress', () => {
    it('should delete address and return apiSuccess', async () => {
      (service.deleteAddress as jest.Mock).mockResolvedValueOnce({ id: 'a-1' });

      const res = await controller.deleteAddress('prof-1', 'a-1');
      expect(res.success).toBe(true);
      expect(res.data).toEqual({ id: 'a-1' });
    });
  });

  describe('updateProfile', () => {
    it('should update profile and return apiSuccess', async () => {
      const updated = { id: 'prof-1', name: 'New Name' };
      (service.updateProfile as jest.Mock).mockResolvedValueOnce(updated);

      const res = await controller.updateProfile('prof-1', { name: 'New Name' });
      expect(res.success).toBe(true);
      expect(res.data).toEqual(updated);
    });
  });
});
