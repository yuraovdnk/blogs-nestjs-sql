import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { AuthSessionRepository } from '../infrastructure/auth-session.repository';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtCookieGuard extends AuthGuard('jwt-cookie') {}

@Injectable()
export class JwtCookieStrategy extends PassportStrategy(Strategy, 'jwt-cookie') {
  constructor(
    protected usersRepository: UsersRepository,
    protected authSessionRepository: AuthSessionRepository,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: (req) => {
        return req.cookies.refreshToken;
      },
      ignoreExpiration: false,
      secretOrKey: configService.get('secrets.secretRefreshToken'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any): Promise<any> {
    const user = await this.usersRepository.findById(payload.userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    const session = await this.authSessionRepository.getSessionByDeviceIdAndUserId(
      payload.userId,
      payload.deviceId,
    );
    if (!session) {
      throw new UnauthorizedException();
    }
    if (session.lastActiveDate.getTime() !== new Date(payload.iat * 1000).getTime()) {
      throw new UnauthorizedException();
    }
    return { ...user, ...payload };
  }
}
