import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogModel } from '../typing/blogs.types';
import { QueryParamsDto } from '../../../pipes/query-params.pipe';
import { PageDto } from '../../../utils/PageDto';
import { BlogViewModel } from '../dto/blog-view.model';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getBlogs(queryParams: QueryParamsDto): Promise<PageDto<BlogViewModel>> {
    const skip = queryParams.pageSize * (queryParams.pageNumber - 1);

    const queryRes: BlogModel[] = await this.dataSource.query(
      `Select * from "Blogs"       
             Where "name" like $1
             Order by "${queryParams.sortBy}" ${queryParams.sortDirection}
             Limit ${queryParams.pageSize} Offset ${skip}`,
      [`%${queryParams.searchNameTerm}%`],
    );

    const blogResDto = queryRes.map((i) => new BlogViewModel(i));
    return new PageDto(blogResDto, queryParams);
  }

  async getBlogById(blogId: string): Promise<BlogViewModel> {
    const queryRes: BlogModel = await this.dataSource.query(
      `Select * from "Blogs"
             Where "id" = $1`,
      [blogId],
    );
    if (!queryRes[0]) throw new NotFoundException();

    return new BlogViewModel(queryRes[0]);
  }
}
