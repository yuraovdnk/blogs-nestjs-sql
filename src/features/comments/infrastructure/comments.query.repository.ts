import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { QueryCommentModel } from '../typing/comments.type';
import { QueryParamsDto } from '../../../pipes/query-params.pipe';

import { PageDto } from '../../../utils/PageDto';
import { CommentViewModel } from '../dto/comment-view.model';

@Injectable()
export class CommentsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getCommentsByPostId(
    postId: string,
    queryParams: QueryParamsDto,
    userId: string = null,
  ): Promise<PageDto<CommentViewModel>> {
    const skip = queryParams.pageSize * (queryParams.pageNumber - 1);

    const resQuery: QueryCommentModel[] = await this.dataSource.query(
      `SELECT c.*,
              (Select  count(*)::int From "Likes" l
                Where c."id" = l."parentId" And l."likeStatus" = 'Like') as "likesCount",

              (Select  count(*)::int From "Likes" l
                Where c."id" = l."parentId" And l."likeStatus" = 'Dislike') as "dislikesCount",

              (Select "likeStatus"  From "Likes" l
                 Where c."id" = l."parentId" And l."userId" = $2) as "myStatus",

              (Select "login" From "Users"
                Where "id" = c."userId") as "userLogin"

             FROM "Comments" c
             WHERE c."postId" = $1
             Order by "${queryParams.sortBy}" ${queryParams.sortDirection}
             Limit ${queryParams.pageSize} Offset ${skip}`,
      [postId, userId],
    );

    const mappedComments = resQuery.map((i) => new CommentViewModel(i));
    return new PageDto(mappedComments, queryParams);
  }
  async getCommentById(commentId: string, userId: string = null) {
    const resQuery: QueryCommentModel[] = await this.dataSource.query(
      `SELECT c.*,
             (Select  count(*)::int From "Likes" l
                Where c."id" = l."parentId" And l."likeStatus" = 'Like') as "likesCount",

              (Select  count(*)::int From "Likes" l
                Where c."id" = l."parentId" And l."likeStatus" = 'Dislike') as "dislikesCount",

              (Select "likeStatus"  From "Likes" l
                 Where c."id" = l."parentId" And l."userId" = $2) as "myStatus",

              (Select "login" From "Users"
                Where "id" = c."userId") as "userLogin"
                
             FROM "Comments" c              
             WHERE c."id" = $1`,
      [commentId, userId],
    );
    return new CommentViewModel(resQuery[0]);
  }
}
