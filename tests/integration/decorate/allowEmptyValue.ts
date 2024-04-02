import { Type } from '@sinclair/typebox';
import { AllowEmptyValue, Controller, Get, Query } from '../../../src';
import { DecoratorSpecification, DecoratorTest } from './decorate.test';

const controller: DecoratorSpecification = {
  controller: () => {
    @Controller('/')
    // @ts-expect-error: AllowEmptyValue can not be used on controllers
    @AllowEmptyValue()
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
      // @ts-expect-error: AllowEmptyValue can not be used on methods
      @AllowEmptyValue()
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
        @Query('q', Type.String())
        @AllowEmptyValue()
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
        - name: q
          in: query
          allowEmptyValue: true
          schema:
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
