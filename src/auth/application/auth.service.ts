import {Injectable} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService) {
    }

    async validateUser(username: string, pass: string): Promise<any> {
        console.log(username,'st')
        let users = [{id: 1, login: 'login', password: '123'}, {id: 2, login: 'login2', password: '123'}]
        const user = users.find(_ => _.login === username);
        if (user && user.password === pass) {
            const {password, ...result} = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = {username: user.username, sub: user.userId};
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
