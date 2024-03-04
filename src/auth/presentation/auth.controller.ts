import {Body, Controller, Get, Param, Post, Res, Request, Response, UseGuards} from "@nestjs/common";
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
    @Post('/login')
    async login(@Request() req, @Response() res, @Body() body: LoginOrEmailPasswordModel): Promise<{
        accessToken: string
    } | void> {
        const {
            accessToken,
            refreshToken
        }: AccessRefreshTokens = await this.authService.login(body);
        if (accessToken && refreshToken) {

            res.cookie('refreshToken', refreshToken, {httpOnly: true, secure: true})
            res.status(200).send({accessToken})
            return
        }
        throw new Error('Something is not work')
    }

    @UseGuards(RegistrationGuard)
    @Post('/registration')
    async registration(@Request() req, @Response() res, @Body() body: RegistrationDataClass) {
        try {

            const response = await this.authService.registration(body)

            if (!response) {
                res.sendStatus(HTTP_STATUSES.SOMETHING_WRONG_400)
                return
            }

            // res.send({confirmationCode:response})
            res.send(204)

        } catch (error) {
            res.sendStatus(HTTP_STATUSES.SERVER_ERROR_500)
        }
    }

    @Post('/registration-email-resending')
    async registrationEmailResending(@Body() body: EmailValidClass, @Response() res) {
        try {

            const response = await this.authService.registrationEmailResending(body.email)
            if (!response) {
                res.sendStatus(HTTP_STATUSES.SOMETHING_WRONG_400)
                return
            }

            // res.status(204).send({confirmationCode:response})
            res.sendStatus(204)

        } catch (error) {
            res.sendStatus(HTTP_STATUSES.SERVER_ERROR_500)
        }
    }

    // @UseGuards(CodeConfirmGuard)
    @Post('/registration-confirmation')
    async registrationConfirmation(@Body() body: ConfirmationCodeClass, @Response() res)  {
        try {
            const response = await this.authService.registrationConfirmation(body.code)
            if (!response) {
                res.sendStatus(HTTP_STATUSES.SOMETHING_WRONG_400)
                return
            }

            res.send(204)

        } catch (error) {
            res.sendStatus(HTTP_STATUSES.SERVER_ERROR_500)
        }
    }


    // @UseGuards(BasicAuthGuard)
    @Get('/test')
    async testF(@Request() req) {
        console.log(req.headers.cookie, 'olggggggggggggggg')
        return {refreshToken: req.header.cookie}
    }
}