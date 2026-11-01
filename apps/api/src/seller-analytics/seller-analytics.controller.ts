import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { SellerAnalyticsService } from './seller-analytics.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/guards/roles.decorator';
import { SellerApprovalGuard } from '../common/guards/seller-approval.guard';
import { CurrentUser } from '../common/guards/current-user.decorator';
import { apiSuccess } from '../common/dto/api-response.dto';
import { Role } from '@prisma/client';

@ApiTags('Seller Console: Analytics & Reports')
@Controller('seller/analytics')
@UseGuards(AuthGuard, RolesGuard, SellerApprovalGuard)
@Roles(Role.SELLER, Role.ADMIN)
@ApiBearerAuth()
export class SellerAnalyticsController {
  constructor(private readonly analyticsService: SellerAnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get KPI metrics overview for seller dashboard' })
  @ApiResponse({ status: 200, description: 'Overview metrics' })
  async getOverview(@CurrentUser('sellerId') sellerId: string) {
    const data = await this.analyticsService.getOverview(sellerId);
    return apiSuccess(data, null, 'Overview metrics retrieved');
  }

  @Get('sales-chart')
  @ApiOperation({ summary: 'Get revenue and sales time-series chart data' })
  @ApiQuery({ name: 'period', enum: ['7d', '30d', '12m'], required: false })
  @ApiResponse({ status: 200, description: 'Sales chart series' })
  async getSalesChart(
    @CurrentUser('sellerId') sellerId: string,
    @Query('period') period: '7d' | '30d' | '12m' = '7d',
  ) {
    const chart = await this.analyticsService.getSalesChart(sellerId, period);
    return apiSuccess(chart, null, 'Sales chart retrieved');
  }

  @Get('best-sellers')
  @ApiOperation({ summary: 'Get top performing products for seller' })
  @ApiQuery({ name: 'limit', required: false, example: 5 })
  @ApiResponse({ status: 200, description: 'Top products' })
  async getBestSellers(
    @CurrentUser('sellerId') sellerId: string,
    @Query('limit') limit: string = '5',
  ) {
    const products = await this.analyticsService.getBestSellers(
      sellerId,
      parseInt(limit, 10) || 5,
    );
    return apiSuccess(products, null, 'Best sellers retrieved');
  }
}
