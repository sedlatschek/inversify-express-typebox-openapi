import { Type } from '@sinclair/typebox';
import { Controller, Delete, Description, Get, Query } from '../../../src';
import { DecoratorSpecification, DecoratorTest } from './decorate.test';

const controller: DecoratorSpecification = {
  controller: () => {
    @Controller('/')
    @Description('test')
    class TestController {
      @Get('/')
      public get(): void {}

      @Delete('/')
      public delete(): void {}
    }

    return () => new TestController();
  },
  expectation: {
    possible: true,
    yaml: `
  /:
    get:
      responses: {}
      operationId: TestController_get
      description: test
    delete:
      responses: {}
      operationId: TestController_delete
      description: test
`,
  },
};

const method: DecoratorSpecification = {
  controller: () => {
    @Controller('/')
    class TestController {
      @Description('test')
      @Get('/')
      public get(): void {}
    }

    return () => new TestController();
  },
  expectation: {
    possible: true,
    yaml: `
  /:
    get:
      responses: {}
      description: test
      operationId: TestController_get
`,
  },
};

const parameter: DecoratorSpecification = {
  controller: () => {
    @Controller('/')
    class TestController {
      @Get('/')
      public get(
        @Description('test') @Query('q', { schema: Type.String() }) _q: string,
      ): void {}
    }
    return () => new TestController();
  },
  expectation: {
    possible: true,
    yaml: `
  /:
    get:
      responses: {}
      parameters:
        - name: q
          in: query
          schema:
            type: string
          required: true
          description: test
      operationId: TestController_get
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
