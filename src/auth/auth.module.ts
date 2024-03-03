import {Module} from '@nestjs/common';
import {AuthController} from "./auth.controller";
import {BasicStrategy} from "./strategies/basic.strategy";
import {AuthService} from "./application/auth.service";
import {JwtModule} from "@nestjs/jwt";
import {LocalStrategy} from "./strategies/local.strategy";

@Module({
    imports: [
        JwtModule.register({
            secret: '123456',
            signOptions: {expiresIn: '5m'},
        }),
        // MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    ],
    controllers: [AuthController],
    providers: [BasicStrategy, AuthService, LocalStrategy],
})
export class AuthModule {
}
