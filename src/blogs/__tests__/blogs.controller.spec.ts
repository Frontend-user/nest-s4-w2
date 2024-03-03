import { TestManager } from './test-manager.spec';
import mongoose from 'mongoose';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { BlogsController } from '../blogs.controller';

describe('Blogs', () => {
  let app: INestApplication;
  // eslint-disable-next-line prefer-const
  let testManager: TestManager;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(BlogsController)
      .useValue({
        s: 'q',
      })
      .compile();
    app = moduleRef.createNestApplication();

    await app.init();
    testManager = new TestManager(app);
  });
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
  let blog_1: any;
  let post_1: any;
  it('TEST DELETE ALL', async () => {
    await testManager.deleteBlog();
  });
  it(`CREATE BLOG`, async () => {
    blog_1 = await testManager.createBlog();
    expect(blog_1).toEqual('s');
  });

  it(`CREATE POST BY BLOG ID`, async () => {
    post_1 = await testManager.craetePostByBlogId(blog_1.id);
    console.log(post_1, 'post create by blogid');
    expect(post_1).toEqual('s');
  });

  it(`Delete POST`, async () => {
    const result = await testManager.deletePost(post_1.id);
    console.log(result, 'post create by blogid');
    expect(result).toEqual('s');
  });

  it(`Get POSTs BY BLOG ID`, async () => {
    await testManager.getPostsByBlogId(blog_1.id);
    console.log(blog_1, 'blogid');
  });

  it(`create Post in posts`, async () => {
    const response: any = await testManager.createPostInPost(blog_1.id);
    expect(response).toEqual('s');
    console.log(response, 'response');
  });

  it(`create Post in posts`, async () => {
    let postUp = await testManager.updatePost('s', blog_1.id);
    expect(postUp).toEqual('s');
  });

  // it(`CREATE BLOG`, async () => {
  //   blog_1 = await testManager.createBlog('aaaa');
  //   console.log(blog_1, 'createBlog');
  // });

  // it(`CREATE BLOG`, async () => {
  //   blog_1 = await testManager.createBlog('bbbb');
  //   console.log(blog_1, 'createBlog');
  // });

  // it(`CREATE BLOG`, async () => {
  //   blog_1 = await testManager.createBlog('cccc');
  //   console.log(blog_1, 'createBlog');
  // });

  // it(`GET BLOGssss`, async () => {
  //   const allBlogs: any = await testManager.getBlogs('','name','asc',2,1);
  //   // let s :any[]= [];
  //   // allBlogs.items.forEach((i:any) => {
  //   //   s.push(i.name);
  //   // });
  //   expect(allBlogs).toEqual('fsdfdssdf');
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
  //   await TestManager.deleteBlog();
  // });
});
