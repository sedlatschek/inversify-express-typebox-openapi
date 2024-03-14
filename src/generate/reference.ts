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
  object: T,
): object is IdentifiableObject<T> => {
  return (
    typeof object === 'object' && '$id' in object && object.$id !== undefined
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

export const reference = <T extends object>(
  components: ComponentsObject,
  componentKey: keyof ComponentsObject,
  record: T | ReferenceObject,
): T | ReferenceObject => {
  if (isReferenceObject(record)) {
    return record;
  }
  if (!isIdentifiableObject(record)) {
    return record;
  }

  if (!components[componentKey]) {
    components[componentKey] = {};
  }

  const { $id, ...cleanRecord } = record;

  const existingRecord = components[componentKey][$id];
  if (
    existingRecord &&
    !isReferenceObject(existingRecord) &&
    !equalsRegardlessOfItemOrPropertyOrder(existingRecord, cleanRecord)
  ) {
    throw new Error(
      `Component with identifier "${$id}" already exists in ${componentKey} and does not match the new component.\nExisting: ${JSON.stringify(existingRecord, null, 2)}\nNew: ${JSON.stringify(cleanRecord, null, 2)}`,
    );
  }

  components[componentKey][$id] = cleanRecord as T;

  return { $ref: `#/components/${componentKey}/${$id}` };
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
