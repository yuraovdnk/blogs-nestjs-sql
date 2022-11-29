import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { UserInputType, UserModel } from '../typing/user.types';

@Injectable()
export class UsersRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createUser(newUser: UserInputType): Promise<string> {
    const query = await this.dataSource.query(
      `INSERT INTO "Users" ("login","email","passwordHash","confirmationCode","expirationConfirmCode","isConfirmedEmail")
        Values($1,$2,$3,$4,$5,$6)
        RETURNING "id"`,
      [
        newUser.login,
        newUser.email,
        newUser.passwordHash,
        newUser.confirmationCode,
        newUser.expirationConfirmCode,
        newUser.isConfirmedEmail,
      ],
    );
    return query[0].id;
  }
  async findByLoginOrEmail(loginOrEmail: string) {
    const query = await this.dataSource.query(
      `SELECT * FROM "Users" 
             WHERE ("email" = $1 OR "login" = $1)`,
      [loginOrEmail],
    );
    return query[0];
  }

  async removeUser(userId: string) {
    const query = await this.dataSource.query(
      `DELETE FROM "Users"
             WHERE ("id" = $1)`,
      [userId],
    );
    return query[1] === 1;
  }
  async findById(userId: string) {
    const query = await this.dataSource.query(
      `SELECT * FROM "Users"
             WHERE ("id" = $1)`,
      [userId],
    );
    return query[0];
  }
  async findByLogin(login: string) {
    const query = await this.dataSource.query(
      `SELECT * FROM "Users"
             WHERE ("login" = $1)`,
      [login],
    );
    return query[0];
  }
  async findByConfirmCode(confirmCode: string): Promise<UserModel> {
    const resQuery = await this.dataSource.query(
      `SELECT * FROM "Users"
             WHERE ("confirmationCode" = $1)`,
      [confirmCode],
    );
    return resQuery[0];
  }
  async updateConfirm(userId: string): Promise<boolean> {
    const resQuery = await this.dataSource.query(
      `UPDATE "Users"
             SET "isConfirmedEmail" = true,
             "confirmationCode" = null,
             "expirationConfirmCode" = null
             WHERE ("id" = $1)`,
      [userId],
    );
    return resQuery[1] === 1;
  }
  async findByEmail(email: string): Promise<UserModel> {
    const query = await this.dataSource.query(
      `SELECT * FROM "Users"
             WHERE ("email" = $1)`,
      [email],
    );
    return query[0];
  }

  async updateConfirmCode(
    userId: string,
    confirmCode: string,
    expirationConfirmCode: Date,
  ): Promise<UserModel> {
    const resQuery: UserModel = await this.dataSource.query(
      `UPDATE "Users"
             SET "confirmationCode" = $2,
             "expirationConfirmCode" = $3
             WHERE ("id" = $1)
             Returning *`,
      [userId, confirmCode, expirationConfirmCode],
    );
    return resQuery[0][0];
  }
  async updateRecoveryPasswordCode(
    userId: string,
    recoveryCode: string,
    expirationRecoveryCode: Date,
  ): Promise<UserModel> {
    const resQuery: UserModel[] = await this.dataSource.query(
      `UPDATE "Users"
             SET "passwordRecoveryCode" = $1 , "expirationPasswordRecoveryCode" = $3
             WHERE ("id" = $2)
             Returning *`,
      [recoveryCode, userId, expirationRecoveryCode],
    );
    return resQuery[0][0];
  }
  async findByRecoveryCode(recoveryCode: string): Promise<UserModel> {
    const resQuery = await this.dataSource.query(
      `SELECT * FROM "Users"
             WHERE ("passwordRecoveryCode" = $1)`,
      [recoveryCode],
    );
    return resQuery[0];
  }

  async setNewPassword(userId: string, newPassword: string): Promise<boolean> {
    const resQuery = await this.dataSource.query(
      `UPDATE "Users"
             SET "passwordHash" = $2,
             "passwordRecoveryCode" = null,
             "expirationPasswordRecoveryCode" = null
             WHERE ("id" = $1)
             Returning *`,
      [userId, newPassword],
    );
    console.log(resQuery, '11');
    return resQuery[1] === 1;
  }
}
