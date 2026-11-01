import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SellersService } from './sellers.service';
import { SellerRegisterDto } from './dto/seller-register.dto';
import { CreateSellerApplicationDto } from './dto/create-seller-application.dto';
import { UpdateSellerProfileDto } from './dto/update-seller-profile.dto';
import { LoginDto } from '../auth/dto/login.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/guards/current-user.decorator';
import { apiSuccess } from '../common/dto/api-response.dto';

@ApiTags('Seller Console: Onboarding & Profile')
@Controller('sellers')
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new seller account' })
  @ApiResponse({ status: 201, description: 'Seller registered successfully' })
  async register(@Body() dto: SellerRegisterDto) {
    const result = await this.sellersService.register(dto);
    return apiSuccess(result, null, 'Seller account created successfully');
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate seller and retrieve session' })
  @ApiResponse({ status: 200, description: 'Seller authenticated successfully' })
  async login(@Body() dto: LoginDto) {
    const result = await this.sellersService.login(dto);
    return apiSuccess(result, null, 'Seller authenticated successfully');
  }

  @Post('apply')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit seller onboarding application' })
  @ApiResponse({ status: 201, description: 'Application submitted' })
  async submitApplication(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSellerApplicationDto,
  ) {
    const profile = await this.sellersService.submitApplication(userId, dto);
    return apiSuccess(
      profile,
      null,
      'Seller application submitted successfully and is pending review',
    );
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get authenticated seller profile' })
  @ApiResponse({ status: 200, description: 'Seller profile retrieved' })
  async getProfile(@CurrentUser('id') userId: string) {
    const profile = await this.sellersService.getProfile(userId);
    return apiSuccess(profile, null, 'Seller profile retrieved');
  }

  @Patch('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update seller profile settings' })
  @ApiResponse({ status: 200, description: 'Seller profile updated' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateSellerProfileDto,
  ) {
    const profile = await this.sellersService.updateProfile(userId, dto);
    return apiSuccess(profile, null, 'Seller profile updated successfully');
  }

  @Get('status')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get seller approval and onboarding status' })
  @ApiResponse({ status: 200, description: 'Status retrieved' })
  async getStatus(@CurrentUser('id') userId: string) {
    const status = await this.sellersService.getStatus(userId);
    return apiSuccess(status, null, 'Seller status retrieved');
  }
}
