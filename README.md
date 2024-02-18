# Inversify Express Typebox OpenAPI

Generate OpenAPI specification during runtime from inversify-express-utils controllers and typebox schemas.

## Features

- OpenAPI spec generation at runtime (no precompilation)
- Integrated with `inversify-express-utils`

## ToDo

- [ ] improve `mapTypeBoxSchemaToOpenAPISchema`
- [ ] provide clearMetadata for testing
- [ ] tests
- [ ] schema reference by id (`const UserSchema = Type.Object( { id: Type.String(), name: Type.String() }, { $id: 'User' });`)
- [ ] security
- [ ] descriptions
- [ ] examples
- [ ] tags
- [ ] operationId
- [ ] externalDocs
- [ ] Readme
- [ ] make a package out of it
- [ ] check for the lowest compatibile version of each peerDependency
- [ ] inversify all?
- [ ] fix array type
