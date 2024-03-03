import { Module } from '@nestjs/common';
import { BlogsController } from './blogs.controller';
import { BlogsService } from './application/blogs.service';
import { BlogsRepository } from './repositories/blogs.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './domain/blogs-schema';
import { BlogsQueryRepository } from './repositories/blogs.query-repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
  ],
  controllers: [BlogsController],
  providers: [BlogsService, BlogsRepository, BlogsQueryRepository],
})
export class BlogsModule {}
