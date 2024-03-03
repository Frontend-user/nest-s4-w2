import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res } from '@nestjs/common';
import { PostsService } from './application/posts.service';
import { PostsRepository } from './repositories/posts.repository';
import { PostsQueryRepository } from './repositories/posts.query-repository';
import { PostDocumentType } from './domain/posts-schema';
import { PostInputCreateModel, PostViewModel } from './types/post.types';
import { PostsMongoDataMapper } from './domain/posts.mongo.dm';
import { BlogsQueryRepository } from '../blogs/repositories/blogs.query-repository';
import { HTTP_STATUSES } from '../_common/constants';
import { QueryUtilsClass } from '../_common/query.utils';

@Controller('/posts')
export class PostsController {
  constructor(
    protected postsService: PostsService,
    protected postsQueryRepository: PostsQueryRepository,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postsRepository: PostsRepository,
  ) {}

  @Get()
  async getPosts(
    @Res() res,
    @Query('sortBy') sortBy?: string,
    @Query('sortDirection') sortDirection?: string,
    @Query('pageNumber') pageNumber?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const { skip, limit, newPageNumber, newPageSize, sortParams } = QueryUtilsClass.getPagination(
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    );
    const result = await this.postsQueryRepository.getPosts(sortParams, skip, limit);

    if (!result) {
      res.sendStatus(404);
      return;
    }
    const { totalCount, posts } = result;
    const changeBlogs = posts.map((b: PostDocumentType) => PostsMongoDataMapper.toView(b));
    const pagesCount = Math.ceil(totalCount / newPageSize);

    const response = {
      pagesCount: pagesCount,
      page: +newPageNumber,
      pageSize: +newPageSize,
      totalCount: totalCount,
      items: changeBlogs,
    };
    return res.send(response);
  }

  @Get('/:id')
  async getPostById(@Param() id: string, @Res() res): Promise<PostViewModel | any> {
    try {
      const post: PostDocumentType | null = await this.postsQueryRepository.getPostById(id);
      if (post) {
        const changePost: PostViewModel = PostsMongoDataMapper.toView(post);
        res.send(changePost);
        return;
      }
      res.sendStatus(404);
      return;
    } catch (e) {
      console.log(e);
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);

      return;
    }
  }

  @Post()
  async createPost(@Res() res, @Body() body: PostInputCreateModel) {
    const getBlog: any = await this.blogsQueryRepository.getBlogById(body.blogId);
    if (getBlog) {
      try {
        const postId = await this.postsService.createPost(body, getBlog.name);
        if (postId) {
          res.status(HTTP_STATUSES.CREATED_201).send(postId);
          return;
        }
        res.sendStatus(HTTP_STATUSES.SOMETHING_WRONG_400);
        return;
      } catch (error) {
        res.sendStatus(HTTP_STATUSES.SOMETHING_WRONG_400);
      }
    }
  }

  @Put('/:id')
  async updatePost(@Res() res, @Body() body: PostInputCreateModel, @Param('id') id: string) {
    debugger;
    try {
      const response: boolean = await this.postsService.updatePost(id, body);
      res.sendStatus(response ? HTTP_STATUSES.NO_CONTENT_204 : HTTP_STATUSES.NOT_FOUND_404);
      return;
    } catch (e) {
      console.log(e);
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
      return;
    }
  }

  @Delete('/:id')
  async deletePost(@Res() res, @Param('id') id: string) {
    try {
      const response: any = await this.postsService.deletePost(id);
      res.send(response ? HTTP_STATUSES.NO_CONTENT_204 : HTTP_STATUSES.NOT_FOUND_404);
    } catch (error) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
    }
  }
}
