import {Body, Controller, Get, Param, Post, Res, Request, Response, UseGuards} from "@nestjs/common";
import {BasicAuthGuard} from "../guards/basic-auth.guart";
import {LocalAuthGuard} from "../guards/local-auth.guard";
import {AuthService} from "../application/auth.service";
import {UsersService} from "../../users/application/users.service";
import {UsersQueryRepository} from "../../users/repositories/users.query-repository";
import {JSONCookie} from "cookie-parser";
import {AccessRefreshTokens, LoginOrEmailPasswordModel} from "../types/auth.types";


@Controller('/auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {
    }

    @UseGuards(LocalAuthGuard)
    @Post('/login')
    async login(@Request() req, @Response() res, @Body() body:LoginOrEmailPasswordModel): Promise<{ accessToken: string } | void> {
        const {
            accessToken,
            refreshToken
        }: AccessRefreshTokens = await this.authService.login(body);
        if (accessToken && refreshToken) {

            res.cookie('refreshToken', refreshToken, {httpOnly: true, secure: true})
            res.status(201).send({accessToken})
            return
        }
        throw new Error('Something is not work')
    }

    // @UseGuards(BasicAuthGuard)
    @Get('/test')
    async testF(@Request() req) {
        console.log(req.headers.cookie,'olggggggggggggggg')
        return {refreshToken: req.header.cookie}
    }
}