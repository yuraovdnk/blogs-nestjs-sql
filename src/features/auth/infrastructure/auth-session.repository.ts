import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthSessionModel } from '../../devices/typing/device.types';
@Injectable()
export class AuthSessionRepository {
  constructor(@InjectDataSource() private dataSource: DataSource, private jwtService: JwtService) {}

  async saveSession(userId: string, refreshToken: string, deviceInfo: any) {
    const issuedAtToken: any = this.jwtService.decode(refreshToken);

    const lastActiveDate = new Date(issuedAtToken.iat * 1000);
    try {
      await this.dataSource.query(
        `INSERT INTO "AuthSessions" ("userId","deviceId","title","lastActiveDate","ip")
             VALUES ($1,$2,$3,$4,$5)
             ON CONFLICT ON CONSTRAINT constraint_device_id
             DO UPDATE SET "lastActiveDate" = $4, "ip" = $5, "title" = $3`,
        [userId, deviceInfo.deviceId, deviceInfo.deviceName, lastActiveDate, deviceInfo.ip],
      );
      return true;
    } catch (e) {
      return false;
    }
  }

  async getSessionByDeviceIdAndUserId(userId: string, deviceId: string): Promise<AuthSessionModel> {
    const resQuery = await this.dataSource.query(
      `Select * 
            from "AuthSessions"
            Where "userId"= $1 And "deviceId" = $2 `,
      [userId, deviceId],
    );
    return resQuery[0];
  }

  async deleteSession(userId: string, deviceId: string): Promise<boolean> {
    const resQuery = await this.dataSource.query(
      `Delete 
            from "AuthSessions"
            Where ("userId" = $1 And "deviceId" = $2)`,
      [userId, deviceId],
    );
    return resQuery[1] === 1;
  }

  async getSessionsByUserId(userId: string): Promise<AuthSessionModel> {
    const resQuery = await this.dataSource.query(
      `Select 
               "ip",
               "title",
               "lastActiveDate",
               "deviceId"
             from "AuthSessions"
             Where "userId"= $1`,
      [userId],
    );
    return resQuery;
  }

  async deleteAllSessions(deviceId: string, userId: string): Promise<boolean> {
    const resQuery = await this.dataSource.query(
      `Delete 
            from "AuthSessions"
            Where "userId" = $1 And "deviceId" != $2`,
      [userId, deviceId],
    );
    return resQuery[1] === 1;
  }
  async getSessionById(deviceId: string): Promise<AuthSessionModel> {
    const resQuery = await this.dataSource.query(
      `Select * 
            From "AuthSessions"
            Where "deviceId" = $1`,
      [deviceId],
    );
    return resQuery[0];
  }
}
