import 'reflect-metadata';
import { TSchema } from '@sinclair/typebox';
import {
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
import { addBodyMetadata, addParametersMetadata } from './reflect';

export {
  controller as Controller,
  httpDelete as Delete,
  httpGet as Get,
  httpHead as Head,
  httpPatch as Patch,
  httpPost as Post,
  httpPut as Put,
};

export function Path(name: string, schema: TSchema): ParameterDecorator {
  return (
    target: Object,
    methodName: string | symbol | undefined,
    parameterIndex: number,
  ) => {
    if (methodName) {
      addParametersMetadata(target, methodName, 'path', schema, name);
    }
    requestParam(name)(target, methodName, parameterIndex);
  };
}

export function Query(name: string, schema: TSchema): ParameterDecorator {
  return (
    target: Object,
    methodName: string | symbol | undefined,
    parameterIndex: number,
  ) => {
    if (methodName) {
      addParametersMetadata(target, methodName, 'query', schema, name);
    }
    queryParam(name)(target, methodName, parameterIndex);
  };
}

export function Cookie(name: string, schema: TSchema): ParameterDecorator {
  return (
    target: Object,
    methodName: string | symbol | undefined,
    parameterIndex: number,
  ) => {
    if (methodName) {
      addParametersMetadata(target, methodName, 'cookie', schema, name);
    }
    queryParam(name)(target, methodName, parameterIndex);
  };
}

export function Header(name: string, schema: TSchema): ParameterDecorator {
  return (
    target: Object,
    methodName: string | symbol | undefined,
    parameterIndex: number,
  ) => {
    if (methodName) {
      addParametersMetadata(target, methodName, 'header', schema, name);
    }
    queryParam(name)(target, methodName, parameterIndex);
  };
}

export function Body(schema: TSchema): ParameterDecorator {
  return (
    target: Object,
    methodName: string | symbol | undefined,
    parameterIndex: number,
  ) => {
    if (methodName) {
      addBodyMetadata(target, methodName, schema);
    }
    requestBody()(target, methodName, parameterIndex);
  };
}
