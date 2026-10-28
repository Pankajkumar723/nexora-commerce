import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
            session: {
              create: jest.fn(),
              delete: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Password Hashing', () => {
    it('should correctly hash and verify password', () => {
      const password = 'SuperSecretPassword123!';
      const hash = service.hashPassword(password);
      expect(hash).toContain(':');

      const isValid = service.verifyPassword(password, hash);
      expect(isValid).toBe(true);

      const isInvalid = service.verifyPassword('WrongPassword!', hash);
      expect(isInvalid).toBe(false);
    });
  });

  describe('register', () => {
    it('should throw ConflictException if user with email already exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'u-exists',
        email: 'test@example.com',
      });

      await expect(
        service.register({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should register user and create profile & session within transaction', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const mockTxResult = {
        user: { id: 'u-1', email: 'aryan@example.com', name: 'Aryan Sharma', role: Role.CUSTOMER },
        profile: { id: 'prof-1', name: 'Aryan Sharma', phone: '+919999999999' },
        session: { token: 'mock_token_32', expiresAt: new Date() },
      };

      (prisma.$transaction as jest.Mock).mockImplementationOnce(async (callback) => {
        return callback({
          user: { create: jest.fn().mockResolvedValue(mockTxResult.user) },
          account: { create: jest.fn().mockResolvedValue({}) },
          customerProfile: { create: jest.fn().mockResolvedValue(mockTxResult.profile) },
          session: { create: jest.fn().mockResolvedValue(mockTxResult.session) },
        });
      });

      const result = await service.register({
        name: 'Aryan Sharma',
        email: 'aryan@example.com',
        password: 'Password123',
        phone: '+919999999999',
      });

      expect(result.user.email).toBe('aryan@example.com');
      expect(result.profile.id).toBe('prof-1');
      expect(result.session.token).toBe('mock_token_32');
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if email does not exist', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        service.login({ email: 'unknown@example.com', password: 'Password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password hash does not match', async () => {
      const correctHash = service.hashPassword('CorrectPassword123');

      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'u-1',
        email: 'user@example.com',
        accounts: [{ providerId: 'credentials', password: correctHash }],
      });

      await expect(
        service.login({ email: 'user@example.com', password: 'IncorrectPassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return user and new session token on valid credentials', async () => {
      const password = 'CorrectPassword123';
      const validHash = service.hashPassword(password);

      const mockUser = {
        id: 'u-1',
        email: 'user@example.com',
        name: 'Valid User',
        role: Role.CUSTOMER,
        accounts: [{ providerId: 'credentials', password: validHash }],
        profile: { id: 'prof-1', name: 'Valid User', phone: null },
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
      (prisma.session.create as jest.Mock).mockResolvedValueOnce({
        token: 'new_session_token',
        expiresAt: new Date(),
      });

      const result = await service.login({ email: 'user@example.com', password });
      expect(result.user.email).toBe('user@example.com');
      expect(result.session.token).toBe('new_session_token');
    });
  });

  describe('getMe', () => {
    it('should throw NotFoundException if user is missing', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
      await expect(service.getMe('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should return user details with profile and addresses', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'u-1',
        email: 'user@example.com',
        name: 'User',
        role: Role.CUSTOMER,
        profile: { id: 'p-1', addresses: [] },
      });

      const result = await service.getMe('u-1');
      expect(result.id).toBe('u-1');
      expect(result.profile.id).toBe('p-1');
    });
  });
});
