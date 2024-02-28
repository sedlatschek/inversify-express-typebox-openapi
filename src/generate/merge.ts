import { OperationObject } from 'openapi3-ts/oas31';
import { ControllerMetadata } from '../type';

export const mergeBaseOperationIntoOperations = (
  controller: ControllerMetadata,
): void => {
  for (const operationMetadata of controller.operationMetadatas) {
    operationMetadata.operationObject.operationId = `${controller.baseOperationObject.operationId ?? controller.name}_${operationMetadata.operationObject?.operationId ?? operationMetadata.name}`;

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
        !operationMetadata.operationObject[property] &&
        controller.baseOperationObject[property]
      ) {
        operationMetadata.operationObject[property] =
          controller.baseOperationObject[property];
      }
    }

    // primitive arrays
    if (controller.baseOperationObject.tags) {
      operationMetadata.operationObject.tags = Array.from(
        new Set([
          ...(operationMetadata.operationObject.tags ?? []),
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
        operationMetadata.operationObject[property] = (
          operationMetadata.operationObject[property] ?? []
        ).concat(controller.baseOperationObject[property]);
      }
    }

    // maps
    const mapProperties: (keyof OperationObject)[] = ['callbacks', 'responses'];
    for (const property of mapProperties) {
      if (controller.baseOperationObject[property]) {
        operationMetadata.operationObject[property] = {
          ...controller.baseOperationObject[property],
          ...operationMetadata.operationObject[property],
        };
      }
    }
  }
};
