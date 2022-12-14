import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { PostModel, QueryPostModel } from '../typing/posts.type';
import { QueryParamsDto } from '../../../pipes/query-params.pipe';
import { PageDto } from '../../../utils/PageDto';
import { PostViewModel } from '../dto/post-view.model';
import { queryPostsMapper } from './helpers/postsMapper';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getPosts(
    queryParams: QueryParamsDto,
    userId: string = null,
  ): Promise<PageDto<PostViewModel>> {
    const skip = queryParams.pageSize * (queryParams.pageNumber - 1);
    const resQuery: PostModel[] = await this.dataSource.query(
      `Select *, 
                 (select count(*)::int  as "likesCount"
                    From "Likes" l 
                    Where l."parentId" = cu."id" And l."likeStatus" = 'Like' ),
                (select count(*)::int   as "dislikesCount"
                    From "Likes" l 
                    Where l."parentId" = cu."id" And l."likeStatus" = 'Dislike' ),
                (Select "likeStatus"  From "Likes" l
                    Where cu."id" = l."parentId" And l."userId" = $1) as "myStatus"             
              From (Select p.*,
                        (select "name" from "Blogs" b
                        Where b."id" = p."blogId") as "blogName"
                    from "Posts" p                  
                    Order by "${queryParams.sortBy}" ${queryParams.sortDirection}
                    Limit ${queryParams.pageSize} Offset ${skip}) as cu
              left join (Select 
                    l."parentId",
                    l."addedAt",
                    l."userId" as "likeUserId",
                    ROW_NUMBER() Over (Partition by "parentId" Order By "addedAt" desc) "likeNum",
                    (Select "login"
                        from "Users" u
                        Where l."userId" = u."id") as "userLogin"
                    From "Likes" l 
                    Where "parentType" = 'post' and "likeStatus" = 'Like') likes
              ON likes."parentId" = cu."id"
              Where likes."likeNum" < 4 OR likes."likeNum" IS null
              Order by "${queryParams.sortBy}" ${queryParams.sortDirection},likes."addedAt" desc`,
      [userId],
    );

    const queryMap = queryPostsMapper(resQuery);
    return new PageDto(queryMap, queryParams);
  }

  async getPostById(postId: string, userId: string = null): Promise<PostViewModel> | null {
    const resQuery: QueryPostModel[] = await this.dataSource.query(
      `Select *, 
                 (select count(*)::int  as "likesCount"
                    From "Likes" l 
                    Where l."parentId" = cu."id" And l."likeStatus" = 'Like' ),
                (select count(*)::int   as "dislikesCount"
                    From "Likes" l 
                    Where l."parentId" = cu."id" And l."likeStatus" = 'Dislike' ),
                (Select "likeStatus"  From "Likes" l
                    Where cu."id" = l."parentId" And l."userId" = $2) as "myStatus"             
              From (Select p.*,
                        (select "name" from "Blogs" b
                        Where b."id" = p."blogId") as "blogName"
                    from "Posts" p   
                    Where p."id" = $1) as cu
              left join (Select 
                    l."parentId",
                    l."addedAt",
                    l."userId" as "likeUserId",
                    ROW_NUMBER() Over (Partition by "parentId" Order By "addedAt" desc) "likeNum",
                    (Select "login"
                        from "Users" u
                        Where l."userId" = u."id") as "userLogin"
                    From "Likes" l 
                    Where "parentType" = 'post' and "likeStatus" = 'Like') likes
              ON likes."parentId" = cu."id"
              Where likes."likeNum" < 4 OR likes."likeNum" IS null`,
      [postId, userId],
    );
    if (resQuery[0]) {
      const queryMap = queryPostsMapper(resQuery);
      return queryMap[0];
    }
    return null;
  }

  async getPostsByBlogId(
    blogId: string,
    queryParams: QueryParamsDto,
    userId: string = null,
  ): Promise<PageDto<PostViewModel>> {
    const skip = queryParams.pageSize * (queryParams.pageNumber - 1);
    const resQuery: QueryPostModel[] = await this.dataSource.query(
      `Select *, 
                 (select count(*)::int  as "likesCount"
                    From "Likes" l 
                    Where l."parentId" = cu."id" And l."likeStatus" = 'Like' ),
                (select count(*)::int   as "dislikesCount"
                    From "Likes" l 
                    Where l."parentId" = cu."id" And l."likeStatus" = 'Dislike' ),
                (Select "likeStatus"  From "Likes" l
                    Where cu."id" = l."parentId" And l."userId" = $2) as "myStatus"             
              From (Select p.*,
                        (select "name" from "Blogs" b
                        Where b."id" = p."blogId") as "blogName"
                    from "Posts" p   
                    Where p."blogId" = $1
                    Order by "${queryParams.sortBy}" ${queryParams.sortDirection}
                    Limit ${queryParams.pageSize} Offset ${skip}) as cu
              left join (Select 
                    l."parentId",
                    l."addedAt",
                    l."userId" as "likeUserId",
                    ROW_NUMBER() Over (Partition by "parentId" Order By "addedAt" desc) "likeNum",
                    (Select "login"
                        from "Users" u
                        Where l."userId" = u."id") as "userLogin"
                    From "Likes" l 
                    Where "parentType" = 'post' and "likeStatus" = 'Like') likes
              ON likes."parentId" = cu."id"
              Where likes."likeNum" < 4 OR likes."likeNum" IS null
              Order by "${queryParams.sortBy}" ${queryParams.sortDirection},likes."addedAt" desc`,
      [blogId, userId],
    );

    const queryMap = queryPostsMapper(resQuery);
    return new PageDto(queryMap, queryParams);
  }
}
