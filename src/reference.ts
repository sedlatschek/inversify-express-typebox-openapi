import {
  ContentObject,
  ParameterObject,
  ReferenceObject,
  RequestBodyObject,
  ResponsesObject,
  SchemaObject,
  isSchemaObject,
} from 'openapi3-ts/oas31';
import {
  Operation,
  SchemasObject,
  isParameterObject,
  isRequestBodyObject,
  isResponseObject,
} from './type';
import { TSchema } from '@sinclair/typebox';
import { equalsRegardlessOfItemOrPropertyOrder } from './utilize';

export const collectSchemasAndReplaceWithReferences = (
  schemas: SchemasObject,
  operations: Operation[],
): void => {
  for (const operation of operations) {
    const parameterObjects = (
      operation.operationObject?.parameters ?? []
    ).filter(isParameterObject);
    replaceParameterSchemasWithReferences(schemas, parameterObjects);
    replaceBodySchemasWithReferences(
      schemas,
      operation.operationObject.requestBody,
    );
    replaceResponseSchemasWithReferences(
      schemas,
      operation.operationObject.responses,
    );
  }
};

export const replaceParameterSchemasWithReferences = (
  schemas: SchemasObject,
  parameterObjects: ParameterObject[],
): void => {
  for (const parameterObject of parameterObjects) {
    if (parameterObject.schema && isSchemaObject(parameterObject.schema)) {
      parameterObject.schema = referenceSchema(schemas, parameterObject.schema);
    }
  }
};

export const replaceBodySchemasWithReferences = (
  schemas: SchemasObject,
  requestBody: RequestBodyObject | ReferenceObject | undefined,
): void => {
  if (!isRequestBodyObject(requestBody)) {
    return;
  }

  replaceContentObjectSchemaWithReferences(schemas, requestBody.content);
};

export const replaceResponseSchemasWithReferences = (
  schemas: SchemasObject,
  responsesObject: ResponsesObject | undefined,
): void => {
  if (!responsesObject) {
    return;
  }
  for (const response of Object.values(responsesObject).filter(
    isResponseObject,
  )) {
    if (response.content) {
      replaceContentObjectSchemaWithReferences(schemas, response.content);
    }
  }
};

export const replaceContentObjectSchemaWithReferences = (
  schemas: SchemasObject,
  contentObject: ContentObject,
): void => {
  const schema = contentObject['application/json']?.schema;

  if (schema && isSchemaObject(schema)) {
    contentObject['application/json'].schema = referenceSchema(schemas, schema);
  }
};

export const referenceSchema = (
  schemas: SchemasObject,
  schema: SchemaObject,
): SchemaObject | ReferenceObject => {
  const title = (schema as TSchema).$id ?? schema.title;
  if (!title) {
    return schema;
  }

  const newSchema = {
    ...schema,
    title,
  };
  delete (newSchema as TSchema).$id;

  const existingSchema = schemas[title];
  if (
    existingSchema &&
    isSchemaObject(existingSchema) &&
    !areEqualSchemas(existingSchema, newSchema)
  ) {
    throw new Error(
      `Schema with title "${title}" already exists and does not match the new schema\nexistingSchema: ${JSON.stringify(existingSchema, null, 2)}\nschema: ${JSON.stringify(newSchema, null, 2)}`,
    );
  }

  schemas[title] = newSchema;
  return { $ref: `#/components/schemas/${title}` };
};

export const areEqualSchemas = (
  schema1: TSchema | SchemaObject,
  schema2: TSchema | SchemaObject,
): boolean => {
  return equalsRegardlessOfItemOrPropertyOrder(schema1, schema2);
};
