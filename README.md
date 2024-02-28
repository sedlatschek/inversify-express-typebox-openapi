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

ToDo

## Development

### Testing

We use [vitest](https://vitest.dev/) for testing. To ensure support for decorators and reflection, we run it with [swc](https://swc.rs).

## ToDo

- [ ] provide clearMetadata for testing
- [ ] security
- [ ] descriptions
- [ ] examples
- [ ] externalDocs
- [ ] Readme (docs)
- [ ] make a package out of it
- [ ] check for the lowest compatibile version of each peerDependency
- [ ] inversify all?
- [ ] controller wide parameter decorators: cookie, header
- [ ] deprecated controller
- [ ] ignore decorator for controller, methods and paramaters
