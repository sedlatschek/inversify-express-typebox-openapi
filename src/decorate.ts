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
} from './reflect';
import { OperationMethod } from './type';
import { ParameterLocation } from 'openapi3-ts/oas31';

export { controller as Controller };

export type InversifyMethodDecorator = (
  path: string,
  ...middleware: Array<Middleware>
) => HandlerDecorator;

const operationDecoratorFactory = (
  inversifyMethodDecorator: InversifyMethodDecorator,
  method: OperationMethod,
): ((path: string, ...middleware: Array<Middleware>) => HandlerDecorator) => {
  return (path: string, ...middleware: Array<Middleware>) => {
    return (target: object, key: string, descriptor: PropertyDescriptor) => {
      addOperationMetadata(target, key, { method });
      inversifyMethodDecorator(path, ...middleware)(target, key, descriptor);
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
): ((name: string, schema: TSchema) => ParameterDecorator) => {
  return (name: string, schema: TSchema): ParameterDecorator => {
    return (
      target: object,
      methodName: string | symbol | undefined,
      parameterIndex: number,
    ) => {
      if (!methodName) {
        throw new Error('Parameter decorators must have a method name');
      }
      addParametersMetadata(target, methodName, parameterIndex, {
        name,
        in: type,
        schema,
      });
      inversifyParameterDecorator(name)(target, methodName, parameterIndex);
    };
  };
};

export const Path = parameterDecoratorFactory(requestParam, 'path');
export const Query = parameterDecoratorFactory(queryParam, 'query');
export const Cookie = parameterDecoratorFactory(queryParam, 'cookie');
export const Header = parameterDecoratorFactory(queryParam, 'header');

export function Body(schema: TSchema): ParameterDecorator {
  return (
    target: object,
    propertyKey: string | symbol | undefined,
    parameterIndex: number,
  ) => {
    if (!propertyKey) {
      throw new Error('Body decorators must have a method name');
    }
    addBodyMetadata(target, propertyKey, schema);
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
      throw new Error('Deprecated decorators must have a method name');
    }
    if (typeof parameterIndex === 'number') {
      // Parameter decorator
      addParametersMetadata(target, propertyKey, parameterIndex, {
        deprecated: true,
      });
    } else {
      // Method decorator
      addOperationMetadata(target, propertyKey, { deprecated: true });
    }
  };
};
