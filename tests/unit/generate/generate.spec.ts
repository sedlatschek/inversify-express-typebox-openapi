import { expect, describe, it } from 'vitest';
import {
  getRoutePath,
  mergeBaseOperationIntoAllOperations,
} from '../../../src/generate/generate';
import { ControllerMetadata } from '../../../src/type';

describe('generate', () => {
  describe('mergeBaseOperationIntoAllOperations', () => {
    it('should merge the base operation into all operations', () => {
      const controllerMetadata: ControllerMetadata = {
        name: 'TestController',
        baseOperationObject: {
          operationId: 'testController',
          deprecated: true,
          parameters: [
            {
              name: 'testParameter',
              in: 'query',
              schema: {
                type: 'string',
              },
            },
          ],
        },
        operationMetadatas: [
          {
            name: 'testOperation',
            operationObject: {
              operationId: 'operation',
            },
            parameterIndices: [],
            config: {},
          },
        ],
      };

      mergeBaseOperationIntoAllOperations(controllerMetadata);

      expect(controllerMetadata.operationMetadatas[0]).toEqual({
        name: 'testOperation',
        operationObject: {
          operationId: 'testController_operation',
          deprecated: true,
          parameters: [
            {
              name: 'testParameter',
              in: 'query',
              schema: {
                type: 'string',
              },
            },
          ],
        },
        parameterIndices: [],
        config: {},
      });
    });
  });

  describe('getRoutePath', () => {
    it('concatenates with one slash', () => {
      for (const paths of [
        ['/api', '/test'],
        ['/api/', '/test'],
        ['/api/', 'test'],
        ['/api', 'test'],
      ]) {
        const result = getRoutePath(paths[0], paths[1]);
        expect(result, `${paths[0]}, ${paths[1]}`).toBe('/api/test');
      }
    });
  });
});
