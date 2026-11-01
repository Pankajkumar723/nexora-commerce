import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SellerProductsService } from './seller-products.service';
import { CreateSellerProductDto } from './dto/create-seller-product.dto';
import { UpdateSellerProductDto } from './dto/update-seller-product.dto';
import { AdjustSellerStockDto } from './dto/adjust-seller-stock.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/guards/roles.decorator';
import { SellerApprovalGuard } from '../common/guards/seller-approval.guard';
import { CurrentUser } from '../common/guards/current-user.decorator';
import { apiSuccess } from '../common/dto/api-response.dto';
import { ProductStatus, Role } from '@prisma/client';

@ApiTags('Seller Console: Products & Inventory')
@Controller('seller/products')
@UseGuards(AuthGuard, RolesGuard, SellerApprovalGuard)
@Roles(Role.SELLER, Role.ADMIN)
@ApiBearerAuth()
export class SellerProductsController {
  constructor(private readonly sellerProductsService: SellerProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List products owned by authenticated seller' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', enum: ProductStatus, required: false })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({ status: 200, description: 'Products retrieved' })
  async getProducts(
    @CurrentUser('sellerId') sellerId: string,
    @Query('search') search?: string,
    @Query('status') status?: ProductStatus,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    const data = await this.sellerProductsService.getProducts(sellerId, {
      search,
      status,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 20,
    });
    return apiSuccess(data.items, data.meta, 'Seller products retrieved');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of seller product' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Product retrieved' })
  @ApiResponse({ status: 403, description: 'Forbidden: Product owned by another seller' })
  async getProductById(
    @CurrentUser('sellerId') sellerId: string,
    @Param('id') productId: string,
  ) {
    const product = await this.sellerProductsService.getProductById(sellerId, productId);
    return apiSuccess(product, null, 'Product retrieved');
  }

  @Post()
  @ApiOperation({ summary: 'Create new product for seller' })
  @ApiResponse({ status: 201, description: 'Product created and submitted for approval' })
  async createProduct(
    @CurrentUser('sellerId') sellerId: string,
    @Body() dto: CreateSellerProductDto,
  ) {
    const product = await this.sellerProductsService.createProduct(sellerId, dto);
    return apiSuccess(
      product,
      null,
      'Product created successfully and submitted for platform approval',
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update seller product' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Product updated' })
  async updateProduct(
    @CurrentUser('sellerId') sellerId: string,
    @Param('id') productId: string,
    @Body() dto: UpdateSellerProductDto,
  ) {
    const product = await this.sellerProductsService.updateProduct(
      sellerId,
      productId,
      dto,
    );
    return apiSuccess(product, null, 'Product updated successfully');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive/delete seller product' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Product archived' })
  async deleteProduct(
    @CurrentUser('sellerId') sellerId: string,
    @Param('id') productId: string,
  ) {
    const product = await this.sellerProductsService.deleteProduct(sellerId, productId);
    return apiSuccess(product, null, 'Product removed from active catalog');
  }

  @Post(':id/stock')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Adjust stock for a variant of this product' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Stock updated' })
  async adjustStock(
    @CurrentUser('sellerId') sellerId: string,
    @Param('id') productId: string,
    @Body() dto: AdjustSellerStockDto,
  ) {
    const variant = await this.sellerProductsService.adjustStock(
      sellerId,
      productId,
      dto,
    );
    return apiSuccess(variant, null, 'Stock adjusted successfully');
  }
}
