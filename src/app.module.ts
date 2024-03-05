import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {MongooseModule} from '@nestjs/mongoose';
import {ConfigModule} from '@nestjs/config';
import * as process from 'process';
import {Blog, BlogSchema} from './blogs/domain/blogs-schema';
import {BlogsController} from './blogs/blogs.controller';
import {BlogsService} from './blogs/application/blogs.service';
import {BlogsRepository} from './blogs/repositories/blogs.repository';
import {PostsRepository} from './posts/repositories/posts.repository';
import {PostsService} from './posts/application/posts.service';
import {PostSchema, Post} from './posts/domain/posts-schema';
import {PostsController} from './posts/posts.controller';
import {BlogsQueryRepository} from './blogs/repositories/blogs.query-repository';
import {PostsQueryRepository} from './posts/repositories/posts.query-repository';
import {UsersController} from './users/users.controller';
import {UsersQueryRepository} from './users/repositories/users.query-repository';
import {UsersRepository} from './users/repositories/users.repository';
import {UsersService} from './users/application/users.service';
import {User, UserSchema} from './users/domain/users-schema';
import {MyJwtService} from './_common/jwt-service';
import {AuthModule} from "./auth/auth.module";
import {BasicStrategy} from "./auth/strategies/basic.strategy";
import {AuthController} from "./auth/presentation/auth.controller";
import {BlogsModule} from "./blogs/blogs.module";
import {PostsModule} from "./posts/posts.module";
import {UsersModule} from "./users/users.module";

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{name: User.name, schema: UserSchema}]),
        MongooseModule.forFeature([{name: Post.name, schema: PostSchema}]),
        MongooseModule.forFeature([{name: Blog.name, schema: BlogSchema}]),
        MongooseModule.forRoot(process.env.MONGO_NEST_URL as string),
        AuthModule,
        UsersModule,
        BlogsModule,
        PostsModule
    ],

    controllers: [AppController, BlogsController, PostsController, UsersController],
    providers: [
        AppService,
        // BlogsService,
        // BlogsRepository,
        // BlogsQueryRepository,
        // PostsRepository,
        // PostsService,
        // PostsQueryRepository,
        // UsersService,
        // UsersQueryRepository,
        // UsersRepository,
        // MyJwtService
    ],
})
export class AppModule {
}
