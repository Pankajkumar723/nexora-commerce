import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MailService } from './mail.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, MailService, AuthGuard, RolesGuard],
  exports: [AuthService, MailService, AuthGuard, RolesGuard],
})
export class AuthModule {}
