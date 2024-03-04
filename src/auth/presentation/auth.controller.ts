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

    // @UseGuards(RegistrationGuard)
    @HttpCode(204)
    @Post('/registration')
    async registration(@Body() body: RegistrationDataClass) {
            const response = await this.authService.registration(body)
            if (!response) {
                throw new HttpException({'asddddddddd':'dsdsds'},400)
            }
    }

    @Post('/registration-email-resending')
    async registrationEmailResending(@Body() body: EmailValidClass, @Response() res) {

            const response = await this.authService.registrationEmailResending(body.email)
            if (!response) {
                res.status(400).send({errorsMessages: [{message: ';String', field: "email"}]})
                // res.sendStatus(HTTP_STATUSES.SOMETHING_WRONG_400)
                return
            }

            // res.status(204).send({confirmationCode:response})
            res.sendStatus(204)

    }

    @Post('/registration-confirmation')
    @HttpCode(204)
    async registrationConfirmation(@Body() body: any ) {
        console.log(body)
            const response = await this.authService.registrationConfirmation(body.code)
            if (!response) {
                throw new HttpException({field: 'code', message: 'code in unvalid'},400)
            }

    }


    // @UseGuards(BasicAuthGuard)
    @Get('/test')
    async testF(@Request() req) {
        console.log(req.headers.cookie, 'olggggggggggggggg')
        return {refreshToken: req.header.cookie}
    }
}