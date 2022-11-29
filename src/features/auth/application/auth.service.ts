import { v4 as uuid } from 'uuid';
import * as bcrypt from 'bcrypt';
import { add } from 'date-fns';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { mapErrors } from '../../../exceptions/mapErrors';
import { EmailManager } from '../../../adapters/notification/email.manager';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthSessionRepository } from '../infrastructure/auth-session.repository';
import { EmailDto } from '../dto/email.dto';
import { NewPasswordDto } from '../dto/new-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private emailManager: EmailManager,
    private jwtService: JwtService,
    private configService: ConfigService,
    private authSessionRepository: AuthSessionRepository,
  ) {}
  async signUp(registrationDto: CreateUserDto) {
    const [userByEmail, userByLogin] = await Promise.all([
      this.usersRepository.findByEmail(registrationDto.email),
      this.usersRepository.findByLogin(registrationDto.login),
    ]);

    if (userByEmail || userByLogin) {
      throw new BadRequestException(mapErrors('user is exist', 'login or email'));
    }

    const passwordHash = await bcrypt.hash(registrationDto.password, 10);
    const newUser = {
      login: registrationDto.login,
      email: registrationDto.email,
      passwordHash,
      createdAt: new Date(),
      confirmationCode: uuid(),
      expirationConfirmCode: add(new Date(), {
        hours: 1,
      }),
      isConfirmedEmail: false,
    };

    const createdUserId = await this.usersRepository.createUser(newUser);
    const user = await this.usersRepository.findById(createdUserId);

    try {
      await this.emailManager.sendConfirmMail(user);
    } catch (e) {
      await this.usersRepository.removeUser(createdUserId);
      throw new InternalServerErrorException();
    }
    return true;
  }

  async generateTokens(
    userId: string,
    deviceInfo: any,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const session = await this.authSessionRepository.getSessionByDeviceIdAndUserId(
      userId,
      deviceInfo.deviceId,
    );

    if (!session) {
      deviceInfo.deviceId = uuid();
    }

    const payload = { userId, deviceId: deviceInfo.deviceId };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('secrets.secretAccessToken'),
      expiresIn: '1h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('secrets.secretRefreshToken'),
      expiresIn: '5h',
    });

    const resultSave = await this.authSessionRepository.saveSession(
      userId,
      refreshToken,
      deviceInfo,
    );

    if (!resultSave) throw new InternalServerErrorException();

    return {
      accessToken,
      refreshToken,
    };
  }

  async confirmEmail(confirmCode: string): Promise<boolean> {
    const user = await this.usersRepository.findByConfirmCode(confirmCode);
    if (
      !user ||
      user.isConfirmedEmail ||
      user.confirmationCode !== confirmCode ||
      user.expirationConfirmCode < new Date()
    ) {
      throw new BadRequestException(mapErrors('something wrong with confirmCode', 'confirm code'));
    }
    return await this.usersRepository.updateConfirm(user.id);
  }

  async getInfoAboutUser(userId: string) {
    const user = await this.usersRepository.findById(userId);
    return {
      email: user.email,
      login: user.login,
      userId: user.id,
    };
  }

  async resendConfirmCode(emailDto: EmailDto): Promise<boolean> {
    const user = await this.usersRepository.findByEmail(emailDto.email);

    if (user.isConfirmedEmail) {
      throw new BadRequestException(mapErrors('invalid email', 'email'));
    }

    const newConfirmCode = uuid();
    const expirationConfirmCode = add(new Date(), {
      hours: 1,
    });
    const updatedUser = await this.usersRepository.updateConfirmCode(
      user.id,
      newConfirmCode,
      expirationConfirmCode,
    );
    try {
      await this.emailManager.sendConfirmMail(updatedUser);
    } catch (e) {
      throw new InternalServerErrorException();
    }
    return true;
  }

  async recoveryPassword(emailDto: EmailDto): Promise<boolean> {
    const user = await this.usersRepository.findByEmail(emailDto.email);

    if (user) {
      const recoveryCode = uuid();
      const expirationCode = add(new Date(), {
        minutes: 1,
      });
      const updatedUser = await this.usersRepository.updateRecoveryPasswordCode(
        user.id,
        recoveryCode,
        expirationCode,
      );

      try {
        await this.emailManager.sendRecoveryCode(updatedUser);
      } catch (e) {
        throw new InternalServerErrorException(e);
      }
    }
    return true;
  }

  async setNewPassword(newPasswordDto: NewPasswordDto): Promise<boolean> {
    const user = await this.usersRepository.findByRecoveryCode(newPasswordDto.recoveryCode);
    if (!user) {
      throw new BadRequestException(mapErrors('recoveryCode is incorrect', 'recoveryCode'));
    }

    if (user.expirationPasswordRecoveryCode < new Date()) {
      throw new BadRequestException(mapErrors('recoveryCode is incorrect', 'recoveryCode'));
    }
    const passwordHash = await bcrypt.hash(newPasswordDto.newPassword, 10);
    return this.usersRepository.setNewPassword(user.id, passwordHash);
  }

  async signOut(userId: string, deviceId: string): Promise<boolean> {
    return this.authSessionRepository.deleteSession(userId, deviceId);
  }
}
