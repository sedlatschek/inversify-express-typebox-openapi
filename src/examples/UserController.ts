import 'reflect-metadata';
import { response } from 'inversify-express-utils';
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
  public async get(@response() res: Response): Promise<void> {
    res.status(200).send('Hello, world!');
  }

  @Get('/users/:userId')
  public async getUser(
    @Cookie('session', Type.String()) _session: string,
    @Path('userId', Type.String({ format: 'numeric' })) _userId: string,
    @response() res: Response,
  ): Promise<void> {
    res.status(200).send(user);
  }

  @Post('/users')
  public async postUser(
    @Header('X-Something', Type.String()) _something: string,
    @Query('date', Type.String()) _date: string,
    @Body(UserSchema) body: User,
    @response() res: Response,
  ): Promise<void> {
    res.status(201).send(body);
  }

  @Put('/users/:userId')
  public async putUser(@Body(UserSchema) body: User): Promise<UserType> {
    return body;
  }

  @Delete('/users/:userId')
  public async deleteUser(
    @Path('userId', Type.String({ format: 'numeric' })) _userId: string,
    @response() res: Response,
  ): Promise<void> {
    res.status(204).send();
  }
}
