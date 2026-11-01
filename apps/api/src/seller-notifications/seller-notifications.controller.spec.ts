import { Test, TestingModule } from '@nestjs/testing';
import { SellerNotificationsController } from './seller-notifications.controller';
import { SellerNotificationsService } from './seller-notifications.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

describe('SellerNotificationsController', () => {
  let controller: SellerNotificationsController;
  let service: SellerNotificationsService;

  const mockNotificationsService = {
    getNotifications: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SellerNotificationsController],
      providers: [
        {
          provide: SellerNotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SellerNotificationsController>(
      SellerNotificationsController,
    );
    service = module.get<SellerNotificationsService>(SellerNotificationsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get notifications list', async () => {
    mockNotificationsService.getNotifications.mockResolvedValueOnce({
      items: [{ id: 'notif-1' }],
      unreadCount: 1,
      meta: { total: 1 },
    });

    const res = await controller.getNotifications('seller-1');
    expect(res.success).toBe(true);
    expect(res.data.items).toEqual([{ id: 'notif-1' }]);
    expect(res.data.unreadCount).toBe(1);
  });

  it('should mark single notification as read', async () => {
    mockNotificationsService.markAsRead.mockResolvedValueOnce({
      id: 'notif-1',
      read: true,
    });

    const res = await controller.markAsRead('seller-1', 'notif-1');
    expect(res.success).toBe(true);
    expect(res.data.read).toBe(true);
  });

  it('should mark all notifications as read', async () => {
    mockNotificationsService.markAllAsRead.mockResolvedValueOnce({ count: 3 });

    const res = await controller.markAllAsRead('seller-1');
    expect(res.success).toBe(true);
    expect(res.data.count).toBe(3);
  });
});
