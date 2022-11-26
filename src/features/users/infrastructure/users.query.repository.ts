import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { QueryParamsDto } from '../../../pipes/query-params.pipe';
import { UserModel } from '../typing/user.types';
import { PageDto } from '../../../utils/PageDto';

export class UsersQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findAllUsers(queryParams: QueryParamsDto): Promise<PageDto<UserModel>> {
    const resQuery: UserModel[] = await this.dataSource.query(
      `Select "id","login","email","createdAt" 
             from "Users"
             Where "login" like $1 And "email" like $2`,
      [`%${queryParams.searchLoginTerm}%`, `%${queryParams.searchEmailTerm}%`],
    );
    return new PageDto(resQuery, queryParams);
  }
  async findUserById(userId: string): Promise<UserModel> {
    const resQuery: UserModel = await this.dataSource.query(
      `Select "id","login","email","createdAt" 
             from "Users"
             Where "id" = $1`,
      [userId],
    );
    return resQuery[0];
  }
}
