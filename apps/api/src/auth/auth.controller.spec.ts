jest.mock('better-auth/node', () => ({
  toNodeHandler: jest.fn(() => () => {}),
}));
jest.mock('./better-auth.instance', () => ({
  auth: { handler: jest.fn() },
  getBetterAuth: jest.fn().mockResolvedValue({ handler: jest.fn() }),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { Role } from '@prisma/client';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthResult = {
    user: { id: 'u-1', email: 'user@example.com', name: 'User', role: Role.CUSTOMER },
    profile: { id: 'prof-1', name: 'User', phone: null },
    session: { token: 'token-123', expiresAt: new Date() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            getMe: jest.fn(),
            logout: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register and return apiSuccess envelope', async () => {
      (service.register as jest.Mock).mockResolvedValueOnce(mockAuthResult);

      const dto = { name: 'User', email: 'user@example.com', password: 'Password123' };
      const res = await controller.register(dto);
      expect(res.success).toBe(true);
      expect(res.data).toEqual(mockAuthResult);
    });
  });

  describe('login', () => {
    it('should authenticate user and return session', async () => {
      (service.login as jest.Mock).mockResolvedValueOnce(mockAuthResult);

      const dto = { email: 'user@example.com', password: 'Password123' };
      const res = await controller.login(dto);
      expect(res.success).toBe(true);
      expect(res.data).toEqual(mockAuthResult);
    });
  });

  describe('getMe', () => {
    it('should return profile for authenticated user ID', async () => {
      const mockProfile = { id: 'u-1', email: 'user@example.com', profile: { id: 'prof-1' } };
      (service.getMe as jest.Mock).mockResolvedValueOnce(mockProfile);

      const res = await controller.getMe('u-1');
      expect(res.success).toBe(true);
      expect(res.data).toEqual(mockProfile);
    });
  });

  describe('logout', () => {
    it('should invalidate token and return success', async () => {
      (service.logout as jest.Mock).mockResolvedValueOnce({ success: true });

      const res = await controller.logout('Bearer token-123');
      expect(res.success).toBe(true);
      expect(service.logout).toHaveBeenCalledWith('token-123');
    });
  });
});
