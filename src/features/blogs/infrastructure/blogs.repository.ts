import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { BlogModel } from '../typing/blogs.types';
import { UpdateBlogDto } from '../dto/update-blog.dto';
@Injectable()
export class BlogsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createBlog(newBlog: CreateBlogDto): Promise<string> {
    const resQuery: BlogModel = await this.dataSource.query(
      `Insert into "Blogs" ("name","description","websiteUrl")
               Values($1,$2,$3)
               Returning "id"`,
      [newBlog.name, newBlog.description, newBlog.websiteUrl],
    );
    return resQuery[0].id;
  }

  async deleteBlog(blogId: string) {
    const resQuery = await this.dataSource.query(
      `Delete from "Blogs"
             Where "id" = $1`,
      [blogId],
    );
    return resQuery[1] === 1;
  }

  async updateBlog(blogId: string, updateBlogDto: UpdateBlogDto): Promise<boolean> {
    const resQuery = await this.dataSource.query(
      `Update "Blogs"
            Set "name" = $2, 
                "websiteUrl" = $3,
                "description" = $4
            Where "id" = $1`,
      [blogId, updateBlogDto.name, updateBlogDto.websiteUrl, updateBlogDto.description],
    );
    return resQuery[1] === 1;
  }

  async getBlogById(blogId: string): Promise<BlogModel> {
    const resQuery: BlogModel = await this.dataSource.query(
      `Select * from "Blogs"
             Where "id" = $1`,
      [blogId],
    );
    return resQuery[0];
  }
}
