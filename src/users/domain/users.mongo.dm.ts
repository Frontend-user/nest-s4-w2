import { UserDocumentType, UserViewModel } from './users-schema';
import { WithId } from '../types/users.types';

export class UsersMongoDataMapper {
  static toView(user: UserDocumentType): WithId<UserViewModel> {
    return {
      id: String(user._id),
      login: user.accountData.login,
      email: user.accountData.email,
      createdAt: user.accountData.createdAt,
    };
  }
}
