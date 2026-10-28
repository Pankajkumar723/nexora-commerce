import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import { ValidateCouponDto } from './dto/validate-coupon.dto';
import { apiSuccess } from '../common/dto/api-response.dto';

@ApiTags('Coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate promotional coupon against current cart subtotal' })
  @ApiResponse({ status: 200, description: 'Coupon is valid' })
  @ApiResponse({ status: 400, description: 'Coupon invalid, expired, or threshold not met' })
  async validateCoupon(@Body() dto: ValidateCouponDto) {
    const result = await this.couponsService.validateCoupon(dto.code, dto.orderSubtotal);
    return apiSuccess(result, null, `Coupon "${result.code}" applied successfully`);
  }
}
