import { basename } from 'path';
import { Controller, Post } from '../../../src';
import { ucfirst } from '../../../src/utilize';
import { DecoratorSpecification, DecoratorTest } from './decorate.test';

const controller: DecoratorSpecification = {
  controller: () => {
    @Controller('/')
    // @ts-expect-error: Post can not be used on controllers
    @Post('/')
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
      @Post('/test')
      public create(): void {}
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
    post:
      responses: {}
      operationId: TestController_create
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
      @Post('/')
      // @ts-expect-error: Post can not be used on parameters
      public post(@Post() _test: string): void {}
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
