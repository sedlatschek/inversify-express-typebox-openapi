import 'reflect-metadata';
import {
  controller,
  httpDelete,
  httpGet,
  httpPost,
  httpPut,
  response,
} from 'inversify-express-utils';
import { type Response } from 'express';
import { Body, Header, Path, Query } from './decorators';
import { Type } from '@sinclair/typebox';

export interface User {
  id: number;
  name: string;
}

const UserSchema = Type.Object({ id: Type.String(), name: Type.String() });

export type UserType = {
  id: number;
  name: string;
};

const user = {
  id: 1,
  name: 'John Doe',
};

@controller('/api')
export class ExampleController {
  @httpGet('/')
  public async get(@response() res: Response) {
    res.status(200).send('Hello, world!');
  }

  @httpGet('/users/:userId')
  public async getUser(
    @Path('userId', Type.String({ format: 'numeric' })) _userId: string,
    @response() res: Response,
  ) {
    res.status(200).send(user);
  }

  @httpPost('/users')
  public async postUser(
    @Header('Authorization', Type.String()) _auth: string,
    @Query('date', Type.String()) _date: string,
    @Body(UserSchema) body: User,
    @response() res: Response,
  ) {
    res.status(201).send(body);
  }

  @httpPut('/users/:userId')
  public async putUser(
    @Body(UserSchema) body: User,
    @response() res: Response,
  ): Promise<UserType | undefined> {
    res.status(200).send(body);
    return undefined;
  }

  @httpDelete('/users/:userId')
  public async deleteUser(
    @Path('userId', Type.String({ format: 'numeric' })) _userId: string,
    @response() res: Response,
  ) {
    res.status(204).send();
  }
}
