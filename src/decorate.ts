import 'reflect-metadata';
import { TSchema } from '@sinclair/typebox';
import {
  HandlerDecorator,
  Middleware,
  controller,
  httpDelete,
  httpGet,
  httpHead,
  httpPatch,
  httpPost,
  httpPut,
  queryParam,
  requestBody,
  requestParam,
} from 'inversify-express-utils';
import {
  addBodyMetadata,
  addParametersMetadata,
  addResponsesMetadata,
  addOperationMetadata,
  addControllerMetadata,
} from './reflect';
import { OperationMethod } from './type';
import {
  ParameterLocation,
  SecurityRequirementObject,
} from 'openapi3-ts/oas31';
import { ucfirst } from './utilize';

export const Controller = (
  path: string,
  ...middleware: Array<Middleware>
): ClassDecorator => {
  return (target: object): void => {
    addControllerMetadata(target, {
      config: { path },
    });
    controller(path, ...middleware)(target);
  };
};

export type InversifyMethodDecorator = (
  path: string,
  ...middleware: Array<Middleware>
) => HandlerDecorator;

const operationDecoratorFactory = (
  inversifyMethodDecorator: InversifyMethodDecorator,
  method: OperationMethod,
): ((
  path: string,
  description?: string,
  ...middleware: Array<Middleware>
) => HandlerDecorator) => {
  return (
    path: string,
    description?: string,
    ...middleware: Array<Middleware>
  ) => {
    return (
      target: object,
      propertyKey: string,
      descriptor: PropertyDescriptor,
    ) => {
      addOperationMetadata(target, propertyKey, {
        config: { method, path },
        metadataProperties: { description },
      });
      inversifyMethodDecorator(path, ...middleware)(
        target,
        propertyKey,
        descriptor,
      );
    };
  };
};

export const Get = operationDecoratorFactory(httpGet, 'get');
export const Post = operationDecoratorFactory(httpPost, 'post');
export const Patch = operationDecoratorFactory(httpPatch, 'patch');
export const Put = operationDecoratorFactory(httpPut, 'put');
export const Head = operationDecoratorFactory(httpHead, 'head');
export const Delete = operationDecoratorFactory(httpDelete, 'delete');

export type InversifyParameterDecorator = (
  paramName?: string,
) => ParameterDecorator;

const parameterDecoratorFactory = (
  inversifyParameterDecorator: InversifyParameterDecorator,
  type: ParameterLocation,
): ((
  name: string,
  schema: TSchema,
  description?: string,
) => ParameterDecorator) => {
  return (
    name: string,
    schema: TSchema,
    description?: string,
  ): ParameterDecorator => {
    return (
      target: object,
      methodName: string | symbol | undefined,
      parameterIndex: number,
    ) => {
      if (!methodName) {
        throw new Error(
          `${ucfirst(type)} decorator can only be used on parameters`,
        );
      }
      addParametersMetadata(target, methodName, parameterIndex, {
        name,
        in: type,
        schema,
        description,
      });
      inversifyParameterDecorator(name)(target, methodName, parameterIndex);
    };
  };
};

export const Path = parameterDecoratorFactory(requestParam, 'path');
export const Query = parameterDecoratorFactory(queryParam, 'query');
export const Cookie = parameterDecoratorFactory(queryParam, 'cookie');
export const Header = parameterDecoratorFactory(queryParam, 'header');

export function Body(
  schema: TSchema,
  description?: string,
): ParameterDecorator {
  return (
    target: object,
    propertyKey: string | symbol | undefined,
    parameterIndex: number,
  ) => {
    if (!propertyKey) {
      throw new Error('Body decorator can only be used on parameters');
    }
    addBodyMetadata(target, propertyKey, schema, description);
    requestBody()(target, propertyKey, parameterIndex);
  };
}

export function Response(
  statusCode: string | number,
  description: string,
  schema?: TSchema,
): HandlerDecorator {
  return (target: object, methodName: string) => {
    addResponsesMetadata(
      target,
      methodName,
      statusCode.toString(),
      description,
      schema,
    );
  };
}

export const Deprecated = (): ParameterDecorator | HandlerDecorator => {
  return (
    target: object,
    propertyKey: string | symbol | undefined,
    parameterIndex?: number | TypedPropertyDescriptor<unknown> | undefined,
  ): void => {
    if (!propertyKey) {
      throw new Error(
        'Deprecated decorator can only be used on methods or parameters',
      );
    }

    const metadataProperties = { deprecated: true };

    if (typeof parameterIndex === 'number') {
      // Parameter decorator
      addParametersMetadata(
        target,
        propertyKey,
        parameterIndex,
        metadataProperties,
      );
    } else {
      // Method decorator
      addOperationMetadata(target, propertyKey, {
        metadataProperties,
      });
    }
  };
};

export const OperationId = (
  operationId: string,
): ClassDecorator & MethodDecorator => {
  return (target: object, propertyKey?: string | symbol | undefined) => {
    const metadataProperties = { operationId };

    if (propertyKey === undefined) {
      addControllerMetadata(target, { metadataProperties });
    } else {
      addOperationMetadata(target, propertyKey, {
        metadataProperties,
      });
    }
  };
};

export const Security = (
  securityObject: SecurityRequirementObject,
): ((target: object, propertyKey?: string | symbol | undefined) => void) => {
  return (target: object, propertyKey?: string | symbol | undefined): void => {
    const metadataProperties = { security: [securityObject] };

    if (!propertyKey) {
      addControllerMetadata(target, { metadataProperties });
    } else {
      addOperationMetadata(target, propertyKey, {
        metadataProperties,
      });
    }
  };
};

export const Tags = (
  ...tags: string[]
): ((target: object, propertyKey?: string | symbol | undefined) => void) => {
  return (target: object, propertyKey?: string | symbol | undefined): void => {
    const metadataProperties = { tags };

    if (!propertyKey) {
      addControllerMetadata(target, { metadataProperties });
    } else {
      addOperationMetadata(target, propertyKey, {
        metadataProperties,
      });
    }
  };
};
