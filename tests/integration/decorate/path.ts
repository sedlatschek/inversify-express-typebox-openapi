import { Type } from '@sinclair/typebox';
import { Controller, Get, Path } from '../../../src';
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
      @Get('/{id}')
      public get(@Path('id', Type.String()) _id: string): void {}
    }
    return () => new TestController();
  },
  expectation: {
    possible: true,
    yaml: `
  /{id}:
    get:
      responses: {}
      parameters:
        - name: id
          in: path
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
