import { BaseHttpController, response } from 'inversify-express-utils';
import { Static, Type } from '@sinclair/typebox';
import {
  Delete,
  Get,
  Body,
  Controller,
  Patch,
  Path,
  Post,
  Put,
  Query,
  Deprecated,
  Response,
  Header,
  Cookie,
  Tags,
  OperationId,
  Security,
} from '../../src';
import { Response as ExpressResponse } from 'express';
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
  @Response(200, 'The user from the session', userSchema)
  @Response(401, 'Unauthorized')
  @Security({ bearerAuth: ['user'] })
  @Security({ basicAuth: ['user'] })
  public getUserFromSession(
    @response() res: ExpressResponse,
    @Cookie('sessionId', Type.String()) sessionId: string,
  ): void {
    if (sessionId) {
      res.send(users[0]);
      return;
    }
    res.status(401).send('Unauthorized');
  }

  @Get('/')
  @Response(200, 'List of all users', Type.Array(userSchema))
  @OperationId('getAllUsers')
  public get(
    @Query('state', Type.Optional(userStateSchema)) userState?: UserState,
    @Header(
      'Accept-Language',
      Type.Optional(Type.String()),
      'Falls back to english if not provided',
    )
    _acceptLanguage?: string,
  ): User[] {
    if (userState) {
      return users.filter((user) => user.state === userState);
    }
    return users;
  }

  @Deprecated()
  @Get('/active')
  @Response(200, 'List of all active users', Type.Array(userSchema))
  public getAllActiveUsers(): User[] {
    return users.filter((user) => user.state === UserState.Active);
  }

  @Get('/:userId')
  @Response(200, 'The requested user', userSchema)
  @Response(404, 'User not found')
  public getUserById(
    @Path('userId', Type.Number()) userId: number,
    @response() res: ExpressResponse,
    @Header('Accept-Language', Type.Optional(Type.String()))
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
  @Response(201, 'The created user', userSchema)
  public createUser(
    @Body(userSchema) user: User,
    @response() res: ExpressResponse,
  ): void {
    users.push(user);
    res.status(201).send(user);
  }

  @Put('/:userId')
  @Response(200, 'The updated user')
  @Response(404, 'User not found')
  public updateUser(
    @Path('userId', Type.Number()) userId: number,
    @Body(userSchema) user: User,
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
  @Response(200, 'The updated user', userSchema)
  @Response(404, 'User not found')
  public patchUserState(
    @Path('userId', Type.Number()) userId: number,
    @Body(userStateSchema) userState: UserState,
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
  @Response(204, 'User deleted')
  @Response(404, 'User not found')
  public deleteUser(
    @Path('userId', Type.Number()) userId: number,
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
  @Response(200, 'List of the users posts', Type.Array(postSchema))
  @Tags('Posts')
  public getUserPosts(
    @Path('userId', Type.Number()) userId: number,
    @Header('Accept-Language', Type.Optional(Type.String()))
    _acceptLanguage?: string,
  ): PostType[] {
    return posts.filter((post) => post.userId === userId);
  }
}
