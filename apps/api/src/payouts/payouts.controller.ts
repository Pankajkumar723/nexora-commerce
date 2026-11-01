import {
  Controller,
  Get,
  Post,
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
import { PayoutsService } from './payouts.service';
import { RequestPayoutDto } from './dto/request-payout.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/guards/roles.decorator';
import { SellerApprovalGuard } from '../common/guards/seller-approval.guard';
import { CurrentUser } from '../common/guards/current-user.decorator';
import { apiSuccess } from '../common/dto/api-response.dto';
import { PayoutStatus, Role } from '@prisma/client';

@ApiTags('Seller Console: Payouts & Disbursements')
@Controller('seller/payouts')
@UseGuards(AuthGuard, RolesGuard, SellerApprovalGuard)
@Roles(Role.SELLER, Role.ADMIN)
@ApiBearerAuth()
export class PayoutsController {
  constructor(private readonly payoutsService: PayoutsService) {}

  @Get()
  @ApiOperation({ summary: 'List payouts history' })
  @ApiQuery({ name: 'status', enum: PayoutStatus, required: false })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({ status: 200, description: 'Payouts list' })
  async getPayouts(
    @CurrentUser('sellerId') sellerId: string,
    @Query('status') status?: PayoutStatus,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    const data = await this.payoutsService.getPayouts(sellerId, {
      status,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 20,
    });
    return apiSuccess(data.items, data.meta, 'Payout history retrieved');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payout details' })
  @ApiParam({ name: 'id', description: 'Payout UUID' })
  @ApiResponse({ status: 200, description: 'Payout details' })
  @ApiResponse({ status: 403, description: 'Forbidden: Payout belongs to another seller' })
  async getPayoutById(
    @CurrentUser('sellerId') sellerId: string,
    @Param('id') payoutId: string,
  ) {
    const payout = await this.payoutsService.getPayoutById(sellerId, payoutId);
    return apiSuccess(payout, null, 'Payout details retrieved');
  }

  @Post('request')
  @ApiOperation({ summary: 'Request withdrawal of available earnings' })
  @ApiResponse({ status: 201, description: 'Payout requested' })
  @ApiResponse({ status: 400, description: 'Insufficient available earnings' })
  async requestPayout(
    @CurrentUser('sellerId') sellerId: string,
    @Body() dto: RequestPayoutDto,
  ) {
    const payout = await this.payoutsService.requestPayout(sellerId, dto);
    return apiSuccess(
      payout,
      null,
      `Payout request #${payout.payoutNumber} of ₹${dto.amount} submitted successfully`,
    );
  }
}
