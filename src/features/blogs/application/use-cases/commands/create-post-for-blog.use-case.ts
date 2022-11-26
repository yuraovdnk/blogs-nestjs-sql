import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { BlogsRepository } from '../../../infrastructure/blogs.repository';
import { CreatePostForBlogDto } from '../../../dto/create-post-for-blog.dto';
import { PostsRepository } from '../../../../posts/infrastructure/posts.repository';

export class CreatePostForBlogCommand {
  constructor(
    public readonly blogId: string,
    public readonly createPostDto: CreatePostForBlogDto,
  ) {}
}
@CommandHandler(CreatePostForBlogCommand)
export class CreatePostForBlogUseCase implements ICommandHandler<CreatePostForBlogCommand> {
  constructor(private blogRepository: BlogsRepository, private postsRepository: PostsRepository) {}

  async execute(command: CreatePostForBlogCommand): Promise<string> {
    const blog = await this.blogRepository.getBlogById(command.blogId);
    if (!blog) {
      throw new NotFoundException();
    }
    const newPost = {
      title: command.createPostDto.title,
      shortDescription: command.createPostDto.shortDescription,
      content: command.createPostDto.content,
      blogId: command.blogId,
    };
    return this.postsRepository.createPost(newPost);
  }
}
