import { Static, TSchema } from '@sinclair/typebox';
import {
  BaseParameterObject,
  EncodingObject,
  ExampleObject,
  ISpecificationExtension,
  OperationObject,
  PathItemObject,
  ResponseObject,
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

export type BodyParameters<T extends TSchema> = {
  schema: T;
  example?: Static<T>;
  examples?: ExamplesObjectOf<Static<T>>;
} & Omit<BaseParameterObject, 'schema' | 'example' | 'examples' | 'content'>;

export type ParameterParameters<T extends TSchema> = BodyParameters<T>;

export type ResponseParameters<T extends TSchema> = {
  content?: MediaTypeObjectOf<T>;
} & Omit<ResponseObject, 'content'>;

export interface ContentObjectOf<T extends TSchema> {
  [mediaType: string]: MediaTypeObjectOf<T>;
}

export interface MediaTypeObjectOf<T extends TSchema>
  extends ISpecificationExtension {
  schema?: T;
  examples?: ExamplesObjectOf<Static<T>>;
  example?: Static<T>;
  encoding?: EncodingObject;
}
