import { Body, Controller, Get, HttpCode, Post, Res, UseGuards } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { Response } from 'express';
import { AuthService } from './application/auth.service';
import { DeviceMeta } from '../../decorators/device-meta.decotator';
import { LocalAuthGuard } from './strategies/local.strategy';
import { JwtCookieGuard } from './strategies/jwt-cookie.strategy';
import { JwtGuard } from './strategies/jwt.strategy';
import { EmailDto } from './dto/email.dto';
import { NewPasswordDto } from './dto/new-password.dto';
import { Throttle } from '@nestjs/throttler';

@Throttle(5, 10)
@Controller('auth')
export class AuthController {
  constructor(protected authService: AuthService) {}

  @Post('registration')
  @HttpCode(204)
  async registration(@Body() registrationDto: CreateUserDto): Promise<boolean> {
    return this.authService.signUp(registrationDto);
  }

  @Post('registration-confirmation')
  @HttpCode(204)
  async confirmRegistration(@Body('code') confirmCode: string): Promise<boolean> {
    return this.authService.confirmEmail(confirmCode);
  }

  @Post('registration-email-resending')
  @HttpCode(204)
  async resendConfirmCode(@Body() emailDto: EmailDto): Promise<boolean> {
    return this.authService.resendConfirmCode(emailDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  async login(@Res() res: Response, @CurrentUser() userId: string, @DeviceMeta() deviceInfo: any) {
    const tokens = await this.authService.generateTokens(userId, deviceInfo);
    res.cookie('refreshToken', tokens.refreshToken, {
      //httpOnly: true,
      //secure: true,
    });
    res.status(200).send({ accessToken: tokens.accessToken });
  }

  @UseGuards(JwtCookieGuard)
  @Post('refresh-token')
  @HttpCode(200)
  async refreshToken(
    @Res() res: Response,
    @CurrentUser() userId: string,
    @DeviceMeta() deviceInfo: any,
  ) {
    const tokens = await this.authService.generateTokens(userId, deviceInfo);
    res.cookie('refreshToken', tokens.refreshToken, {
      //httpOnly: true,
      //secure: true,
    });
    res.status(200).send({ accessToken: tokens.accessToken });
  }

  @UseGuards(JwtCookieGuard)
  @Post('logout')
  @HttpCode(204)
  async logout(@Res() res: Response, @CurrentUser() userId: string, @DeviceMeta() deviceInfo: any) {
    const result = await this.authService.signOut(userId, deviceInfo.deviceId);
    if (result) {
      res.clearCookie('refreshToken');
      return res.sendStatus(204);
    }
    res.sendStatus(401);
  }

  @Post('password-recovery')
  @HttpCode(204)
  async recoveryPassword(@Body() email: EmailDto) {
    return this.authService.recoveryPassword(email);
  }

  @Post('new-password')
  @HttpCode(204)
  async setNewPassword(@Body() newPasswordDto: NewPasswordDto) {
    return this.authService.setNewPassword(newPasswordDto);
  }

  @Get('me')
  @UseGuards(JwtGuard)
  async infoAboutMe(@CurrentUser() userId: string) {
    return await this.authService.getInfoAboutUser(userId);
  }
}
