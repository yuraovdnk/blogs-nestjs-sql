import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { CommentInputType, CommentModel } from '../typing/comments.type';
import { UpdateCommentDto } from '../dto/update-comment.dto';

@Injectable()
export class CommentsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async createComment(newComment: CommentInputType) {
    const resQuery: CommentModel = await this.dataSource.query(
      `Insert into "Comments" ("content","postId","userId")
             Values ($1,$2,$3)
             Returning "id"`,
      [newComment.content, newComment.postId, newComment.userId],
    );
    return resQuery[0].id;
  }
  async findById(commentId: string): Promise<CommentModel> {
    const resQuery: CommentModel = await this.dataSource.query(
      `Select * from "Comments"
             Where "id" = $1`,
      [commentId],
    );
    return resQuery[0];
  }
  async updateComment(updateCommentDto: UpdateCommentDto, commentId: string) {
    const resQuery = await this.dataSource.query(
      `Update "Comments"
        Set "content" = $1
        Where "id" = $2`,
      [updateCommentDto.content, commentId],
    );
    return resQuery[1] === 1;
  }
  async deleteComment(commentId: string) {
    const resQuery = await this.dataSource.query(
      `Delete from "Comments"
             Where "id" = $1`,
      [commentId],
    );
    return resQuery[1] === 1;
  }
}
