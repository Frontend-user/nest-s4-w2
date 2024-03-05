import {Model} from 'mongoose';
import {InjectModel} from '@nestjs/mongoose';
import {Injectable} from '@nestjs/common';
import {createUserEntity, User, UserDocumentType} from '../domain/users-schema';
import {UsersMongoDataMapper} from '../domain/users.mongo.dm';
import {QueryUtilsClass} from '../../_common/query.utils';
import {UsersQueryTransformPipeTypes} from "../pipes/UsersQueryTransformPipe";

@Injectable()
export class UsersQueryRepository {
    constructor(@InjectModel('User') private userModel: Model<User> & createUserEntity) {
    }

    async getUserByEmailOrLogin(loginOrEmail: String): Promise<UserDocumentType | null> {
        const response: UserDocumentType | null = await this.userModel.findOne({$or: [{'accountData.login': loginOrEmail}, {'accountData.email': loginOrEmail}]}).lean()
        return response ? response : null
    }

 async getUserEmailByConfirmCode(code: string): Promise<UserDocumentType | null> {
        const response: UserDocumentType | null = await this.userModel.findOne({'emailConfirmation.confirmationCode': code}).lean()
        return response ? response : null
    }

    async getUsers(usersQueries:any): Promise<any> {
        console.log(usersQueries.findQuery,'findQuery')
        const query = this.userModel.find(usersQueries.findQuery);
        const totalCount = this.userModel.find(usersQueries.findQuery);
        let users
        try {
            users = await query.sort(usersQueries.sortParams).skip(usersQueries.skip).limit(usersQueries.limit).lean();

        } catch (e) {
            return []
        }
        if (users.length > 0) {
            const allUsers = await totalCount.countDocuments();

            return {totalCount: allUsers, users: users};
        } else return [];
    }
}
