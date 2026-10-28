import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/guards/current-user.decorator';
import { apiSuccess } from '../common/dto/api-response.dto';
import { Role } from '@prisma/client';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create pending order from server-validated cart' })
  @ApiResponse({ status: 201, description: 'Order created in PENDING status' })
  @ApiResponse({ status: 400, description: 'Cart empty or insufficient stock' })
  async createOrder(
    @CurrentUser('profileId') profileId: string,
    @Body() dto: CreateOrderDto,
  ) {
    if (!profileId) {
      throw new BadRequestException('Customer profile not initialized.');
    }
    const order = await this.ordersService.createOrder(profileId, dto);
    return apiSuccess(order, null, 'Order placed successfully in PENDING state');
  }

  @Get()
  @ApiOperation({ summary: 'Get current customer order history' })
  @ApiResponse({ status: 200, description: 'Order history list' })
  async getCustomerOrders(@CurrentUser('profileId') profileId: string) {
    if (!profileId) {
      throw new BadRequestException('Customer profile not initialized.');
    }
    const orders = await this.ordersService.getCustomerOrders(profileId);
    return apiSuccess(orders, null, 'Orders retrieved');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details with timeline by order ID' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ status: 200, description: 'Order details' })
  @ApiResponse({ status: 403, description: 'Forbidden: Cannot access other customers orders' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderById(
    @Param('id') orderId: string,
    @CurrentUser('profileId') profileId: string,
    @CurrentUser('role') role: Role,
  ) {
    const order = await this.ordersService.getOrderById(orderId, profileId, role);
    return apiSuccess(order, null, 'Order details retrieved');
  }
}
