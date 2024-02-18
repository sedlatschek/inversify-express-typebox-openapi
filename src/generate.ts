import {
  OpenApiBuilder,
  ParameterObject,
  PathItemObject,
  RequestBodyObject,
} from 'openapi3-ts/oas31';
import { Controller, Route } from './type';
import { TSchema } from '@sinclair/typebox';
import { mapTypeBoxSchemaToOpenAPISchema } from './map';

export const injectControllers = (
  builder: OpenApiBuilder,
  controllers: Controller[],
): OpenApiBuilder => {
  for (const controller of controllers) {
    for (const route of controller.routes) {
      const pathItem: PathItemObject = {
        [route.method]: {
          requestBody: getBody(route),
          parameters: getParameters(route),
        },
      };
      builder.addPath(getRoutePath(controller.path, route.path), pathItem);
    }
  }

  return builder;
};

const pathParamReplaceRegex = /:([^/]+)/g;

const getRoutePath = (controllerPath: string, routePath: string): string => {
  return `${controllerPath}${routePath}`.replace(pathParamReplaceRegex, '{$1}');
};

const getBody = (route: Route): RequestBodyObject | undefined => {
  const bodySchema: TSchema | undefined = route.body?.schema;

  if (!bodySchema) {
    return undefined;
  }

  return {
    content: {
      body: {
        schema: mapTypeBoxSchemaToOpenAPISchema(bodySchema),
      },
    },
  };
};

const getParameters = (route: Route): ParameterObject[] => {
  return (route.parameters ?? []).map((parameter) => ({
    name: parameter.name,
    in: parameter.type,
    schema: mapTypeBoxSchemaToOpenAPISchema(parameter.schema),
  }));
};
