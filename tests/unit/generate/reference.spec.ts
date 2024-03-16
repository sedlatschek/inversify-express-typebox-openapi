import 'reflect-metadata';
import { Kind, TSchema, Type } from '@sinclair/typebox';
import {
  ComponentsObject,
  ExamplesObject,
  ParameterObject,
} from 'openapi3-ts/oas31';
import { describe, expect, it } from 'vitest';
import { identifiable, isIdentifiableObject } from '../../../src';
import {
  addComponent,
  reference,
  referenceArray,
  referenceMap,
  withoutId,
} from '../../../src/generate/reference';

describe('generate', () => {
  describe('isIdentifiableObject', () => {
    it('should return true for an identifiable object', () => {
      const object = { a: 1, b: 2, $id: 'test' };

      expect(isIdentifiableObject(object)).toBe(true);
    });

    it('should return false for a non-identifiable object', () => {
      const object = { a: 1, b: 2 };

      expect(isIdentifiableObject(object)).toBe(false);
    });
  });

  describe('identifiable', () => {
    it('should add an id to an object', () => {
      const object = { a: 1, b: 2 };
      const identifiableObject = identifiable(object, { $id: 'test' });

      expect(identifiableObject).toEqual({ a: 1, b: 2, $id: 'test' });
    });
  });

  describe('withoutId', () => {
    it('should remove an id from an object', () => {
      const object = { a: 1, b: 2, $id: 'test' };
      const cleanObject = withoutId(object);

      expect(cleanObject).toEqual({ a: 1, b: 2 });
    });
  });

  describe('reference', () => {
    it('should return a reference object for an identifiable object', () => {
      const record = { a: 1, b: 2, $id: 'test' };

      const ref = reference({}, 'schemas', record);

      expect(ref).toEqual({ $ref: '#/components/schemas/test' });
    });

    it('should return a reference object for a reference object', () => {
      const record = { $ref: '#/components/schemas/test' };

      const ref = reference({}, 'schemas', record);

      expect(ref).toEqual({ $ref: '#/components/schemas/test' });
    });

    it('should add a record to the components object', () => {
      const record = { a: 1, b: 2, $id: 'test' };
      const components: ComponentsObject = {};

      reference(components, 'schemas', record);

      expect(components).toEqual({ schemas: { test: { a: 1, b: 2 } } });
    });

    it('should use existing record for an identifiable object', () => {
      const record: TSchema = Type.Object({
        a: Type.Number(),
        b: Type.Number(),
      });

      const components: ComponentsObject = {
        schemas: { test: record },
      };

      reference(
        components,
        'schemas',
        Type.Object(
          {
            a: Type.Number(),
            b: Type.Number(),
          },
          { $id: 'test' },
        ),
      );

      expect(components).toEqual({
        schemas: { test: record },
      });
    });

    it('should reference nested schemas', () => {
      const components: ComponentsObject = {};

      const nestedRecord = Type.Object(
        {
          a: Type.Number(),
          b: Type.Number(),
        },
        { $id: 'nested' },
      );

      const baseRecord = Type.Object(
        {
          a: Type.Number(),
          b: nestedRecord,
        },
        { $id: 'base' },
      );

      reference(components, 'schemas', baseRecord);

      expect(components).toEqual({
        schemas: {
          base: {
            properties: {
              a: Type.Number(),
              b: { $ref: '#/components/schemas/nested' },
            },
            required: ['a', 'b'],
            type: 'object',
            [Kind]: 'Object',
          },
          nested: {
            properties: {
              a: Type.Number(),
              b: Type.Number(),
            },
            required: ['a', 'b'],
            type: 'object',
            [Kind]: 'Object',
          },
        },
      });
    });
  });

  describe('addComponent', () => {
    it('should add a record to the components object', () => {
      const components: ComponentsObject = {};

      addComponent(components, 'schemas', 'test', { a: 1, b: 2 });

      expect(components).toEqual({ schemas: { test: { a: 1, b: 2 } } });
    });

    it('should throw an error if the record already exists', () => {
      const components: ComponentsObject = {
        schemas: { test: {} },
      };

      expect(() =>
        addComponent(components, 'schemas', 'test', { a: 3, b: 4 }),
      ).toThrowError();
    });
  });

  describe('referenceMap', () => {
    it('should return a map of references and add its values to the components object', () => {
      const examples: ExamplesObject = {
        first: { a: 1, b: 2, $id: 'FirstExample' },
        second: { a: 3, b: 4, $id: 'SecondExample' },
      };
      const components: ComponentsObject = {};

      const ref = referenceMap(components, 'examples', examples);

      expect(ref).toEqual({
        first: { $ref: '#/components/examples/FirstExample' },
        second: { $ref: '#/components/examples/SecondExample' },
      });

      expect(components).toEqual({
        examples: {
          FirstExample: { a: 1, b: 2 },
          SecondExample: { a: 3, b: 4 },
        },
      });
    });

    it('should ignore non-identifiable objects', () => {
      const examples: ExamplesObject = {
        first: { a: 1, b: 2 },
        second: { a: 3, b: 4, $id: 'SecondExample' },
      };
      const components: ComponentsObject = {};

      const ref = referenceMap(components, 'examples', examples);

      expect(ref).toEqual({
        first: { a: 1, b: 2 },
        second: { $ref: '#/components/examples/SecondExample' },
      });

      expect(components).toEqual({
        examples: {
          SecondExample: { a: 3, b: 4 },
        },
      });
    });
  });

  describe('referenceArray', () => {
    it('should return an array of references and add its values to the components object', () => {
      const parameters: ParameterObject[] = [
        identifiable<ParameterObject>(
          { name: 'first', in: 'path' },
          { $id: 'FirstParameter' },
        ),
        identifiable<ParameterObject>(
          { name: 'second', in: 'query' },
          { $id: 'SecondParameter' },
        ),
      ];
      const components: ComponentsObject = {};

      const ref = referenceArray(components, 'parameters', parameters);

      expect(ref).toEqual([
        { $ref: '#/components/parameters/FirstParameter' },
        { $ref: '#/components/parameters/SecondParameter' },
      ]);

      expect(components).toEqual({
        parameters: {
          FirstParameter: { name: 'first', in: 'path' },
          SecondParameter: { name: 'second', in: 'query' },
        },
      });
    });

    it('should ignore non-identifiable objects', () => {
      const parameters: ParameterObject[] = [
        { name: 'first', in: 'path' },
        identifiable<ParameterObject>(
          { name: 'second', in: 'query' },
          { $id: 'SecondParameter' },
        ),
      ];
      const components: ComponentsObject = {};

      const ref = referenceArray(components, 'parameters', parameters);

      expect(ref).toEqual([
        { name: 'first', in: 'path' },
        { $ref: '#/components/parameters/SecondParameter' },
      ]);

      expect(components).toEqual({
        parameters: {
          SecondParameter: { name: 'second', in: 'query' },
        },
      });
    });
  });
});
