import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SellerNotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * List notifications for seller
   */
  async getNotifications(
    sellerId: string,
    options: { page?: number; limit?: number } = {},
  ) {
    if (!sellerId) {
      return {
        items: [],
        unreadCount: 0,
        meta: {
          page: 1,
          limit: options.limit || 20,
          total: 0,
          totalPages: 1,
        },
      };
    }

    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const [items, total, unreadCount] = await Promise.all([
      this.prisma.sellerNotification.findMany({
        where: { sellerId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.sellerNotification.count({ where: { sellerId } }),
      this.prisma.sellerNotification.count({ where: { sellerId, read: false } }),
    ]);

    return {
      items,
      unreadCount,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Mark a single notification as read with ownership check
   */
  async markAsRead(sellerId: string, notificationId: string) {
    const notification = await this.prisma.sellerNotification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID "${notificationId}" not found.`);
    }

    if (notification.sellerId !== sellerId) {
      throw new ForbiddenException('Access denied: You do not own this notification.');
    }

    return this.prisma.sellerNotification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  /**
   * Mark all unread notifications as read
   */
  async markAllAsRead(sellerId: string) {
    return this.prisma.sellerNotification.updateMany({
      where: { sellerId, read: false },
      data: { read: true },
    });
  }
}
