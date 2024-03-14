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

#### Decorators

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

## ToDo

- [ ] provide clearMetadata for testing
- [ ] descriptions
- [ ] examples
- [ ] externalDocs
- [ ] Readme (docs)
- [ ] make a package out of it
- [ ] check for the lowest compatible version of each peerDependency
- [ ] inversify all?
- [ ] controller wide parameter decorators: cookie, header
- [ ] controller wide responses (eg 500)
- [ ] controller wide deprecated
- [ ] ignore decorator for controller, methods and parameters
- [ ] improve types of merge.ts (only allow property keys of the assumed property value that is needed for the function to work)
- [ ] parameters decorators should reflect types
- [ ] OA v3.0
- [ ] remove reflect-metadata import from tests that do not rely on it
