import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {appSettings} from "./app.settings";

export async function bootstrap() {
    const app = await NestFactory.create(AppModule);
   appSettings(app)
    // app.enableCors();

    // app.useGlobalPipes(new ValidationPipe())
    // app.useGlobalFilters( new HttpExceptionFilter());
    await app.listen(3000);
}

 bootstrap();
