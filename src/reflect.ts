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
  BodyParameters,
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

export const getTypeOfParameterIndex = (
  target: object,
  methodName: string | symbol,
  parameterIndex: number,
): ParameterLocation | 'body' | undefined => {
  const operationMetadata = getOperationMetadata(target, methodName);

  if (operationMetadata?.bodyParameterIndex === parameterIndex) {
    return 'body';
  }

  const index = getIndexByParameterIndex(target, methodName, parameterIndex);
  if (index !== undefined) {
    const parameter = operationMetadata?.operationObject.parameters?.[index];
    if (parameter && !isReferenceObject(parameter)) {
      return parameter.in;
    }
  }

  return undefined;
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
  // reroute if we already know its a body parameter
  if (getTypeOfParameterIndex(target, methodName, parameterIndex) === 'body') {
    addBodyMetadata(target, methodName, parameterIndex, parameters);
    return;
  }

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

  updateDefinedProperties(parameter, {
    ...metadata,
    ...parameters,
    ...calculatedProps,
  });
  operationMetadata.operationObject.parameters[arrayIndex] = parameter;
};

export const convertParameterMetadataToBodyMetadata = (
  target: object,
  methodName: string | symbol,
  parameterIndex: number,
): void => {
  const operationMetadata = getOperationMetadata(target, methodName);

  if (!operationMetadata) {
    throw new Error('Could not find operation metadata');
  }

  if (operationMetadata.bodyParameterIndex === parameterIndex) {
    throw new Error('Parameter is already a body parameter');
  }

  const parameter = getParameterMetadata(target, methodName, parameterIndex);

  if (!parameter) {
    throw new Error(
      `Could not find parameter at index ${parameterIndex} in operation metadata`,
    );
  }

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
  operationMetadata.operationObject.parameters?.splice(arrayIndex, 1);
  operationMetadata.parameterIndices.splice(arrayIndex, 1);

  operationMetadata.bodyParameterIndex = parameterIndex;

  const { schema, example, examples } = parameter;

  operationMetadata.operationObject.requestBody = {
    content: {
      'application/json': {
        ...(schema !== undefined && { schema }),
        ...(example !== undefined && { example }),
        ...(examples !== undefined && { examples }),
      },
    },
  };
};

export const addBodyMetadata = <T extends TSchema>(
  target: object,
  methodName: string | symbol,
  parameterIndex: number,
  parameters: BodyParameters<T>,
): void => {
  const metadata = getOrCreateOperationMetadata(target, methodName);

  // Since we can not tell from decorators such as Example whether the parameter
  // is a body or any other parameter, the example may ends up in the parameters
  // array. Therefore we need to check if the parameter is already defined in
  // the parameters array and move it to the requestBody object.
  if (metadata.parameterIndices.includes(parameterIndex)) {
    convertParameterMetadataToBodyMetadata(target, methodName, parameterIndex);
  }

  if (metadata.operationObject.requestBody) {
    updateBodyMetadata(target, methodName, parameters);
  } else {
    createBodyMetadata(target, methodName, parameterIndex, parameters);
  }
};

export const createBodyMetadata = <T extends TSchema>(
  target: object,
  methodName: string | symbol,
  parameterIndex: number,
  parameters: BodyParameters<T>,
): void => {
  const metadata = getOrCreateOperationMetadata(target, methodName);

  const { schema, example, examples, ...properties } = parameters;

  metadata.operationObject.requestBody = {
    ...properties,
    content: {
      'application/json': {
        ...(schema !== undefined && { schema }),
        ...(example !== undefined && { example }),
        ...(examples !== undefined && { examples }),
      },
    },
  };
  metadata.bodyParameterIndex = parameterIndex;
};

export const updateBodyMetadata = <T extends TSchema>(
  target: object,
  methodName: string | symbol,
  parameters: BodyParameters<T>,
): void => {
  const metadata = getOrCreateOperationMetadata(target, methodName);

  if (!metadata.operationObject.requestBody) {
    throw new Error('Could not find request body in operation metadata');
  }

  if (isReferenceObject(metadata.operationObject.requestBody)) {
    throw new Error('Request body is a reference object');
  }

  const { schema, example, examples, ...properties } = parameters;

  updateDefinedProperties(metadata.operationObject.requestBody, properties);
  updateDefinedProperties(
    metadata.operationObject.requestBody.content['application/json'],
    { schema, example, examples },
  );
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

  metadata.operationObject.responses[statusCode] = response;
};
