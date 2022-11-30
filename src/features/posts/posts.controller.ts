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
import { CreatePostDto } from './dto/create-post.dto';
import { PostsQueryRepository } from './infrastructure/posts.query.repository';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { CommentsQueryRepository } from '../comments/infrastructure/comments.query.repository';
import { QueryParamsDto, QueryParamsPipe } from '../../pipes/query-params.pipe';
import { SortFieldsPostModel } from './typing/posts.type';
import { JwtExtractGuard } from '../auth/guards/jwt-extract.guard';
import { CommandBus } from '@nestjs/cqrs';
import { DeletePostCommand } from './application/use-cases/commands/delete-post.use-case';
import { UpdatePostCommand } from './application/use-cases/commands/update-post.use-case';
import { CreatePostCommand } from './application/use-cases/commands/create-post.use-case';
import { CreateCommentCommand } from '../comments/application/use-cases/commands/create-comment.use-case';
import { JwtGuard } from '../auth/strategies/jwt.strategy';
import { ParseStatusLikeEnumPipe } from '../../pipes/status-like-enum.pipe';
import { SetLikeStatusForPostCommand } from './application/use-cases/commands/set-likeStatus-for-post.use-case';

@Controller('posts')
export class PostsController {
  constructor(
    private postsQueryRepository: PostsQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(JwtExtractGuard)
  @Get()
  async getPosts(@Query() queryParams: QueryParamsDto, @CurrentUser() userId: string) {
    return this.postsQueryRepository.getPosts(queryParams, userId);
  }

  @UseGuards(JwtExtractGuard)
  @Get(':postId')
  async getPostById(@Param('postId', ParseUUIDPipe) postId: string, @CurrentUser() userId: string) {
    const post = await this.postsQueryRepository.getPostById(postId, userId);
    if (!post) {
      throw new NotFoundException();
    }
    return post;
  }

  @Post()
  async createPost(@Body() createPostDto: CreatePostDto) {
    const createdPostId = await this.commandBus.execute(new CreatePostCommand(createPostDto));
    return this.postsQueryRepository.getPostById(createdPostId);
  }

  @Put(':postId')
  @HttpCode(204)
  async updatePost(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<boolean> {
    return this.commandBus.execute(new UpdatePostCommand(postId, updatePostDto));
  }

  @Delete(':postId')
  @HttpCode(204)
  async deletePost(@Param('postId', ParseUUIDPipe) postId: string): Promise<boolean> {
    return this.commandBus.execute(new DeletePostCommand(postId));
  }

  @Post(':postId/comments')
  @UseGuards(JwtGuard)
  async createCommentForPost(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() userId: string,
  ) {
    const createdCommentId = await this.commandBus.execute(
      new CreateCommentCommand(userId, postId, createCommentDto),
    );
    return this.commentsQueryRepository.getCommentById(createdCommentId);
  }

  @UseGuards(JwtExtractGuard)
  @Get(':postId/comments')
  async getCommentsByPostId(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Query(new QueryParamsPipe(SortFieldsPostModel)) queryParams: QueryParamsDto,
    @CurrentUser() userId: string,
  ) {
    return this.commentsQueryRepository.getCommentsByPostId(postId, queryParams, userId);
  }

  @UseGuards(JwtGuard)
  @Put(':postId/like-status')
  @HttpCode(204)
  async setLikeForPost(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Body('likeStatus', ParseStatusLikeEnumPipe) likeStatus: string,
    @CurrentUser() userId: string,
  ) {
    return this.commandBus.execute(new SetLikeStatusForPostCommand(postId, likeStatus, userId));
  }
}
