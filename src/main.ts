import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {appSettings} from "./app.settings";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import {  createWriteStream } from 'fs';
import { get } from 'http';
const serverUrl = 'https://nest-s4-w2.vercel.app'
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

    if (process.env.NODE_ENV === 'development') {

        // write swagger ui files
        get(
            `${serverUrl}/swagger/swagger-ui-bundle.js`, function
            (response) {
                response.pipe(createWriteStream('swagger-static/swagger-ui-bundle.js'));
                console.log(
                    `Swagger UI bundle file written to: '/swagger-static/swagger-ui-bundle.js'`,
                );
            });

        get(`${serverUrl}/swagger/swagger-ui-init.js`, function (response) {
            response.pipe(createWriteStream('swagger-static/swagger-ui-init.js'));
            console.log(
                `Swagger UI init file written to: '/swagger-static/swagger-ui-init.js'`,
            );
        });

        get(
            `${serverUrl}/swagger/swagger-ui-standalone-preset.js`,
            function (response) {
                response.pipe(
                    createWriteStream('swagger-static/swagger-ui-standalone-preset.js'),
                );
                console.log(
                    `Swagger UI standalone preset file written to: '/swagger-static/swagger-ui-standalone-preset.js'`,
                );
            });

        get(`${serverUrl}/swagger/swagger-ui.css`, function (response) {
            response.pipe(createWriteStream('swagger-static/swagger-ui.css'));
            console.log(
                `Swagger UI css file written to: '/swagger-static/swagger-ui.css'`,
            );
        });

    }

}

bootstrap();
