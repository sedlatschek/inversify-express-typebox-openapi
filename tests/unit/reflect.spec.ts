import 'reflect-metadata';
import { Type } from '@sinclair/typebox';
import { ParameterObject } from 'openapi3-ts/oas31';
import { describe, expect, it } from 'vitest';
import {
  CONTROLLER_METADATA_KEY,
  addBodyMetadata,
  addControllerMetadata,
  addOperationMetadata,
  addParametersMetadata,
  addResponsesMetadata,
  convertParameterMetadataToBodyMetadata,
  getControllerMetadata,
  getIndexByParameterIndex,
  getOperationMetadata,
  getOrCreateControllerMetadata,
  getOrCreateOperationMetadata,
  getParameterMetadata,
  getTypeOfParameterIndex,
} from '../../src/reflect';
import { ControllerMetadata, OperationMetadata } from '../../src/type';

describe('reflect', () => {
  describe('getControllerMetadata', () => {
    it('should return undefined if no metadata is found', () => {
      expect(getControllerMetadata(class {})).toBeUndefined();
    });

    it('should return metadata if found', () => {
      const TestController = class {};
      const metadata: ControllerMetadata = {
        name: 'TestController',
        config: {
          path: '/api',
        },
        baseOperationObject: { operationId: 'test' },
        operationMetadatas: [],
      };
      Reflect.defineMetadata(CONTROLLER_METADATA_KEY, metadata, TestController);

      expect(getControllerMetadata(TestController)).toEqual(metadata);
    });
  });

  describe('getOrCreateControllerMetadata', () => {
    it('should return metadata if found', () => {
      const TestController = class {};
      const metadata: ControllerMetadata = {
        name: 'test',
        config: {
          path: '/api',
        },
        baseOperationObject: {},
        operationMetadatas: [],
      };
      Reflect.defineMetadata(CONTROLLER_METADATA_KEY, metadata, TestController);

      expect(getOrCreateControllerMetadata(TestController)).toEqual(metadata);
    });

    it('should create metadata if not found', () => {
      const TestController = class {};
      const metadata = getOrCreateControllerMetadata(TestController);

      expect(metadata).toEqual({
        name: 'TestController',
        baseOperationObject: {},
        operationMetadatas: [],
      });

      expect(
        Reflect.getMetadata(CONTROLLER_METADATA_KEY, TestController),
      ).toEqual(metadata);
    });
  });

  describe('addControllerMetadata', () => {
    it('should add new metadata', () => {
      const TestController = class {};
      const metadata = addControllerMetadata(TestController, {
        metadataProperties: {
          operationId: 'test',
        },
      });

      expect(metadata).toEqual({
        name: 'TestController',
        baseOperationObject: { operationId: 'test' },
        operationMetadatas: [],
      });
    });

    it('should update existing metadata', () => {
      const TestController = class {};

      const returnedMetadata = addControllerMetadata(TestController, {
        metadataProperties: {
          operationId: 'test',
        },
      });
      const retrievedMetadata = getControllerMetadata(TestController);
      const expectedMetadata: ControllerMetadata = {
        name: 'TestController',
        baseOperationObject: { operationId: 'test' },
        operationMetadatas: [],
      };

      expect(returnedMetadata).toEqual(expectedMetadata);
      expect(retrievedMetadata).toEqual(expectedMetadata);

      const returnedUpdatedMetadata = addControllerMetadata(TestController, {
        metadataProperties: {
          deprecated: true,
        },
      });
      const retrievedUpdatedMetadata = getControllerMetadata(TestController);
      const expectedUpdatedMetadata: ControllerMetadata = {
        name: 'TestController',
        baseOperationObject: {
          operationId: 'test',
          deprecated: true,
        },
        operationMetadatas: [],
      };

      expect(returnedUpdatedMetadata).toEqual(expectedUpdatedMetadata);
      expect(retrievedUpdatedMetadata).toEqual(expectedUpdatedMetadata);
    });
  });

  describe('getOperationMetadata', () => {
    it('should return undefined if no metadata is found', () => {
      expect(getOperationMetadata(class {}, 'test')).toBeUndefined();
    });

    it('should return metadata if found', () => {
      const TestController = class {};
      const metadata: ControllerMetadata = {
        name: 'TestController',
        baseOperationObject: {},
        operationMetadatas: [
          {
            name: 'test',
            config: { method: 'get' },
            operationObject: { responses: {} },
            parameterIndices: [],
          },
        ],
      };

      Reflect.defineMetadata(CONTROLLER_METADATA_KEY, metadata, TestController);

      expect(getOperationMetadata(new TestController(), 'test')).toEqual(
        metadata.operationMetadatas[0],
      );
    });
  });

  describe('getOrCreateOperationMetadata', () => {
    it('should return metadata if found', () => {
      const TestController = class {};
      const metadata: ControllerMetadata = {
        name: 'TestController',
        baseOperationObject: {},
        operationMetadatas: [
          {
            name: 'test',
            config: { method: 'post' },
            operationObject: { responses: {} },
            parameterIndices: [],
          },
        ],
      };

      Reflect.defineMetadata(CONTROLLER_METADATA_KEY, metadata, TestController);

      expect(
        getOrCreateOperationMetadata(new TestController(), 'test'),
      ).toEqual(metadata.operationMetadatas[0]);
    });

    it('should create metadata if not found', () => {
      const TestController = class {};
      const testController = new TestController();
      const metadata = getOrCreateOperationMetadata(testController, 'test');

      expect(metadata).toEqual({
        name: 'test',
        config: {},
        operationObject: { responses: {} },
        parameterIndices: [],
      });

      const expectation: ControllerMetadata = {
        name: 'TestController',
        baseOperationObject: {},
        operationMetadatas: [metadata],
      };

      expect(
        Reflect.getMetadata(CONTROLLER_METADATA_KEY, TestController),
      ).toEqual(expectation);
    });
  });

  describe('addOperationMetadata', () => {
    it('should add new metadata', () => {
      const TestController = class {};
      const testController = new TestController();
      const metadata = addOperationMetadata(testController, 'test', {});

      expect(metadata).toEqual({
        name: 'test',
        config: {},
        operationObject: {
          responses: {},
        },
        parameterIndices: [],
      });

      const expectation: ControllerMetadata = {
        name: 'TestController',
        baseOperationObject: {},
        operationMetadatas: [metadata],
      };

      expect(
        Reflect.getMetadata(CONTROLLER_METADATA_KEY, TestController),
      ).toEqual(expectation);
    });

    it('should update existing metadata', () => {
      const TestController = class {};
      const metadata = addOperationMetadata(TestController, 'test', {
        config: { method: 'get' },
      });

      expect(metadata).toEqual({
        name: 'test',
        config: {
          method: 'get',
        },

        operationObject: {
          responses: {},
        },
        parameterIndices: [],
      });

      const updatedMetadata = addOperationMetadata(TestController, 'test', {
        metadataProperties: {
          deprecated: true,
        },
      });

      expect(updatedMetadata).toEqual({
        name: 'test',
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

  describe('getTypeOfParameterIndex', () => {
    it('should return undefined if no metadata is found', () => {
      expect(getTypeOfParameterIndex({}, 'test', 0)).toBeUndefined();
    });

    it('should return type for all parameters ', () => {
      const parameters: ParameterObject[] = [
        { name: 'test', in: 'query' },
        { name: 'test2', in: 'path' },
        { name: 'test3', in: 'header' },
        { name: 'test4', in: 'cookie' },
      ];

      const TestController = class {};
      const operationMetadata: OperationMetadata = {
        name: 'test',
        config: {},
        operationObject: {
          parameters,
          responses: {},
        },
        parameterIndices: [0, 1, 2, 3],
        bodyParameterIndex: 4,
      };
      const controllerMetadata: ControllerMetadata = {
        name: 'TestController',
        baseOperationObject: {},
        operationMetadatas: [operationMetadata],
      };

      Reflect.defineMetadata(
        CONTROLLER_METADATA_KEY,
        controllerMetadata,
        TestController,
      );

      for (let i = 0; i < parameters.length; i++) {
        expect(
          getTypeOfParameterIndex(new TestController(), 'test', i),
        ).toEqual(parameters[i].in);
      }
      expect(getTypeOfParameterIndex(new TestController(), 'test', 4)).toEqual(
        'body',
      );
    });
  });

  describe('getIndexByParameterIndex', () => {
    it('should return undefined if no metadata is found', () => {
      expect(getIndexByParameterIndex({}, 'test', 0)).toBeUndefined();
    });

    it('should return array index if parameter index was found', () => {
      const TestController = class {};
      const operationMetadata: OperationMetadata = {
        name: 'test',
        config: {},
        operationObject: {
          parameters: [
            { name: 'test', in: 'query' },
            { name: 'test2', in: 'query' },
          ],
          responses: {},
        },
        parameterIndices: [3, 4],
      };
      const controllerMetadata: ControllerMetadata = {
        name: 'TestController',
        baseOperationObject: {},
        operationMetadatas: [operationMetadata],
      };

      Reflect.defineMetadata(
        CONTROLLER_METADATA_KEY,
        controllerMetadata,
        TestController,
      );

      expect(getIndexByParameterIndex(new TestController(), 'test', 3)).toEqual(
        0,
      );
      expect(getIndexByParameterIndex(new TestController(), 'test', 4)).toEqual(
        1,
      );
    });
  });

  describe('getParameterMetadata', () => {
    it('should return undefined if no metadata is found', () => {
      expect(getParameterMetadata({}, 'test', 0)).toBeUndefined();
    });

    it('should return metadata if found', () => {
      const TestController = class {};
      const metadata: ControllerMetadata = {
        name: 'TestController',
        baseOperationObject: {},
        operationMetadatas: [
          {
            name: 'test',
            config: {},
            operationObject: {
              parameters: [{ name: 'test', in: 'query' }],
              responses: {},
            },
            parameterIndices: [0],
          },
        ],
      };

      Reflect.defineMetadata(CONTROLLER_METADATA_KEY, metadata, TestController);

      expect(getParameterMetadata(new TestController(), 'test', 0)).toEqual({
        name: 'test',
        in: 'query',
      });
    });
  });

  describe('addParametersMetadata', () => {
    it('should add new metadata', () => {
      const TestController = class {};

      addParametersMetadata(
        new TestController(),
        'test',
        0,
        {},
        {
          name: 'testMethod',
          in: 'header',
        },
      );

      const expectation: ControllerMetadata = {
        name: 'TestController',
        baseOperationObject: {},
        operationMetadatas: [
          {
            name: 'test',
            config: {},
            operationObject: {
              parameters: [{ name: 'testMethod', in: 'header' }],
              responses: {},
            },
            parameterIndices: [0],
          },
        ],
      };

      expect(
        Reflect.getMetadata(CONTROLLER_METADATA_KEY, TestController),
      ).toEqual(expectation);
    });

    it('should update existing metadata', () => {
      const TestController = class {};
      const testController = new TestController();

      addParametersMetadata(
        testController,
        'test',
        0,
        {},
        {
          name: 'method',
          in: 'header',
        },
      );

      const metadata = getParameterMetadata(testController, 'test', 0);

      expect(metadata).toMatchObject({
        name: 'method',
        in: 'header',
      });
      expect(metadata).not.toHaveProperty('deprecated');

      addParametersMetadata(testController, 'test', 0, { deprecated: true });

      expect(getParameterMetadata(testController, 'test', 0)).toMatchObject({
        name: 'method',
        in: 'header',
        deprecated: true,
      });
    });
  });

  describe('convertParameterMetadataToBodyMetadata', () => {
    it('should convert parameter metadata to body metadata', () => {
      const TestController = class {};
      const testController = new TestController();

      const schema = Type.Object({ name: Type.String() });

      addParametersMetadata(
        testController,
        'test',
        0,
        {
          schema,
          example: { name: 'test' },
        },
        {
          name: 'method',
          in: 'query',
        },
      );

      convertParameterMetadataToBodyMetadata(testController, 'test', 0);

      const metadata = getOperationMetadata(testController, 'test');

      expect(metadata).toStrictEqual({
        bodyParameterIndex: 0,
        config: {},
        name: 'test',
        operationObject: {
          parameters: [],
          requestBody: {
            content: {
              'application/json': {
                schema,
                example: { name: 'test' },
              },
            },
          },
          responses: {},
        },
        parameterIndices: [],
      });
    });
  });

  describe('addBodyMetadata', () => {
    it('should add new metadata', () => {
      const TestController = class {};
      const testController = new TestController();

      const schema = Type.Object({ name: Type.String() });

      addBodyMetadata(testController, 'test', 0, { schema });

      const metadata = getOperationMetadata(testController, 'test');

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
      const TestController = class {};
      const testController = new TestController();

      const schema = Type.Object({ name: Type.String() });

      addBodyMetadata(testController, 'test', 0, { schema });

      const metadata = getOperationMetadata(testController, 'test');

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

      addBodyMetadata(testController, 'test', 0, { schema: newSchema });

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
      const TestController = class {};
      const testController = new TestController();

      addResponsesMetadata(testController, 'test', '200', {
        description: 'OK',
      });

      const metadata = getOperationMetadata(testController, 'test');

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
      const TestController = class {};
      const testController = new TestController();

      addResponsesMetadata(testController, 'test', '200', {
        description: 'OK',
      });

      const metadata = getOperationMetadata(testController, 'test');

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

      addResponsesMetadata(testController, 'test', '200', {
        description: 'OK',
        content: {
          schema: Type.Object({}),
        },
      });

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
