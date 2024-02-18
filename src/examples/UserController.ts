import 'reflect-metadata';
import { response } from 'inversify-express-utils';
import { type Response as ExpressResponse } from 'express';
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
  Response,
} from '../decorate';
import { Type } from '@sinclair/typebox';

export interface User {
  id: number;
  name: string;
}

const UserSchema = Type.Object(
  { id: Type.String(), name: Type.String() },
  { $id: 'User' },
);

export type UserType = {
  id: number;
  name: string;
};

const user = {
  id: 1,
  name: 'John Doe',
};

@Controller('/api')
export class UserController {
  @Get('/users')
  @Response(200, 'All users', Type.Array(UserSchema))
  public async get(@response() res: ExpressResponse): Promise<void> {
    res.status(200).send('Hello, world!');
  }

  @Get('/users/:userId')
  @Response(200, 'The user with the userId', UserSchema)
  public async getUser(
    @Cookie('session', Type.String()) _session: string,
    @Path('userId', Type.String({ format: 'numeric' })) _userId: string,
    @response() res: ExpressResponse,
  ): Promise<void> {
    res.status(200).send(user);
  }

  @Post('/users')
  @Response(200, 'The new user', UserSchema)
  public async postUser(
    @Header('X-Something', Type.String()) _something: string,
    @Query('date', Type.String()) _date: string,
    @Body(UserSchema) body: User,
    @response() res: ExpressResponse,
  ): Promise<void> {
    res.status(201).send(body);
  }

  @Put('/users/:userId')
  @Response(200, 'The updated user', UserSchema)
  public async putUser(
    @Path('userId', Type.String({ format: 'numeric' })) _userId: string,
    @Body(UserSchema) body: User,
  ): Promise<UserType> {
    return body;
  }

  @Delete('/users/:userId')
  @Response(204, 'No content')
  public async deleteUser(
    @Path('userId', Type.String({ format: 'numeric' })) _userId: string,
    @response() res: ExpressResponse,
  ): Promise<void> {
    res.status(204).send();
  }
}
