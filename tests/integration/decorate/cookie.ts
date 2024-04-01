import { Type } from '@sinclair/typebox';
import { basename } from 'path';
import { Controller, Cookie, Get } from '../../../src';
import { ucfirst } from '../../../src/utilize';
import { DecoratorSpecification, DecoratorTest } from './decorate.test';

const controller: DecoratorSpecification = {
  controller: () => {
    @Controller('/')
    // @ts-expect-error: Cookie can not be used on controllers
    @Cookie({ schema: Type.String() })
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
      // @ts-expect-error: Cookie can not be used on methods
      @Cookie({ schema: Type.String() })
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
      @Get('/')
      public get(
        @Cookie('Cookie', { schema: Type.String() }) _Cookie: string,
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
      parameters:
        - name: Cookie
          in: cookie
          schema:
            type: string
          required: true
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
  name: ucfirst(basename(__filename).replace(/\.ts$/, '')),
  tests: {
    controller,
    method,
    parameter,
  },
};

export default test;
