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
import { TcpSocketConnectOpts } from 'net';

export { controller as Controller };

export function Get(
  path: string,
  ...middleware: Array<Middleware>
): HandlerDecorator {
  return (
    target: object,
    methodName: string,
    descriptor: PropertyDescriptor,
  ) => {
    console.log('Get', methodName);
    createOperationMetadata(target, methodName, 'get');
    httpGet(path, ...middleware)(target, methodName, descriptor);
  };
}

export function Post(
  path: string,
  ...middleware: Array<Middleware>
): HandlerDecorator {
  return (
    target: object,
    methodName: string,
    descriptor: PropertyDescriptor,
  ) => {
    console.log('Post', methodName);
    createOperationMetadata(target, methodName, 'post');
    httpPost(path, ...middleware)(target, methodName, descriptor);
  };
}

export function Patch(
  path: string,
  ...middleware: Array<Middleware>
): HandlerDecorator {
  return (
    target: object,
    methodName: string,
    descriptor: PropertyDescriptor,
  ) => {
    console.log('Patch', methodName);
    createOperationMetadata(target, methodName, 'patch');
    httpPatch(path, ...middleware)(target, methodName, descriptor);
  };
}

export function Put(
  path: string,
  ...middleware: Array<Middleware>
): HandlerDecorator {
  return (
    target: object,
    methodName: string,
    descriptor: PropertyDescriptor,
  ) => {
    console.log('Put', methodName);
    createOperationMetadata(target, methodName, 'put');
    httpPut(path, ...middleware)(target, methodName, descriptor);
  };
}

export function Head(
  path: string,
  ...middleware: Array<Middleware>
): HandlerDecorator {
  return (
    target: object,
    methodName: string,
    descriptor: PropertyDescriptor,
  ) => {
    console.log('Head', methodName);
    createOperationMetadata(target, methodName, 'head');
    httpHead(path, ...middleware)(target, methodName, descriptor);
  };
}

export function Delete(
  path: string,
  ...middleware: Array<Middleware>
): HandlerDecorator {
  return (
    target: object,
    methodName: string,
    descriptor: PropertyDescriptor,
  ) => {
    console.log('Delete', methodName);
    createOperationMetadata(target, methodName, 'delete');
    httpDelete(path, ...middleware)(target, methodName, descriptor);
  };
}

export function Response(
  statusCode: string | number,
  description: string,
  schema?: TSchema,
): HandlerDecorator {
  return (target: object, methodName: string) => {
    console.log('Response', methodName);
    addResponsesMetadata(
      target,
      methodName,
      statusCode.toString(),
      description,
      schema,
    );
  };
}

export function Path(name: string, schema: TSchema): ParameterDecorator {
  return (
    target: object,
    methodName: string | symbol | undefined,
    parameterIndex: number,
  ) => {
    console.log('Path', methodName);
    if (methodName) {
      addParametersMetadata(target, methodName, 'path', schema, name);
    }
    requestParam(name)(target, methodName, parameterIndex);
  };
}

export function Query(name: string, schema: TSchema): ParameterDecorator {
  return (
    target: object,
    methodName: string | symbol | undefined,
    parameterIndex: number,
  ) => {
    if (methodName) {
      console.log('Query', methodName);
      addParametersMetadata(target, methodName, 'query', schema, name);
    }
    queryParam(name)(target, methodName, parameterIndex);
  };
}

export function Cookie(name: string, schema: TSchema): ParameterDecorator {
  return (
    target: object,
    methodName: string | symbol | undefined,
    parameterIndex: number,
  ) => {
    if (methodName) {
      console.log('Cookie', methodName);
      addParametersMetadata(target, methodName, 'cookie', schema, name);
    }
    queryParam(name)(target, methodName, parameterIndex);
  };
}

export function Header(name: string, schema: TSchema): ParameterDecorator {
  return (
    target: object,
    methodName: string | symbol | undefined,
    parameterIndex: number,
  ) => {
    if (methodName) {
      console.log('Header', methodName);
      addParametersMetadata(target, methodName, 'header', schema, name);
    }
    queryParam(name)(target, methodName, parameterIndex);
  };
}

export function Body(schema: TSchema): ParameterDecorator {
  return (
    target: object,
    methodName: string | symbol | undefined,
    parameterIndex: number,
  ) => {
    if (methodName) {
      console.log('Body', methodName);
      addBodyMetadata(target, methodName, schema);
    }
    requestBody()(target, methodName, parameterIndex);
  };
}
