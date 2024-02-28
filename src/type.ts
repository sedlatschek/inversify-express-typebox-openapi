import {
  OperationObject,
  ParameterObject,
  PathItemObject,
  ReferenceObject,
  RequestBodyObject,
  ResponseObject,
  SchemaObject,
  isReferenceObject,
} from 'openapi3-ts/oas31';

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

export type SchemasObject = {
  [schema: string]: SchemaObject | ReferenceObject;
};

export const isParameterObject = (
  parameter: ParameterObject | ReferenceObject | undefined,
): parameter is ParameterObject => {
  return !!parameter && !isReferenceObject(parameter);
};

export const isRequestBodyObject = (
  requestBody: RequestBodyObject | ReferenceObject | undefined,
): requestBody is RequestBodyObject => {
  return !!requestBody && !isReferenceObject(requestBody);
};

export const isResponseObject = (
  response: ResponseObject | ReferenceObject | undefined,
): response is ResponseObject => {
  return !!response && !isReferenceObject(response);
};

export const isSchemaObject = (
  schema: SchemaObject | ReferenceObject | undefined,
): schema is SchemaObject => {
  return !!schema && !isReferenceObject(schema);
};
