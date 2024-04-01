import { Static, Type } from '@sinclair/typebox';
import { Body, Controller, Get } from '../../../src';
import { DecoratorSpecification, DecoratorTest } from './decorate.test';

const controller: DecoratorSpecification = {
  controller: () => {
    @Controller('/')
    // @ts-expect-error: Body can not be used on controllers
    @Body({ schema: Type.String() })
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
      // @ts-expect-error: Body can not be used on methods
      @Body({ schema: Type.String() })
      public get(): void {}
    }

    return () => new TestController();
  },
  expectation: {
    possible: false,
  },
};

const bodySchema = Type.Object({ id: Type.Number(), name: Type.String() });

const parameter: DecoratorSpecification = {
  controller: () => {
    @Controller('/')
    class TestController {
      @Get('/')
      public get(
        @Body({ schema: bodySchema }) _body: Static<typeof bodySchema>,
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
  /:
    get:
      responses: {}
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                id:
                  type: number
                name:
                  type: string
              required:
                - id
                - name
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

const test: DecoratorTest = {
  filename: __filename,
  tests: {
    controller,
    method,
    parameter,
  },
};

export default test;
