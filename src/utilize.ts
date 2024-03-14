import { State, createCustomEqual } from 'fast-equals';

/**
 * Update the properties of a target object in place with only the defined properties of another object.
 */
export const updateDefinedProperties = <T extends object>(
  target: T,
  update: Partial<T>,
): void => {
  for (const updateKey of Object.keys(update)) {
    const key = updateKey as keyof T;
    if (update[key] !== undefined) {
      target[key] = update[key]!;
    }
  }
};

const areArraysEqual = (
  a: unknown[],
  b: unknown[],
  state: State<unknown>,
): boolean => {
  let index = a.length;

  if (b.length !== index) {
    return false;
  }

  const sortedA = [...a].sort();
  const sortedB = [...b].sort();

  while (index-- > 0) {
    if (
      !state.equals(
        sortedA[index],
        sortedB[index],
        index,
        index,
        sortedA,
        sortedB,
        state,
      )
    ) {
      return false;
    }
  }

  return true;
};

export const equalsRegardlessOfItemOrPropertyOrder = createCustomEqual({
  createCustomConfig: () => {
    return {
      areArraysEqual,
    };
  },
});

export const ucfirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const hasValues = (obj: object): boolean => {
  if (!obj) {
    return false;
  }
  return Object.values(obj).some((value) => value !== undefined);
};

export const hasProperty = <T extends object, K extends keyof T>(
  object: T,
  key: K,
): object is T & Record<K, NonNullable<T[K]>> => {
  return (
    typeof object === 'object' &&
    key in object &&
    object[key] !== undefined &&
    object[key] !== null
  );
};
