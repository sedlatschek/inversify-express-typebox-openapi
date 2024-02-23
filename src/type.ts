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

export type Controller = {
  name: string;
  path: string;
  routes: Route[];
};

export type Route = {
  path: string;
  operations: Operation[];
};

export type OperationMethod = keyof Pick<
  PathItemObject,
  'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch' | 'trace'
>;

export type Operation = {
  method?: OperationMethod;
  operationObject: OperationObject;
  parameterIndices: number[];
};

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
