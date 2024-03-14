# Inversify Express Typebox OpenAPI

Generate OpenAPI specification during runtime from inversify-express-utils controllers and typebox schemas.

## Features

- OpenAPI spec generation at runtime (no precompilation)
- Integrated with `inversify-express-utils`

## Usage

### Installation

```sh
npm install inversify-express-typebox-openapi
```

### Example

ToDo

### Documentation

#### References

##### Create identifiable objects

This package supports references. It will add any object that has an `$id` property to the `components` map of the OpenApi specification. There is a helper function for defining identifiable/referenceable objects called `identifiable`. The value of `$id` will be used as the key within the components map.

```ts
import { type ExampleObject } from 'openapi3-ts/oas31';
import { identifiable } from 'inversify-express-typebox-openapi';

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

##### Create identifiable Typebox schemas

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

##### `withoutId` helper

In case the create identifiable objects need to be reused without their `$id` property, the helper function `withoutId` can be used.

```ts
import { withoutId } from 'inversify-express-typebox-openapi';

const example = withoutId({
  $id: 'example'
  id: 1,
});

// example = { id: 1 }
```

#### Decorators

##### Deprecated

Flag a parameter, a method or a controller as deprecated.

```ts
@Deprecated()
```

| Controller | Method | Parameter |
| :--------: | :----: | :-------: |
|     ✅     |   ✅   |    ✅     |

When used on a controller, it is applied to each of its methods.

##### Security

Specify the security requirements for a method.

```ts
@Security({ securityScheme: ['scopeA', 'scopeB'] })
```

| Controller | Method | Parameter |
| :--------: | :----: | :-------: |
|     ✅     |   ✅   |    ❌     |

When used on a controller, it is applied to each of its methods.
Multiple `@Security` decorators onto one controller/method extend the requirements.

## Development

### Testing

We use [vitest](https://vitest.dev/) for testing. To ensure support for decorators and reflection, we run it with [swc](https://swc.rs).

### Contribute

ToDo

## ToDo

- [ ] provide clearMetadata for testing
- [ ] externalDocs
- [ ] Readme (docs)
- [ ] make a package out of it
- [ ] check for the lowest compatible version of each peerDependency
- [ ] inversify all?
- [ ] ignore decorator for controller, methods and parameters
- [ ] improve types of merge.ts (only allow property keys of the assumed property value that is needed for the function to work)
- [ ] parameters decorators should reflect types
- [ ] OA v3.0
- [ ] remove reflect-metadata import from tests that do not rely on it
- [ ] Changelog

### Roadmap

- [ ] controller wide parameters: eg. cookie, header
- [ ] controller wide responses: eg. 500
