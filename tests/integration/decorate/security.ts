import { Controller, Get, Patch, Post, Security } from '../../../src';
import { DecoratorSpecification, DecoratorTest } from './decorate.test';

const controller: DecoratorSpecification = {
  controller: () => {
    @Controller('/')
    @Security({ bearerAuth: ['write:user'] })
    class TestController {
      @Post('/')
      public post(): void {}
      @Patch('/')
      public patch(): void {}
    }

    return () => new TestController();
  },
  expectation: {
    possible: true,
    yaml: `
  /:
    post:
      responses: {}
      operationId: TestController_post
      security:
        - bearerAuth:
            - write:user
    patch:
      responses: {}
      operationId: TestController_patch
      security:
        - bearerAuth:
            - write:user
`,
  },
};

const method: DecoratorSpecification = {
  controller: () => {
    @Controller('/')
    class TestController {
      @Security({ bearerAuth: ['read:user', 'read:session'] })
      @Get('/')
      public me(): void {}
    }

    return () => new TestController();
  },
  expectation: {
    possible: true,
    yaml: `
  /:
    get:
      responses: {}
      security:
        - bearerAuth:
            - read:user
            - read:session
      operationId: TestController_me
`,
  },
};

const parameter: DecoratorSpecification = {
  controller: () => {
    @Controller('/')
    class TestController {
      @Get('/')
      // @ts-expect-error: Security can not be used on parameters
      public get(@Security('Y') _q: string): void {}
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
