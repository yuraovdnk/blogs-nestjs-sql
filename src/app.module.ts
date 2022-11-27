import { getConfig } from './configuration/config';
import { ConfigModule } from '@nestjs/config';
const configModule = ConfigModule.forRoot({
  load: [getConfig],
  isGlobal: true,
  envFilePath: ['.env'],
});
import { Module } from '@nestjs/common';
import { UsersController } from './features/users/users.controller';
import { UsersService } from './features/users/users.service';
import { UsersRepository } from './features/users/infrastructure/users.repository';
import { UsersQueryRepository } from './features/users/infrastructure/users.query.repository';
import { AuthController } from './features/auth/auth.controller';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './features/auth/application/auth.service';
import { EmailManager } from './adapters/notification/email.manager';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { LocalStrategy } from './features/auth/strategies/local.strategy';
import { AuthSessionRepository } from './features/auth/infrastructure/auth-session.repository';
import { BlogsController } from './features/blogs/blogs.controller';
import { BlogsService } from './features/blogs/application/blogs.service';
import { BlogsRepository } from './features/blogs/infrastructure/blogs.repository';
import { BlogsQueryRepository } from './features/blogs/infrastructure/blogs.query.repository';
import { BasicStrategy } from './features/auth/strategies/basic.strategy';
import { PostsController } from './features/posts/posts.controller';
import { PostsService } from './features/posts/application/posts.service';
import { PostsRepository } from './features/posts/infrastructure/posts.repository';
import { PostsQueryRepository } from './features/posts/infrastructure/posts.query.repository';
import { CommentsService } from './features/comments/application/comments.service';
import { CommentsRepository } from './features/comments/infrastructure/comments.repository';
import { JwtStrategy } from './features/auth/strategies/jwt.strategy';
import { CommentsQueryRepository } from './features/comments/infrastructure/comments.query.repository';
import { CommentsController } from './features/comments/comments.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { SetLikeStatusForCommentUseCase } from './features/comments/application/use-cases/commands/set-like-comment.use-case';
import { LikesRepository } from './features/likes/infrastructure/likes.repository';
import { JwtExtractGuard } from './features/auth/guards/jwt-extract.guard';
import { UpdateCommentUseCase } from './features/comments/application/use-cases/commands/update-comment.use-case';
import { DeleteCommentUseCase } from './features/comments/application/use-cases/commands/delete-comment.use-case';
import { CreateCommentUseCase } from './features/comments/application/use-cases/commands/create-comment.use-case';
import { CreatePostUseCase } from './features/posts/application/use-cases/commands/create-post.use-case';
import { UpdatePostUseCase } from './features/posts/application/use-cases/commands/update-post.use-case';
import { DeletePostUseCase } from './features/posts/application/use-cases/commands/delete-post.use-case';
import { DevicesController } from './features/devices/devices.controller';
import { JwtCookieStrategy } from './features/auth/strategies/jwt-cookie.strategy';
import { TerminateSessionsUseCase } from './features/devices/use-cases/terminate-sessions.use-case';
import { SetLikeStatusForPostUseCase } from './features/posts/application/use-cases/commands/set-likeStatus-for-post.use-case';
import { CreateBlogUseCase } from './features/blogs/application/use-cases/commands/create-blog.use-case';
import { UpdateBlogUseCase } from './features/blogs/application/use-cases/commands/update-blog.use-case';
import { DeleteBlogUseCase } from './features/blogs/application/use-cases/commands/delete-blog.use-case';
import { CreatePostForBlogUseCase } from './features/blogs/application/use-cases/commands/create-post-for-blog.use-case';
import { TestingController } from './features/testing/testing.controller';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './adapters/database/database.module';

const useCases = [
  SetLikeStatusForCommentUseCase,
  UpdateCommentUseCase,
  DeleteCommentUseCase,
  CreateCommentUseCase,
  CreatePostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
  TerminateSessionsUseCase,
  SetLikeStatusForPostUseCase,
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  CreatePostForBlogUseCase,
];

@Module({
  imports: [
    configModule,
    CqrsModule,
    DatabaseModule,
    PassportModule,
    JwtModule.register({}),
    ThrottlerModule.forRoot({}),
  ],
  controllers: [
    UsersController,
    AuthController,
    BlogsController,
    PostsController,
    CommentsController,
    DevicesController,
    TestingController,
  ],
  providers: [
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    AuthService,
    EmailManager,
    JwtService,
    JwtStrategy,
    JwtExtractGuard,
    JwtCookieStrategy,
    LocalStrategy,
    BasicStrategy,
    AuthSessionRepository,
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    PostsService,
    PostsRepository,
    PostsQueryRepository,
    CommentsService,
    CommentsRepository,
    CommentsQueryRepository,
    LikesRepository,
    ...useCases,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
