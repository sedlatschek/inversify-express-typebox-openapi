import {
  ExampleObject,
  OperationObject,
  PathItemObject,
} from 'openapi3-ts/oas31';
import { IdentifiableObject } from './generate/reference';

export type ControllerConfig = {
  path?: string;
};

export type ControllerMetadata = {
  name: string;
  config?: ControllerConfig;
  baseOperationObject: OperationObject;
  operationMetadatas: OperationMetadata[];
};

export type OperationConfig = {
  method?: OperationMethod;
  path?: string;
};

export type OperationMetadata = {
  name: string;
  parameterIndices: number[];
  config: OperationConfig;
  operationObject: OperationObject;
};

export type OperationMethod = keyof Pick<
  PathItemObject,
  'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch' | 'trace'
>;

export type ExampleObjectOf<T> = Omit<ExampleObject, 'value'> & {
  value: T;
};

export type ExamplesObjectOf<T> = {
  [name: string]: IdentifiableObject<ExampleObjectOf<T>> | ExampleObjectOf<T>;
};
