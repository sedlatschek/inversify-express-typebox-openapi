import 'reflect-metadata';
import { expect, describe, it } from 'vitest';
import {
  OPERATION_METADATA_KEY,
  addBodyMetadata,
  addOperationMetadata,
  addParametersMetadata,
  addResponsesMetadata,
  getOperationMetadata,
  getOrCreateOperationMetadata,
  getParameterMetadata,
} from '../../src/reflect';
import { Type } from '@sinclair/typebox';

describe('reflect', () => {
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
      const metadata = { method: 'get' };
      Reflect.defineMetadata(OPERATION_METADATA_KEY, metadata, target, 'test');

      expect(getOrCreateOperationMetadata(target, 'test')).toEqual(metadata);
    });

    it('should create metadata if not found', () => {
      const target = {};
      const metadata = getOrCreateOperationMetadata(target, 'test');

      expect(metadata).toEqual({
        operationId: 'Object::test',
        responses: {},
      });
    });
  });

  describe('addOperationMetadata', () => {
    it('should add new metadata', () => {
      const target = {};
      const metadata = addOperationMetadata(target, 'test', {
        method: 'get',
      });

      expect(metadata).toEqual({
        method: 'get',
        operationId: 'Object::test',
        responses: {},
      });
    });

    it('should update existing metadata', () => {
      const target = {};
      const metadata = addOperationMetadata(target, 'test', {
        method: 'get',
      });

      expect(metadata).toEqual({
        method: 'get',
        operationId: 'Object::test',
        responses: {},
      });

      const updatedMetadata = addOperationMetadata(target, 'test', {
        deprecated: true,
      });

      expect(updatedMetadata).toEqual({
        method: 'get',
        operationId: 'Object::test',
        responses: {},
        deprecated: true,
      });
    });
  });

  describe('getParameterMetadata', () => {
    it('should return undefined if no metadata is found', () => {
      expect(getParameterMetadata({}, 'test', 0)).toBeUndefined();
    });

    it('should return metadata if found', () => {
      const target = {};
      const metadata = { method: 'get', parameters: [{ index: 0 }] };
      Reflect.defineMetadata(OPERATION_METADATA_KEY, metadata, target, 'test');

      expect(getParameterMetadata(target, 'test', 0)).toEqual({ index: 0 });
    });
  });

  describe('addParametersMetadata', () => {
    it('should add new metadata', () => {
      const target = {};

      addParametersMetadata(target, 'test', 0, {}, 'method', 'header');

      expect(getParameterMetadata(target, 'test', 0)).toMatchObject({
        index: 0,
        name: 'method',
        in: 'header',
      });
    });

    it('should update existing metadata', () => {
      const target = {};

      addParametersMetadata(target, 'test', 0, {}, 'method', 'header');

      const metadata = getParameterMetadata(target, 'test', 0);

      expect(metadata).toMatchObject({
        index: 0,
        name: 'method',
        in: 'header',
      });
      expect(metadata).not.toHaveProperty('deprecated');

      addParametersMetadata(target, 'test', 0, { deprecated: true });

      expect(getParameterMetadata(target, 'test', 0)).toMatchObject({
        index: 0,
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
        requestBody: {
          content: {
            'application/json': {
              schema,
            },
          },
        },
      });
    });

    it('should update existing metadata', () => {
      const target = {};

      const schema = Type.Object({ name: Type.String() });

      addBodyMetadata(target, 'test', schema);

      const metadata = getOperationMetadata(target, 'test');

      expect(metadata).toMatchObject({
        requestBody: {
          content: {
            'application/json': {
              schema,
            },
          },
        },
      });

      const newSchema = Type.Object({ id: Type.Number(), name: Type.String() });

      addBodyMetadata(target, 'test', newSchema);

      expect(metadata).toMatchObject({
        requestBody: {
          content: {
            'application/json': {
              schema: newSchema,
            },
          },
        },
      });
    });
  });

  describe('addResponsesMetadata', () => {
    it('should add new metadata', () => {
      const target = {};

      addResponsesMetadata(target, 'test', '200', 'OK');

      const metadata = getOperationMetadata(target, 'test');

      expect(metadata).toMatchObject({
        responses: {
          '200': {
            description: 'OK',
          },
        },
      });
    });

    it('should update existing metadata', () => {
      const target = {};

      addResponsesMetadata(target, 'test', '200', 'OK');

      const metadata = getOperationMetadata(target, 'test');

      expect(metadata).toMatchObject({
        responses: {
          '200': {
            description: 'OK',
          },
        },
      });

      addResponsesMetadata(target, 'test', '200', 'OK', Type.Object({}));

      expect(metadata).toMatchObject({
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
      });
    });
  });
});
