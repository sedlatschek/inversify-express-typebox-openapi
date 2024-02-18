import { OpenApiBuilder, PathItemObject } from 'openapi3-ts/oas31';
import { Controller } from './type';

export const injectControllers = (
  builder: OpenApiBuilder,
  controllers: Controller[],
): OpenApiBuilder => {
  for (const controller of controllers) {
    for (const route of controller.routes) {
      const pathItem: PathItemObject = {};
      for (const operation of route.operations) {
        if (!operation.method) {
          throw new Error('Operation method is required');
        }

        const operationObject = { ...operation };
        delete operationObject.method;

        pathItem[operation.method] = operationObject;
      }
      builder.addPath(getRoutePath(controller.path, route.path), pathItem);
    }
  }

  return builder;
};

const pathParamReplaceRegex = /:([^/]+)/g;

const getRoutePath = (controllerPath: string, routePath: string): string => {
  return `${controllerPath}${routePath}`.replace(pathParamReplaceRegex, '{$1}');
};
