import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CreateAdminCouponDto } from './dto/create-admin-coupon.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/guards/roles.decorator';
import { CurrentUser } from '../common/guards/current-user.decorator';
import { apiSuccess } from '../common/dto/api-response.dto';
import { OrderStatus, Role } from '@prisma/client';

@ApiTags('Admin Console')
@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('analytics')
  @ApiOperation({ summary: 'Get aggregate store metrics and KPI analytics' })
  @ApiResponse({ status: 200, description: 'Store analytics overview' })
  @ApiResponse({ status: 403, description: 'Forbidden: Requires ADMIN role' })
  async getAnalytics() {
    const data = await this.adminService.getAnalytics();
    return apiSuccess(data, null, 'Analytics retrieved');
  }

  @Get('orders')
  @ApiOperation({ summary: 'List all store orders with status filter' })
  @ApiQuery({ name: 'status', enum: OrderStatus, required: false })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({ status: 200, description: 'Orders list' })
  async getOrders(
    @Query('status') status?: OrderStatus,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    const data = await this.adminService.getAllOrders(
      status,
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 20,
    );
    return apiSuccess(data.items, data.meta, 'Orders retrieved');
  }

  @Patch('orders/:id')
  @ApiOperation({ summary: 'Update order fulfillment status' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ status: 200, description: 'Order status updated' })
  async updateOrderStatus(
    @Param('id') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    const order = await this.adminService.updateOrderStatus(orderId, dto.status);
    return apiSuccess(order, null, `Order status updated to ${dto.status}`);
  }

  @Post('inventory/adjust')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Adjust variant inventory with audit log' })
  @ApiResponse({ status: 200, description: 'Stock adjusted' })
  async adjustStock(
    @CurrentUser('id') adminId: string,
    @Body() dto: AdjustStockDto,
  ) {
    const result = await this.adminService.adjustStock(dto, adminId);
    return apiSuccess(result, null, 'Inventory adjusted successfully');
  }

  @Get('coupons')
  @ApiOperation({ summary: 'List all coupons' })
  @ApiResponse({ status: 200, description: 'Coupons list' })
  async getCoupons() {
    const coupons = await this.adminService.getAllCoupons();
    return apiSuccess(coupons, null, 'Coupons retrieved');
  }

  @Post('coupons')
  @ApiOperation({ summary: 'Create a new coupon' })
  @ApiResponse({ status: 201, description: 'Coupon created' })
  async createCoupon(@Body() dto: CreateAdminCouponDto) {
    const coupon = await this.adminService.createCoupon(dto);
    return apiSuccess(coupon, null, 'Coupon created successfully');
  }

  @Get('customers')
  @ApiOperation({ summary: 'List customers with total spend and orders' })
  @ApiResponse({ status: 200, description: 'Customers list' })
  async getCustomers() {
    const customers = await this.adminService.getAllCustomers();
    return apiSuccess(customers, null, 'Customers retrieved');
  }
}
