import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateFulfillmentStatusDto } from './dto/update-fulfillment-status.dto';
import { FulfillmentStatus, CommissionStatus } from '@prisma/client';

@Injectable()
export class SellerOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * List all customer orders containing items from this seller.
   * Strips any items belonging to other sellers before returning.
   */
  async getOrders(
    sellerId: string,
    options: {
      status?: FulfillmentStatus;
      page?: number;
      limit?: number;
    } = {},
  ) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const itemFilter: any = { sellerId };
    if (options.status) {
      itemFilter.fulfillmentStatus = options.status;
    }

    const where: any = {
      items: {
        some: itemFilter,
      },
    };

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: {
              name: true,
              phone: true,
            },
          },
          items: {
            where: { sellerId },
            include: {
              commission: true,
            },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    // Format orders for seller view with seller-specific subtotal
    const sanitizedOrders = orders.map((order) => {
      const sellerSubtotal = order.items.reduce(
        (sum, item) => sum + Number(item.priceSnapshot) * item.quantity,
        0,
      );

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customer.name,
        customerPhone: order.customer.phone,
        addressSnapshot: order.addressSnapshot,
        overallStatus: order.status,
        createdAt: order.createdAt,
        sellerSubtotal,
        sellerItemsCount: order.items.length,
        items: order.items,
      };
    });

    return {
      items: sanitizedOrders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get order details ensuring it contains seller items, and sanitize other sellers' items.
   */
  async getOrderById(sellerId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          select: {
            name: true,
            phone: true,
          },
        },
        items: {
          where: { sellerId },
          include: {
            commission: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID "${orderId}" not found.`);
    }

    if (!order.items || order.items.length === 0) {
      throw new ForbiddenException(
        'Access denied: You do not have any items in this order.',
      );
    }

    const sellerSubtotal = order.items.reduce(
      (sum, item) => sum + Number(item.priceSnapshot) * item.quantity,
      0,
    );

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customer.name,
      customerPhone: order.customer.phone,
      addressSnapshot: order.addressSnapshot,
      overallStatus: order.status,
      createdAt: order.createdAt,
      sellerSubtotal,
      sellerItemsCount: order.items.length,
      items: order.items,
    };
  }

  /**
   * Update item fulfillment status with ownership validation
   */
  async updateItemFulfillment(
    sellerId: string,
    orderItemId: string,
    dto: UpdateFulfillmentStatusDto,
  ) {
    const item = await this.prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: { order: true, commission: true },
    });

    if (!item) {
      throw new NotFoundException(`Order item with ID "${orderItemId}" not found.`);
    }

    if (item.sellerId !== sellerId) {
      throw new ForbiddenException(
        'Access denied: You are not authorized to fulfill this order item.',
      );
    }

    const updateData: any = {
      fulfillmentStatus: dto.status,
    };

    if (dto.trackingNumber !== undefined) {
      updateData.trackingNumber = dto.trackingNumber;
    }
    if (dto.shippingCarrier !== undefined) {
      updateData.shippingCarrier = dto.shippingCarrier;
    }

    if (dto.status === FulfillmentStatus.SHIPPED && !item.shippedAt) {
      updateData.shippedAt = new Date();
    }
    if (dto.status === FulfillmentStatus.DELIVERED && !item.deliveredAt) {
      updateData.deliveredAt = new Date();
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedItem = await tx.orderItem.update({
        where: { id: orderItemId },
        data: updateData,
      });

      // If item is delivered and commission is pending, make commission available for payout
      if (
        dto.status === FulfillmentStatus.DELIVERED &&
        item.commission &&
        item.commission.status === CommissionStatus.PENDING
      ) {
        await tx.commissionRecord.update({
          where: { id: item.commission.id },
          data: { status: CommissionStatus.AVAILABLE },
        });
      }

      // Create notification for seller
      await tx.sellerNotification.create({
        data: {
          sellerId,
          title: `Fulfillment Status: ${dto.status}`,
          message: `Order #${item.order.orderNumber} - item "${item.nameSnapshot}" updated to ${dto.status}.`,
          type: 'ORDER',
        },
      });

      return updatedItem;
    });
  }
}
