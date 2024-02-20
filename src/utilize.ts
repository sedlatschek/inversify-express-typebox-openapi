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
