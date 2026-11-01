import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { SellerApprovalGuard } from './seller-approval.guard';
import { Role, SellerStatus } from '@prisma/client';

describe('SellerApprovalGuard', () => {
  let guard: SellerApprovalGuard;

  beforeEach(() => {
    guard = new SellerApprovalGuard();
  });

  const createMockContext = (user: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  };

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow ADMIN role to bypass approval check', () => {
    const context = createMockContext({ role: Role.ADMIN });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow APPROVED seller', () => {
    const context = createMockContext({
      role: Role.SELLER,
      sellerId: 'seller-1',
      sellerStatus: SellerStatus.APPROVED,
    });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException if user is missing', () => {
    const context = createMockContext(null);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if user is CUSTOMER', () => {
    const context = createMockContext({ role: Role.CUSTOMER });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if seller profile is missing', () => {
    const context = createMockContext({
      role: Role.SELLER,
      sellerId: null,
      sellerStatus: null,
    });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if seller is PENDING', () => {
    const context = createMockContext({
      role: Role.SELLER,
      sellerId: 'seller-1',
      sellerStatus: SellerStatus.PENDING,
    });
    expect(() => guard.canActivate(context)).toThrow(
      'Your seller account is pending admin approval',
    );
  });

  it('should throw ForbiddenException if seller is REJECTED', () => {
    const context = createMockContext({
      role: Role.SELLER,
      sellerId: 'seller-1',
      sellerStatus: SellerStatus.REJECTED,
    });
    expect(() => guard.canActivate(context)).toThrow(
      'Your seller application was rejected',
    );
  });

  it('should throw ForbiddenException if seller is SUSPENDED', () => {
    const context = createMockContext({
      role: Role.SELLER,
      sellerId: 'seller-1',
      sellerStatus: SellerStatus.SUSPENDED,
    });
    expect(() => guard.canActivate(context)).toThrow(
      'Your seller account has been suspended',
    );
  });
});
