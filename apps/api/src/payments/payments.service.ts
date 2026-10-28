import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { CreatePaymentOrderDto } from './dto/create-payment-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly keyId: string;
  private readonly keySecret: string;
  private readonly webhookSecret: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cartService: CartService,
    private readonly configService: ConfigService,
  ) {
    this.keyId = this.configService.get<string>('app.razorpayKeyId') || 'rzp_test_sample';
    this.keySecret = this.configService.get<string>('app.razorpayKeySecret') || 'secret_mock_test';
    this.webhookSecret =
      this.configService.get<string>('app.razorpayWebhookSecret') || 'webhook_secret_mock';
  }

  /**
   * Generates HMAC SHA-256 signature for Razorpay verification
   */
  generateSignature(data: string, secret: string): string {
    return createHmac('sha256', secret).update(data).digest('hex');
  }

  /**
   * Constant-time comparison to prevent timing attack vulnerabilities
   */
  secureCompare(a: string, b: string): boolean {
    if (!a || !b) return false;
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  }

  /**
   * Create Razorpay Order server-side
   */
  async createRazorpayOrder(customerId: string, dto: CreatePaymentOrderDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order "${dto.orderId}" not found.`);
    }

    if (order.customerId !== customerId) {
      throw new ForbiddenException('Unauthorized: You cannot pay for another customer’s order.');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        `Order is in "${order.status}" status and cannot be paid again.`,
      );
    }

    const amountInPaise = Math.round(Number(order.total) * 100);
    // Standard Razorpay Order format: order_xxxxxxxxxxxxxx
    const razorpayOrderId = `order_${randomBytes(8).toString('hex')}`;

    // Create or update local Payment record in database
    await this.prisma.payment.create({
      data: {
        orderId: order.id,
        provider: 'RAZORPAY',
        providerOrderId: razorpayOrderId,
        amount: order.total,
        currency: 'INR',
        status: PaymentStatus.PENDING,
      },
    });

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      razorpayOrderId,
      keyId: this.keyId,
      amount: amountInPaise,
      currency: 'INR',
    };
  }

  /**
   * Server-side signature verification & atomic stock decrement
   */
  async verifyPayment(customerId: string, dto: VerifyPaymentDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: {
        items: true,
        payments: {
          where: { providerOrderId: dto.razorpayOrderId },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order "${dto.orderId}" not found.`);
    }

    if (order.customerId !== customerId) {
      throw new ForbiddenException('Unauthorized: Order ownership mismatch.');
    }

    // 1. Mandatory HMAC SHA-256 verification
    const expectedSignature = this.generateSignature(
      `${dto.razorpayOrderId}|${dto.razorpayPaymentId}`,
      this.keySecret,
    );

    const isValidSignature = this.secureCompare(expectedSignature, dto.razorpaySignature);
    if (!isValidSignature) {
      this.logger.error(`Signature verification failed for order ${dto.orderId}`);
      throw new BadRequestException('Payment signature verification failed. Untrusted payment.');
    }

    // 2. Execute fulfillment in database transaction
    await this.prisma.$transaction(async (tx) => {
      // Update Payment record
      await tx.payment.updateMany({
        where: { orderId: order.id, providerOrderId: dto.razorpayOrderId },
        data: {
          providerPaymentId: dto.razorpayPaymentId,
          status: PaymentStatus.CAPTURED,
          signatureVerifiedAt: new Date(),
        },
      });

      // Update Order status
      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.CONFIRMED },
      });

      // Decrement inventory stock & record inventory audit movement
      for (const item of order.items) {
        if (item.productVariantId) {
          await tx.productVariant.update({
            where: { id: item.productVariantId },
            data: { stockQuantity: { decrement: item.quantity } },
          });

          await tx.inventoryMovement.create({
            data: {
              variantId: item.productVariantId,
              quantityDelta: -item.quantity,
              reason: 'ORDER_FULFILLMENT',
              referenceId: order.id,
            },
          });
        }
      }
    });

    // 3. Clear customer shopping cart upon confirmed purchase
    await this.cartService.clearCart(customerId);

    return {
      verified: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: OrderStatus.CONFIRMED,
      paymentId: dto.razorpayPaymentId,
    };
  }

  /**
   * Idempotent webhook event processor with raw-body HMAC SHA-256 verification
   */
  async processWebhook(rawBody: string, signature: string, payload: any) {
    if (!signature) {
      throw new BadRequestException('Razorpay webhook signature header missing.');
    }

    const expectedSignature = this.generateSignature(rawBody, this.webhookSecret);
    if (!this.secureCompare(expectedSignature, signature)) {
      throw new BadRequestException('Invalid webhook signature.');
    }

    const eventId = payload?.event_id || payload?.id;
    if (!eventId) {
      throw new BadRequestException('Webhook payload missing event identifier.');
    }

    // Idempotency check: deduplicate event IDs
    const existingEvent = await this.prisma.webhookEvent.findUnique({
      where: { providerEventId: eventId },
    });

    if (existingEvent) {
      this.logger.log(`Webhook event ${eventId} already processed, returning idempotently.`);
      return { processed: true, duplicate: true };
    }

    // Record webhook event
    await this.prisma.webhookEvent.create({
      data: {
        providerEventId: eventId,
        eventType: payload.event || 'payment.captured',
        payload: payload as Prisma.InputJsonValue,
      },
    });

    // Reconcile payment status if event is payment.captured
    if (payload.event === 'payment.captured') {
      const paymentEntity = payload.payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;
      if (razorpayOrderId) {
        await this.prisma.payment.updateMany({
          where: { providerOrderId: razorpayOrderId },
          data: {
            status: PaymentStatus.CAPTURED,
            providerPaymentId: paymentEntity.id,
            signatureVerifiedAt: new Date(),
          },
        });
      }
    }

    return { processed: true, eventId };
  }
}
