import { Type } from '@sinclair/typebox';
import express from 'express';
import { inject } from 'inversify';
import { response } from 'inversify-express-utils';
import {
  Body,
  Controller,
  Delete,
  OperationId,
  Path,
  Post,
  Put,
  Response,
  Security,
  Tags,
  injectResponse,
} from '../../src';
import { IdentifiableObject } from '../../src';
import { ExampleObjectOf } from '../../src/type';

export type Post = {
  id: number;
  userId: number;
  title: string;
  content: string;
  createdAt: string;
};

export const postSchema = Type.Object(
  {
    id: Type.Number(),
    userId: Type.Number(),
    title: Type.String(),
    content: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
  },
  { $id: 'Post' },
);

const postExample: IdentifiableObject<ExampleObjectOf<Post>> = {
  $id: 'PostExample',
  value: {
    id: 9238721,
    userId: 9311,
    title: 'Dear community',
    content: 'I am happy to announce that we have a new feature!',
    createdAt: '2024-03-08T14:12:31Z',
  },
};

export const posts: Post[] = [];

@Controller('/api/posts')
@Tags('Posts')
@Security({ bearerAuth: ['user', 'poster'] })
export class TestOaController310Post {
  public someRandomProperty: string;

  public constructor(@inject('SomeService') someService: string) {
    this.someRandomProperty = someService;
  }

  @Post('/', 'Create a new post')
  @Response(201, {
    description: 'Post created',
    content: { schema: postSchema },
  })
  public createPost(
    @Body(postSchema, {
      description: 'A new post',
      examples: { postExample },
    })
    post: Post,
    @injectResponse() res: express.Response,
  ): void {
    posts.push(post);
    res.status(201).send(post);
  }

  @Put('/:postId', 'Update a existing post')
  @Response(200, {
    description: 'Post updated',
    content: { schema: postSchema },
  })
  @Response(404, { description: 'Post not found' })
  public updatePost(
    @Path('postId', Type.Number()) postId: number,
    @Body(postSchema, {
      description: 'The post dto',
      examples: { postExample },
    })
    post: Post,
    @injectResponse() res: express.Response,
  ): void {
    const index = posts.findIndex((p) => p.id === postId);
    if (index) {
      posts[index] = post;
      res.send(post);
      return;
    }
    res.status(404).send('Post not found');
  }

  @Delete('/:postId', 'Delete a post')
  @Response(200, { description: 'Post deleted' })
  @Response(404, { description: 'Post not found' })
  @OperationId('deletePost')
  public del(
    @Path('postId', Type.Number(), { description: 'The post id' })
    postId: number,
    @injectResponse() res: express.Response,
  ): void {
    const index = posts.findIndex((p) => p.id === postId);
    if (index) {
      posts.splice(index, 1);
      res.send('Post deleted');
      return;
    }
    res.status(404).send('Post not found');
  }
}
