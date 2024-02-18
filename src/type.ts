import { TSchema } from '@sinclair/typebox';
import { ParameterLocation } from 'openapi3-ts/oas31';

export type Controller = {
  name: string;
  path: string;
  routes: Route[];
};

export type Route = {
  method: string;
  path: string;
  parameters?: Parameter[];
  body?: Body;
};

export type Parameter = {
  name: string;
  type: ParameterLocation;
  schema: TSchema;
};

export type Body = {
  schema: TSchema;
};
