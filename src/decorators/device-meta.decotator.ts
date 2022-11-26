import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const DeviceMeta = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return {
    deviceId: request.user.deviceId || null,
    deviceName: request.headers['user-agent'],
    ip: request.ip,
  };
});
