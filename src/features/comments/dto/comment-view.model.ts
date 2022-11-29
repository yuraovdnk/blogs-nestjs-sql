export class CommentViewModel {
  id: string;
  content: string;
  userId: string;
  userLogin: string;
  createdAt: string;
  likesInfo: {
    likesCount: string;
    dislikesCount: string;
    myStatus: string;
  };
  constructor(model: any) {
    this.id = model.id;
    this.content = model.content;
    this.userId = model.userId;
    this.userLogin = model.userLogin;
    this.createdAt = model.createdAt;
    this.likesInfo = {
      likesCount: model.likesCount,
      dislikesCount: model.dislikesCount,
      myStatus: model.myStatus ?? 'None',
    };
  }
}
