import { OperationObject } from 'openapi3-ts/dist/oas31';
import { describe, expect, it } from 'vitest';
import {
  concatArrays,
  concatPrimitiveArrays,
  mergeAtomicProperties,
  mergeMaps,
} from '../../src/merge';

describe('merge', () => {
  describe('mergeAtomicProperties', () => {
    it('should fill in atomic properties', () => {
      const operation: OperationObject = {};

      mergeAtomicProperties(
        operation,
        { operationId: 'operationId' },
        'operationId',
      );

      expect(operation.operationId).toEqual('operationId');

      mergeAtomicProperties(
        operation,
        { operationId: 'operationId2' },
        'operationId',
      );

      expect(operation.operationId).toEqual('operationId');
    });
  });

  describe('concatPrimitiveArrays', () => {
    it('should concatenate arrays and ensure entries are unique', () => {
      const operation: OperationObject = {
        tags: ['tag1'],
      };

      concatPrimitiveArrays(
        operation,
        {
          tags: ['tag2', 'tag1'],
        },
        'tags',
      );

      expect(operation.tags).toEqual(['tag1', 'tag2']);
    });
  });

  describe('concatArrays', () => {
    it('should concatenate arrays', () => {
      const operation: OperationObject = {
        parameters: [{ name: 'param1', in: 'query' }],
      };

      concatArrays(
        operation,
        {
          parameters: [{ name: 'param2', in: 'query' }],
        },
        'parameters',
      );

      expect(operation.parameters).toEqual([
        { name: 'param1', in: 'query' },
        { name: 'param2', in: 'query' },
      ]);
    });
  });

  describe('mergeMaps', () => {
    it('should merge maps', () => {
      const operation: OperationObject = {
        responses: { '200': { description: 'OK' } },
      };

      mergeMaps(
        operation,
        {
          responses: {
            '400': { description: 'Bad Request' },
          },
        },
        'responses',
      );

      expect(operation.responses).toEqual({
        '200': { description: 'OK' },
        '400': { description: 'Bad Request' },
      });
    });

    it('should overwrite duplicate properties', () => {
      const operation: OperationObject = {
        responses: { '200': { description: 'OK' } },
      };

      mergeMaps(
        operation,
        {
          responses: {
            '200': { description: 'Overwritten' },
          },
        },
        'responses',
      );

      expect(operation.responses).toEqual({
        '200': { description: 'Overwritten' },
      });
    });
  });
});
