import { Test, TestingModule } from '@nestjs/testing';
import { SellerNotificationsService } from './seller-notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('SellerNotificationsService', () => {
  let service: SellerNotificationsService;
  let prisma: PrismaService;

  const mockPrisma = {
    sellerNotification: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SellerNotificationsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<SellerNotificationsService>(SellerNotificationsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getNotifications', () => {
    it('should list notifications and return unreadCount', async () => {
      mockPrisma.sellerNotification.findMany.mockResolvedValueOnce([
        { id: 'notif-1', title: 'New Order', read: false },
      ]);
      mockPrisma.sellerNotification.count
        .mockResolvedValueOnce(5) // total
        .mockResolvedValueOnce(1); // unreadCount

      const res = await service.getNotifications('seller-1');
      expect(res.items.length).toBe(1);
      expect(res.unreadCount).toBe(1);
      expect(res.meta.total).toBe(5);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      mockPrisma.sellerNotification.findUnique.mockResolvedValueOnce({
        id: 'notif-1',
        sellerId: 'seller-1',
        read: false,
      });
      mockPrisma.sellerNotification.update.mockResolvedValueOnce({
        id: 'notif-1',
        read: true,
      });

      const res = await service.markAsRead('seller-1', 'notif-1');
      expect(res.read).toBe(true);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.sellerNotification.findUnique.mockResolvedValueOnce(null);

      await expect(service.markAsRead('seller-1', 'notif-none')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if notification belongs to another seller', async () => {
      mockPrisma.sellerNotification.findUnique.mockResolvedValueOnce({
        id: 'notif-1',
        sellerId: 'other-seller',
      });

      await expect(service.markAsRead('seller-1', 'notif-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('markAllAsRead', () => {
    it('should batch update unread notifications to read: true', async () => {
      mockPrisma.sellerNotification.updateMany.mockResolvedValueOnce({ count: 4 });

      const res = await service.markAllAsRead('seller-1');
      expect(res.count).toBe(4);
    });
  });
});
