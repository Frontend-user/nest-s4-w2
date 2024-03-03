import { UsersRepository } from '../repositories/users.repository';
import { JwtService } from '../../_common/jwt-service';
import { PostsQueryRepository } from '../../posts/repositories/posts.query-repository';
import { User, UserCreateModel, UserDocumentType } from '../domain/users-schema';
import { Injectable } from '@nestjs/common';
import {IsEmail, IsInt, Length} from "class-validator";
import {CreateUserInputModelType} from "../users.controller";




@Injectable()
export class UsersService {
  constructor(
    protected usersRepositories: UsersRepository,
    protected postsQueryRepository: PostsQueryRepository,
  ) {}

  async createUser(
    user: CreateUserInputModelType,
    isReqFromSuperAdmin: boolean,
  ): Promise<UserDocumentType | false> {
    const userEmailEntity: User = await User.createUserEntity(user, isReqFromSuperAdmin);
    const newUser = await this.usersRepositories.createUser(userEmailEntity);
    if (!newUser) {
      return false;
    }
    return newUser;
  }

  async deleteAllData() {
    return await this.usersRepositories.deleteAllData();
  }

  async deleteUser(id: string): Promise<any> {
    return await this.usersRepositories.deleteUser(id);
  }
}
