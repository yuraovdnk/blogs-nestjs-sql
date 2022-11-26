import { CommentsService } from './application/comments.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentsQueryRepository } from './infrastructure/comments.query.repository';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommandBus } from '@nestjs/cqrs';
import { SetLikeStatusForCommentCommand } from './application/use-cases/commands/set-like-comment.use-case';
import { JwtExtractGuard } from '../auth/guards/jwt-extract.guard';
import { UpdateCommentCommand } from './application/use-cases/commands/update-comment.use-case';
import { DeleteCommentCommand } from './application/use-cases/commands/delete-comment.use-case';
import { JwtGuard } from '../auth/strategies/jwt.strategy';

@Controller('comments')
export class CommentsController {
  constructor(
    private commentsService: CommentsService,
    private commentsQueryRepository: CommentsQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(JwtGuard)
  @Put(':commentId')
  @HttpCode(204)
  async updateComment(
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @CurrentUser() userId: string,
  ) {
    return this.commandBus.execute(new UpdateCommentCommand(userId, commentId, updateCommentDto));
  }

  @UseGuards(JwtGuard)
  @Delete(':commentId')
  @HttpCode(204)
  async deleteComment(
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @CurrentUser() userId: string,
  ) {
    return this.commandBus.execute(new DeleteCommentCommand(commentId, userId));
  }

  @UseGuards(JwtExtractGuard)
  @Get(':commentId')
  async getCommentById(
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @CurrentUser() userId: string,
  ) {
    const comment = await this.commentsQueryRepository.getCommentById(commentId, userId);
    if (!comment) {
      throw new NotFoundException();
    }
    return comment;
  }

  @Put(':commentId/like-status')
  @UseGuards(JwtGuard)
  @HttpCode(204)
  async setLikeStatus(
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @CurrentUser() userId: string,
    @Body('likeStatus') likeStatus: string,
  ) {
    return this.commandBus.execute(
      new SetLikeStatusForCommentCommand(commentId, userId, likeStatus),
    );
  }
}
