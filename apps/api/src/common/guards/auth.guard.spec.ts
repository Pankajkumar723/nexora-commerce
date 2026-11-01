import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';
import { Role } from '@prisma/client';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: PrismaService,
          useValue: {
            session: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw UnauthorizedException if no token provided in headers or cookies', async () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
        }),
      }),
    } as any;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if session is not found in database', async () => {
    (prisma.session.findUnique as jest.Mock).mockResolvedValueOnce(null);

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Bearer invalid_token' },
        }),
      }),
    } as any;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if session has expired', async () => {
    (prisma.session.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 'sess-1',
      token: 'expired_token',
      expiresAt: new Date(Date.now() - 1000 * 60), // Expired 1 minute ago
      user: { id: 'u-1', email: 'test@example.com', role: Role.CUSTOMER },
    });

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Bearer expired_token' },
        }),
      }),
    } as any;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
  });

  it('should attach user to request and return true for valid active session', async () => {
    const mockUser = {
      id: 'u-123',
      email: 'customer@example.com',
      name: 'Customer Demo',
      role: Role.CUSTOMER,
      profile: { id: 'prof-456' },
    };

    (prisma.session.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 'sess-active',
      token: 'valid_token',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60), // Expires in 1 hour
      user: mockUser,
    });

    const req: any = {
      headers: { authorization: 'Bearer valid_token' },
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
    } as any;

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
    expect(req.user).toEqual({
      id: 'u-123',
      email: 'customer@example.com',
      name: 'Customer Demo',
      role: Role.CUSTOMER,
      profileId: 'prof-456',
      sellerId: null,
      sellerStatus: null,
      sellerProfile: null,
      sessionId: 'sess-active',
    });
  });
});
