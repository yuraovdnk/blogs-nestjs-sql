import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../../infrastructure/posts.repository';
import { NotFoundException } from '@nestjs/common';
import { StatusesLike } from '../../../../../types/commonEnums';
import { LikesRepository } from '../../../../likes/infrastructure/likes.repository';

export class SetLikeStatusForPostCommand {
  parentType = 'post';
  constructor(
    public readonly postId: string,
    public readonly likeStatus: string,
    public readonly userId: string,
  ) {}
}
@CommandHandler(SetLikeStatusForPostCommand)
export class SetLikeStatusForPostUseCase implements ICommandHandler<SetLikeStatusForPostCommand> {
  constructor(private postsRepository: PostsRepository, private likeRepository: LikesRepository) {}

  async execute(command: SetLikeStatusForPostCommand): Promise<any> {
    const post = await this.postsRepository.getPostById(command.postId);
    if (!post) {
      throw new NotFoundException();
    }

    if (command.likeStatus === StatusesLike.None) {
      return this.likeRepository.removeLike(command.postId, command.userId, command.parentType);
    }
    return this.likeRepository.setLike(
      command.postId,
      command.userId,
      command.parentType,
      command.likeStatus,
    );
  }
}
