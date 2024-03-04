import {correctBlogData, correctUser1, TestManager} from './test-manager.spec';
import mongoose from 'mongoose';
import {HttpStatus, INestApplication} from '@nestjs/common';
import {Test, TestingModule} from '@nestjs/testing';
import {AppModule} from '../app.module';
import {BlogsController} from '../blogs/blogs.controller';
import request from "supertest";
import {appSettings} from "../app.settings";
import {AuthController} from "../auth/presentation/auth.controller";
import {correctRegistrationData, inCorrectRegistrationData} from "./registration.data";
import {UserForTestModel, UserSchema} from "../users/domain/users-schema";
import {UsersRepository} from "../users/repositories/users.repository";
import {HTTP_STATUSES} from "../_common/constants";

describe('Blogs', () => {
    let app: INestApplication;
    // eslint-disable-next-line prefer-const
    let testManager: TestManager;
    let httpServer

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).overrideProvider(AuthController).useClass(AuthController).compile()  // .useValue({
        //     s: 'q',
        // })
        // .compile();
        // app = moduleRef.createNestApplication();
        //
        app = moduleFixture.createNestApplication()
        appSettings(app)
        await app.init();

        httpServer = app.getHttpServer()
        testManager = new TestManager(app, httpServer);

    });

    // beforeAll(async () => {
    //     const moduleRef = await Test.createTestingModule({
    //         imports: [AppModule],
    //     })
    //         .overrideProvider(BlogsController)
    //         .useValue({
    //             s: 'q',
    //         })
    //         .compile();
    //     app = moduleRef.createNestApplication();
    //
    //     await app.init();
    //     testManager = new TestManager(app);
    // });
    const mongoURI = process.env.MONGO_NEST_URL as string;
    beforeAll(async () => {
        await mongoose.connect(mongoURI);
    });
    afterAll(async () => {
        await mongoose.connection.close();
    });
    afterAll(async () => {
        await app.close();
    });
    it('TEST DELETE ALL', async () => {
        await testManager.deleteAll();
    });


    describe('Users', () => {
        it('TEST DELETE ALL', async () => {
            await testManager.deleteAll();
        });

        it('get users', async () => {
            const reponse = await testManager.getUsers();
            expect(reponse).toEqual({"items": [], "page": 1, "pageSize": 10, "pagesCount": 1, "totalCount": 0})
        });


        let uses1_id: string
        it('should Create User BY SuperAdmin', async () => {
            const reponse = await testManager.createUserBySuperAdmin();
            expect(reponse).toEqual({
                createdAt: expect.any(String),
                email: expect.any(String),
                id: expect.any(String),
                login: expect.any(String)
            })
            uses1_id = reponse.id
        });

        it('should Delete User BY SuperAdmin', async () => {
            const reponse = await testManager.deleteUserBySuperAdmin(uses1_id);
            expect(reponse).toEqual(204)
        });
        it('get users', async () => {
            const reponse = await testManager.getUsers();
            expect(reponse).toEqual({"items": [], "page": 1, "pageSize": 10, "pagesCount": 1, "totalCount": 0})
        });

    })

    describe('Auth', () => {
        it('TEST DELETE ALL', async () => {
            await testManager.deleteAll();
        });

        it('get users', async () => {
            const reponse = await testManager.getUsers();
            expect(reponse).toEqual({"items": [], "page": 1, "pageSize": 10, "pagesCount": 1, "totalCount": 0})
        });

        const loginCorrectData = {
            loginOrEmail: "login",
            password: "password"
        }
        let uses1_id: string
        it('should Create User BY SuperAdmin', async () => {
            const reponse = await testManager.createUserBySuperAdmin();
            expect(reponse).toEqual({
                createdAt: expect.any(String),
                email: expect.any(String),
                id: expect.any(String),
                login: expect.any(String)
            })
            uses1_id = reponse.id
        });

        let refreshToken: string
        it('Login created user by superadmin', async () => {
            const reponse: any = await testManager.loginCreatedUserBySuperAdmin(loginCorrectData);
            refreshToken = reponse.header['set-cookie']
            expect(JSON.parse(reponse.text)).toEqual('accesstokem')
        });

        it('Lget REFRESHTOKEN', async () => {
            const reponse = await testManager.testFunc(refreshToken);
            expect(reponse).toEqual('refreshTOken')
        });
    })


    describe('Registration', () => {
        it('TEST DELETE ALL', async () => {
            await testManager.deleteAll();
        });

        it('get users', async () => {
            const reponse = await testManager.getUsers();
            expect(reponse).toEqual({"items": [], "page": 1, "pageSize": 10, "pagesCount": 1, "totalCount": 0})
        });
        let confirmationCode: any
        it('Correct registration', async () => {
            const reponse: any = await testManager.registration(correctRegistrationData);
            confirmationCode = JSON.parse(reponse.text).confirmationCode
            // expect(reponse.status).toEqual(204)
            expect(confirmationCode).toEqual(204)
        });
        it('IS EXIST Correct registration', async () => {
            const reponse: any = await testManager.registration(correctRegistrationData);
            // expect(reponse.status).toEqual(204)
            expect(reponse.text).toEqual(204)
        });
        it('InCORRECT registration', async () => {
            const reponse: any = await testManager.registration(inCorrectRegistrationData);
            expect(reponse.status).toEqual(400)
            expect(JSON.parse(reponse.text)).toEqual({
                errorsMessages: [
                    {
                        message: expect.any(String),
                        field: expect.any(String)
                    }, {
                        message: expect.any(String),
                        field: expect.any(String)
                    }, {
                        message: expect.any(String),
                        field: expect.any(String)
                    },
                ]
            })
        });

        it(' registrationConfirmation should true', async () => {
            const reponse: any = await testManager.registrationConfirmation(confirmationCode);
            const dbUsers = await UserForTestModel.find({}).lean()
            // expect(dbUsers).toEqual('ONe')
            expect(JSON.parse(reponse.text)).toEqual(204)
        });
        it(' registrationConfirmation should FALSE', async () => {
            const reponse: any = await testManager.registrationConfirmation(confirmationCode);
            const dbUsers = await UserForTestModel.find({}).lean()
            // expect(dbUsers).toEqual('ONe')
            expect(JSON.parse(reponse.text)).toEqual(204)
        });
        it(' registrationEmailResending should true', async () => {
            const reponse: any = await testManager.registrationEmailResending(correctRegistrationData.email);
            // expect(reponse).toEqual(204)
            expect(reponse.status).toEqual(204)
        });


        it(' registrationEmailResending should false', async () => {
            const reponse: any = await testManager.registrationEmailResending(inCorrectRegistrationData.email);
            // expect(reponse).toEqual('s')
            expect(reponse.text).toEqual(HTTP_STATUSES.SOMETHING_WRONG_400)
        });

        it('get users', async () => {
            const reponse = await testManager.getUsers();
            const dbUsers = await UserForTestModel.find({}).lean()
            expect(dbUsers).toEqual('ONe')
            expect(reponse.length).toEqual(1)
        });
    })


    // let blog_1: any;
    // let post_1: any;
    // it('TEST DELETE ALL', async () => {
    //     await testManager.deleteAll();
    // });
    // it(`CREATE BLOG`, async () => {
    //     blog_1 = await testManager.createBlog();
    //     expect(blog_1).toEqual('s');
    // });
    //
    // it(`CREATE POST BY BLOG ID`, async () => {
    //     post_1 = await testManager.craetePostByBlogId(blog_1.id);
    //     console.log(post_1, 'post create by blogid');
    //     expect(post_1).toEqual('s');
    // });
    //
    // it(`Delete POST`, async () => {
    //     const result = await testManager.deletePost(post_1.id);
    //     console.log(result, 'post create by blogid');
    //     expect(result).toEqual('s');
    // });
    //
    // it(`Get POSTs BY BLOG ID`, async () => {
    //     await testManager.getPostsByBlogId(blog_1.id);
    //     console.log(blog_1, 'blogid');
    // });
    //
    // it(`create Post in posts`, async () => {
    //     const response: any = await testManager.createPostInPost(blog_1.id);
    //     expect(response).toEqual('s');
    //     console.log(response, 'response');
    // });
    //
    // it(`create Post in posts`, async () => {
    //     let postUp = await testManager.updatePost('s', blog_1.id);
    //     expect(postUp).toEqual('s');
    // });
    //
    // it(`CREATE BLOG`, async () => {
    //     blog_1 = await testManager.createBlog('aaaa');
    //     console.log(blog_1, 'createBlog');
    // });
    //
    // it(`CREATE BLOG`, async () => {
    //     blog_1 = await testManager.createBlog('bbbb');
    //     console.log(blog_1, 'createBlog');
    // });
    //
    // it(`CREATE BLOG`, async () => {
    //     blog_1 = await testManager.createBlog('cccc');
    //     console.log(blog_1, 'createBlog');
    // });
    //
    // it(`GET BLOGssss`, async () => {
    //     const allBlogs: any = await testManager.getBlogs('', 'name', 'asc',);
    //     // let s :any[]= [];
    //     // allBlogs.items.forEach((i:any) => {
    //     //   s.push(i.name);
    //     // });
    //     expect(allBlogs).toEqual('fsdfdssdf');
    //
    // });
    // it(`GET BLOG`, async () => {
    //   const getBlog: any = await testManager.getBlog(blog_1!.id);
    //   console.log(getBlog, 'getBLog');
    // });
    //

    // it(`GET POST`, async () => {
    //   const getPost: any = await testManager.getPost(post_1.id);
    //   console.log(getPost, 'getPOST');
    // });

    // it(`GET POSTs`, async () => {
    //   await testManager.getPosts();
    // });
    // it(`DELETE ALL DATA`, async () => {
    //   await TestManager.deleteAll();
    // });
});
