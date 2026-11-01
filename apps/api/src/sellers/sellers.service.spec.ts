import { Test, TestingModule } from '@nestjs/testing';
import { SellersService } from './sellers.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Role, SellerStatus } from '@prisma/client';

describe('SellersService', () => {
  let service: SellersService;
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    account: {
      create: jest.fn(),
    },
    session: {
      create: jest.fn(),
    },
    sellerProfile: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    sellerNotification: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrisma)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SellersService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<SellersService>(SellersService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new seller and create session', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      mockPrisma.user.create.mockResolvedValueOnce({
        id: 'u-1',
        name: 'Seller One',
        email: 'seller@example.com',
        role: Role.SELLER,
      });
      mockPrisma.session.create.mockResolvedValueOnce({
        token: 'sess-token-123',
        expiresAt: new Date(),
      });

      const res = await service.register({
        name: 'Seller One',
        email: 'seller@example.com',
        password: 'Password123!',
      });

      expect(res.user.role).toBe(Role.SELLER);
      expect(res.session.token).toBe('sess-token-123');
      expect(mockPrisma.user.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'existing' });

      await expect(
        service.register({
          name: 'Seller',
          email: 'seller@example.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should authenticate seller and return session with sellerProfile', async () => {
      const hashedPassword = service.hashPassword('Secret123!');
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'u-1',
        name: 'Seller One',
        email: 'seller@example.com',
        role: Role.SELLER,
        accounts: [{ password: hashedPassword }],
        sellerProfile: {
          id: 's-1',
          storeName: 'Mega Store',
          storeSlug: 'mega-store',
          status: SellerStatus.APPROVED,
          rejectionReason: null,
        },
      });
      mockPrisma.session.create.mockResolvedValueOnce({
        token: 'test-session-token',
        expiresAt: new Date(),
      });

      const res = await service.login({
        email: 'seller@example.com',
        password: 'Secret123!',
      });

      expect(res.user.email).toBe('seller@example.com');
      expect(res.sellerProfile?.storeName).toBe('Mega Store');
      expect(res.session.token).toBe('test-session-token');
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.login({
          email: 'notfound@example.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow();
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const hashedPassword = service.hashPassword('CorrectPassword123!');
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'u-1',
        email: 'seller@example.com',
        accounts: [{ password: hashedPassword }],
      });

      await expect(
        service.login({
          email: 'seller@example.com',
          password: 'WrongPassword!',
        }),
      ).rejects.toThrow();
    });
  });

  describe('submitApplication', () => {
    const appDto = {
      storeName: 'Mega Store',
      storeSlug: 'mega-store',
      storeDescription: 'Electronics',
      phone: '+91 9988776655',
      businessAddress: '123 Market Street',
      taxId: '29ABCDE1234F1Z5',
      bankAccountName: 'Mega Corp',
      bankAccountNumber: '1234567890',
      bankIfscCode: 'HDFC0001234',
      bankName: 'HDFC Bank',
    };

    it('should submit application in PENDING state', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'u-1',
        sellerProfile: null,
      });
      mockPrisma.sellerProfile.findUnique.mockResolvedValueOnce(null);
      mockPrisma.sellerProfile.create.mockResolvedValueOnce({
        id: 'seller-1',
        authUserId: 'u-1',
        ...appDto,
        status: SellerStatus.PENDING,
      });

      const res = await service.submitApplication('u-1', appDto);
      expect(res.status).toBe(SellerStatus.PENDING);
      expect(mockPrisma.sellerProfile.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);

      await expect(service.submitApplication('u-nonexistent', appDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if application already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'u-1',
        sellerProfile: { id: 'seller-1' },
      });

      await expect(service.submitApplication('u-1', appDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException if store slug is already taken', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'u-1',
        sellerProfile: null,
      });
      mockPrisma.sellerProfile.findUnique.mockResolvedValueOnce({ id: 'other-seller' });

      await expect(service.submitApplication('u-1', appDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('getProfile', () => {
    it('should return profile for authenticated user', async () => {
      const mockProfile = {
        id: 'seller-1',
        authUserId: 'u-1',
        storeName: 'Mega Store',
        status: SellerStatus.APPROVED,
      };
      mockPrisma.sellerProfile.findUnique.mockResolvedValueOnce(mockProfile);

      const res = await service.getProfile('u-1');
      expect(res).toEqual(mockProfile);
    });

    it('should throw NotFoundException if profile does not exist', async () => {
      mockPrisma.sellerProfile.findUnique.mockResolvedValueOnce(null);

      await expect(service.getProfile('u-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProfile', () => {
    it('should update seller profile fields', async () => {
      mockPrisma.sellerProfile.findUnique.mockResolvedValueOnce({ id: 'seller-1' });
      mockPrisma.sellerProfile.update.mockResolvedValueOnce({
        id: 'seller-1',
        storeName: 'Updated Name',
      });

      const res = await service.updateProfile('u-1', { storeName: 'Updated Name' });
      expect(res.storeName).toBe('Updated Name');
    });
  });

  describe('getStatus', () => {
    it('should return UNREGISTERED status when user has no seller profile', async () => {
      mockPrisma.sellerProfile.findUnique.mockResolvedValueOnce(null);

      const res = await service.getStatus('u-1');
      expect(res.hasProfile).toBe(false);
      expect(res.status).toBe('UNREGISTERED');
    });

    it('should return seller profile status details', async () => {
      mockPrisma.sellerProfile.findUnique.mockResolvedValueOnce({
        id: 'seller-1',
        storeName: 'Mega Store',
        storeSlug: 'mega-store',
        status: SellerStatus.APPROVED,
        rejectionReason: null,
        approvedAt: new Date(),
        commissionRate: 10.0,
      });

      const res = await service.getStatus('u-1');
      expect(res.hasProfile).toBe(true);
      expect(res.status).toBe(SellerStatus.APPROVED);
    });
  });
});
