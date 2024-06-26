import { Controller, Delete } from '../../../src';
import { DecoratorSpecification, DecoratorTest } from './decorate.test';

const controller: DecoratorSpecification = {
  controller: () => {
    @Controller('/')
    // @ts-expect-error: Delete can not be used on controllers
    @Delete('/')
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
      @Delete('/test')
      public delete(): void {}
    }

    return () => new TestController();
  },
  expectation: {
    possible: true,
    yaml: `
  /test:
    delete:
      responses: {}
      operationId: TestController_delete
`,
  },
};

const parameter: DecoratorSpecification = {
  controller: () => {
    @Controller('/')
    class TestController {
      @Delete('/')
      // @ts-expect-error: Delete can not be used on parameters
      public delete(@Delete() _test: string): void {}
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
