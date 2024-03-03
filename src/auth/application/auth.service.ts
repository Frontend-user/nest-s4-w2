import {Injectable} from '@nestjs/common';
import {UsersQueryRepository} from "../../users/repositories/users.query-repository";
import {MyJwtService} from "../../_common/jwt-service";
import {JwtService} from "@nestjs/jwt";
import {AccessRefreshTokens, LoginOrEmailPasswordClass, LoginOrEmailPasswordModel} from "../types/auth.types";

@Injectable()
export class AuthService {
    constructor(
        private readonly myJwtService: MyJwtService,
        private readonly jwtService: JwtService,
        private readonly usersQueryRepository: UsersQueryRepository,
    ) {
    }

    async validateUser(loginOrEmail:string,password:string): Promise<{ userId: string } | null> {
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

    async login(user: any):Promise<AccessRefreshTokens> {
        const payload = {userId: user.userId};
        const payloadForRefreshToken = {userId: user.userId};
        const accessToken = await this.myJwtService.createJWT(payload, '10s')
        const refreshToken = await this.myJwtService.createRefreshToken(payloadForRefreshToken, '10s')
        return {
            accessToken,
            refreshToken
        };
    }
}
