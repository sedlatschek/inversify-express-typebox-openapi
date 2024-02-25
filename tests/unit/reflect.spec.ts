import 'reflect-metadata';
import { expect, describe, it } from 'vitest';
import {
  CONTROLLER_METADATA_KEY,
  ControllerMetadata,
  OPERATION_METADATA_KEY,
  OperationMetadata,
  addBodyMetadata,
  addControllerMetadata,
  addOperationMetadata,
  addParametersMetadata,
  addResponsesMetadata,
  getControllerMetadata,
  getIndexByParameterIndex,
  getOperationMetadata,
  getOrCreateOperationMetadata,
  getParameterMetadata,
} from '../../src/reflect';
import { Type } from '@sinclair/typebox';

describe('reflect', () => {
  describe('getControllerMetadata', () => {
    it('should return undefined if no metadata is found', () => {
      expect(getControllerMetadata({})).toBeUndefined();
    });

    it('should return metadata if found', () => {
      const target = {};
      const metadata: ControllerMetadata = {
        baseOperationObject: { operationId: 'test' },
      };
      Reflect.defineMetadata(CONTROLLER_METADATA_KEY, metadata, target);

      expect(getControllerMetadata(target)).toEqual(metadata);
    });
  });

  describe('addControllerMetadata', () => {
    it('should add new metadata', () => {
      const target = {};
      const metadata = addControllerMetadata(target, {
        metadataProperties: {
          operationId: 'test',
        },
      });

      expect(metadata).toEqual({
        baseOperationObject: { operationId: 'test' },
      });
    });

    it('should update existing metadata', () => {
      const target = {};

      const returnedMetadata = addControllerMetadata(target, {
        metadataProperties: {
          operationId: 'test',
        },
      });
      const retrievedMetadata = getControllerMetadata(target);
      const expectedMetadata = {
        baseOperationObject: { operationId: 'test' },
      };

      expect(returnedMetadata).toEqual(expectedMetadata);
      expect(retrievedMetadata).toEqual(expectedMetadata);

      const returnedUpdatedMetadata = addControllerMetadata(target, {
        metadataProperties: {
          deprecated: true,
        },
      });
      const retrievedUpdagtedMetadata = getControllerMetadata(target);
      const expectedUpdatedMetadata = {
        baseOperationObject: {
          operationId: 'test',
          deprecated: true,
        },
      };

      expect(returnedUpdatedMetadata).toEqual(expectedUpdatedMetadata);
      expect(retrievedUpdagtedMetadata).toEqual(expectedUpdatedMetadata);
    });
  });

  describe('getOperationMetadata', () => {
    it('should return undefined if no metadata is found', () => {
      expect(getOperationMetadata({}, 'test')).toBeUndefined();
    });

    it('should return metadata if found', () => {
      const target = {};
      const metadata = { method: 'get' };
      Reflect.defineMetadata(OPERATION_METADATA_KEY, metadata, target, 'test');

      expect(getOperationMetadata(target, 'test')).toEqual(metadata);
    });
  });

  describe('getOrCreateOperationMetadata', () => {
    it('should return metadata if found', () => {
      const target = {};
      const metadata: OperationMetadata = {
        config: { name: 'get' },
        operationObject: { responses: {} },
        parameterIndices: [],
      };
      Reflect.defineMetadata(OPERATION_METADATA_KEY, metadata, target, 'test');

      expect(getOrCreateOperationMetadata(target, 'test')).toEqual(metadata);
    });

    it('should create metadata if not found', () => {
      const target = {};
      const metadata = getOrCreateOperationMetadata(target, 'test');

      expect(metadata).toEqual({
        operationObject: { responses: {} },
        parameterIndices: [],
      });
    });
  });

  describe('addOperationMetadata', () => {
    it('should add new metadata', () => {
      const target = {};
      const metadata = addOperationMetadata(target, 'test', {
        config: {
          name: 'get',
        },
      });

      expect(metadata).toEqual({
        config: {
          name: 'get',
        },
        operationObject: {
          responses: {},
        },
        parameterIndices: [],
      });
    });

    it('should update existing metadata', () => {
      const target = {};
      const metadata = addOperationMetadata(target, 'test', {
        config: { method: 'get' },
      });

      expect(metadata).toEqual({
        config: {
          method: 'get',
        },
        operationObject: {
          responses: {},
        },
        parameterIndices: [],
      });

      const updatedMetadata = addOperationMetadata(target, 'test', {
        metadataProperties: {
          deprecated: true,
        },
      });

      expect(updatedMetadata).toEqual({
        config: {
          method: 'get',
        },
        operationObject: {
          responses: {},
          deprecated: true,
        },
        parameterIndices: [],
      });
    });
  });

  describe('getIndexByParameterIndex', () => {
    it('should return undefined if no metadata is found', () => {
      expect(getIndexByParameterIndex({}, 'test', 0)).toBeUndefined();
    });

    it('should return array index if parameter index was found', () => {
      const target = {};
      const metadata: OperationMetadata = {
        config: { name: 'get' },
        operationObject: {
          parameters: [
            { name: 'test', in: 'query' },
            { name: 'test2', in: 'query' },
          ],
          responses: {},
        },
        parameterIndices: [3, 4],
      };
      Reflect.defineMetadata(OPERATION_METADATA_KEY, metadata, target, 'test');

      expect(getIndexByParameterIndex(target, 'test', 4)).toEqual(1);
    });
  });

  describe('getParameterMetadata', () => {
    it('should return undefined if no metadata is found', () => {
      expect(getParameterMetadata({}, 'test', 0)).toBeUndefined();
    });

    it('should return metadata if found', () => {
      const target = {};
      const metadata: OperationMetadata = {
        config: { name: 'get' },
        operationObject: {
          parameters: [{ name: 'test', in: 'query' }],
          responses: {},
        },
        parameterIndices: [0],
      };
      Reflect.defineMetadata(OPERATION_METADATA_KEY, metadata, target, 'test');

      expect(getParameterMetadata(target, 'test', 0)).toEqual({
        name: 'test',
        in: 'query',
      });
    });
  });

  describe('addParametersMetadata', () => {
    it('should add new metadata', () => {
      const target = {};

      addParametersMetadata(target, 'test', 0, {
        name: 'method',
        in: 'header',
      });

      expect(getParameterMetadata(target, 'test', 0)).toMatchObject({
        name: 'method',
        in: 'header',
      });
    });

    it('should update existing metadata', () => {
      const target = {};

      addParametersMetadata(target, 'test', 0, {
        name: 'method',
        in: 'header',
      });

      const metadata = getParameterMetadata(target, 'test', 0);

      expect(metadata).toMatchObject({
        name: 'method',
        in: 'header',
      });
      expect(metadata).not.toHaveProperty('deprecated');

      addParametersMetadata(target, 'test', 0, { deprecated: true });

      expect(getParameterMetadata(target, 'test', 0)).toMatchObject({
        name: 'method',
        in: 'header',
        deprecated: true,
      });
    });
  });

  describe('addBodyMetadata', () => {
    it('should add new metadata', () => {
      const target = {};

      const schema = Type.Object({ name: Type.String() });

      addBodyMetadata(target, 'test', schema);

      const metadata = getOperationMetadata(target, 'test');

      expect(metadata).toMatchObject({
        operationObject: {
          requestBody: {
            content: {
              'application/json': {
                schema,
              },
            },
          },
          responses: {},
        },
        parameterIndices: [],
      });
    });

    it('should update existing metadata', () => {
      const target = {};

      const schema = Type.Object({ name: Type.String() });

      addBodyMetadata(target, 'test', schema);

      const metadata = getOperationMetadata(target, 'test');

      expect(metadata).toMatchObject({
        operationObject: {
          requestBody: {
            content: {
              'application/json': {
                schema,
              },
            },
          },
          responses: {},
        },
        parameterIndices: [],
      });

      const newSchema = Type.Object({ id: Type.Number(), name: Type.String() });

      addBodyMetadata(target, 'test', newSchema);

      expect(metadata).toMatchObject({
        operationObject: {
          requestBody: {
            content: {
              'application/json': {
                schema: newSchema,
              },
            },
          },
          responses: {},
        },
        parameterIndices: [],
      });
    });
  });

  describe('addResponsesMetadata', () => {
    it('should add new metadata', () => {
      const target = {};

      addResponsesMetadata(target, 'test', '200', 'OK');

      const metadata = getOperationMetadata(target, 'test');

      expect(metadata).toMatchObject({
        operationObject: {
          responses: {
            '200': {
              description: 'OK',
            },
          },
        },
        parameterIndices: [],
      });
    });

    it('should update existing metadata', () => {
      const target = {};

      addResponsesMetadata(target, 'test', '200', 'OK');

      const metadata = getOperationMetadata(target, 'test');

      expect(metadata).toMatchObject({
        operationObject: {
          responses: {
            '200': {
              description: 'OK',
            },
          },
        },
        parameterIndices: [],
      });

      addResponsesMetadata(target, 'test', '200', 'OK', Type.Object({}));

      expect(metadata).toMatchObject({
        operationObject: {
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: {},
                },
              },
            },
          },
        },
        parameterIndices: [],
      });
    });
  });
});
