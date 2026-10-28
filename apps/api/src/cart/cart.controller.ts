import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/guards/current-user.decorator';
import { apiSuccess } from '../common/dto/api-response.dto';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get current customer shopping cart with calculated totals' })
  @ApiResponse({ status: 200, description: 'Current cart details' })
  async getCart(@CurrentUser('profileId') profileId: string) {
    if (!profileId) {
      throw new BadRequestException('Customer profile not initialized.');
    }
    const cart = await this.cartService.getOrCreateCart(profileId);
    return apiSuccess(cart, null, 'Cart retrieved');
  }

  @Post('items')
  @ApiOperation({ summary: 'Add product variant item to cart' })
  @ApiResponse({ status: 201, description: 'Item added to cart' })
  @ApiResponse({ status: 400, description: 'Insufficient stock or invalid quantity' })
  async addItem(
    @CurrentUser('profileId') profileId: string,
    @Body() dto: AddCartItemDto,
  ) {
    if (!profileId) {
      throw new BadRequestException('Customer profile not initialized.');
    }
    const cart = await this.cartService.addItem(profileId, dto);
    return apiSuccess(cart, null, 'Item added to cart');
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiParam({ name: 'id', description: 'Cart Item UUID' })
  @ApiResponse({ status: 200, description: 'Cart item quantity updated' })
  async updateItem(
    @CurrentUser('profileId') profileId: string,
    @Param('id') cartItemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    if (!profileId) {
      throw new BadRequestException('Customer profile not initialized.');
    }
    const cart = await this.cartService.updateItem(profileId, cartItemId, dto);
    return apiSuccess(cart, null, 'Cart updated');
  }

  @Delete('items/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiParam({ name: 'id', description: 'Cart Item UUID' })
  @ApiResponse({ status: 200, description: 'Item removed from cart' })
  async removeItem(
    @CurrentUser('profileId') profileId: string,
    @Param('id') cartItemId: string,
  ) {
    if (!profileId) {
      throw new BadRequestException('Customer profile not initialized.');
    }
    const cart = await this.cartService.removeItem(profileId, cartItemId);
    return apiSuccess(cart, null, 'Item removed from cart');
  }
}
