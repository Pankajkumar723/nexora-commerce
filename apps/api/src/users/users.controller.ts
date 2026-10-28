import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/guards/current-user.decorator';
import { apiSuccess } from '../common/dto/api-response.dto';

@ApiTags('Users & Addresses')
@Controller()
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('addresses')
  @ApiOperation({ summary: 'Get current customer saved shipping addresses' })
  @ApiResponse({ status: 200, description: 'List of addresses' })
  async getAddresses(@CurrentUser('profileId') profileId: string) {
    if (!profileId) {
      throw new BadRequestException('Customer profile not initialized for this account.');
    }
    const addresses = await this.usersService.getAddresses(profileId);
    return apiSuccess(addresses, null, 'Addresses retrieved');
  }

  @Post('addresses')
  @ApiOperation({ summary: 'Save a new shipping address' })
  @ApiResponse({ status: 201, description: 'Address created' })
  async createAddress(
    @CurrentUser('profileId') profileId: string,
    @Body() dto: CreateAddressDto,
  ) {
    if (!profileId) {
      throw new BadRequestException('Customer profile not initialized for this account.');
    }
    const address = await this.usersService.createAddress(profileId, dto);
    return apiSuccess(address, null, 'Address saved successfully');
  }

  @Delete('addresses/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a shipping address by ID' })
  @ApiParam({ name: 'id', description: 'Address UUID' })
  @ApiResponse({ status: 200, description: 'Address deleted' })
  async deleteAddress(
    @CurrentUser('profileId') profileId: string,
    @Param('id') addressId: string,
  ) {
    if (!profileId) {
      throw new BadRequestException('Customer profile not initialized.');
    }
    const deleted = await this.usersService.deleteAddress(profileId, addressId);
    return apiSuccess(deleted, null, 'Address removed successfully');
  }

  @Patch('users/profile')
  @ApiOperation({ summary: 'Update customer profile' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  async updateProfile(
    @CurrentUser('profileId') profileId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    if (!profileId) {
      throw new BadRequestException('Customer profile not initialized.');
    }
    const profile = await this.usersService.updateProfile(profileId, dto);
    return apiSuccess(profile, null, 'Profile updated successfully');
  }
}
