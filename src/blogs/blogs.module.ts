import {forwardRef, Module} from '@nestjs/common';
import { BlogsController } from './blogs.controller';
import { BlogsService } from './application/blogs.service';
import { BlogsRepository } from './repositories/blogs.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './domain/blogs-schema';
import { BlogsQueryRepository } from './repositories/blogs.query-repository';
import {PostsModule} from "../posts/posts.module";
import {PostsService} from "../posts/application/posts.service";
import {PostsQueryRepository} from "../posts/repositories/posts.query-repository";

@Module({
  imports: [
    forwardRef(() => PostsModule),
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
  ],
  controllers: [BlogsController],
  providers: [BlogsService, BlogsRepository, BlogsQueryRepository],
  exports:[
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository]
})
export class BlogsModule {}
