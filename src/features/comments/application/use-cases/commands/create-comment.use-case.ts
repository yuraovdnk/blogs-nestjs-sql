import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../../infrastructure/comments.repository';
import { PostsRepository } from '../../../../posts/infrastructure/posts.repository';
import { NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from '../../../dto/create-comment.dto';

export class CreateCommentCommand {
  constructor(
    public readonly userId: string,
    public readonly postId: string,
    public readonly createCommentDto: CreateCommentDto,
  ) {}
}
@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase implements ICommandHandler<CreateCommentCommand> {
  constructor(
    private commentsRepository: CommentsRepository,
    private postsRepository: PostsRepository,
  ) {}

  async execute(command: CreateCommentCommand) {
    const post = await this.postsRepository.getPostById(command.postId);
    if (!post) {
      throw new NotFoundException();
    }
    const newComment = {
      content: command.createCommentDto.content,
      postId: command.postId,
      userId: command.userId,
    };
    return this.commentsRepository.createComment(newComment);
  }
}
