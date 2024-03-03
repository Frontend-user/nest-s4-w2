import {ArgumentsHost, Catch, ExceptionFilter, HttpException} from "@nestjs/common";

import { Request, Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();

        if (status === 500) {
            response.status(status).json(exception);
        }

        if (status === 400) {
            const errorResponse:any = {
                errors: []
            };

            const responseBody: any = exception.getResponse();

            responseBody.message.forEach((m:any) => {
                errorResponse.errors.push(m);
            });
            response.status(status)
                .json(errorResponse);
        } else {
            response.status(status)
                .json({
                    statusCode: status,
                    timestamp: new Date().toISOString(),
                    path: request.url
                });
        }
    }
}