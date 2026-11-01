import { Controller, Get, Patch, Post, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SellerNotificationsService } from './seller-notifications.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/guards/roles.decorator';
import { CurrentUser } from '../common/guards/current-user.decorator';
import { apiSuccess } from '../common/dto/api-response.dto';
import { Role } from '@prisma/client';

@ApiTags('Seller Console: Notifications')
@Controller('seller/notifications')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.SELLER, Role.ADMIN)
@ApiBearerAuth()
export class SellerNotificationsController {
  constructor(private readonly notificationsService: SellerNotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications for seller' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({ status: 200, description: 'Notifications list' })
  async getNotifications(
    @CurrentUser('sellerId') sellerId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    const data = await this.notificationsService.getNotifications(sellerId, {
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 20,
    });
    return apiSuccess(
      { items: data.items, unreadCount: data.unreadCount },
      data.meta,
      'Notifications retrieved',
    );
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark single notification as read' })
  @ApiParam({ name: 'id', description: 'Notification UUID' })
  @ApiResponse({ status: 200, description: 'Marked as read' })
  async markAsRead(
    @CurrentUser('sellerId') sellerId: string,
    @Param('id') id: string,
  ) {
    const notification = await this.notificationsService.markAsRead(sellerId, id);
    return apiSuccess(notification, null, 'Notification marked as read');
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Mark all unread notifications as read' })
  @ApiResponse({ status: 200, description: 'All marked as read' })
  async markAllAsRead(@CurrentUser('sellerId') sellerId: string) {
    const result = await this.notificationsService.markAllAsRead(sellerId);
    return apiSuccess(result, null, 'All notifications marked as read');
  }
}
