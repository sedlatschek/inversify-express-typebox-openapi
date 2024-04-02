import { Type } from '@sinclair/typebox';
import { Controller, Get, Query } from '../../../src';
import { DecoratorSpecification, DecoratorTest } from './decorate.test';

const controller: DecoratorSpecification = {
  controller: () => {
    @Controller('/')
    // @ts-expect-error: Query can not be used on controllers
    @Query({ schema: Type.String() })
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
      // @ts-expect-error: Query can not be used on methods
      @Query({ schema: Type.String() })
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
      public get(@Query('query', Type.String()) _query: string): void {}
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
        - name: query
          in: query
          schema:
            type: string
          required: true
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
