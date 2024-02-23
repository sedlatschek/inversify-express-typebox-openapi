import { OpenApiBuilder, PathItemObject } from 'openapi3-ts/oas31';
import { Controller } from './type';
import { collectSchemasAndReplaceWithReferences } from './reference';

export const injectControllers = (
  builder: OpenApiBuilder,
  controllers: Controller[],
): OpenApiBuilder => {
  if (builder.rootDoc.components === undefined) {
    builder.rootDoc.components = {};
  }

  if (builder.rootDoc.components.schemas === undefined) {
    builder.rootDoc.components.schemas = {};
  }

  for (const controller of controllers) {
    for (const route of controller.routes) {
      collectSchemasAndReplaceWithReferences(
        builder.rootDoc.components.schemas,
        route.operations,
      );

      const pathItem: PathItemObject = {};
      for (const operation of route.operations) {
        if (!operation.method) {
          throw new Error('Operation method is required');
        }
        pathItem[operation.method] = operation.operationObject;
      }
      builder.addPath(getRoutePath(controller.path, route.path), pathItem);
    }
  }

  return builder;
};

const pathSlashReplaceRegex = /\/\/+/g;
const pathParamReplaceRegex = /:([^/]+)/g;

const getRoutePath = (controllerPath: string, routePath: string): string => {
  return `${controllerPath}/${routePath}`
    .replace(pathSlashReplaceRegex, '/')
    .replace(pathParamReplaceRegex, '{$1}');
};
