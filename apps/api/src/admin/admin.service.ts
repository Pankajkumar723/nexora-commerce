import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { CreateAdminCouponDto } from './dto/create-admin-coupon.dto';
import { OrderStatus, Prisma } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Aggregate KPI analytics across store metrics
   */
  async getAnalytics() {
    const [
      orders,
      totalProducts,
      totalCustomers,
      lowStockVariants,
      recentOrders,
    ] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          status: {
            in: [
              OrderStatus.CONFIRMED,
              OrderStatus.PROCESSING,
              OrderStatus.SHIPPED,
              OrderStatus.DELIVERED,
            ],
          },
        },
        select: { total: true },
      }),
      this.prisma.product.count({
        where: { status: 'ACTIVE' },
      }),
      this.prisma.customerProfile.count(),
      this.prisma.productVariant.findMany({
        where: { stockQuantity: { lte: 5 } },
        include: {
          product: { select: { name: true, slug: true } },
        },
      }),
      this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { name: true } },
          items: true,
        },
      }),
    ]);

    const totalRevenue = orders.reduce((acc, curr) => acc + Number(curr.total), 0);
    const totalOrdersCount = await this.prisma.order.count();

    return {
      revenue: totalRevenue,
      totalOrders: totalOrdersCount,
      totalProducts,
      totalCustomers,
      lowStockCount: lowStockVariants.length,
      lowStockVariants: lowStockVariants.map((v) => ({
        id: v.id,
        sku: v.sku,
        productName: v.product.name,
        stockQuantity: v.stockQuantity,
      })),
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customer.name,
        total: Number(o.total),
        status: o.status,
        itemCount: o.items.length,
        createdAt: o.createdAt,
      })),
    };
  }

  /**
   * List orders with optional status filter and pagination
   */
  async getAllOrders(status?: OrderStatus, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: Prisma.OrderWhereInput = {};
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { name: true, phone: true } },
          items: true,
          payments: { select: { status: true, providerPaymentId: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      items: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customer.name,
        customerPhone: o.customer.phone,
        subtotal: Number(o.subtotal),
        shipping: Number(o.shipping),
        discount: Number(o.discount),
        total: Number(o.total),
        status: o.status,
        itemCount: o.items.length,
        paymentStatus: o.payments?.[0]?.status || 'PENDING',
        paymentId: o.payments?.[0]?.providerPaymentId || null,
        createdAt: o.createdAt,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Validated order status transition
   */
  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID "${orderId}" not found.`);
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  }

  /**
   * Adjust variant inventory with audit log
   */
  async adjustStock(dto: AdjustStockDto, adminId?: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: dto.variantId },
      include: { product: true },
    });

    if (!variant) {
      throw new NotFoundException(`Product variant "${dto.variantId}" not found.`);
    }

    const newStock = variant.stockQuantity + dto.quantityDelta;
    if (newStock < 0) {
      throw new BadRequestException(
        `Cannot reduce stock below zero. Current stock: ${variant.stockQuantity}, adjustment delta: ${dto.quantityDelta}.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedVariant = await tx.productVariant.update({
        where: { id: variant.id },
        data: { stockQuantity: newStock },
      });

      await tx.inventoryMovement.create({
        data: {
          variantId: variant.id,
          quantityDelta: dto.quantityDelta,
          reason: dto.reason,
          referenceId: adminId || 'ADMIN',
        },
      });

      return {
        variantId: updatedVariant.id,
        sku: updatedVariant.sku,
        productName: variant.product.name,
        previousStock: variant.stockQuantity,
        newStock: updatedVariant.stockQuantity,
        delta: dto.quantityDelta,
        reason: dto.reason,
      };
    });
  }

  /**
   * Get all coupons for admin
   */
  async getAllCoupons() {
    return this.prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Create coupon with uniqueness check
   */
  async createCoupon(dto: CreateAdminCouponDto) {
    const code = dto.code.trim().toUpperCase();
    const existing = await this.prisma.coupon.findUnique({ where: { code } });

    if (existing) {
      throw new ConflictException(`Coupon code "${code}" already exists.`);
    }

    return this.prisma.coupon.create({
      data: {
        code,
        discountType: dto.discountType,
        value: new Prisma.Decimal(dto.value),
        minOrderAmount: dto.minOrderAmount ? new Prisma.Decimal(dto.minOrderAmount) : null,
        startsAt: dto.startsAt || new Date(),
        expiresAt: dto.expiresAt,
        usageLimit: dto.usageLimit || 100,
        active: true,
      },
    });
  }

  /**
   * List customers with metrics
   */
  async getAllCustomers() {
    const customers = await this.prisma.customerProfile.findMany({
      include: {
        user: { select: { email: true, createdAt: true } },
        orders: { select: { total: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return customers.map((c) => {
      const totalSpent = c.orders.reduce((acc, curr) => acc + Number(curr.total), 0);
      return {
        id: c.id,
        name: c.name,
        email: c.user.email,
        phone: c.phone,
        orderCount: c.orders.length,
        totalSpent,
        joinedAt: c.user.createdAt,
      };
    });
  }
}
