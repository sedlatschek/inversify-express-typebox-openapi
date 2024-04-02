import { Type } from '@sinclair/typebox';
import { Controller, Explode, Get, Query } from '../../../src';
import { DecoratorSpecification, DecoratorTest } from './decorate.test';

const controller: DecoratorSpecification = {
  controller: () => {
    @Controller('/')
    // @ts-expect-error: Explode can not be used on controllers
    @Explode()
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
      // @ts-expect-error: Explode can not be used on methods
      @Explode()
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
        @Query('ids', Type.Array(Type.String()))
        @Explode()
        _q: string,
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
        - name: ids
          in: query
          explode: true
          schema:
            type: array
            items:
              type: string
          required: true
      operationId: TestController_get`,
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
