import { OpenApiBuilder, PathItemObject } from 'openapi3-ts/oas31';
import { mergeIntoOperation } from '../merge';
import { ControllerMetadata } from '../type';
import { createReferences } from './create-references';

export const injectControllersIntoBuilder = (
  builder: OpenApiBuilder,
  controllers: ControllerMetadata[],
): OpenApiBuilder => {
  if (builder.rootDoc.components === undefined) {
    builder.rootDoc.components = {};
  }

  for (const controller of controllers) {
    if (!controller.config?.path) {
      throw new Error(`Path for controller ${controller.name} is missing`);
    }

    mergeBaseOperationIntoAllOperations(controller);

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

      createReferences(
        builder.rootDoc.components,
        operationMetadata.operationObject,
      );

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

export const mergeBaseOperationIntoAllOperations = (
  controller: ControllerMetadata,
): void => {
  for (const operationMetadata of controller.operationMetadatas) {
    operationMetadata.operationObject.operationId = `${controller.baseOperationObject.operationId ?? controller.name}_${operationMetadata.operationObject?.operationId ?? operationMetadata.name}`;
    mergeIntoOperation(
      operationMetadata.operationObject,
      controller.baseOperationObject,
    );
  }
};
