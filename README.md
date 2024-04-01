# Inversify Express Typebox OpenAPI

Generate OpenAPI specification during runtime from [inversify-express-utils](https://www.npmjs.com/package/inversify-express-utils) controllers and [@sinclair/typebox](https://www.npmjs.com/package/@sinclair/typebox) schemas.

## Features

- Generates [OpenAPI v3.1](https://spec.openapis.org/oas/v3.1.0) specification at runtime
- Requires no pre-compilation step
- Integrates with [inversify-express-utils](https://www.npmjs.com/package/inversify-express-utils)
- Integrates with [@sinclair/typebox](https://www.npmjs.com/package/@sinclair/typebox)
- Allows for manipulation through the [openapi3-ts](https://www.npmjs.com/package/openapi3-ts) package's builder

## Usage

### Installation

```sh
npm install inversify-express-typebox-openapi
```

### Example

```ts
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

@Controller('/users')
@Tags('User')
@Security({ bearerAuth: ['read:user'] })
export class TestOaController310User extends BaseHttpController {
  @Get('me')
  @Response(200, {
    description: 'The user from the session',
    content: { schema: userSchema },
  })
  @Response(401, { description: 'Unauthorized' })
  @Security({ bearerAuth: ['read:session'] })
  public getUserFromSession(
    @response() res: ExpressResponse,
    @Cookie('sessionId', { schema: Type.String() }) sessionId: string,
  ): void {
    // ...
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
    // ...
  }

  @Deprecated()
  @Get('/active')
  @Response(200, {
    description: 'List of all active users',
    content: { schema: Type.Array(userSchema) },
  })
  public getAllActiveUsers(): User[] {
    // ...
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
    // ...
  }

  @Post('/')
  @Response(201, {
    description: 'The created user',
    content: { schema: userSchema },
  })
  @Security({ bearerAuth: ['write:user'] })
  public createUser(
    @Body({ schema: userSchema }) user: User,
    @response() res: ExpressResponse,
  ): void {
    // ...
  }

  @Put('/:userId')
  @Response(200, { description: 'The updated user' })
  @Response(404, { description: 'User not found' })
  @Security({ bearerAuth: ['write:user'] })
  public updateUser(
    @Path('userId', { schema: Type.Number() }) userId: number,
    @Body({ schema: userSchema }) user: User,
    @response() res: ExpressResponse,
  ): void {
    // ...
  }

  @Patch('/:userId/state')
  @Response(200, {
    description: 'The updated user',
    content: { schema: userSchema },
  })
  @Response(404, { description: 'User not found' })
  @Security({ bearerAuth: ['write:user'] })
  public patchUserState(
    @Path('userId', { schema: Type.Number() }) userId: number,
    @Body({ schema: userStateSchema }) userState: UserState,
    @response() res: ExpressResponse,
  ): void {
    // ...
  }

  @Delete('/:userId')
  @Response(204, { description: 'User deleted' })
  @Response(404, { description: 'User not found' })
  @Security({ bearerAuth: ['delete:user'] })
  public deleteUser(
    @Path('userId', { schema: Type.Number() }) userId: number,
    @response() res: ExpressResponse,
  ): void {
    // ...
  }
}
```

### References

#### Create identifiable objects

This package supports references. It will add any object that has an `$id` property to the `components` map of the OpenApi specification. There is a helper function for defining identifiable/referenceable objects called `identifiable`. The value of `$id` will be used as the key within the components map.

```ts
import { identifiable } from 'inversify-express-typebox-openapi';
import { type ExampleObject } from 'openapi3-ts/oas31';

const postExample = identifiable<ExampleObject>(
  {
    value: {
      id: 1,
      content: 'This is a post',
    },
  },
  { $id: 'PostExample' },
);
```

#### Create identifiable Typebox schemas

Typebox schemas support this out of the box:

```ts
import { Type } from '@sinclair/typebox';

export const postSchema = Type.Object(
  {
    id: Type.Number(),
    content: Type.String(),
  },
  { $id: 'PostSchema' },
);
```

#### `withoutId` helper

In case the create identifiable objects need to be reused without their `$id` property, the helper function `withoutId` can be used.

```ts
import { withoutId } from 'inversify-express-typebox-openapi';

const example = withoutId({
  $id: 'example'
  id: 1,
});

// example = { id: 1 }
```

### Decorators

#### AllowEmtpyValue

| Controller | Method | Parameter |
| :--------: | :----: | :-------: |
|     ❌     |   ❌   |    ✅     |

Sets the ability to pass empty-valued parameters. This is valid only for query parameters and allows sending a parameter with an empty value.

```ts
class ExampleController {
  public getUsers(
    @AllowEmptyValue() @Query('status', Type.String()) status: string,
  ) {
    // ....
  }
}
```

This can also be achieved through the `Query` decorator:

```ts
class ExampleController {
  public getUsers(
    @Query('status', Type.String(), { allowEmptyValue: true }) status: string,
  ) {
    // ....
  }
}
```

#### AllowReserved

| Controller | Method | Parameter |
| :--------: | :----: | :-------: |
|     ❌     |   ❌   |    ✅     |

Specify whether the parameter value SHOULD allow reserved characters, as defined by [RFC3986] `:/?#[]@!$&'()*+,;=` to be included without percent-encoding.

```ts
class ExampleController {
  public getUsers(
    @AllowReserved() @Query('q', Type.String()) searchQuery: string,
  ) {
    // ....
  }
}
```

This can also be achieved through the `Query` decorator:

```ts
class ExampleController {
  public getUsers(
    @Query('q', Type.String(), { allowReserved: true }) searchQuery: string,
  ) {
    // ....
  }
}
```

#### Body

| Controller | Method | Parameter |
| :--------: | :----: | :-------: |
|     ❌     |   ❌   |    ✅     |

Specify a body parameter.

```ts
const userSchema = Type.Object({
  id: Type.Number(),
  name: Type.String(),
});
type User = Static<typeof userSchema>;

// ...
class ExampleController {
  // ...
  public createUser(@Body({ schema: userSchema }) userDto: User) {
    // ....
  }
}
```

#### Cookie

| Controller | Method | Parameter |
| :--------: | :----: | :-------: |
|     ❌     |   ❌   |    ✅     |

Specify a cookie parameter.

```ts
// ...
class ExampleController {
  // ...
  public get(@Cookie('Cookie', { schema: Type.String() }) cookie: string) {
    // ....
  }
}
```

#### Delete

| Controller | Method | Parameter |
| :--------: | :----: | :-------: |
|     ❌     |   ✅   |    ❌     |

Specify a delete method.

```ts
// ...
class ExampleController {
  @Delete('/users/{userId}')
  public deleteUser(/* ... */) {
    // ....
  }
}
```

#### Deprecated

| Controller | Method | Parameter |
| :--------: | :----: | :-------: |
|     ✅     |   ✅   |    ✅     |

Flag a parameter, a method or all methods of a controller as deprecated. Deprecated parameters will have `required` set to `false`.

```ts
// ...
@Deprecated()
class ExampleController {
  // ...
}

// ...
class ExampleController {
  // ...
  @Deprecated()
  public getUser() {
    // ...
  }
}

// ...
class ExampleController {
  // ...
  public getUser(@Deprecated() @Path('userId', { schema: Type.String() })) {

  }
}
```

#### Description

| Controller | Method | Parameter |
| :--------: | :----: | :-------: |
|     ✅     |   ✅   |    ✅     |

Specify a description for methods and parameters.

```ts
class ExampleController {
  @Description('Get all users')
  public getUsers() {
    // ....
  }
}
```

When used on a controller, it is applied to each of its methods.

Parameter descriptions can also be achieved through any of the parameter decorators:

```ts
class ExampleController {
  public getUsers(
    @Query('q', Type.String(), { description: 'Search query' })
    searchQuery: string,
  ) {
    // ....
  }
}
```

#### Example

| Controller | Method | Parameter |
| :--------: | :----: | :-------: |
|     ❌     |   ❌   |    ✅     |

Specify an example for a parameter value.

```ts
class ExampleController {
  public getUsers(
    @Example('Search query') @Query('q', Type.String()) searchQuery: string,
  ) {
    // ....
  }
}
```

This can also be achieved through any of the parameter decorators:

```ts
class ExampleController {
  public getUsers(
    @Query('q', Type.String(), { example: 'Search query' }) searchQuery: string,
  ) {
    // ....
  }
}
```

#### Examples

| Controller | Method | Parameter |
| :--------: | :----: | :-------: |
|     ❌     |   ❌   |    ✅     |

Specify a map of examples for a parameter value:

```ts
class ExampleController {
  public createUser(
    @Examples({
      admin: {
        value: { name: 'admin', role: 'admin' },
      },
      guest: {
        value: { name: 'guest', role: null },
      },
    })
    @Body(userSchema)
    userDto: User,
  ) {
    // ....
  }
}
```

This can also be achieved through any of the parameter decorators:

```ts
class ExampleController {
  public createUser(
    @Body(userSchema, {
      examples: {
        admin: {
          value: { name: 'admin', role: 'admin' },
        },
        guest: {
          value: { name: 'guest', role: null },
        },
      },
    })
    userDto: User,
  ) {
    // ....
  }
}
```

#### Explode

| Controller | Method | Parameter |
| :--------: | :----: | :-------: |
|     ❌     |   ❌   |    ✅     |

Specify that property values of the type `array` or `object` generate separate parameters for each value of the array, or key-value-pair of the map.

```ts
// ...
class ExampleController {
  // ...
  public getUsers(
    @Explode() @Query('id', Type.Array(Type.String()) ids: string[],
  ) {
    // ....
  }
}
```

This can also be achieved through any of the parameter decorators:

```ts
// ...
class ExampleController {
  // ...
  public getUsers(
    @Query('id', Type.Array(Type.String(), { explode: true }) ids: string[],
  ) {
    // ....
  }
}
```

#### ExternalDocs

| Controller | Method | Parameter |
| :--------: | :----: | :-------: |
|     ✅     |   ✅   |    ✅     |

Specify external documentation.

```ts
// ...
@ExternalDocs({
  description: 'Official documentation',
  url: 'https://example.org',
})
class ExampleController {
  // ...
  public getUsers() {
    // ....
  }
}

// ...
class ExampleController {
  // ...
  @ExternalDocs({
    description: 'Official documentation',
    url: 'https://example.org',
  })
  public getUsers() {
    // ....
  }
}

// ...
class ExampleController {
  // ...
  public getUser(
    @ExternalDocs({
      description: 'Official documentation',
      url: 'https://example.org',
    })
    @Path('id', { schema: Type.String() }))
    id: string
  {
    // ....
  }
}
```

#### Get

| Controller | Method | Parameter |
| :--------: | :----: | :-------: |
|     ❌     |   ✅   |    ❌     |

Specify a get method.

```ts
// ...
class ExampleController {
  @Get('/users')
  public getUsers() {
    // ....
  }
}
```

#### Head

| Controller | Method | Parameter |
| :--------: | :----: | :-------: |
|     ❌     |   ✅   |    ❌     |

Specify a head method.

```ts
// ...
class ExampleController {
  @Head('/file/xyz.zip')
  public download() {
    // ....
  }
}
```

#### Header

| Controller | Method | Parameter |
| :--------: | :----: | :-------: |
|     ❌     |   ❌   |    ✅     |

Specify a header parameter.

```ts
// ...
class ExampleController {
  // ...
  public get(
    @Header('Authorization', { schema: Type.String() }) authToken: string,
  ) {
    // ....
  }
}
```

#### OperationId

| Controller | Method | Parameter |
| :--------: | :----: | :-------: |
|     ✅     |   ✅   |    ❌     |

Specify a custom operation id for a method. By default, the operation id is the method name.

```ts
class ExampleController {
  @OperationId('customOperationId')
  @Get('/users')
  public getUsers() {
    // ....
  }
}
```

This example will result in the operation id `ExampleController_customOperationId`.

When used on a controller, the prefix (by default the controller name) is replaced with the custom operation id. The following example will result in the operation id `customControllerName_customOperationId`:

```ts
@OperationId('customControllerName')
class ExampleController {
  @OperationId('customOperationId')
  @Get('/users')
  public getUsers() {
    // ....
  }
}
```

#### Patch

| Controller | Method | Parameter |
| :--------: | :----: | :-------: |
|     ❌     |   ✅   |    ❌     |

Specify a patch method.

```ts
// ...
class ExampleController {
  @Patch('/users/{userId}')
  public updateUser() {
    // ....
  }
}
```

#### Path

| Controller | Method | Parameter |
| :--------: | :----: | :-------: |
|     ❌     |   ❌   |    ✅     |

Specify a path parameter.

```ts
// ...
class ExampleController {
  @Get('/users/{userId}')
  public getUser(@Path('userId', schema: Type.String()) userId: string) {
    // ...
  }
}
```

#### Post

| Controller | Method | Parameter |
| :--------: | :----: | :-------: |
|     ❌     |   ✅   |    ❌     |

Specify a post method.

```ts
// ...
class ExampleController {
  @Post('/users')
  public createUser() {
    // ....
  }
}
```

#### Put

| Controller | Method | Parameter |
| :--------: | :----: | :-------: |
|     ❌     |   ✅   |    ❌     |

Specify a put method.

```ts
// ...
class ExampleController {
  @Put('/users/{userId}')
  public replaceUser() {
    // ....
  }
}
```

#### Query

| Controller | Method | Parameter |
| :--------: | :----: | :-------: |
|     ❌     |   ❌   |    ✅     |

Specify a query parameter.

```ts
// ...
class ExampleController {
  // ...
  public getUsers(@Query('query', schema: Type.String()) query: string) {
    // ...
  }
}
```

#### Response

| Controller | Method | Parameter |
| :--------: | :----: | :-------: |
|     ❌     |   ✅   |    ❌     |

Specify a possible response for a method.

```ts
class ExampleController {
  // ...
  @Response(200, {
    description: 'IDs of users',
    content: { schema: Type.Array(Type.Number()) },
  })
  public getUserIds() {
    // ...
  }
}
```

Use `default` instead of an HTTP status code for a default error response.

#### Security

| Controller | Method | Parameter |
| :--------: | :----: | :-------: |
|     ✅     |   ✅   |    ❌     |

Specify the security requirements for a method.

```ts
// ...
@Security({ securityScheme: ['scopeA', 'scopeB'] })
class ExampleController {
  // ...
}
```

When used on a controller, it is applied to each of its methods.

Multiple `@Security` decorators onto one controller/method extend the requirements.

#### Style

| Controller | Method | Parameter |
| :--------: | :----: | :-------: |
|     ❌     |   ❌   |    ✅     |

Describes how the parameter value will be serialized depending on the type of the parameter value.

```ts
// ...
class ExampleController {
  // ...
  public getUser(
    @Style('simple') @Path('userId', Type.String()) status: string,
  ) {
    // ....
  }
}
```

This can also be achieved through any of the parameter decorators:

```ts
// ...
class ExampleController {
  // ...
  public getUser(
    @Path('userId', Type.String(), { style: 'simple' }) status: string,
  ) {
    // ....
  }
}
```

#### Summary

| Controller | Method | Parameter |
| :--------: | :----: | :-------: |
|     ❌     |   ✅   |    ❌     |

Specify a summary for an operation.

```ts
// ...
class ExampleController {
  // ....
  @Summary('Retrieves all the users form the database')
  public getUser() {
    // ....
  }
}
```

#### Tags

| Controller | Method | Parameter |
| :--------: | :----: | :-------: |
|     ✅     |   ✅   |    ❌     |

Specify tags for a method.

```ts
// ...
class ExampleController {
  // ....
  @Tags('V1', 'User')
  public getUser() {
    // ....
  }
}
```

When used on a controller, it is applied to each of its methods.

## Development

### Testing

We use [vitest](https://vitest.dev/) for testing. To ensure support for decorators and reflection, we run it with [swc](https://swc.rs).

### Contribute

ToDo

## ToDo

- [ ] De we need to provide clearMetadata for testing?
- [ ] Make a package out of it
- [ ] Check for the lowest compatible version of each peerDependency
- [ ] What to do with inversify's all method? (and also check for other inversify decorators that are currently not supported)
- [ ] Improve types of merge.ts (only allow property keys of the assumed property value that is needed for the function to work)
- [ ] Parameters decorators should reflect types
- [ ] Check response type if it is something other than void
- [ ] OA v3.0
- [ ] Remove reflect-metadata import from tests that do not rely on it
- [ ] Changelog / PR CI system
- [ ] Add jsdoc to decorators from oas v3.1 spec
- [ ] webhooks callback via decorator?
- [ ] Add type tests for decorators (und such things as examples, example, schema)
- [ ] Move schema to be its own parameter for parameter decorators
- [ ] DRY up decorator code
- [ ] AllowReserved can only be applied to Query parameters, yet we allow it to be used on any parameter. This allows for invalid oas31 specification if used incorrectly.

### Roadmap

- [ ] Controller wide parameters: eg. cookie, header
- [ ] Controller wide responses: eg. 500
