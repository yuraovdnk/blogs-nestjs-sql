import { Strategy } from 'passport-local';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { mapErrors } from '../../../exceptions/mapErrors';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService, private usersRepository: UsersRepository) {
    super({
      usernameField: 'loginOrEmail',
      passwordField: 'password',
    });
  }

  async validate(login: string, password: string): Promise<any> {
    const candidate = await this.usersRepository.findByLoginOrEmail(login);

    if (!candidate || !candidate.isConfirmedEmail) {
      throw new UnauthorizedException();
    }

    const isValidPassword = await bcrypt.compare(password, candidate.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedException(mapErrors('login or password is not correct', 'auth'));
    }
    return candidate;
  }
}
