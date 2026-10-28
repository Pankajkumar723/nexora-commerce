import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            address: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              updateMany: jest.fn(),
              delete: jest.fn(),
            },
            customerProfile: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAddresses', () => {
    it('should return addresses for customer', async () => {
      const mockAddresses = [{ id: 'addr-1', line1: '402 Cyber Heights', isDefault: true }];
      (prisma.address.findMany as jest.Mock).mockResolvedValueOnce(mockAddresses);

      const res = await service.getAddresses('cust-1');
      expect(res).toEqual(mockAddresses);
    });
  });

  describe('createAddress', () => {
    it('should unset previous default addresses if new address isDefault is true', async () => {
      (prisma.address.updateMany as jest.Mock).mockResolvedValueOnce({ count: 1 });
      (prisma.address.create as jest.Mock).mockResolvedValueOnce({
        id: 'addr-new',
        line1: '123 Street',
        isDefault: true,
      });

      const res = await service.createAddress('cust-1', {
        line1: '123 Street',
        city: 'Gurugram',
        state: 'Haryana',
        postalCode: '122002',
        isDefault: true,
      });

      expect(prisma.address.updateMany).toHaveBeenCalledWith({
        where: { customerId: 'cust-1', isDefault: true },
        data: { isDefault: false },
      });
      expect(res.id).toBe('addr-new');
    });
  });

  describe('deleteAddress', () => {
    it('should throw NotFoundException if address not found or not owned by customer', async () => {
      (prisma.address.findFirst as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.deleteAddress('cust-1', 'addr-unknown')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should delete address if found', async () => {
      (prisma.address.findFirst as jest.Mock).mockResolvedValueOnce({ id: 'addr-1', customerId: 'cust-1' });
      (prisma.address.delete as jest.Mock).mockResolvedValueOnce({ id: 'addr-1' });

      const res = await service.deleteAddress('cust-1', 'addr-1');
      expect(res.id).toBe('addr-1');
    });
  });

  describe('updateProfile', () => {
    it('should throw NotFoundException if profile not found', async () => {
      (prisma.customerProfile.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.updateProfile('cust-1', { name: 'New Name' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update profile name and phone', async () => {
      (prisma.customerProfile.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'cust-1' });
      (prisma.customerProfile.update as jest.Mock).mockResolvedValueOnce({
        id: 'cust-1',
        name: 'Updated Name',
      });

      const res = await service.updateProfile('cust-1', { name: 'Updated Name' });
      expect(res.name).toBe('Updated Name');
    });
  });
});
