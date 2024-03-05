import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpException, HttpStatus,
    Param,
    Post,
    Query,
    UseGuards
} from '@nestjs/common';
import {UsersService} from './application/./users.service';
import {UsersQueryRepository} from './repositories/users.query-repository';
import { UserDocumentType} from './domain/users-schema';
import {UsersMongoDataMapper} from './domain/users.mongo.dm';
import {BasicAuthGuard} from "../auth/guards/basic-auth.guart";
import {IsEmail, IsString, Length} from "class-validator";
import {UsersQueryTransformPipe, UsersQueryTransformTypes} from "./pipes/users-query-transform-pipe";
import {CommonResponseFabric} from "../_common/common-mapper";

export class CreateUserInputModelType {
    @Length(3, 10)
    @IsString()
    login: string;

    @Length(6, 20)
    @IsString()
    password: string;

    @IsEmail()
    email: string;


};

@Controller('/users')
export class UsersController {
    constructor(
        protected usersService: UsersService,
        protected usersQueryRepository: UsersQueryRepository
    ) {
    }

    @Get()
    async getUsers(@Query(UsersQueryTransformPipe) usersQueries: UsersQueryTransformTypes) {
        try {
            const {totalCount, users} = await this.usersQueryRepository.getUsers(usersQueries);
            if (!totalCount) {
                return UsersMongoDataMapper.createAndGetClearResponse()
            }
            return CommonResponseFabric.createAndGetResponse(usersQueries, users, totalCount,UsersMongoDataMapper)
        } catch (error) {
            console.error('Ошибка при получении данных из коллекции:', error);
            throw new HttpException('Failed to try get users', HttpStatus.BAD_REQUEST)

        }
    }


    @UseGuards(BasicAuthGuard)
    @HttpCode(201)
    @Post()
    async createUser(@Body() body: CreateUserInputModelType) {
        try {
            const isReqFromSuperAdmin = true;
            try {
                const response: UserDocumentType | false = await this.usersService.createUser(
                    body,
                    isReqFromSuperAdmin,
                );
                if (response) {
                    return UsersMongoDataMapper.toView(response)
                }
            } catch (e) {
                console.log(e, 'error');
            }
        } catch (error) {
            throw new HttpException('Failed to createUser', HttpStatus.BAD_REQUEST)
        }
    }

    @UseGuards(BasicAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete('/:id')
    async deleteUser(@Param('id') id: string) {
        try {
            const response: any = await this.usersService.deleteUser(id);
            if (!response) {
                throw new HttpException('Failed to deleteUser', HttpStatus.NOT_FOUND)
            }
        } catch (error) {
            throw new HttpException('Failed to deleteUser', HttpStatus.NOT_FOUND)
        }
    }
}
