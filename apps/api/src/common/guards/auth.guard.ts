import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    const cookieToken = request.cookies?.session_token;

    let token: string | null = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (cookieToken) {
      token = cookieToken;
    }

    if (!token) {
      throw new UnauthorizedException('Authentication token missing. Please sign in.');
    }

    // Verify session in database
    const session = await this.prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid or expired authentication session.');
    }

    if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
      throw new UnauthorizedException('Session expired. Please sign in again.');
    }

    request.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      profileId: session.user.profile?.id || null,
      sessionId: session.id,
    };

    return true;
  }
}
