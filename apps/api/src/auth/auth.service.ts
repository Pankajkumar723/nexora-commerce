import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Hashes a plain password using crypto.scrypt
   */
  hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  /**
   * Verifies password against stored salt:hash
   */
  verifyPassword(password: string, storedHash: string): boolean {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = scryptSync(password, salt, 64);
    return timingSafeEqual(keyBuffer, derivedKey);
  }

  /**
   * Register a new user with CustomerProfile and active Session
   */
  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('An account with this email address already exists.');
    }

    const hashedPassword = this.hashPassword(dto.password);
    const sessionToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: dto.name,
          email: dto.email.toLowerCase(),
          emailVerified: false,
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

      const profile = await tx.customerProfile.create({
        data: {
          authUserId: user.id,
          name: dto.name,
          phone: dto.phone || null,
        },
      });

      const session = await tx.session.create({
        data: {
          userId: user.id,
          token: sessionToken,
          expiresAt,
        },
      });

      return { user, profile, session };
    });

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
      },
      profile: {
        id: result.profile.id,
        name: result.profile.name,
        phone: result.profile.phone,
      },
      session: {
        token: result.session.token,
        expiresAt: result.session.expiresAt,
      },
    };
  }

  /**
   * Sign-in user and generate new session token
   */
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: {
        accounts: {
          where: { providerId: 'credentials' },
        },
        profile: true,
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
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

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
        email: user.email,
        name: user.name,
        role: user.role,
      },
      profile: user.profile
        ? {
            id: user.profile.id,
            name: user.profile.name,
            phone: user.profile.phone,
          }
        : null,
      session: {
        token: session.token,
        expiresAt: session.expiresAt,
      },
    };
  }

  /**
   * Get current authenticated user profile
   */
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            addresses: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found.');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      profile: user.profile,
    };
  }

  /**
   * Terminate session
   */
  async logout(token: string) {
    try {
      await this.prisma.session.delete({
        where: { token },
      });
      return { success: true };
    } catch {
      return { success: true };
    }
  }
}
