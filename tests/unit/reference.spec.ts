import 'reflect-metadata';
import { expect, describe, it } from 'vitest';
import { areEqualSchemas, referenceSchema } from '../../src/reference';
import { Type } from '@sinclair/typebox';

describe('generate', () => {
  describe('referenceSchema', () => {
    it('should return a reference to the schema', () => {
      const schemaPool = {};
      const schema = Type.Object({ id: Type.Number() }, { $id: 'TestSchema' });

      const reference = referenceSchema(schemaPool, schema);

      expect(reference).toEqual({
        $ref: '#/components/schemas/TestSchema',
      });
    });

    it("throws error if a schema with the same title doesn't match the new schema", () => {
      const schemaPool = {};
      const schema1 = Type.Object({ id: Type.Number() }, { $id: 'TestSchema' });
      const schema2 = Type.Object({ id: Type.String() }, { $id: 'TestSchema' });

      referenceSchema(schemaPool, schema1);

      expect(() => referenceSchema(schemaPool, schema2)).to.throw();
    });
  });

  describe('areEqualSchemas', () => {
    it('returns true for equal schemas', () => {
      const schema1 = Type.Object({ id: Type.Number() });
      const schema2 = Type.Object({ id: Type.Number() });

      expect(areEqualSchemas(schema1, schema2)).toBe(true);
    });

    it('return true for equal schemas with differing property order', () => {
      const schema1 = Type.Object({ id: Type.Number(), name: Type.String() });
      const schema2 = Type.Object({ name: Type.String(), id: Type.Number() });

      expect(areEqualSchemas(schema1, schema2)).toBe(true);

      expect(schema1.required).toEqual(['id', 'name']);
      expect(schema2.required).toEqual(['name', 'id']);
    });

    it('returns false for different schemas', () => {
      const schema1 = Type.Object({ id: Type.Number() });
      const schema2 = Type.Object({ id: Type.String() });

      expect(areEqualSchemas(schema1, schema2)).toBe(false);
    });
  });
});
