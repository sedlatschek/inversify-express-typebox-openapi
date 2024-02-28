import { OpenApiBuilder, PathItemObject } from 'openapi3-ts/oas31';
import { collectSchemasAndReplaceWithReferences } from './reference';
import { mergeBaseOperationIntoOperations } from './merge';
import { ControllerMetadata } from './type';

export const injectControllersIntoBuilder = (
  builder: OpenApiBuilder,
  controllers: ControllerMetadata[],
): OpenApiBuilder => {
  if (builder.rootDoc.components === undefined) {
    builder.rootDoc.components = {};
  }

  if (builder.rootDoc.components.schemas === undefined) {
    builder.rootDoc.components.schemas = {};
  }

  for (const controller of controllers) {
    if (!controller.config?.path) {
      throw new Error(`Path for controller ${controller.name} is missing`);
    }

    mergeBaseOperationIntoOperations(controller);
    collectSchemasAndReplaceWithReferences(
      builder.rootDoc.components.schemas,
      controller.operationMetadatas,
    );

    for (const operationMetadata of controller.operationMetadatas) {
      if (
        !operationMetadata.config?.method ||
        !operationMetadata.config?.path
      ) {
        throw new Error('Operation method and path are required');
      }

      const pathItem: PathItemObject = {};

      pathItem[operationMetadata.config.method] =
        operationMetadata.operationObject;

      builder.addPath(
        getRoutePath(controller.config?.path, operationMetadata.config?.path),
        pathItem,
      );
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
