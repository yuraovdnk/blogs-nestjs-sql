import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../../infrastructure/comments.repository';
import { UsersRepository } from '../../../../users/infrastructure/users.repository';
import { NotFoundException } from '@nestjs/common';
import { StatusesLike } from '../../../../../types/commonEnums';
import { LikesRepository } from '../../../../likes/infrastructure/likes.repository';

export class SetLikeStatusForCommentCommand {
  parentType = 'comment';
  constructor(
    public readonly commentId: string,
    public readonly userId: string,
    public readonly likeStatus: string,
  ) {}
}
@CommandHandler(SetLikeStatusForCommentCommand)
export class SetLikeStatusForCommentUseCase
  implements ICommandHandler<SetLikeStatusForCommentCommand>
{
  constructor(
    private commentsRepository: CommentsRepository,
    private usersRepository: UsersRepository,
    private likeRepository: LikesRepository,
  ) {}

  async execute(command: SetLikeStatusForCommentCommand) {
    const comment = await this.commentsRepository.findById(command.commentId);
    if (!comment) {
      throw new NotFoundException();
    }
    if (command.likeStatus === StatusesLike.None) {
      return this.likeRepository.removeLike(command.commentId, command.userId, command.parentType);
    }
    return this.likeRepository.setLike(
      command.commentId,
      command.userId,
      command.parentType,
      command.likeStatus,
    );
  }
}
