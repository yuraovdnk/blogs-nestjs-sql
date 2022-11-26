export class PostModel {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  dislikesCount: string;
  myStatus: string;
  likesCount: string;
  userLogin: string;
  likeUserId: string;
  addedAt: Date;
}

export class QueryPostModel extends PostModel {
  dislikesCount: string;
  myStatus: string;
  likesCount: string;
  userLogin: string;
  likeUserId: string;
  addedAt: Date;
}
export type PostInputDbType = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};

export class SortFieldsPostModel {
  title: string;
  shortDescription: string;
  content: string;
  blogName: string;
  createdAt: Date;
}
