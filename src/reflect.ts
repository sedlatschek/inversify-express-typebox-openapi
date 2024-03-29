import { OptionalKind, TSchema } from '@sinclair/typebox';
import {
  OperationObject,
  ParameterLocation,
  ParameterObject,
  ResponseObject,
  isReferenceObject,
} from 'openapi3-ts/oas31';
import { mergeIntoOperation } from './merge';
import {
  ControllerConfig,
  ControllerMetadata,
  OperationConfig,
  OperationMetadata,
  ParameterParameters,
  ResponseParameters,
} from './type';
import { hasValues, updateDefinedProperties } from './utilize';

export const CONTROLLER_METADATA_KEY =
  'inversify-express-typebox-openapi:controller';

export const getControllerMetadata = (
  // eslint-disable-next-line @typescript-eslint/ban-types
  target: object | Function,
): ControllerMetadata | undefined => {
  const constructor =
    typeof target === 'function' ? target : target.constructor;
  return Reflect.getMetadata(CONTROLLER_METADATA_KEY, constructor);
};

export const getOrCreateControllerMetadata = (
  // eslint-disable-next-line @typescript-eslint/ban-types
  target: object | Function,
): ControllerMetadata => {
  const constructor =
    typeof target === 'function' ? target : target.constructor;

  let controllerMetadata = getControllerMetadata(constructor);

  if (!controllerMetadata) {
    controllerMetadata = {
      name: constructor.name,
      baseOperationObject: {},
      operationMetadatas: [],
    };
    Reflect.defineMetadata(
      CONTROLLER_METADATA_KEY,
      controllerMetadata,
      constructor,
    );
  }

  return controllerMetadata;
};

export const addControllerMetadata = (
  // eslint-disable-next-line @typescript-eslint/ban-types
  target: object | Function,
  metadata?: {
    metadataProperties?: Partial<OperationObject>;
    config?: Partial<ControllerConfig>;
  },
): ControllerMetadata => {
  const controllerMetadata = getOrCreateControllerMetadata(target);

  if (metadata) {
    const { metadataProperties, config } = metadata;

    if (config) {
      if (!controllerMetadata.config) {
        controllerMetadata.config = {};
      }
      updateDefinedProperties(controllerMetadata.config, config);
    }

    if (metadataProperties) {
      mergeIntoOperation(
        controllerMetadata.baseOperationObject,
        metadataProperties,
      );
    }
  }

  return controllerMetadata;
};

export const getOperationMetadata = (
  target: object,
  methodName: string | symbol,
): OperationMetadata | undefined => {
  const metadata = getControllerMetadata(target.constructor);
  return (
    metadata?.operationMetadatas.find(
      (operationMetadata) => operationMetadata.name === methodName,
    ) ?? undefined
  );
};

export const getOrCreateOperationMetadata = (
  target: object,
  methodName: string | symbol,
): OperationMetadata => {
  let operationMetadata = getOperationMetadata(target, methodName);

  if (!operationMetadata) {
    operationMetadata = {
      name: methodName.toString(),
      config: {},
      operationObject: {
        responses: {},
      },
      parameterIndices: [],
    };

    const controllerMetadata = getOrCreateControllerMetadata(
      target.constructor,
    );
    controllerMetadata.operationMetadatas.push(operationMetadata);
  }

  return operationMetadata;
};

export const addOperationMetadata = (
  target: object,
  methodName: string | symbol,
  metadata?: {
    metadataProperties?: Partial<OperationObject>;
    config?: Partial<OperationConfig>;
  },
): OperationMetadata => {
  const operationMetadata = getOrCreateOperationMetadata(target, methodName);

  if (metadata) {
    const { metadataProperties, config } = metadata;

    if (config) {
      if (!operationMetadata.config) {
        operationMetadata.config = {};
      }
      updateDefinedProperties(operationMetadata.config, config);
    }

    if (metadataProperties) {
      mergeIntoOperation(operationMetadata.operationObject, metadataProperties);
    }
  }

  return operationMetadata;
};

export const getIndexByParameterIndex = (
  target: object,
  methodName: string | symbol,
  parameterIndex: number,
): number | undefined => {
  const operationMetadata = getOperationMetadata(target, methodName);
  return (
    operationMetadata?.parameterIndices.findIndex(
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
    const parameterMetadata =
      metadata?.operationObject.parameters?.[actualIndex];

    if (!!parameterMetadata && !isReferenceObject(parameterMetadata)) {
      return parameterMetadata;
    }
  }

  return undefined;
};

export const addParametersMetadata = <T extends TSchema>(
  target: object,
  methodName: string | symbol,
  parameterIndex: number,
  parameters: Partial<ParameterParameters<T>>,
  metadata?: { name: string; in: ParameterLocation },
): void => {
  const operationMetadata = getOrCreateOperationMetadata(target, methodName);

  if (!operationMetadata.operationObject.parameters) {
    operationMetadata.operationObject.parameters = [];
  }

  let parameter = getParameterMetadata(target, methodName, parameterIndex);
  if (!parameter) {
    parameter = {
      name: metadata?.name ?? 'unknown name', // TODO: refactor this ugly peace of code so we don't need to set a default value
      in: metadata?.in ?? 'query', // TODO: refactor this ugly peace of code so we don't need to set a default value
    };
    operationMetadata.operationObject.parameters.push(parameter);
    operationMetadata.parameterIndices.push(parameterIndex);
  }

  const calculatedProps = parameters.schema
    ? {
        required: !(OptionalKind in parameters.schema),
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

  updateDefinedProperties(parameter, { ...parameters, ...calculatedProps });
  operationMetadata.operationObject.parameters[arrayIndex] = parameter;
};

export const addBodyMetadata = <T extends TSchema>(
  target: object,
  methodName: string | symbol,
  parameters: ParameterParameters<T>,
): void => {
  const metadata = getOrCreateOperationMetadata(target, methodName);

  const { schema, example, examples, ...properties } = parameters;

  metadata.operationObject.requestBody = {
    ...properties,
    content: {
      'application/json': {
        schema,
        example,
        examples,
      },
    },
  };
};

export const addResponsesMetadata = <T extends TSchema>(
  target: object,
  methodName: string | symbol,
  statusCode: string,
  parameters: ResponseParameters<T>,
): void => {
  const metadata = getOrCreateOperationMetadata(target, methodName);

  const { content, ...properties } = parameters;

  if (!metadata.operationObject.responses) {
    metadata.operationObject.responses = {};
  }

  const response: ResponseObject = {
    ...properties,
  };

  if (content && hasValues(content)) {
    response.content = {
      'application/json': content,
    };
  }

  // TODO: add default response to operation responses metadata

  metadata.operationObject.responses[statusCode] = response;
};
