import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { createUserEntity, User } from '../domain/users-schema';
import { UsersMongoDataMapper } from '../domain/users.mongo.dm';
import { QueryUtilsClass } from '../../_common/query.utils';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel('User') private userModel: Model<User> & createUserEntity) {}

  async getUsers(
    searchLoginTerm?: string,
    searchEmailTerm?: string,
    sortBy?: string,
    sortDirection?: string,
    skip: number = 0,
    limit: number = 10,
  ): Promise<any> {
    let sb;
    if (sortBy) {
      sb = `accountData.${sortBy}`;
    } else {
      sb = 'accountData.createdAt';
    }
    console.log(sb);
    const sd = sortDirection ?? 'desc';

    const findQuery = QueryUtilsClass.__getUserSortingOR(searchLoginTerm, searchEmailTerm);
    const query = this.userModel.find(findQuery);
    const totalCount = this.userModel.find(findQuery);
    const sort = {};
    sort[sb] = sd;

    const users = await query.sort(sort).skip(skip).limit(limit).lean();
    if (users.length > 0) {
      const allUsers = await totalCount.countDocuments();

      return { totalCount: allUsers, users: users };
    } else return [];
  }
}
