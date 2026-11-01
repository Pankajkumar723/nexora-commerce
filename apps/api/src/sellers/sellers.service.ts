import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SellerRegisterDto } from './dto/seller-register.dto';
import { CreateSellerApplicationDto } from './dto/create-seller-application.dto';
import { UpdateSellerProfileDto } from './dto/update-seller-profile.dto';
import { LoginDto } from '../auth/dto/login.dto';
import { Role, SellerStatus } from '@prisma/client';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

@Injectable()
export class SellersService {
  constructor(private readonly prisma: PrismaService) {}

  hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  verifyPassword(password: string, storedHash: string): boolean {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = scryptSync(password, salt, 64);
    return timingSafeEqual(keyBuffer, derivedKey);
  }

  /**
   * Register a new seller account
   */
  async register(dto: SellerRegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('An account with this email address already exists.');
    }

    const hashedPassword = this.hashPassword(dto.password);
    const sessionToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: dto.name,
          email: dto.email.toLowerCase(),
          role: Role.SELLER,
        },
      });

      await tx.account.create({
        data: {
          userId: user.id,
          providerId: 'credentials',
          accountId: user.id,
          password: hashedPassword,
        },
      });

      const session = await tx.session.create({
        data: {
          userId: user.id,
          token: sessionToken,
          expiresAt,
        },
      });

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        session: {
          token: session.token,
          expiresAt: session.expiresAt,
        },
        sellerProfile: null,
      };
    });
  }

  /**
   * Authenticate seller credentials and return session token with profile status
   */
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: {
        accounts: {
          where: { providerId: { in: ['credentials', 'credential'] } },
        },
        sellerProfile: true,
      },
    });

    if (!user || !user.accounts || user.accounts.length === 0) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const account = user.accounts[0];
    if (!account.password || !this.verifyPassword(dto.password, account.password)) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const sessionToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        expiresAt,
      },
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      sellerProfile: user.sellerProfile
        ? {
            id: user.sellerProfile.id,
            storeName: user.sellerProfile.storeName,
            storeSlug: user.sellerProfile.storeSlug,
            status: user.sellerProfile.status,
            rejectionReason: user.sellerProfile.rejectionReason,
          }
        : null,
      session: {
        token: session.token,
        expiresAt: session.expiresAt,
      },
    };
  }

  /**
   * Submit seller KYC application
   */
  async submitApplication(userId: string, dto: CreateSellerApplicationDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { sellerProfile: true },
    });

    if (!user) {
      throw new NotFoundException('User account not found.');
    }

    if (user.sellerProfile) {
      throw new ConflictException(
        'A seller profile/application already exists for this account.',
      );
    }

    const slugTaken = await this.prisma.sellerProfile.findUnique({
      where: { storeSlug: dto.storeSlug.toLowerCase() },
    });

    if (slugTaken) {
      throw new ConflictException(
        `Store slug "${dto.storeSlug}" is already taken. Please choose another URL identifier.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { role: Role.SELLER },
      });

      const profile = await tx.sellerProfile.create({
        data: {
          authUserId: userId,
          storeName: dto.storeName,
          storeSlug: dto.storeSlug.toLowerCase(),
          storeDescription: dto.storeDescription,
          storeLogo: dto.storeLogo,
          storeBanner: dto.storeBanner,
          phone: dto.phone,
          businessAddress: dto.businessAddress,
          taxId: dto.taxId,
          bankAccountName: dto.bankAccountName,
          bankAccountNumber: dto.bankAccountNumber,
          bankIfscCode: dto.bankIfscCode,
          bankName: dto.bankName,
          status: SellerStatus.PENDING,
          commissionRate: 10.0,
        },
      });

      await tx.sellerNotification.create({
        data: {
          sellerId: profile.id,
          title: 'Application Received',
          message:
            'Your seller application has been submitted and is under review by Nexora administration.',
          type: 'APPROVAL',
        },
      });

      return profile;
    });
  }

  /**
   * Get seller profile by user ID
   */
  async getProfile(userId: string) {
    const profile = await this.prisma.sellerProfile.findUnique({
      where: { authUserId: userId },
      include: {
        _count: {
          select: {
            products: true,
            orderItems: true,
            notifications: { where: { read: false } },
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Seller profile not found for this user.');
    }

    return profile;
  }

  /**
   * Update seller profile settings
   */
  async updateProfile(userId: string, dto: UpdateSellerProfileDto) {
    const profile = await this.prisma.sellerProfile.findUnique({
      where: { authUserId: userId },
    });

    if (!profile) {
      throw new NotFoundException('Seller profile not found.');
    }

    return this.prisma.sellerProfile.update({
      where: { id: profile.id },
      data: {
        ...(dto.storeName && { storeName: dto.storeName }),
        ...(dto.storeDescription !== undefined && { storeDescription: dto.storeDescription }),
        ...(dto.storeLogo !== undefined && { storeLogo: dto.storeLogo }),
        ...(dto.storeBanner !== undefined && { storeBanner: dto.storeBanner }),
        ...(dto.phone && { phone: dto.phone }),
        ...(dto.businessAddress && { businessAddress: dto.businessAddress }),
        ...(dto.bankAccountName && { bankAccountName: dto.bankAccountName }),
        ...(dto.bankAccountNumber && { bankAccountNumber: dto.bankAccountNumber }),
        ...(dto.bankIfscCode && { bankIfscCode: dto.bankIfscCode }),
        ...(dto.bankName && { bankName: dto.bankName }),
      },
    });
  }

  /**
   * Get seller application status
   */
  async getStatus(userId: string) {
    const profile = await this.prisma.sellerProfile.findUnique({
      where: { authUserId: userId },
      select: {
        id: true,
        storeName: true,
        storeSlug: true,
        status: true,
        rejectionReason: true,
        approvedAt: true,
        commissionRate: true,
      },
    });

    if (!profile) {
      return {
        hasProfile: false,
        status: 'UNREGISTERED',
      };
    }

    return {
      hasProfile: true,
      ...profile,
    };
  }
}
