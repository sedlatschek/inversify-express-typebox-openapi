import 'reflect-metadata';
import { BaseHttpController, response } from 'inversify-express-utils';
import { type Response } from 'express';
import {
  Body,
  Controller,
  Cookie,
  Delete,
  Get,
  Header,
  Path,
  Post,
  Put,
  Query,
} from '../decorate';
import { Static, Type } from '@sinclair/typebox';

export const PostSchema = Type.Object(
  {
    id: Type.String(),
    text: Type.String(),
    visible: Type.Boolean(),
    createdAt: Type.String({ format: 'date-time' }),
  },
  { $id: 'Post' },
);

export type Post = Static<typeof PostSchema>;

const post = {
  id: 3,
  text: 'lorem ipsum',
  visible: true,
  createdAt: '2021-01-01T00:00:00Z',
};

@Controller('/api/posts')
export class PostController extends BaseHttpController {
  @Get('/')
  public async get(@response() res: Response): Promise<void> {
    res.status(200).send('Hello, world!');
  }

  @Get('/:postId')
  public async getPost(
    @Cookie('session', Type.String()) _session: string,
    @Path('postId', Type.String({ format: 'numeric' })) _postId: string,
    @response() res: Response,
  ): Promise<void> {
    res.status(200).send(post);
  }

  @Post('')
  public async postPost(
    @Header('X-Something', Type.String()) _something: string,
    @Query('date', Type.String()) _date: string,
    @Body(PostSchema) body: Post,
    @response() res: Response,
  ): Promise<void> {
    res.status(201).send(body);
  }

  @Put('/:postId')
  public async putPost(@Body(PostSchema) body: Post): Promise<Post> {
    return body;
  }

  @Delete('/:postId')
  public async deletePost(
    @Path('postId', Type.String({ format: 'numeric' })) _postId: string,
    @response() res: Response,
  ): Promise<void> {
    res.status(204).send();
  }
}
