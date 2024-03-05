import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpException, HttpStatus,
    Param,
    Post,
    Put,
    Query,
    Res,
    UseGuards
} from '@nestjs/common';
import {UsersService} from './application/./users.service';
import {UsersRepository} from './repositories/users.repository';
import {UsersQueryRepository} from './repositories/users.query-repository';
import {UserCreateModel, UserDocumentType} from './domain/users-schema';
import {BlogsQueryRepository} from '../blogs/repositories/blogs.query-repository';
import {HTTP_STATUSES} from '../_common/constants';
import {UsersMongoDataMapper} from './domain/users.mongo.dm';
import {QueryUtilsClass} from '../_common/query.utils';
import {BasicAuthGuard} from "../auth/guards/basic-auth.guart";
import {IsEmail, IsInt, IsString, Length} from "class-validator";
import {UsersQueryTransformPipe, UsersQueryTransformTypes} from "./pipes/UsersQueryTransformPipe";

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
                const response = {
                    pagesCount: 1,
                    page: 1,
                    pageSize: 10,
                    totalCount: 0,
                    items: [],
                };

                return response
            }
            let changeUsers;
            try {
                changeUsers = users.map((b: UserDocumentType) => UsersMongoDataMapper.toView(b));
            } catch (e) {
                throw new HttpException('Failed to try get users', HttpStatus.BAD_REQUEST)
            }
            const pagesCount = Math.ceil(totalCount / usersQueries.newPageSize);

            const response = {
                pagesCount: pagesCount,
                page: usersQueries.newPageNumber,
                pageSize: usersQueries.newPageSize,
                totalCount: totalCount,
                items: changeUsers,
            };
            return response
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
