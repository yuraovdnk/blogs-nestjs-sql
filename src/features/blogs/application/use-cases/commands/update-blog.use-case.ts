import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBlogDto } from '../../../dto/update-blog.dto';
import { NotFoundException } from '@nestjs/common';
import { BlogsRepository } from '../../../infrastructure/blogs.repository';

export class UpdateBlogCommand {
  constructor(public readonly blogId: string, public readonly updateBlogDto: UpdateBlogDto) {}
}
@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(private blogRepository: BlogsRepository) {}

  async execute(command: UpdateBlogCommand): Promise<boolean> {
    const blog = await this.blogRepository.getBlogById(command.blogId);
    if (!blog) {
      throw new NotFoundException();
    }
    return this.blogRepository.updateBlog(command.blogId, command.updateBlogDto);
  }
}
