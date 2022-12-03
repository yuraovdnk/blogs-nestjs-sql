import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogsQueryRepository } from './infrastructure/blogs.query.repository';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { PostsQueryRepository } from '../posts/infrastructure/posts.query.repository';
import { CreatePostForBlogDto } from './dto/create-post-for-blog.dto';
import { QueryParamsDto, QueryParamsPipe } from '../../pipes/query-params.pipe';
import { SortFieldsBlogModel } from './typing/blogs.types';
import { BasicAuthGuard } from '../auth/strategies/basic.strategy';
import { CommandBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from './application/use-cases/commands/create-blog.use-case';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogCommand } from './application/use-cases/commands/update-blog.use-case';
import { DeleteBlogCommand } from './application/use-cases/commands/delete-blog.use-case';
import { CreatePostForBlogCommand } from './application/use-cases/commands/create-post-for-blog.use-case';
import { PageDto } from '../../utils/PageDto';
import { BlogViewModel } from './dto/blog-view.model';
import { SortFieldsPostModel } from '../posts/typing/posts.type';
import { JwtExtractGuard } from '../auth/guards/jwt-extract.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get()
  async getAllBlogs(
    @Query(new QueryParamsPipe(SortFieldsBlogModel)) queryParams: QueryParamsDto,
  ): Promise<PageDto<BlogViewModel>> {
    return this.blogsQueryRepository.getBlogs(queryParams);
  }

  @Get(':blogId')
  async getBlogById(@Param('blogId', ParseUUIDPipe) blogId: string): Promise<BlogViewModel> {
    const blog = await this.blogsQueryRepository.getBlogById(blogId);
    if (!blog) {
      throw new NotFoundException();
    }
    return blog;
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createBlog(@Body() createBlog: CreateBlogDto): Promise<BlogViewModel> {
    const createdBlogId = await this.commandBus.execute(new CreateBlogCommand(createBlog));
    return this.blogsQueryRepository.getBlogById(createdBlogId);
  }

  @UseGuards(BasicAuthGuard)
  @Put(':blogId')
  @HttpCode(204)
  async updateBlog(
    @Param('blogId', ParseUUIDPipe) blogId: string,
    @Body() updateBlogDto: UpdateBlogDto,
  ): Promise<boolean> {
    return this.commandBus.execute(new UpdateBlogCommand(blogId, updateBlogDto));
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':blogId')
  @HttpCode(204)
  async deleteBlog(@Param('blogId', ParseUUIDPipe) blogId: string): Promise<boolean> {
    return this.commandBus.execute(new DeleteBlogCommand(blogId));
  }

  @Post(':blogId/posts')
  async createPostForBlog(
    @Param('blogId', ParseUUIDPipe) blogId: string,
    @Body() createPostDto: CreatePostForBlogDto,
  ) {
    const createdPostId = await this.commandBus.execute(
      new CreatePostForBlogCommand(blogId, createPostDto),
    );
    return this.postsQueryRepository.getPostById(createdPostId);
  }
  @UseGuards(JwtExtractGuard)
  @Get(':blogId/posts')
  async getPostsByBlogId(
    @Param('blogId', ParseUUIDPipe) blogId: string,
    @Query(new QueryParamsPipe(SortFieldsPostModel)) queryParams: QueryParamsDto,
    @CurrentUser() userId: string,
  ) {
    return this.postsQueryRepository.getPostsByBlogId(blogId, queryParams, userId);
  }
}
