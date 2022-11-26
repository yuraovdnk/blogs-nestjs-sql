import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../../../posts/infrastructure/posts.repository';
import { NotFoundException } from '@nestjs/common';
import { BlogsRepository } from '../../../../blogs/infrastructure/blogs.repository';
import { UpdatePostDto } from '../../../dto/update-post.dto';

export class UpdatePostCommand {
  constructor(public readonly postId: string, public readonly updatePostDto: UpdatePostDto) {}
}
@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(private postsRepository: PostsRepository, private blogsRepository: BlogsRepository) {}

  async execute(command: UpdatePostCommand) {
    const post = await this.postsRepository.getPostById(command.postId);
    if (!post) {
      throw new NotFoundException();
    }
    const blog = await this.blogsRepository.getBlogById(command.updatePostDto.blogId);
    if (!blog) {
      throw new NotFoundException();
    }
    return this.postsRepository.updatePost(command.postId, command.updatePostDto);
  }
}
