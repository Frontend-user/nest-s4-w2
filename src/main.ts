import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {HttpExceptionFilter} from "./exception.filter";
import {BadRequestException, ValidationPipe} from "@nestjs/common";
import {appSettings} from "./app.settings";
import cookieParser from "cookie-parser";
import {useContainer} from "class-validator";

export async function bootstrap() {
    const app = await NestFactory.create(AppModule);
   // appSettings(app)
    // app.enableCors();
    // app.use(cookieParser())
    app.enableCors()
    useContainer(app.select(AppModule), {fallbackOnErrors: true});
    app.useGlobalPipes(new ValidationPipe(
        {

            transform: true,
            stopAtFirstError: false,
            exceptionFactory: (errors) => {
                const errorsMessages: any = []
                errors.forEach((e) => {
                    if (e.constraints) {
                        let s = Object.keys(e.constraints)
                        s.forEach((key) => {
                            if (e.constraints) {
                                errorsMessages.push({
                                    field: e.property,
                                    message: e.constraints[key]
                                })
                            }
                        })
                    }
                })
                // errors.forEach((e) => {
                //     const constraintKeys = Object.keys(e.constraints)
                //     constraintKeys.forEach((ckey) => {
                //         errorsMessages.push(
                //             {
                //                 message: e.constraints[ckey],
                //                 field: e.property
                //             }
                //         )
                //     })
                //
                // })
                throw new BadRequestException({errorsMessages})
            }

        }
    ))
    // app.useGlobalPipes(new ValidationPipe())
    // app.useGlobalFilters( new HttpExceptionFilter());
    await app.listen(3000);
}

bootstrap();
