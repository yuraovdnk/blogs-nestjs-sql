import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { BlogsRepository } from '../../../infrastructure/blogs.repository';

export class DeleteBlogCommand {
  constructor(public readonly blogId: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(private blogRepository: BlogsRepository) {}

  async execute(command: DeleteBlogCommand): Promise<boolean> {
    const blog = await this.blogRepository.getBlogById(command.blogId);
    if (!blog) {
      throw new NotFoundException();
    }
    return this.blogRepository.deleteBlog(command.blogId);
  }
}
