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
