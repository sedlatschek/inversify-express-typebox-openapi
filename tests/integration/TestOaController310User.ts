import { Static, Type } from '@sinclair/typebox';
import { Response as ExpressResponse } from 'express';
import { BaseHttpController, response } from 'inversify-express-utils';
import {
  Body,
  Controller,
  Cookie,
  Delete,
  Deprecated,
  Get,
  Header,
  OperationId,
  Patch,
  Path,
  Post,
  Put,
  Query,
  Response,
  Security,
  Tags,
} from '../../src';
import { Post as PostType, postSchema, posts } from './TestOaController310Post';

export enum UserState {
  Active = 'active',
  Inactive = 'inactive',
  Pending = 'pending',
}

export const userStateSchema = Type.Enum(UserState, { $id: 'UserState' });

export const userSchema = Type.Object(
  {
    id: Type.Number(),
    name: Type.String(),
    email: Type.String({}),
    createdAt: Type.String({ format: 'date-time' }),
    state: userStateSchema,
  },
  { $id: 'User' },
);

export type User = Static<typeof userSchema>;

export const users: User[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@exampe.org',
    createdAt: new Date().toISOString(),
    state: UserState.Active,
  },
  {
    id: 2,
    name: 'Jane Doe',
    email: 'jane.doe@exampe.org',
    createdAt: new Date().toISOString(),
    state: UserState.Inactive,
  },
];

@Controller('/api/users')
@Tags('Users')
@OperationId('UserController')
@Security({ bearerAuth: ['user', 'admin'] })
@Security({ basicAuth: ['user', 'admin'] })
export class TestOaController310User extends BaseHttpController {
  @Get('me')
  @Response(200, {
    description: 'The user from the session',
    content: { schema: userSchema },
  })
  @Response(401, { description: 'Unauthorized' })
  @Security({ bearerAuth: ['user'] })
  @Security({ basicAuth: ['user'] })
  public getUserFromSession(
    @response() res: ExpressResponse,
    @Cookie('sessionId', { schema: Type.String() }) sessionId: string,
  ): void {
    if (sessionId) {
      res.send(users[0]);
      return;
    }
    res.status(401).send('Unauthorized');
  }

  @Get('/')
  @Response(200, {
    description: 'List of all users',
    content: { schema: Type.Array(userSchema) },
  })
  @OperationId('getAllUsers')
  public get(
    @Query('state', { schema: Type.Optional(userStateSchema) })
    userState?: UserState,
    @Header('Accept-Language', {
      schema: Type.Optional(Type.String()),
      description: 'Falls back to english if not provided',
    })
    _acceptLanguage?: string,
  ): User[] {
    if (userState) {
      return users.filter((user) => user.state === userState);
    }
    return users;
  }

  @Deprecated()
  @Get('/active')
  @Response(200, {
    description: 'List of all active users',
    content: { schema: Type.Array(userSchema) },
  })
  public getAllActiveUsers(): User[] {
    return users.filter((user) => user.state === UserState.Active);
  }

  @Get('/:userId')
  @Response(200, {
    description: 'The requested user',
    content: { schema: userSchema },
  })
  @Response(404, { description: 'User not found' })
  public getUserById(
    @Path('userId', { schema: Type.Number() }) userId: number,
    @response() res: ExpressResponse,
    @Header('Accept-Language', { schema: Type.Optional(Type.String()) })
    _acceptLanguage?: string,
  ): void {
    const user = users.find((user) => user.id === userId);

    if (user) {
      res.send(user);
      return;
    }

    res.status(404).send('User not found');
  }

  @Post('/')
  @Response(201, {
    description: 'The created user',
    content: { schema: userSchema },
  })
  public createUser(
    @Body({ schema: userSchema }) user: User,
    @response() res: ExpressResponse,
  ): void {
    users.push(user);
    res.status(201).send(user);
  }

  @Put('/:userId')
  @Response(200, { description: 'The updated user' })
  @Response(404, { description: 'User not found' })
  public updateUser(
    @Path('userId', { schema: Type.Number() }) userId: number,
    @Body({ schema: userSchema }) user: User,
    @response() res: ExpressResponse,
  ): void {
    const index = users.findIndex((user) => user.id === userId);

    if (index !== -1) {
      users[index] = user;
      res.send(user);
      return;
    }

    res.status(404).send('User not found');
  }

  @Patch('/:userId/state')
  @Response(200, {
    description: 'The updated user',
    content: { schema: userSchema },
  })
  @Response(404, { description: 'User not found' })
  public patchUserState(
    @Path('userId', { schema: Type.Number() }) userId: number,
    @Body({ schema: userStateSchema }) userState: UserState,
    @response() res: ExpressResponse,
  ): void {
    const user = users.find((user) => user.id === userId);

    if (user) {
      user.state = userState;
      res.send(user);
      return;
    }

    res.status(404).send('User not found');
  }

  @Delete('/:userId')
  @Response(204, { description: 'User deleted' })
  @Response(404, { description: 'User not found' })
  public deleteUser(
    @Path('userId', { schema: Type.Number() }) userId: number,
    @response() res: ExpressResponse,
  ): void {
    const index = users.findIndex((user) => user.id === userId);

    if (index !== -1) {
      users.splice(index, 1);
      res.status(204).send();
      return;
    }

    res.status(404).send('User not found');
  }

  @Get('/:userId/posts', 'Get all posts of a user')
  @Response(200, {
    description: 'List of the users posts',
    content: { schema: Type.Array(postSchema) },
  })
  @Tags('Posts')
  public getUserPosts(
    @Path('userId', { schema: Type.Number() }) userId: number,
    @Header('Accept-Language', { schema: Type.Optional(Type.String()) })
    _acceptLanguage?: string,
  ): PostType[] {
    return posts.filter((post) => post.userId === userId);
  }
}
