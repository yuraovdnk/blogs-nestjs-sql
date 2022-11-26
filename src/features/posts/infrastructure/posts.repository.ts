import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { PostInputDbType, PostModel } from '../typing/posts.type';
import { UpdatePostDto } from '../dto/update-post.dto';

@Injectable()
export class PostsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createPost(post: PostInputDbType): Promise<string> {
    const resQuery = await this.dataSource.query(
      `Insert into "Posts" ("title","shortDescription","content","blogId")
             Values($1,$2,$3,$4)
             Returning "id"`,
      [post.title, post.shortDescription, post.content, post.blogId],
    );
    return resQuery[0].id;
  }
  async getPostById(postId: string) {
    const resQuery: PostModel = await this.dataSource.query(
      `Select * from "Posts"
             Where "id" = $1`,
      [postId],
    );
    return resQuery[0];
  }
  async updatePost(postId: string, updatePostDto: UpdatePostDto) {
    const resQuery = await this.dataSource.query(
      `Update "Posts"
            Set "title"= $1,
                "shortDescription" = $2,
                "content" = $3,
                "blogId" = $4
            Where "id" = $5`,
      [
        updatePostDto.title,
        updatePostDto.shortDescription,
        updatePostDto.content,
        updatePostDto.blogId,
        postId,
      ],
    );
    return resQuery[1] === 1;
  }
  async deletePost(postId: string) {
    const resQuery = await this.dataSource.query(
      `Delete from "Posts"
             Where "id" = $1`,
      [postId],
    );
    return resQuery[1] === 1;
  }
}
