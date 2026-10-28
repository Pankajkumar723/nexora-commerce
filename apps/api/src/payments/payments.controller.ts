import {
  Controller,
  Post,
  Body,
  UseGuards,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentOrderDto } from './dto/create-payment-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/guards/current-user.decorator';
import { apiSuccess } from '../common/dto/api-response.dto';
import { Request } from 'express';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('razorpay/order')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Razorpay payment order for local pending order' })
  @ApiResponse({ status: 201, description: 'Razorpay order created with public Key ID' })
  async createRazorpayOrder(
    @CurrentUser('profileId') profileId: string,
    @Body() dto: CreatePaymentOrderDto,
  ) {
    if (!profileId) {
      throw new BadRequestException('Customer profile not initialized.');
    }
    const result = await this.paymentsService.createRazorpayOrder(profileId, dto);
    return apiSuccess(result, null, 'Razorpay order created');
  }

  @Post('razorpay/verify')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify Razorpay signature and capture payment' })
  @ApiResponse({ status: 200, description: 'Payment verified and order confirmed' })
  @ApiResponse({ status: 400, description: 'Invalid or forged signature' })
  async verifyPayment(
    @CurrentUser('profileId') profileId: string,
    @Body() dto: VerifyPaymentDto,
  ) {
    if (!profileId) {
      throw new BadRequestException('Customer profile not initialized.');
    }
    const result = await this.paymentsService.verifyPayment(profileId, dto);
    return apiSuccess(result, null, 'Payment verified successfully. Order confirmed.');
  }

  @Post('razorpay/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Razorpay webhook receiver with HMAC signature verification' })
  @ApiHeader({ name: 'x-razorpay-signature', description: 'Webhook HMAC SHA-256 signature' })
  @ApiResponse({ status: 200, description: 'Webhook processed or deduplicated' })
  async handleWebhook(
    @Headers('x-razorpay-signature') signature: string,
    @Req() req: Request,
    @Body() payload: any,
  ) {
    // In Express, raw body or serialized JSON payload
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(payload);
    const result = await this.paymentsService.processWebhook(rawBody, signature, payload);
    return apiSuccess(result, null, 'Webhook processed successfully');
  }
}
