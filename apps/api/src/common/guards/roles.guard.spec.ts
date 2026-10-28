import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if no roles are required on route', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);

    const mockContext = {
      getHandler: () => {},
      getClass: () => {},
      switchToHttp: () => ({
        getRequest: () => ({ user: null }),
      }),
    } as any;

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should throw ForbiddenException if user has no role or is unauthenticated', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([Role.ADMIN]);

    const mockContext = {
      getHandler: () => {},
      getClass: () => {},
      switchToHttp: () => ({
        getRequest: () => ({ user: null }),
      }),
    } as any;

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if user role does not match required role', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([Role.ADMIN]);

    const mockContext = {
      getHandler: () => {},
      getClass: () => {},
      switchToHttp: () => ({
        getRequest: () => ({ user: { role: Role.CUSTOMER } }),
      }),
    } as any;

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
  });

  it('should return true if user role matches required role', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([Role.ADMIN]);

    const mockContext = {
      getHandler: () => {},
      getClass: () => {},
      switchToHttp: () => ({
        getRequest: () => ({ user: { role: Role.ADMIN } }),
      }),
    } as any;

    expect(guard.canActivate(mockContext)).toBe(true);
  });
});
