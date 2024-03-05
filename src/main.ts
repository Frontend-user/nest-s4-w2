import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {appSettings} from "./app.settings";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    appSettings(app)
    const config = new DocumentBuilder()
        .setTitle('Blogs-example')
        .setDescription('The cats API description')
        .setVersion('1.0')
        .addTag('blogs')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('swagger', app, document);
    await app.listen(3000);
}

bootstrap();
