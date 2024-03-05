import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    Res
} from '@nestjs/common';
import {PostsService} from './application/posts.service';
import {PostsRepository} from './repositories/posts.repository';
import {PostsQueryRepository} from './repositories/posts.query-repository';
import {PostDocumentType} from './domain/posts-schema';
import {PostInputCreateModel, PostViewModel} from './types/post.types';
import {PostsMongoDataMapper} from './domain/posts.mongo.dm';
import {BlogsQueryRepository} from '../blogs/repositories/blogs.query-repository';
import {HTTP_STATUSES} from '../_common/constants';
import {QueryUtilsClass} from '../_common/query.utils';

@Controller('/posts')
export class PostsController {
    constructor(
        protected postsService: PostsService,
        protected postsQueryRepository: PostsQueryRepository,
        protected blogsQueryRepository: BlogsQueryRepository,
        protected postsRepository: PostsRepository,
    ) {
    }

    @HttpCode(201)
    @Get()
    async getPosts(
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
        const result = await this.postsQueryRepository.getPosts(sortParams, skip, limit);

        if (!result) {
            throw new HttpException('Falied getPosts', HttpStatus.NOT_FOUND)
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
        return response
    }

    @HttpCode(201)
    @Get('/:id')
    async getPostById(@Param() id: string): Promise<PostViewModel | any> {
        try {
            const post: PostDocumentType | null = await this.postsQueryRepository.getPostById(id);
            if (post) {
                return PostsMongoDataMapper.toView(post);
            }
            throw new HttpException('Falied getPostById', HttpStatus.NOT_FOUND)
        } catch (e) {
            console.log(e);
            throw new HttpException('Falied getPostById', HttpStatus.NOT_FOUND)

        }
    }

    @HttpCode(201)
    @Post()
    async createPost(@Body() body: PostInputCreateModel) {
        const getBlog: any = await this.blogsQueryRepository.getBlogById(body.blogId);
        if (getBlog) {
            try {
                const postId = await this.postsService.createPost(body, getBlog.name);
                if (postId) {
                    return postId
                }
                throw new HttpException('Falied createPost', HttpStatus.BAD_REQUEST)
            } catch (error) {
                throw new HttpException('Falied createPost', HttpStatus.BAD_REQUEST)
            }
        }
    }

    @HttpCode(201)
    @Put('/:id')
    async updatePost(@Body() body: PostInputCreateModel, @Param('id') id: string) {
        try {
            const response: boolean = await this.postsService.updatePost(id, body);
            if (!response) {
                throw new HttpException('Falied updatePost', HttpStatus.NOT_FOUND)
            }
        } catch (e) {
            console.log(e);
            throw new HttpException('Falied updatePost', HttpStatus.NOT_FOUND)
        }
    }

    @Delete('/:id')
    async deletePost(@Param('id') id: string) {
        try {
            const response: any = await this.postsService.deletePost(id);
            if(!response){
                throw new HttpException('Falied deletePost', HttpStatus.NOT_FOUND)
            }
        } catch (error) {
            throw new HttpException('Falied deletePost', HttpStatus.NOT_FOUND)
        }
    }
}
