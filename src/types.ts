import { TSchema } from '@sinclair/typebox';

export type Controller = {
  name: string;
  path: string;
  routes: Route[];
};

export type Route = {
  method: string;
  path: string;
  parameters?: ParameterMetadata;
};

export enum ParameterType {
  BODY = 'body',
  QUERY = 'query',
  PATH = 'path',
  HEADER = 'header',
}

export type Parameter = {
  name?: string;
  type: ParameterType;
  schema: TSchema;
};

export type ParameterMetadata = {
  [key in ParameterType]: Parameter[];
};
