// import { PaginatedItems } from '../../../../typing/global-typing';
// import { Blog } from '../../schemas/blogs.schema';
//
// export class BlogsMapper {
//   static async mapPaginatedBlogs(paginatedBlogs: PaginatedItems<Blog>) {
//     const items = paginatedBlogs.items.map((item) => this.mapBlog(item));
//     return {
//       ...paginatedBlogs,
//       items,
//     };
//   }
//   static mapBlog(blog: Blog) {
//     if (!blog) return null;
//     return {
//       id: blog._id,
//       name: blog.name,
//       youtubeUrl: blog.youtubeUrl,
//     };
//   }
// }
