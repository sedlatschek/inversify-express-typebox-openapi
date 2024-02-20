import { expect, describe, it } from 'vitest';
import { updateDefinedProperties } from '../../src/utilize';

describe('utilize', () => {
  describe('updateDefinedProperties', () => {
    it('should update defined properties', () => {
      const target = { a: 1, b: 2 };
      const update = { a: 3, c: undefined };

      updateDefinedProperties(target, update);

      expect(target).toEqual({ a: 3, b: 2 });
    });
  });
});
