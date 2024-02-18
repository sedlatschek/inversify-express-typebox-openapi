# Inversify Express OpenAPI

## Features

- OpenAPI spec generation at runtime (no precompilation)
- Integrated with `inversify-express-utils`

## ToDo

- [ ] improve `mapTypeBoxSchemaToOpenAPISchema`
- [ ] provide clearMetadata for testing
- [ ] tests
- [ ] schema reference by id (`const UserSchema = Type.Object( { id: Type.String(), name: Type.String() }, { $id: 'User' });`)
- [ ] refactor decorate.ts to be more DRY
- [ ] required parameters
- [ ] security
- [ ] descriptions
- [ ] examples
- [ ] tags
- [ ] deprecated
- [ ] operationId
- [ ] externalDocs
- [ ] Readme
- [ ] make a package out of it
- [ ] check for the lowest compatibile version of each peerDependency
- [ ] inversify all?
