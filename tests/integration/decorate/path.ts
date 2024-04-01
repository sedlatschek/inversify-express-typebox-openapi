import { Type } from '@sinclair/typebox';
import { basename } from 'path';
import { Controller, Get, Path } from '../../../src';
import { ucfirst } from '../../../src/utilize';
import { DecoratorSpecification, DecoratorTest } from './decorate.test';

const controller: DecoratorSpecification = {
  controller: () => {
    @Controller('/')
    // @ts-expect-error: Path can not be used on controllers
    @Path({ schema: Type.String() })
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
      // @ts-expect-error: Path can not be used on methods
      @Path({ schema: Type.String() })
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
      public get(@Path('id', { schema: Type.String() }) _id: string): void {}
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
        - name: id
          in: path
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
