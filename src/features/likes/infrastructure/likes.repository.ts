import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class LikesRepository {
  constructor(private dataSource: DataSource) {}

  async removeLike(parentId: string, userId: string, parentType: string) {
    const resQuery = await this.dataSource.query(
      `DELETE FROM "Likes"
             Where "userId" = $1 And "parentId" = $2 And "parentType"= $3`,
      [userId, parentId, parentType],
    );
    return resQuery[1] === 1;
  }

  async setLike(parentId: string, userId: string, parentType: string, likeStatus: string) {
    const resQuery = await this.dataSource.query(
      `INSERT INTO "Likes" ("parentId","parentType","likeStatus","userId")
             Values ($1,$2,$3,$4)
             ON CONFLICT ON CONSTRAINT unique_parentId_userId
             DO UPDATE SET "likeStatus" = $3`,
      [parentId, parentType, likeStatus, userId],
    );
    return true;
  }
}
