import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../../infrastructure/posts.repository';
import { NotFoundException } from '@nestjs/common';
import { BlogsRepository } from '../../../../blogs/infrastructure/blogs.repository';
import { CreatePostDto } from '../../../dto/create-post.dto';

export class CreatePostCommand {
  constructor(public readonly createPostDto: CreatePostDto) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(private postsRepository: PostsRepository, private blogsRepository: BlogsRepository) {}

  async execute(command: CreatePostCommand): Promise<string> {
    const blog = await this.blogsRepository.getBlogById(command.createPostDto.blogId);
    if (!blog) {
      throw new NotFoundException();
    }
    const newPost = {
      title: command.createPostDto.title,
      shortDescription: command.createPostDto.shortDescription,
      content: command.createPostDto.content,
      blogId: blog.id,
    };
    return this.postsRepository.createPost(newPost);
  }
}
