import { OptionalKind, TSchema } from '@sinclair/typebox';
import { ParameterLocation, ResponseObject } from 'openapi3-ts/oas31';
import { mapTypeBoxSchemaToOpenAPISchema } from './map';
import { Operation, OperationMethod } from './type';

export const OPERATION_METADATA_KEY =
  'inversify-express-typebox-openapi:operation';

export function createOperationMetadata(
  target: object,
  methodName: string | symbol,
  method?: OperationMethod,
): Operation {
  let metadata = getOperationMetadata(target, methodName);

  if (!metadata) {
    metadata = {
      method,
      operationId: `${target.constructor.name}::${methodName.toString()}`,
      responses: {},
    };

    Reflect.defineMetadata(
      OPERATION_METADATA_KEY,
      metadata,
      target,
      methodName,
    );
  } else if (method) {
    metadata.method = method;
  }

  return metadata;
}

export function getOperationMetadata(
  target: object,
  methodName: string | symbol,
): Operation | undefined {
  return Reflect.getMetadata(OPERATION_METADATA_KEY, target, methodName);
}

export function getOrCreateOperationMetadata(
  target: object,
  methodName: string | symbol,
): Operation {
  let metadata = getOperationMetadata(target, methodName);

  if (!metadata) {
    metadata = createOperationMetadata(target, methodName);
  }

  return metadata;
}

export function addParametersMetadata(
  target: object,
  methodName: string | symbol,
  type: ParameterLocation,
  schema: TSchema,
  name: string,
): void {
  const metadata = getOrCreateOperationMetadata(target, methodName);

  if (!metadata.parameters) {
    metadata.parameters = [];
  }

  metadata.parameters.push({
    name,
    in: type,
    // TODO: add description to operation parameter metadata
    required: !(OptionalKind in schema),
    // TODO: add deprecated to operation parameter metadata
    // TODO: add allowEmptyValue to operation parameter metadata
    // TODO: add style to operation parameter metadata
    // TODO: add explode to operation parameter metadata
    // TODO: add allowReserved to operation parameter metadata
    schema: mapTypeBoxSchemaToOpenAPISchema(schema),
    // TODO: add examples to operation parameter metadata
    // TODO: add example to operation parameter metadata
    // TODO: add content to operation parameter metadata
  });
}

export function addBodyMetadata(
  target: object,
  methodName: string | symbol,
  _schema: TSchema,
): void {
  const metadata = getOrCreateOperationMetadata(target, methodName);

  metadata.requestBody = {
    // TODO: add description to operation requestBody metadata
    content: {}, // TODO: map schema to ContentObject
    // TODO: add required to operation requestBody metadata
  };
}

export function addResponsesMetadata(
  target: object,
  methodName: string | symbol,
  statusCode: string,
  description: string,
  schema?: TSchema,
): void {
  const metadata = getOrCreateOperationMetadata(target, methodName);

  if (!metadata.responses) {
    metadata.responses = {};
  }

  const response: ResponseObject = {
    description,
    // TODO: add headers to operation response metadata
    // TODO: add links to operation response metadata
  };

  if (schema) {
    response.content = {
      'application/json': {
        schema: mapTypeBoxSchemaToOpenAPISchema(schema),
        // TODO: add examples to operation response metadata
        // TODO: add example to operation response metadata
        // TODO: add encoding to operation response metadata
      },
    };
  }

  // TODO: add default response to operation responses metadata

  metadata.responses[statusCode] = response;
}
