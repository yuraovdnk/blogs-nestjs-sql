import { BlogModel } from '../typing/blogs.types';

export class BlogViewModel {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;

  constructor(model: BlogModel) {
    this.id = model.id;
    this.name = model.name;
    this.description = model.description;
    this.websiteUrl = model.websiteUrl;
    this.createdAt = model.createdAt;
  }
}
