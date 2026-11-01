import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CommissionsService } from './commissions.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/guards/roles.decorator';
import { SellerApprovalGuard } from '../common/guards/seller-approval.guard';
import { CurrentUser } from '../common/guards/current-user.decorator';
import { apiSuccess } from '../common/dto/api-response.dto';
import { CommissionStatus, Role } from '@prisma/client';

@ApiTags('Seller Console: Earnings & Commissions')
@Controller('seller/commissions')
@UseGuards(AuthGuard, RolesGuard, SellerApprovalGuard)
@Roles(Role.SELLER, Role.ADMIN)
@ApiBearerAuth()
export class CommissionsController {
  constructor(private readonly commissionsService: CommissionsService) {}

  @Get()
  @ApiOperation({ summary: 'List commission ledger records' })
  @ApiQuery({ name: 'status', enum: CommissionStatus, required: false })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({ status: 200, description: 'Commission records' })
  async getCommissions(
    @CurrentUser('sellerId') sellerId: string,
    @Query('status') status?: CommissionStatus,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    const data = await this.commissionsService.getCommissions(sellerId, {
      status,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 20,
    });
    return apiSuccess(data.items, data.meta, 'Commissions retrieved');
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get financial summary: gross, net, commission and available payout balance' })
  @ApiResponse({ status: 200, description: 'Financial summary' })
  async getFinancialSummary(@CurrentUser('sellerId') sellerId: string) {
    const summary = await this.commissionsService.getFinancialSummary(sellerId);
    return apiSuccess(summary, null, 'Financial summary calculated successfully');
  }
}
