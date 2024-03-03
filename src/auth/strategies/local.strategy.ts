import {Injectable, UnauthorizedException} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {Strategy} from 'passport-local';
import {AuthService} from "../application/auth.service";
import {UsersQueryRepository} from "../../users/repositories/users.query-repository";
import {LoginOrEmailPasswordModel} from "../types/auth.types";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super({
            usernameField: 'loginOrEmail',
        });
    }

    async validate(authData:LoginOrEmailPasswordModel): Promise<any> {
        const user = await this.authService.validateUser(authData);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
