import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { AddWishlistDto } from './dto/add-wishlist.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/guards/current-user.decorator';
import { apiSuccess } from '../common/dto/api-response.dto';

@ApiTags('Wishlist')
@Controller('wishlist')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get current customer wishlist' })
  @ApiResponse({ status: 200, description: 'Wishlist items' })
  async getWishlist(@CurrentUser('profileId') profileId: string) {
    if (!profileId) {
      throw new BadRequestException('Customer profile not initialized.');
    }
    const wishlist = await this.wishlistService.getWishlist(profileId);
    return apiSuccess(wishlist, null, 'Wishlist retrieved successfully');
  }

  @Post()
  @ApiOperation({ summary: 'Save product to wishlist' })
  @ApiResponse({ status: 201, description: 'Product added to wishlist' })
  async addToWishlist(
    @CurrentUser('profileId') profileId: string,
    @Body() dto: AddWishlistDto,
  ) {
    if (!profileId) {
      throw new BadRequestException('Customer profile not initialized.');
    }
    const item = await this.wishlistService.addItem(profileId, dto.productId);
    return apiSuccess(item, null, 'Product saved to wishlist');
  }

  @Delete(':productId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove product from wishlist' })
  @ApiParam({ name: 'productId', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Product removed from wishlist' })
  async removeFromWishlist(
    @CurrentUser('profileId') profileId: string,
    @Param('productId') productId: string,
  ) {
    if (!profileId) {
      throw new BadRequestException('Customer profile not initialized.');
    }
    const result = await this.wishlistService.removeItem(profileId, productId);
    return apiSuccess(result, null, 'Product removed from wishlist');
  }
}
