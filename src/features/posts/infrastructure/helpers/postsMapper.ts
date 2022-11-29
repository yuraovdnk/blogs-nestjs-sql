import { QueryPostModel } from '../../typing/posts.type';
import { PostViewModel } from '../../dto/post-view.model';

export function queryPostsMapper(resQuery: QueryPostModel[]): PostViewModel[] {
  const resultMap = [];
  const addedPosts = {};
  for (const postElem of resQuery) {
    let postsWithLikes = addedPosts[postElem.id];
    if (!postsWithLikes) {
      postsWithLikes = {
        id: postElem.id,
        title: postElem.title,
        shortDescription: postElem.shortDescription,
        content: postElem.content,
        blogId: postElem.blogId,
        blogName: postElem.blogName,
        createdAt: postElem.createdAt,
        extendedLikesInfo: {
          myStatus: postElem.myStatus ?? 'None',
          likesCount: postElem.likesCount,
          dislikesCount: postElem.dislikesCount,
          newestLikes: [],
        },
      };
      resultMap.push(postsWithLikes);
      addedPosts[postElem.id] = postsWithLikes;
    }
    if (postElem.likesCount) {
      postsWithLikes.extendedLikesInfo.newestLikes.push({
        login: postElem.userLogin,
        userId: postElem.likeUserId,
        addedAt: postElem.addedAt,
      });
    }
  }
  return resultMap;
}
