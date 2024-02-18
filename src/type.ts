import { OperationObject, PathItemObject } from 'openapi3-ts/oas31';

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

export type Operation = OperationObject & {
  method?: OperationMethod;
};
