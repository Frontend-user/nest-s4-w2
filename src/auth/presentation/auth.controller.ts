import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Res,
    Request,
    Response,
    UseGuards,
    BadRequestException, HttpCode, NotFoundException, HttpException
} from "@nestjs/common";
import {LocalAuthGuard} from "../guards/local-auth.guard";
import {AuthService} from "../application/auth.service";
import {
    AccessRefreshTokens, ConfirmationCodeClass,
    EmailValidClass,
    LoginOrEmailPasswordModel,
    RegistrationDataClass
} from "../types/auth.types";
import {HTTP_STATUSES} from "../../_common/constants";
import {RegistrationGuard} from "../guards/registration.guard";


@Controller('/auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {
    }

    @UseGuards(LocalAuthGuard)
    @HttpCode(200)
    @Post('/login')
    async login(@Response({passthrough:true}) res, @Body() body: LoginOrEmailPasswordModel): Promise<{
        accessToken: string
    } | void> {
        const {
            accessToken,
            refreshToken
        }: AccessRefreshTokens = await this.authService.login(body);
        if (accessToken && refreshToken) {

            res.cookie('refreshToken', refreshToken, {httpOnly: true, secure: true})

            return   {accessToken}
        }
        throw new Error('Something is not work')
    }

    @HttpCode(204)
    @Post('/registration')
    async registration(@Body() body: RegistrationDataClass) {
        const response = await this.authService.registration(body)
        if (!response) {
            throw new HttpException('Falied registration', 400)
        }
    }

    @HttpCode(204)
    @Post('/registration-email-resending')
    async registrationEmailResending(@Body() body: EmailValidClass) {

        const response = await this.authService.registrationEmailResending(body.email)
        if (!response) {
            throw new HttpException({message: 'wrong email', field: "email"}, 400)
        }

    }

    @Post('/registration-confirmation')
    @HttpCode(204)
    async registrationConfirmation(@Body() body: any) {
        console.log(body)
        const response = await this.authService.registrationConfirmation(body.code)
        if (!response) {
            throw new HttpException({field: 'code', message: 'code in Invalid'}, 400)
        }

    }

}