import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Role, SellerStatus } from '@prisma/client';

@Injectable()
export class SellerApprovalGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Access denied: Authentication required.');
    }

    // Admins can bypass seller approval checks
    if (user.role === Role.ADMIN) {
      return true;
    }

    if (user.role !== Role.SELLER) {
      throw new ForbiddenException('Access denied: Seller privileges required.');
    }

    if (!user.sellerId || !user.sellerStatus) {
      throw new ForbiddenException(
        'Seller profile not found. Please complete your seller onboarding application.',
      );
    }

    switch (user.sellerStatus) {
      case SellerStatus.APPROVED:
        return true;
      case SellerStatus.PENDING:
        throw new ForbiddenException(
          'Your seller account is pending admin approval. Product management and fulfillment are disabled until approved.',
        );
      case SellerStatus.REJECTED:
        throw new ForbiddenException(
          'Your seller application was rejected. Please review your business information or contact support.',
        );
      case SellerStatus.SUSPENDED:
        throw new ForbiddenException(
          'Your seller account has been suspended by administration. Please contact platform support.',
        );
      default:
        throw new ForbiddenException('Access denied: Unauthorized seller status.');
    }
  }
}
