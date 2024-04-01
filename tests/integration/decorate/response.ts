import { Type } from '@sinclair/typebox';
import { basename } from 'path';
import { Controller, Get, Response } from '../../../src';
import { ucfirst } from '../../../src/utilize';
import { DecoratorSpecification, DecoratorTest } from './decorate.test';

const controller: DecoratorSpecification = {
  controller: () => {
    @Controller('/')
    // @ts-expect-error: Response can not be used on controllers
    @Response(200, { schema: Type.String() })
    class TestController {
      @Get('/')
      public get(): void {}
    }

    return () => new TestController();
  },
  expectation: {
    possible: false,
  },
};

const method: DecoratorSpecification = {
  controller: () => {
    @Controller('/')
    class TestController {
      @Get('/')
      @Response(200, {
        description: 'Success',
        content: { schema: Type.String() },
      })
      @Response('default', {
        description: 'Error',
        content: { schema: Type.Object({ errorCode: Type.Number() }) },
      })
      public get(): void {}
    }

    return () => new TestController();
  },
  expectation: {
    possible: true,
    yaml: `openapi: 3.1.0
info:
  title: app
  version: version
paths:
  /:
    get:
      responses:
        "200":
          description: Success
          content:
            application/json:
              schema:
                type: string
        default:
          description: Error
          content:
            application/json:
              schema:
                type: object
                properties:
                  errorCode:
                    type: number
                required:
                  - errorCode
      operationId: TestController_get
components:
  schemas: {}
  responses: {}
  parameters: {}
  examples: {}
  requestBodies: {}
  headers: {}
  securitySchemes: {}
  links: {}
  callbacks: {}
tags: []
servers: []
`,
  },
};

const parameter: DecoratorSpecification = {
  controller: () => {
    @Controller('/')
    class TestController {
      @Get('/')
      public get(
        // @ts-expect-error: Response can not be used on methods
        @Response('200', { schema: Type.String() }) _res: string,
      ): void {}
    }
    return () => new TestController();
  },
  expectation: {
    possible: false,
  },
};

const test: DecoratorTest = {
  name: ucfirst(basename(__filename).replace(/\.ts$/, '')),
  tests: {
    controller,
    method,
    parameter,
  },
};

export default test;
