import { v4 as uuid } from 'uuid';
import * as bcrypt from 'bcrypt';
import { add } from 'date-fns';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './infrastructure/users.repository';
import { mapErrors } from '../../exceptions/mapErrors';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}
  async createUser(createUserDto: CreateUserDto): Promise<string> {
    const [userByEmail, userByLogin] = await Promise.all([
      this.usersRepository.findByEmail(createUserDto.email),
      this.usersRepository.findByLogin(createUserDto.login),
    ]);

    if (userByEmail || userByLogin) {
      throw new BadRequestException(mapErrors('user is exist', 'login or email'));
    }

    const passwordHash = await this.generateHash(createUserDto.password);
    const newUser = {
      login: createUserDto.login,
      email: createUserDto.email,
      passwordHash,
      createdAt: new Date(),
      confirmationCode: uuid(),
      expirationConfirmCode: add(new Date(), {
        hours: 1,
      }),
      isConfirmedEmail: true,
    };
    return this.usersRepository.createUser(newUser);
  }

  async removeUser(userId: string) {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundException();
    return this.usersRepository.removeUser(userId);
  }
  private async generateHash(password: string) {
    return await bcrypt.hash(password, 10);
  }
}
