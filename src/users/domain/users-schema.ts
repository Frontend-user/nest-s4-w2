import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';
import { JwtService } from '../../_common/jwt-service';
import {CreateUserInputModelType} from "../users.controller";

export type UserDocumentType = HydratedDocument<User>;
export type UserAccountDBMethodsType = {
  canBeConfirmed: () => boolean;
};

// export type PostModelType = Model<Post, {}, PostAccountDBMethodsType>;

// export type BlogModelType = Model<Blog, {}, BlogAccountDBMethodsType>
@Schema()
export class User {
  name: 'User';
  @Prop({ type: SchemaTypes.Mixed, required: true }) accountData: UserAccountDataModel;

  @Prop() passwordSalt: string;

  @Prop() passwordHash: string;

  @Prop({ type: SchemaTypes.Mixed, required: true }) emailConfirmation: UserEmailConfirmationModel;

  @Prop() isConfirmed: boolean;
  @Prop() isCreatedFromAdmin: boolean;

  static async createUserEntity(user: CreateUserInputModelType, isReqFromSuperAdmin: boolean) {
    const passwordSalt = await JwtService.generateSalt(10);
    const passwordHash = await JwtService.generateHash(user.password, passwordSalt);
    const userEntity: any = {
      accountData: {
        login: user.login,
        email: user.email,
        createdAt: new Date(),
      },
      passwordSalt,
      passwordHash,
      emailConfirmation: {
        confirmationCode: 'superadmin',
        expirationDate: new Date(),
      },
      isConfirmed: isReqFromSuperAdmin,
      isCreatedFromAdmin: true,
    };

    return userEntity;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.statics = {
  createUserEntity: User.createUserEntity,
};

export type createUserEntity = (
  user: UserCreateModel,
  isReqFromSuperAdmin: boolean,
) => Promise<User>;

export type UserCreateModel = {
  login: string;
  password: string;
  email: string;
};

export type UserViewModel = {
  id: string;
  login: string;
  email: string;
  createdAt: Date;
};
type UserAccountDataModel = {
  login: string;
  email: string;
  createdAt: Date;
};
type UserEmailConfirmationModel = {
  confirmationCode: string;
  expirationDate: Date;
};
