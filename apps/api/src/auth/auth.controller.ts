import {
  Controller,
  Post,
  Get,
  All,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Headers,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SendOtpDto, VerifyOtpDto, RegisterWithOtpDto } from './dto/otp.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/guards/current-user.decorator';
import { apiSuccess } from '../common/dto/api-response.dto';
import { getBetterAuth } from './better-auth.instance';
import { Request, Response } from 'express';

// Lazy loader for better-auth and better-auth/node to avoid ERR_REQUIRE_ESM in CommonJS runtime
let cachedBetterAuthHandler: ((req: Request, res: Response) => Promise<any>) | null = null;
async function getBetterAuthHandler() {
  if (!cachedBetterAuthHandler) {
    const dynamicImport = new Function('specifier', 'return import(specifier)');
    const [{ toNodeHandler }, authInstance] = await Promise.all([
      (dynamicImport('better-auth/node') as Promise<{
        toNodeHandler: (authInstance: any) => (req: Request, res: Response) => Promise<any>;
      }>),
      getBetterAuth(),
    ]);
    cachedBetterAuthHandler = toNodeHandler(authInstance);
  }
  return cachedBetterAuthHandler;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new customer account' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() dto: RegisterDto) {
    const result = await this.authService.register(dto);
    return apiSuccess(result, null, 'Registration successful');
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiResponse({ status: 200, description: 'User authenticated with session token' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto);
    return apiSuccess(result, null, 'Sign in successful');
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user and profile' })
  @ApiResponse({ status: 200, description: 'User profile details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@CurrentUser('id') userId: string) {
    const user = await this.authService.getMe(userId);
    return apiSuccess(user, null, 'Profile retrieved');
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sign out and invalidate current session' })
  @ApiResponse({ status: 200, description: 'Session terminated' })
  async logout(@Headers('authorization') authHeader: string) {
    const token = authHeader?.replace('Bearer ', '').trim();
    if (token) {
      await this.authService.logout(token);
    }
    return apiSuccess({ loggedOut: true }, null, 'Sign out successful');
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in or sign up via Google OAuth' })
  @ApiResponse({ status: 200, description: 'User authenticated with Google' })
  async googleAuth(@Body() body: { email: string; name: string; googleId?: string; image?: string }) {
    const result = await this.authService.googleAuth(body);
    return apiSuccess(result, null, 'Google authentication successful');
  }

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a 6-digit OTP to user email for verification' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  async sendOtp(@Body() dto: SendOtpDto) {
    const result = await this.authService.sendOtp(dto);
    return apiSuccess(result, null, result.message);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify 6-digit OTP code' })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    const result = await this.authService.verifyOtp(dto);
    return apiSuccess(result, null, result.message);
  }

  @Post('register-with-otp')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Complete registration after OTP verification' })
  @ApiResponse({ status: 201, description: 'Account created and verified' })
  async registerWithOtp(@Body() dto: RegisterWithOtpDto) {
    const result = await this.authService.registerWithOtp(dto);
    return apiSuccess(result, null, result.message);
  }

  @All('*')
  @ApiOperation({ summary: 'Better Auth native endpoint handler' })
  async handleBetterAuth(@Req() req: Request, @Res() res: Response) {
    const handler = await getBetterAuthHandler();
    return handler(req, res);
  }
}
