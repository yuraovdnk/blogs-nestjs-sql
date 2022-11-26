export class PostViewModel {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendsLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
    newestLikes?: [];
  };

  constructor(model: any) {
    // this.id = model.id;
    // this.title = model.title;
    // this.shortDescription = model.shortDescription;
    // this.content = model.content;
    // this.blogId = model.blogId;
    // this.blogName = model.blogName;
    // this.extendsLikesInfo = {
    //   likesCount: model.likesCount,
    //   dislikesCount: model.dislikesCount,
    //   myStatus: model.myStatus ?? 'None',
    // };
  }
}
