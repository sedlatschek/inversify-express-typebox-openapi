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
} from '../../src/decorate';

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
export class TestOaController310Post {
  @Post('/')
  @Response(201, 'Post created', postSchema)
  public createPost(
    @Body(postSchema) post: Post,
    @response() res: express.Response,
  ): void {
    posts.push(post);
    res.status(201).send(post);
  }

  @Put('/:postId')
  @Response(200, 'Post updated', postSchema)
  @Response(404, 'Post not found')
  public updatePost(
    @Path('postId', Type.Number()) postId: number,
    @Body(postSchema) post: Post,
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

  @Delete('/:postId')
  @Response(200, 'Post deleted')
  @Response(404, 'Post not found')
  @OperationId('deletePost')
  public deletePost(
    @Path('postId', Type.Number()) postId: number,
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
