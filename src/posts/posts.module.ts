import { Module } from '@nestjs/common';
import { PostsService } from './application/posts.service';
import { PostsRepository } from './repositories/posts.repository';
import { PostsController } from './posts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PostSchema, Post } from './domain/posts-schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
  ],
  controllers: [PostsController],
  providers: [PostsService, PostsRepository],
})
export class PostsModule {}
