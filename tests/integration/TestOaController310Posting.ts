import { Static, Type } from '@sinclair/typebox';
import express from 'express';
import { response } from 'inversify-express-utils';
import { Body, Controller, Deprecated, Post, Response, Tags } from '../../src';

const postings: string[] = [];

const postingSchema = Type.String();
type Posting = Static<typeof postingSchema>;

@Controller('/api/postings')
@Tags('Posts')
@Deprecated()
export class TestOaController310DeprecatedPosting {
  @Post('/', 'Create a new posting')
  @Response(201, {
    description: 'Posting created',
    content: { schema: Type.String() },
  })
  public createPosting(
    @Body({ schema: postingSchema })
    postingDto: Posting,
    @response() res: express.Response,
  ): void {
    postings.push(postingDto);
    res.status(201).send(postingDto);
  }
}
