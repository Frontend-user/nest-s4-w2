import {Body, Controller, Get, Param, Post, Res,Request, UseGuards} from "@nestjs/common";
import {BasicAuthGuard} from "./guards/basic-auth.guart";
import {LocalAuthGuard} from "./guards/local-auth.guard";
import {AuthService} from "./application/auth.service";


@Controller('/auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) {
    }

    @UseGuards(LocalAuthGuard)
    @Post('/login')
    async login(@Request() req): Promise<any> {
        return this.authService.login(req.user);

        // if (!blog) {
        //     res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        //     return;
        // }
        // const mappedBlog = BlogsMongoDataMapper.toView(blog);
        // res.status(200).send(mappedBlog);
    }

    @UseGuards(BasicAuthGuard)
    @Get('/test')
    async testF() {
        return {SUperadmin: 'Hello!'}
    }
}