export class CommentModel {
  id: string;
  content: string;
  postId: string;
  userId: string;
  createdAt: Date;
}
export class QueryCommentModel extends CommentModel {
  userLogin: string;
  dislikesCount: number;
  likesCount: number;
  myStatus: string;
}
export type CommentInputType = {
  content: string;
  postId: string;
  userId: string;
};
