import { OptionalKind, TSchema } from '@sinclair/typebox';
import {
  ParameterLocation,
  ParameterObject,
  ResponseObject,
} from 'openapi3-ts/oas31';
import { Operation } from './type';
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

export type OperationMetadataProperties = Partial<
  Omit<Operation, 'operationObject'> & {
    operationObject?: Partial<Operation['operationObject']>;
  }
>;

export const addOperationMetadata = (
  target: object,
  methodName: string | symbol,
  properties?: OperationMetadataProperties,
): Operation => {
  let metadata = getOperationMetadata(target, methodName);

  if (!metadata) {
    metadata = {
      method: properties?.method,
      operationObject: {
        operationId: `${target.constructor.name}::${methodName.toString()}`,
        responses: {},
      },
      parameterIndices: [],
    };

    Reflect.defineMetadata(
      OPERATION_METADATA_KEY,
      metadata,
      target,
      methodName,
    );
  }

  if (properties?.method !== undefined) {
    metadata.method = properties.method;
  }

  if (properties?.operationObject) {
    updateDefinedProperties(
      metadata.operationObject,
      properties.operationObject,
    );
  }

  return metadata;
};

export const getIndexByParameterIndex = (
  target: object,
  methodName: string | symbol,
  parameterIndex: number,
): number | undefined => {
  const metadata = getOperationMetadata(target, methodName);
  return (
    metadata?.parameterIndices?.findIndex(
      (index) => index === parameterIndex,
    ) ?? undefined
  );
};

export const getParameterMetadata = (
  target: object,
  methodName: string | symbol,
  parameterIndex: number,
): ParameterObject | undefined => {
  const actualIndex = getIndexByParameterIndex(
    target,
    methodName,
    parameterIndex,
  );

  if (actualIndex !== undefined) {
    const metadata = getOperationMetadata(target, methodName);
    return metadata?.operationObject.parameters?.[actualIndex] ?? undefined;
  }

  return undefined;
};

export type ParameterMetadataProperties = Omit<
  ParameterObject,
  'name' | 'in'
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
  parameterIndex: number,
  properties: ParameterMetadataProperties,
): void => {
  const metadata = getOrCreateOperationMetadata(target, methodName);

  if (!metadata.operationObject.parameters) {
    metadata.operationObject.parameters = [];
  }

  let parameter = getParameterMetadata(target, methodName, parameterIndex);
  if (!parameter) {
    parameter = {
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
    metadata.operationObject.parameters.push(parameter);
    metadata.parameterIndices.push(parameterIndex);
  }

  const calculatedProps = properties.schema
    ? {
        required: !(OptionalKind in properties.schema),
      }
    : {};

  const arrayIndex = getIndexByParameterIndex(
    target,
    methodName,
    parameterIndex,
  );
  if (arrayIndex === undefined) {
    throw new Error(
      `Could not find array index of parameter index ${parameterIndex} in operation metadata`,
    );
  }

  updateDefinedProperties(parameter, { ...properties, ...calculatedProps });
  metadata.operationObject.parameters[arrayIndex] = parameter;
};

export const addBodyMetadata = (
  target: object,
  methodName: string | symbol,
  schema: TSchema,
): void => {
  const metadata = getOrCreateOperationMetadata(target, methodName);

  metadata.operationObject.requestBody = {
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

  if (!metadata.operationObject.responses) {
    metadata.operationObject.responses = {};
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

  metadata.operationObject.responses[statusCode] = response;
};
