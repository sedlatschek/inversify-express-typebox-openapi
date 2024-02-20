import { OptionalKind, TSchema } from '@sinclair/typebox';
import { ParameterLocation, ResponseObject } from 'openapi3-ts/oas31';
import { Operation, Parameter } from './type';
import { updateDefinedProperties } from './utilize';

export const OPERATION_METADATA_KEY =
  'inversify-express-typebox-openapi:operation';

export const getOperationMetadata = (
  target: object,
  methodName: string | symbol,
): Operation | undefined => {
  return Reflect.getMetadata(OPERATION_METADATA_KEY, target, methodName);
};

export const getOrCreateOperationMetadata = (
  target: object,
  methodName: string | symbol,
): Operation => {
  let metadata = getOperationMetadata(target, methodName);

  if (!metadata) {
    metadata = addOperationMetadata(target, methodName);
  }

  return metadata;
};

export type OperationMetadataProperties = Partial<Operation>;

export const addOperationMetadata = (
  target: object,
  methodName: string | symbol,
  properties?: OperationMetadataProperties,
): Operation => {
  let metadata = getOperationMetadata(target, methodName);

  if (!metadata) {
    metadata = {
      method: properties?.method,
      operationId: `${target.constructor.name}::${methodName.toString()}`,
      responses: {},
      deprecated: properties?.deprecated,
    };

    Reflect.defineMetadata(
      OPERATION_METADATA_KEY,
      metadata,
      target,
      methodName,
    );
  } else {
    if (properties) {
      updateDefinedProperties(metadata, properties);
    }
  }

  return metadata;
};

export const getParameterMetadata = (
  target: object,
  methodName: string | symbol,
  index: number,
): Parameter | undefined => {
  const metadata = getOperationMetadata(target, methodName);
  return (metadata?.parameters ?? []).find(
    (parameter) => parameter.index === index,
  );
};

export type ParameterMetadataProperties = Omit<
  Parameter,
  'index' | 'name' | 'in'
> & {
  name?: string;
  in?: ParameterLocation;
};

/**
 * Existing metadata will be updated with the new props.
 */
export const addParametersMetadata = (
  target: object,
  methodName: string | symbol,
  index: number,
  properties: ParameterMetadataProperties,
): void => {
  const metadata = getOrCreateOperationMetadata(target, methodName);

  if (!metadata.parameters) {
    metadata.parameters = [];
  }

  let parameter = getParameterMetadata(target, methodName, index);
  if (!parameter) {
    parameter = {
      index,
      name: properties.name ?? 'unknown name', // TODO: refactor this ugly peace of code so we don't need to set a default value
      in: properties.in ?? 'query', // TODO: refactor this ugly peace of code so we don't need to set a default value
      // TODO: add description to operation parameter metadata
      // TODO: add allowEmptyValue to operation parameter metadata
      // TODO: add style to operation parameter metadata
      // TODO: add explode to operation parameter metadata
      // TODO: add allowReserved to operation parameter metadata
      // TODO: add examples to operation parameter metadata
      // TODO: add example to operation parameter metadata
      // TODO: add content to operation parameter metadata
    };
    metadata.parameters.push(parameter);
  }

  const calculatedProps = properties.schema
    ? {
        required: !(OptionalKind in properties.schema),
      }
    : {};

  const arrayIndex = metadata.parameters.findIndex((p) => p.index === index);

  updateDefinedProperties(parameter, { ...properties, ...calculatedProps });
  metadata.parameters[arrayIndex] = parameter;
};

export const addBodyMetadata = (
  target: object,
  methodName: string | symbol,
  schema: TSchema,
): void => {
  const metadata = getOrCreateOperationMetadata(target, methodName);

  metadata.requestBody = {
    // TODO: add description to operation requestBody metadata
    content: {
      'application/json': {
        schema,
      },
    },
    // TODO: add required to operation requestBody metadata
  };
};

export const addResponsesMetadata = (
  target: object,
  methodName: string | symbol,
  statusCode: string,
  description: string,
  schema?: TSchema,
): void => {
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
        schema,
        // TODO: add examples to operation response metadata
        // TODO: add example to operation response metadata
        // TODO: add encoding to operation response metadata
      },
    };
  }

  // TODO: add default response to operation responses metadata

  metadata.responses[statusCode] = response;
};
