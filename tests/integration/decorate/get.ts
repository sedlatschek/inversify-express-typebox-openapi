import { basename } from 'path';
import { Controller, Get } from '../../../src';
import { ucfirst } from '../../../src/utilize';
import { DecoratorSpecification, DecoratorTest } from './decorate.test';

const controller: DecoratorSpecification = {
  controller: () => {
    @Controller('/')
    // @ts-expect-error: Get can not be used on controllers
    @Get('/')
    class TestController {}

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
      @Get('/test')
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
  /test:
    get:
      responses: {}
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
      // @ts-expect-error: Get can not be used on methods
      public get(@Get() _test: string): void {}
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
