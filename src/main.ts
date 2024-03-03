import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {HttpExceptionFilter} from "./exception.filter";
import {ValidationPipe} from "@nestjs/common";
import {appSettings} from "./app.settings";

export async function bootstrap() {
    const app = await NestFactory.create(AppModule);
   await appSettings(app)
    // app.enableCors();

    // app.useGlobalPipes(new ValidationPipe())
    // app.useGlobalFilters( new HttpExceptionFilter());
    await app.listen(3000);
}

 bootstrap();
