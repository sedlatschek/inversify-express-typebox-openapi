import { expect, describe, it } from 'vitest';
import {
  equalsRegardlessOfItemOrPropertyOrder,
  hasProperty,
  hasValues,
  ucfirst,
  updateDefinedProperties,
} from '../../src/utilize';

describe('utilize', () => {
  describe('updateDefinedProperties', () => {
    it('should update defined properties', () => {
      const target = { a: 1, b: 2 };
      const update = { a: 3, c: undefined };

      updateDefinedProperties(target, update);

      expect(target).toEqual({ a: 3, b: 2 });
    });
  });

  describe('equalsRegardlessOfItemOrPropertyOrder', () => {
    it('should return true for equal objects with differing property order', () => {
      const a = { a: 1, b: 2 };
      const b = { b: 2, a: 1 };

      expect(equalsRegardlessOfItemOrPropertyOrder(a, b)).toBe(true);
    });

    it('should return false for objects with differing properties', () => {
      const a = { a: 1, b: 2 };
      const b = { b: 2, c: 3 };

      expect(equalsRegardlessOfItemOrPropertyOrder(a, b)).toBe(false);
    });

    it('should return true for equal arrays with differing item order', () => {
      const a = [1, 2];
      const b = [2, 1];

      expect(equalsRegardlessOfItemOrPropertyOrder(a, b)).toBe(true);
    });
  });

  describe('ucfirst', () => {
    it('should capitalize the first letter of a string', () => {
      expect(ucfirst('test')).toBe('Test');
    });
  });

  describe('hasValues', () => {
    it('should return true if an object has values', () => {
      expect(hasValues({ a: 1 })).toBe(true);
    });

    it('should return false if an object has no values', () => {
      expect(hasValues({})).toBe(false);
    });

    it('should return false if an object has only undefined values', () => {
      expect(hasValues({ a: undefined })).toBe(false);
    });

    it('should return false if passed value is undefined', () => {
      expect(hasValues(undefined as unknown as object)).toBe(false);
    });
  });

  describe('hasProperty', () => {
    it('should return false if the passed parameter is not a object', () => {
      expect(
        hasProperty(undefined as unknown as object, 'x' as keyof object),
      ).toBe(false);
    });

    it('should return false if the object does not have the property', () => {
      expect(hasProperty({}, 'x' as keyof object)).toBe(false);
    });

    it('should return true if the object has the property', () => {
      expect(hasProperty({ x: 1 }, 'x')).toBe(true);
    });
  });
});
