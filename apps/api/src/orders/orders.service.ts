import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CouponsService } from '../coupons/coupons.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, Prisma, Role } from '@prisma/client';
import { randomBytes } from 'crypto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly couponsService: CouponsService,
  ) {}

  /**
   * Create pending order from server-validated cart
   */
  async createOrder(customerId: string, dto: CreateOrderDto) {
    // 1. Fetch customer cart
    const cart = await this.prisma.cart.findUnique({
      where: { customerId },
      include: {
        items: {
          include: {
            productVariant: {
              include: {
                product: {
                  include: {
                    images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cannot create order: Your cart is empty.');
    }

    // 2. Fetch and snapshot shipping address
    const address = await this.prisma.address.findFirst({
      where: { id: dto.addressId, customerId },
    });

    if (!address) {
      throw new BadRequestException('Selected shipping address is invalid or not found.');
    }

    const addressSnapshot = {
      label: address.label,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
    };

    // 3. Validate stock and recalculate subtotal
    let subtotalDecimal = new Prisma.Decimal(0);
    const orderItemsData: any[] = [];

    for (const item of cart.items) {
      const variant = item.productVariant;
      const product = variant.product;

      if (item.quantity > variant.stockQuantity) {
        throw new BadRequestException(
          `Insufficient stock for "${product.name}" (${variant.sku}). Available: ${variant.stockQuantity}, requested: ${item.quantity}.`,
        );
      }

      const unitPrice = variant.priceOverride || product.price;
      const lineTotal = unitPrice.mul(new Prisma.Decimal(item.quantity));
      subtotalDecimal = subtotalDecimal.add(lineTotal);

      orderItemsData.push({
        productVariantId: variant.id,
        nameSnapshot: product.name,
        priceSnapshot: unitPrice,
        quantity: item.quantity,
        skuSnapshot: variant.sku,
        imageSnapshot: product.images?.[0]?.url || null,
      });
    }

    const subtotal = Number(subtotalDecimal);
    const shipping = subtotal >= 1999 || subtotal === 0 ? 0 : 150;
    const tax = Number((subtotal * 0.18).toFixed(2));

    // 4. Validate Coupon Discount (if provided)
    let discount = 0;
    if (dto.couponCode) {
      const couponResult = await this.couponsService.validateCoupon(dto.couponCode, subtotal);
      discount = couponResult.discountAmount;
    }

    const total = Math.max(0, Number((subtotal - discount + shipping).toFixed(2)));

    // 5. Generate Order Number: NEX-YYYYMMDD-XXXX
    const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = randomBytes(3).toString('hex').toUpperCase();
    const orderNumber = `NEX-${datePrefix}-${randomHex}`;

    // 6. Create order in transaction
    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        customerId,
        addressSnapshot,
        subtotal: new Prisma.Decimal(subtotal),
        tax: new Prisma.Decimal(tax),
        shipping: new Prisma.Decimal(shipping),
        discount: new Prisma.Decimal(discount),
        total: new Prisma.Decimal(total),
        status: OrderStatus.PENDING,
        notes: dto.notes || null,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
      },
    });

    return order;
  }

  /**
   * Get all orders for authenticated customer
   */
  async getCustomerOrders(customerId: string) {
    return this.prisma.order.findMany({
      where: { customerId },
      include: {
        items: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get order details by ID with authorization check
   */
  async getOrderById(orderId: string, customerId?: string, userRole?: Role) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        payments: true,
        customer: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID "${orderId}" not found.`);
    }

    // Role-based authorization: customer can only view their own order; ADMIN can view any
    if (userRole !== Role.ADMIN && customerId && order.customerId !== customerId) {
      throw new ForbiddenException('You do not have permission to view this order.');
    }

    return order;
  }
}
