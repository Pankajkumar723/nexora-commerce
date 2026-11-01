import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SellerOrdersService } from './seller-orders.service';
import { UpdateFulfillmentStatusDto } from './dto/update-fulfillment-status.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/guards/roles.decorator';
import { SellerApprovalGuard } from '../common/guards/seller-approval.guard';
import { CurrentUser } from '../common/guards/current-user.decorator';
import { apiSuccess } from '../common/dto/api-response.dto';
import { FulfillmentStatus, Role } from '@prisma/client';

@ApiTags('Seller Console: Orders & Fulfillment')
@Controller('seller/orders')
@UseGuards(AuthGuard, RolesGuard, SellerApprovalGuard)
@Roles(Role.SELLER, Role.ADMIN)
@ApiBearerAuth()
export class SellerOrdersController {
  constructor(private readonly sellerOrdersService: SellerOrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List customer orders containing seller items' })
  @ApiQuery({ name: 'status', enum: FulfillmentStatus, required: false })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({ status: 200, description: 'Seller orders retrieved' })
  async getOrders(
    @CurrentUser('sellerId') sellerId: string,
    @Query('status') status?: FulfillmentStatus,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    const data = await this.sellerOrdersService.getOrders(sellerId, {
      status,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 20,
    });
    return apiSuccess(data.items, data.meta, 'Orders retrieved successfully');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details with seller-specific item isolation' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ status: 200, description: 'Order details' })
  @ApiResponse({ status: 403, description: 'Forbidden: No seller items in order' })
  async getOrderById(
    @CurrentUser('sellerId') sellerId: string,
    @Param('id') orderId: string,
  ) {
    const order = await this.sellerOrdersService.getOrderById(sellerId, orderId);
    return apiSuccess(order, null, 'Order details retrieved');
  }

  @Patch('items/:itemId/fulfillment')
  @ApiOperation({ summary: 'Update fulfillment status of an order item' })
  @ApiParam({ name: 'itemId', description: 'Order item UUID' })
  @ApiResponse({ status: 200, description: 'Fulfillment status updated' })
  @ApiResponse({ status: 403, description: 'Forbidden: Item not owned by seller' })
  async updateItemFulfillment(
    @CurrentUser('sellerId') sellerId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateFulfillmentStatusDto,
  ) {
    const item = await this.sellerOrdersService.updateItemFulfillment(
      sellerId,
      itemId,
      dto,
    );
    return apiSuccess(
      item,
      null,
      `Fulfillment status updated to ${dto.status}`,
    );
  }
}
