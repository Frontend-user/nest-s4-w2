import {Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Post, Put, Query, Res} from '@nestjs/common';
import {BlogsService} from './application/blogs.service';
import {BlogInputCreateModel, BlogViewModel, WithId} from './types/blogs.types';
import {BlogsMongoDataMapper} from './domain/blogs.mongo.dm';
import {BlogDocumentType} from './domain/blogs-schema';
import {PostInputCreateModel, PostViewModel} from '../posts/types/post.types';
import {PostDocumentType} from '../posts/domain/posts-schema';
import {PostsService} from '../posts/application/posts.service';
import {BlogsQueryRepository} from './repositories/blogs.query-repository';
import {QueryUtilsClass} from '../_common/query.utils';
import {PostsQueryRepository} from '../posts/repositories/posts.query-repository';
import {PostsMongoDataMapper} from '../posts/domain/posts.mongo.dm';
import {HTTP_STATUSES} from '../_common/constants';
import {query} from 'express';
import {NotFoundError} from "rxjs";

@Controller('/blogs')
export class BlogsController {
    constructor(protected blogsService: BlogsService,
                protected postsService: PostsService,
                protected blogsQueryRepository: BlogsQueryRepository,
                protected postsQueryRepository: PostsQueryRepository,
    ) {
    }

    @Get()
    async getBlogs(
        @Query('searchNameTerm') searchNameTerm?: string,
        @Query('sortBy') sortBy?: string,
        @Query('sortDirection') sortDirection?: string,
        @Query('pageNumber') pageNumber?: number,
        @Query('pageSize') pageSize?: number,
    ) {
        const {skip, limit, newPageNumber, newPageSize, sortParams} = QueryUtilsClass.getPagination(
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
        );
        const {totalCount, blogs} = await this.blogsQueryRepository.getBlogs(
            sortParams,
            searchNameTerm,
            skip,
            limit,
        );
        const changeBlogs = blogs.map((b: BlogDocumentType) => BlogsMongoDataMapper.toView(b));
        const pagesCount = Math.ceil(totalCount / newPageSize);

        const response = {
            pagesCount: pagesCount,
            page: +newPageNumber,
            pageSize: +newPageSize,
            totalCount: totalCount,
            items: changeBlogs,
        };

        return response;
    }

    @Get('/:id')
    async getBlogById(@Res() res, @Param('id') id: string): Promise<BlogViewModel | any> {
        const blog: BlogDocumentType | null = await this.blogsQueryRepository.getBlogById(id);
        if (!blog) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
            return;
        }
        const mappedBlog = BlogsMongoDataMapper.toView(blog);
        res.status(200).send(mappedBlog);
    }

    @Get('/:id/posts')
    async getPostByBlogId(
        @Param('id') id: string,
        @Res() res,
        @Query('sortBy') sortBy?: string,
        @Query('sortDirection') sortDirection?: string,
        @Query('pageNumber') pageNumber?: number,
        @Query('pageSize') pageSize?: number,
    ) {
        if (!id) {
            res.sendStatus(404);
            return;
        }
        const {skip, limit, newPageNumber, newPageSize, sortParams} = QueryUtilsClass.getPagination(
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
        );
        const result = await this.postsQueryRepository.getPostsByBlogId(sortParams, id, skip, limit);

        const blog = await this.blogsService.getBlogById(id);
        if (!blog) {
            res.sendStatus(404);
            return;
        }
        const {totalCount, posts} = result;
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

    @Post()
    async createBlog(@Res() res, @Body() body: BlogInputCreateModel): Promise<WithId<BlogViewModel>> {
        const blog: BlogDocumentType | false = await this.blogsService.createBlog(body);
        return blog ? res.send(BlogsMongoDataMapper.toView(blog)) : res.sendStatus(404);
    }

    @Post('/:id/posts')
    async createPostByBlogId(
        @Body() body: PostInputCreateModel,
        @Param('id') id: string,
        @Res() res,
    ): Promise<WithId<PostViewModel> | undefined> {
        const blog = await this.blogsService.getBlogById(id);
        if (blog) {
            body.blogId = String(blog._id);
            const post: WithId<PostViewModel> | false = await this.postsService.createPost(
                body,
                blog.name,
            );
            return post ? res.send(post) : res.sendStatus(404);
        }
        res.sendStatus(404);
    }

    @Put('/:id')
    async updateBlog(@Res() res, @Body() body: BlogInputCreateModel, @Param('id') id: string) {
        const response: boolean = await this.blogsService.updateBlog(id, body);
        res.sendStatus(response ? HTTP_STATUSES.NO_CONTENT_204 : HTTP_STATUSES.NOT_FOUND_404);
    }

    @Delete('/:id')
    @HttpCode(204)
    async deleteBlog(@Res({passthrough: true}) res, @Param('id') id: string) {
        try {
            const response: boolean = await this.blogsService.deleteBlog(id);
            // res.sendStatus(response ? HTTP_STATUSES.NO_CONTENT_204 : HTTP_STATUSES.NOT_FOUND_404);
            if (!response) {
                throw new NotFoundException()
            }
        } catch (error) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }
    }
}
