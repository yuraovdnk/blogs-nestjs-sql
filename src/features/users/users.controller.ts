import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersQueryRepository } from './infrastructure/users.query.repository';
import { QueryParamsDto } from '../../pipes/query-params.pipe';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersRepository: UsersRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @Post()
  @HttpCode(201)
  async create(@Body() createUserDto: CreateUserDto) {
    const res = await this.usersService.createUser(createUserDto);
    return this.usersQueryRepository.findUserById(res);
  }

  @Get()
  findAllUsers(@Query() queryParams: QueryParamsDto) {
    return this.usersQueryRepository.findAllUsers(queryParams);
  }

  @Delete(':userId')
  removeUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.usersService.removeUser(userId);
  }
}
