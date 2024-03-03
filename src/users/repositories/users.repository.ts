import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { User, UserDocumentType } from '../domain/users-schema';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(user: any): Promise<UserDocumentType | false> {
    const response = new this.userModel(user);
    const getCreatedUser = await response.save();

    return response ? getCreatedUser : false;
  }

  async deleteUser(id: string): Promise<any> {
    const response = await this.userModel.deleteOne({ _id: new Types.ObjectId(id) });
    return response.deletedCount === 1 ? true : false;
  }

  async deleteAllData() {
    await this.userModel.deleteMany({});
    return true;
  }
}
