import { OperationObject } from 'openapi3-ts/oas31';

export const mergeIntoOperation = (
  a: OperationObject,
  b: Partial<OperationObject>,
): void => {
  mergeAtomicProperties(
    a,
    b,
    'operationId',
    'summary',
    'description',
    'externalDocs',
    'requestBody',
    'deprecated',
  );
  concatPrimitiveArrays(a, b, 'tags');
  concatArrays(a, b, 'parameters', 'servers', 'security');
  mergeMaps(a, b, 'callbacks', 'responses');
};

export const mergeAtomicProperties = (
  a: OperationObject,
  b: Partial<OperationObject>,
  ...properties: (keyof OperationObject)[] // TODO: Restrict to properties that are actually atomic
): void => {
  for (const property of properties) {
    if (!a[property] && b[property]) {
      a[property] = b[property];
    }
  }
};

export const concatPrimitiveArrays = (
  a: OperationObject,
  b: Partial<OperationObject>,
  ...properties: (keyof OperationObject)[] // TODO: Restrict to properties that are actually an array of primitives
): void => {
  for (const property of properties) {
    if (b[property]) {
      a[property] = Array.from(
        new Set([...(a[property] ?? []), ...b[property]]),
      );
    }
  }
};

export const concatArrays = (
  a: OperationObject,
  b: Partial<OperationObject>,
  ...properties: (keyof OperationObject)[] // TODO: Restrict to properties that are actually an array of objects
): void => {
  for (const property of properties) {
    if (b[property]) {
      a[property] = [...(a[property] ?? []), ...b[property]];
    }
  }
};

export const mergeMaps = <OperationObject>(
  a: OperationObject,
  b: Partial<OperationObject>,
  ...properties: (keyof OperationObject)[] // TODO: Restrict to properties that are actually a map
): void => {
  for (const property of properties) {
    if (b[property]) {
      a[property] = {
        ...a[property],
        ...b[property],
      };
    }
  }
};
