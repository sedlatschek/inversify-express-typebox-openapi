import { OperationObject } from 'openapi3-ts/oas31';
import { ParsedController } from './parse';
import { OperationMetadata } from './reflect';

export const mergeBaseOperationIntoOperations = (
  controller: ParsedController,
  operationMetadatas: OperationMetadata[],
): void => {
  for (const operationMetadata of operationMetadatas) {
    mergeBaseOperationIntoOperation(controller, operationMetadata);
  }
};

export const mergeBaseOperationIntoOperation = (
  controller: ParsedController,
  metadata: OperationMetadata,
): void => {
  metadata.operationObject.operationId = `${controller.baseOperationObject.operationId ?? controller.name}_${metadata.operationObject?.operationId ?? metadata.config?.name}`;

  // atomic properties
  const atomicProperties: (keyof OperationObject)[] = [
    'summary',
    'description',
    'externalDocs',
    'requestBody',
    'deprecated',
  ];
  for (const property of atomicProperties) {
    if (
      !metadata.operationObject[property] &&
      controller.baseOperationObject[property]
    ) {
      metadata.operationObject[property] =
        controller.baseOperationObject[property];
    }
  }

  // primitive arrays
  if (controller.baseOperationObject.tags) {
    metadata.operationObject.tags = Array.from(
      new Set([
        ...(metadata.operationObject.tags ?? []),
        ...controller.baseOperationObject.tags,
      ]),
    );
  }

  // object arrays
  const objectArrayProperties: (keyof OperationObject)[] = [
    'parameters',
    'security',
    'servers',
  ];
  for (const property of objectArrayProperties) {
    if (controller.baseOperationObject[property]) {
      metadata.operationObject[property] = (
        metadata.operationObject[property] ?? []
      ).concat(controller.baseOperationObject[property]);
    }
  }

  // maps
  const mapProperties: (keyof OperationObject)[] = ['callbacks', 'responses'];
  for (const property of mapProperties) {
    if (controller.baseOperationObject[property]) {
      metadata.operationObject[property] = {
        ...controller.baseOperationObject[property],
        ...metadata.operationObject[property],
      };
    }
  }
};
