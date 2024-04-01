import { Controller, Get, Tags } from '../../../src';
import { DecoratorSpecification, DecoratorTest } from './decorate.test';

const controller: DecoratorSpecification = {
  controller: () => {
    @Controller('/')
    @Tags('X')
    class TestController {
      @Get('/')
      public get(): void {}

      @Get('/{id}')
      public getId(): void {}
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
      tags:
        - X
  /{id}:
    get:
      responses: {}
      operationId: TestController_getId
      tags:
        - X
`,
  },
};

const method: DecoratorSpecification = {
  controller: () => {
    @Controller('/')
    class TestController {
      @Tags('X')
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
      tags:
        - X
      operationId: TestController_get
`,
  },
};

const parameter: DecoratorSpecification = {
  controller: () => {
    @Controller('/')
    class TestController {
      @Get('/')
      // @ts-expect-error: Tags can not be used on parameters
      public get(@Tags('Y') _q: string): void {}
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
