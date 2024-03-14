import { Static, Type } from '@sinclair/typebox';
import { response } from 'inversify-express-utils';
import express from 'express';
import { Body, Controller, Post, Response, Tags, Deprecated } from '../../src';
import { inject } from 'inversify';

const posts: string[] = [];

const deprecatedPostSchema = Type.String();
type DeprecatedPost = Static<typeof deprecatedPostSchema>;

@Controller('/api/postings')
@Tags('Posts')
@Deprecated()
export class TestOaController310DeprecatedPost {
  public someRandomProperty: string;

  public constructor(@inject('SomeService') someService: string) {
    this.someRandomProperty = someService;
  }

  @Post('/', 'Create a new post')
  @Response(201, 'Post created', Type.String())
  public createPost(
    @Body(deprecatedPostSchema, 'A new post', { example: { value: 'example' } })
    post: DeprecatedPost,
    @response() res: express.Response,
  ): void {
    posts.push(post);
    res.status(201).send(post);
  }
}
