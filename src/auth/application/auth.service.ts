import {Injectable} from '@nestjs/common';
import {UsersQueryRepository} from "../../users/repositories/users.query-repository";
import {MyJwtService} from "../../_common/jwt-service";
import {JwtService} from "@nestjs/jwt";
import {v4 as uuidv4} from 'uuid'
import {add} from 'date-fns/add';

import {
    AccessRefreshTokens, ConfirmationCodeClass,
    LoginOrEmailPasswordClass,
    LoginOrEmailPasswordModel,
    RegistrationDataClass
} from "../types/auth.types";
import {User} from "../../users/domain/users-schema";
import {UsersRepository} from "../../users/repositories/users.repository";
import {NodemailerService} from "../../_common/nodemailer-service";


@Injectable()
export class AuthService {
    constructor(
        private readonly myJwtService: MyJwtService,
        private readonly jwtService: JwtService,
        private readonly usersQueryRepository: UsersQueryRepository,
        private readonly usersRepository: UsersRepository,
        private readonly nodemailerService: NodemailerService,
    ) {
    }

    async validateUser(loginOrEmail: string, password: string): Promise<{ userId: string } | null> {
        const getUserForAuth = await this.usersQueryRepository.getUserByEmailOrLogin(loginOrEmail)
        if (getUserForAuth) {
            const passwordSalt = getUserForAuth.passwordSalt
            const passwordHash = getUserForAuth.passwordHash
            const newPasswordHash = await this.myJwtService.generateHash(password, passwordSalt)
            if (newPasswordHash === passwordHash) {
                return {userId: String(getUserForAuth._id)}
            }
        }
        return null;
    }

    async login(user: any): Promise<AccessRefreshTokens> {
        const payload = {userId: user.userId};
        const payloadForRefreshToken = {userId: user.userId};
        const accessToken = await this.myJwtService.createJWT(payload, '10s')
        const refreshToken = await this.myJwtService.createRefreshToken(payloadForRefreshToken, '10s')
        return {
            accessToken,
            refreshToken
        };
    }


    async registration(userInputData: RegistrationDataClass) {
        const passwordSalt = await this.myJwtService.generateSalt(10)
        const passwordHash = await this.myJwtService.generateHash(userInputData.password, passwordSalt)
        const confirmationCode = uuidv4()
        const confirmationDate = add(new Date(), {hours: 1, minutes: 3})
        const userEmailEntity: User = await User.createUserEntity(userInputData, false, confirmationCode, confirmationDate)

        const mailSendResponse = await this.nodemailerService.send(userEmailEntity.emailConfirmation.confirmationCode, userInputData.email)
        if (mailSendResponse) {
        const userId = await this.usersRepository.createUser(userEmailEntity)
        return !!userId
        // return confirmationCode
        }
        return false

    }


    async registrationConfirmation(code: string): Promise<boolean> {
            const updateIsConfirmed = await this.usersRepository.updateIsConfirmed(code, true)

            if (updateIsConfirmed) {
                return true
            }
            return false
    }

    async registrationEmailResending(email: string) {
        const getUserForAuth = await this.usersQueryRepository.getUserByEmailOrLogin(email)
        if (getUserForAuth) {
            if(getUserForAuth.isConfirmed){
                return false
            }
            const newConfirmationCode = uuidv4()
            const isUpdateUser = await this.usersRepository.updateUserConfirmationCode(String(getUserForAuth._id), newConfirmationCode)
            if (isUpdateUser) {
                await this.nodemailerService.send(newConfirmationCode, email)
                // return newConfirmationCode
                return true
            } else {
                return false
            }

        }
        return false
    }

}
