import {
  ComponentsObject,
  ReferenceObject,
  isReferenceObject,
} from 'openapi3-ts/oas31';
import { equalsRegardlessOfItemOrPropertyOrder } from '../utilize';

export type IdentifiableObject<T extends object> = T & {
  $id: string;
};

export const isIdentifiableObject = <T extends object>(
  object: T | null | undefined,
): object is IdentifiableObject<T> => {
  return (
    typeof object === 'object' &&
    object !== null &&
    '$id' in object &&
    object.$id !== undefined
  );
};

export const identifiable = <T extends object>(
  object: T,
  additionalProperties: { $id: string },
): IdentifiableObject<T> => {
  return { ...object, ...additionalProperties };
};

export const withoutId = <T extends object>(
  object: { $id?: string } & T,
): T => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { $id, ...cleanObject } = object;
  return cleanObject as T;
};

export const reference = <T>(
  components: ComponentsObject,
  componentsKey: keyof ComponentsObject,
  record: T,
): T | ReferenceObject => {
  if (Array.isArray(record)) {
    for (let i = 0; i < record.length; i++) {
      record[i] = reference(components, componentsKey, record[i]);
    }
  }

  if (
    isReferenceObject(record) ||
    typeof record !== 'object' ||
    record === null
  ) {
    return record;
  }

  for (const key of Object.keys(record)) {
    const property = key as keyof typeof record;
    const value = record[property];
    if (typeof value === 'object' && value !== null) {
      record[property] = reference(
        components,
        getComponentsKey(key) ?? componentsKey,
        value,
      ) as (typeof record)[keyof typeof record];
    }
  }

  if (!isIdentifiableObject(record)) {
    return record;
  }

  const { $id, ...cleanRecord } = record;

  return addComponent(components, componentsKey, $id, cleanRecord);
};

export const getComponentsKey = (
  propertyKey: string,
): keyof ComponentsObject | undefined => {
  if (
    [
      'parameters',
      'responses',
      'examples',
      'headers',
      'links',
      'callbacks',
    ].includes(propertyKey)
  ) {
    return propertyKey as keyof ComponentsObject;
  }
  if (propertyKey === 'schema') {
    return 'schemas';
  }
  if (propertyKey === 'requestBody') {
    return 'requestBodies';
  }

  return undefined;
};

export const addComponent = (
  components: ComponentsObject,
  componentsKey: keyof ComponentsObject,
  id: string,
  target: object,
): ReferenceObject => {
  const existingRecord = components[componentsKey]?.[id];
  if (
    existingRecord &&
    !isReferenceObject(existingRecord) &&
    !equalsRegardlessOfItemOrPropertyOrder(existingRecord, target)
  ) {
    throw new Error(
      `Component with identifier "${id}" already exists in ${componentsKey} and does not match the new component.\nExisting: ${JSON.stringify(existingRecord, null, 2)}\nNew: ${JSON.stringify(target, null, 2)}`,
    );
  }

  if (!components[componentsKey]) {
    components[componentsKey] = {};
  }

  components[componentsKey][id] = target;

  return { $ref: `#/components/${componentsKey}/${id}` };
};

export const referenceArray = <T extends object>(
  components: ComponentsObject,
  componentKey: keyof Pick<ComponentsObject, 'parameters'>, // TODO: automatically determine possible keys
  records: (T | ReferenceObject)[],
): (T | ReferenceObject)[] => {
  const newRecords: (T | ReferenceObject)[] = [];
  for (const record of records) {
    newRecords.push(reference(components, componentKey, record));
  }
  return newRecords;
};

export const referenceMap = <T extends object>(
  components: ComponentsObject,
  componentKey: keyof Pick<
    ComponentsObject,
    'responses' | 'examples' | 'headers' | 'links' | 'callbacks'
  >, // TODO: automatically determine possible keys
  records: { [name: string]: T | ReferenceObject },
): Record<string, T | ReferenceObject> => {
  const newRecords = { ...records };
  for (const [key, value] of Object.entries(newRecords)) {
    newRecords[key] = reference(components, componentKey, value);
  }
  return newRecords;
};
