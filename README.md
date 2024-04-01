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

ToDo

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

This can also be done through the `Query` decorator:

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

Determines whether the parameter value SHOULD allow reserved characters, as defined by [RFC3986] `:/?#[]@!$&'()*+,;=` to be included without percent-encoding.

```ts
class ExampleController {
  public getUsers(
    @AllowReserved() @Query('q', Type.String()) searchQuery: string,
  ) {
    // ....
  }
}
```

This can also be done through the `Query` decorator:

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

Flag a parameter, a method or a controller as deprecated.

```ts
@Deprecated()
class ExampleController {}
```

When used on a controller, it is applied to each of its methods.

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

This can also be done through any of the parameter decorators:

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

This can also be done through any of the parameter decorators:

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

This can also be done through any of the parameter decorators:

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
class ExampleController {
  public getUsers(
    @Explode() @Query('id', Type.Array(Type.String()) ids: string[],
  ) {
    // ....
  }
}
```

This can also be done through any of the parameter decorators:

```ts
class ExampleController {
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
class ExampleController {
  @ExternalDocs({
    description: 'Official documentation',
    url: 'https://example.org',
  })
  public getUsers() {
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

Specify a query parameter.

| Controller | Method | Parameter |
| :--------: | :----: | :-------: |
|     ❌     |   ❌   |    ✅     |

```ts
// ...
class ExampleController {
  // ...
  public getUsers(@Query('query', schema: Type.String()) query: string) {
    // ...
  }
}
```

#### Security

| Controller | Method | Parameter |
| :--------: | :----: | :-------: |
|     ✅     |   ✅   |    ❌     |

Specify the security requirements for a method.

```ts
@Security({ securityScheme: ['scopeA', 'scopeB'] })
class ExampleController {}
```

When used on a controller, it is applied to each of its methods.
Multiple `@Security` decorators onto one controller/method extend the requirements.

#### Style

| Controller | Method | Parameter |
| :--------: | :----: | :-------: |
|     ❌     |   ❌   |    ✅     |

Describes how the parameter value will be serialized depending on the type of the parameter value.

```ts
class ExampleController {
  public getUser(
    @Style('simple') @Path('userId', Type.String()) status: string,
  ) {
    // ....
  }
}
```

This can also be done through any of the parameter decorators:

```ts
class ExampleController {
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
class ExampleController {
  @Summary('Retrieves all the users form the database')
  public getUser() {
    // ....
  }
}
```

## Development

### Testing

We use [vitest](https://vitest.dev/) for testing. To ensure support for decorators and reflection, we run it with [swc](https://swc.rs).

### Contribute

ToDo

## ToDo

- [ ] provide clearMetadata for testing
- [ ] Readme (docs)
- [ ] make a package out of it
- [ ] check for the lowest compatible version of each peerDependency
- [ ] inversify all? (and also check for other inversify decorators that are currently not supported)
- [ ] ignore decorator for controller, methods and parameters
- [ ] improve types of merge.ts (only allow property keys of the assumed property value that is needed for the function to work)
- [ ] parameters decorators should reflect types
- [ ] check response type if it is something other than void
- [ ] OA v3.0
- [ ] remove reflect-metadata import from tests that do not rely on it
- [ ] Changelog
- [ ] add jsdoc to decorators from oas v3.1 spec
- [ ] webhooks callback via decorator?
- [ ] add type tests for decorators (und such things as examples, example, schema)
- [ ] move schema to be its own parameter for parameter decorators
- [ ] DRY up decorator code

### Roadmap

- [ ] controller wide parameters: eg. cookie, header
- [ ] controller wide responses: eg. 500
