import 'reflect-metadata';
import { TSchema } from '@sinclair/typebox';
import {
  httpGet,
  httpPost,
  queryParam,
  requestBody,
  requestParam,
} from 'inversify-express-utils';
import { addParametersMetadata } from './metadata';
import { ParameterType } from './types';

export function Get(path: string) {
  return httpGet(path);
}

export function Post(path: string) {
  return httpPost(path);
}

export function Path(name: string, schema: TSchema): ParameterDecorator {
  return (
    target: Object,
    methodName: string | symbol | undefined,
    parameterIndex: number,
  ) => {
    if (methodName) {
      addParametersMetadata(
        target,
        methodName,
        ParameterType.PATH,
        schema,
        name,
      );
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
      addParametersMetadata(target, methodName, ParameterType.QUERY, schema);
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
      addParametersMetadata(target, methodName, ParameterType.HEADER, schema);
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
      addParametersMetadata(target, methodName, ParameterType.BODY, schema);
    }
    requestBody()(target, methodName, parameterIndex);
  };
}
