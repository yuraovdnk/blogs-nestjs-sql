import { DataSource } from 'typeorm';
import { Controller, Delete, HttpCode } from '@nestjs/common';

@Controller('testing/all-data')
export class TestingController {
  constructor(private dataSource: DataSource) {}

  @Delete()
  @HttpCode(204)
  async deleteAllData() {
    await this.dataSource.query(`
    DELETE FROM "Blogs";
    DELETE FROM "AuthSessions";
    DELETE FROM "Comments";
    DELETE FROM "Likes";
    DELETE FROM "Posts";
    DELETE FROM "Users";
    `);
  }
}
