import { Controller, Delete, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { AuthSessionRepository } from '../auth/infrastructure/auth-session.repository';
import { DeviceMeta } from '../../decorators/device-meta.decotator';
import { JwtCookieGuard } from '../auth/strategies/jwt-cookie.strategy';
import { CommandBus } from '@nestjs/cqrs';
import { TerminateSessionsCommand } from './use-cases/terminate-sessions.use-case';
import { TerminateSessionByDeviceIdCommand } from './use-cases/terminate-session-by-deviceId.use-case';

@Controller('security')
export class DevicesController {
  constructor(
    private authSessionsRepository: AuthSessionRepository,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(JwtCookieGuard)
  @Get('devices')
  async getAllDevices(@CurrentUser() userId: string) {
    return this.authSessionsRepository.getSessionsByUserId(userId);
  }

  @UseGuards(JwtCookieGuard)
  @Delete('devices')
  async terminateSessions(@CurrentUser() userId: string, @DeviceMeta() deviceInfo: any) {
    return this.commandBus.execute(new TerminateSessionsCommand(deviceInfo.deviceId, userId));
  }

  @UseGuards(JwtCookieGuard)
  @Delete('devices/:deviceId')
  async terminateSessionByDeviceId(
    @CurrentUser() userId: string,
    @Param('deviceId', ParseUUIDPipe) deviceId: string,
  ) {
    return this.commandBus.execute(new TerminateSessionByDeviceIdCommand(deviceId, userId));
  }
}
