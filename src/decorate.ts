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
  createOperationMetadata,
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
    return (
      target: object,
      methodName: string,
      descriptor: PropertyDescriptor,
    ) => {
      createOperationMetadata(target, methodName, method);
      inversifyMethodDecorator(path, ...middleware)(
        target,
        methodName,
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
      addParametersMetadata(target, methodName, type, schema, name);
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
    methodName: string | symbol | undefined,
    parameterIndex: number,
  ) => {
    if (!methodName) {
      throw new Error('Body decorators must have a method name');
    }
    addBodyMetadata(target, methodName, schema);
    requestBody()(target, methodName, parameterIndex);
  };
}
