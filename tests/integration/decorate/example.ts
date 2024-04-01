import { Type } from '@sinclair/typebox';
import { Body, Controller, Example, Post, Query } from '../../../src';
import { DecoratorSpecification, DecoratorTest } from './decorate.test';

const controller: DecoratorSpecification = {
  controller: () => {
    @Controller('/')
    // @ts-expect-error: Example can not be used on controllers
    @Example()
    class TestController {
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
      // @ts-expect-error: Example can not be used on methods
      @Example()
      public get(): void {}
    }

    return () => new TestController();
  },
  expectation: {
    possible: false,
  },
};

const parameter: DecoratorSpecification = {
  controller: () => {
    @Controller('/')
    class TestController {
      @Post('/users')
      public createUser(
        @Example({ name: 'example' })
        @Body({ schema: Type.Object({ name: Type.String() }) })
        _userDto: {
          name: string;
        },
        @Example('PUSH')
        @Query('mode', { schema: Type.Optional(Type.String()) })
        _mode?: string,
      ): void {}
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
  /users:
    post:
      responses: {}
      parameters:
        - name: mode
          in: query
          schema:
            type: string
          required: false
          example: PUSH
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
              required:
                - name
            example:
              name: example
      operationId: TestController_createUser
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

const test: DecoratorTest = {
  filename: __filename,
  tests: {
    controller,
    method,
    parameter,
  },
};

export default test;
