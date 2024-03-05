import {Module} from '@nestjs/common';
import {UsersService} from './application/./users.service';
import {UsersRepository} from './repositories/users.repository';
import {UsersController} from './users.controller';
import {MongooseModule} from '@nestjs/mongoose';
import {User, UserSchema} from './domain/users-schema';
import {UsersQueryRepository} from "./repositories/users.query-repository";
import {BlogsModule} from "../blogs/blogs.module";
import {PostsModule} from "../posts/posts.module";

@Module({
    imports: [
        BlogsModule,
        PostsModule,
        MongooseModule.forFeature([{name: User.name, schema: UserSchema}])],
    controllers: [UsersController],
    providers: [UsersService, UsersRepository, UsersQueryRepository],
    exports: [UsersService,UsersQueryRepository,UsersRepository]

})
export class UsersModule {
}
