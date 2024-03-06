import { Type } from '@sinclair/typebox';
import { response } from 'inversify-express-utils';
import express from 'express';
import {
  Delete,
  Body,
  Controller,
  Path,
  Post,
  Put,
  Response,
  OperationId,
  Tags,
  Security,
} from '../../src';
import { inject } from 'inversify';

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
  @Response(201, 'Post created', postSchema)
  public createPost(
    @Body(postSchema) post: Post,
    @response() res: express.Response,
  ): void {
    posts.push(post);
    res.status(201).send(post);
  }

  @Put('/:postId', 'Update a existing post')
  @Response(200, 'Post updated', postSchema)
  @Response(404, 'Post not found')
  public updatePost(
    @Path('postId', Type.Number()) postId: number,
    @Body(postSchema, 'The post dto') post: Post,
    @response() res: express.Response,
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
  @Response(200, 'Post deleted')
  @Response(404, 'Post not found')
  @OperationId('deletePost')
  public del(
    @Path('postId', Type.Number(), 'The post id') postId: number,
    @response() res: express.Response,
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
