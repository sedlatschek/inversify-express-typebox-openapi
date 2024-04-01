import { Controller, Get, OperationId } from '../../../src';
import { DecoratorSpecification, DecoratorTest } from './decorate.test';

const controller: DecoratorSpecification = {
  controller: () => {
    @Controller('/')
    @OperationId('X')
    class TestController {
      @Get('/')
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
      responses: {}
      operationId: X_get
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

const method: DecoratorSpecification = {
  controller: () => {
    @Controller('/')
    class TestController {
      @OperationId('X')
      @Get('/')
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
      responses: {}
      operationId: TestController_X
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
      // @ts-expect-error: OperationId can not be used on parameters
      public get(@OperationId('Y') _q: string): void {}
    }
    return () => new TestController();
  },
  expectation: {
    possible: false,
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
