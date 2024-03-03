import {Module} from '@nestjs/common';
import {UsersService} from './application/./users.service';
import {UsersRepository} from './repositories/users.repository';
import {UsersController} from './users.controller';
import {MongooseModule} from '@nestjs/mongoose';
import {User, UserSchema} from './domain/users-schema';
import {AuthModule} from "../auth/auth.module";
import {UsersQueryRepository} from "./repositories/users.query-repository";

@Module({
    imports: [
        MongooseModule.forFeature([{name: User.name, schema: UserSchema}])],
    controllers: [UsersController],
    providers: [UsersService, UsersRepository, UsersQueryRepository],
    exports: [UsersService,UsersQueryRepository]

})
export class UsersModule {
}
