import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { UserModel } from '../../features/users/typing/user.types';
@Injectable()
export class EmailManager {
  async sendConfirmMail(user: UserModel) {
    const transporter = await nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'yuraovdnk@gmail.com',
        pass: 'puoowkujaurxnden',
      },
    });
    const info = await transporter.sendMail({
      from: '"Yura" <yuraovdnk@gmail.com>',
      to: user.email,
      subject: 'Confrim Email',
      text: `https://somesite.com/confirm-email?code=${user.confirmationCode}`,
    });
    return info;
  }

  async sendRecoveryCode(user: UserModel) {
    const transporter = await nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'yuraovdnk@gmail.com',
        pass: 'puoowkujaurxnden',
      },
    });
    const info = await transporter.sendMail({
      from: '"Yura" <yuraovdnk@gmail.com>',
      to: user.email,
      subject: 'Passwrod recovery code',
      text: `https://somesite.com/password-recovery?recoveryCode=${user.passwordRecoveryCode}`,
    });
    return info;
  }
}
