import { OpenApiBuilder, PathItemObject } from 'openapi3-ts/oas31';
import { collectSchemasAndReplaceWithReferences } from './reference';
import { mergeBaseOperationIntoOperations } from './merge';
import { ParsedController } from './parse';

export const injectControllersIntoBuilder = (
  builder: OpenApiBuilder,
  controllers: ParsedController[],
): OpenApiBuilder => {
  if (builder.rootDoc.components === undefined) {
    builder.rootDoc.components = {};
  }

  if (builder.rootDoc.components.schemas === undefined) {
    builder.rootDoc.components.schemas = {};
  }

  for (const controller of controllers) {
    for (const route of controller.routes) {
      mergeBaseOperationIntoOperations(controller, route.operationMetadatas);

      collectSchemasAndReplaceWithReferences(
        builder.rootDoc.components.schemas,
        route.operationMetadatas,
      );

      const pathItem: PathItemObject = {};
      for (const operationMetadata of route.operationMetadatas) {
        if (!operationMetadata.config?.method) {
          throw new Error('Operation method is required');
        }
        pathItem[operationMetadata.config.method] =
          operationMetadata.operationObject;
      }

      console.log('pathItem', pathItem);

      builder.addPath(getRoutePath(controller.path, route.path), pathItem);
    }
  }

  return builder;
};

const pathSlashReplaceRegex = /\/\/+/g;
const pathParamReplaceRegex = /:([^/]+)/g;

export const getRoutePath = (
  controllerPath: string,
  routePath: string,
): string => {
  return `${controllerPath}/${routePath}`
    .replace(pathSlashReplaceRegex, '/')
    .replace(pathParamReplaceRegex, '{$1}');
};
