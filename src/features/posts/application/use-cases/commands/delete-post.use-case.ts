import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../../infrastructure/posts.repository';
import { NotFoundException } from '@nestjs/common';

export class DeletePostCommand {
  constructor(public readonly postId: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(private postsRepository: PostsRepository) {}
  async execute(command: DeletePostCommand) {
    const post = await this.postsRepository.getPostById(command.postId);
    if (!post) {
      throw new NotFoundException();
    }
    return this.postsRepository.deletePost(command.postId);
  }
}
