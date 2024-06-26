import { Type } from '@sinclair/typebox';
import { Controller, Get, Response } from '../../../src';
import { DecoratorSpecification, DecoratorTest } from './decorate.test';

const controller: DecoratorSpecification = {
  controller: () => {
    @Controller('/')
    // @ts-expect-error: Response can not be used on controllers
    @Response(200, { schema: Type.String() })
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
      @Response(200, {
        description: 'Success',
        content: { schema: Type.String() },
      })
      @Response('default', {
        description: 'Error',
        content: { schema: Type.Object({ errorCode: Type.Number() }) },
      })
      public get(): void {}
    }

    return () => new TestController();
  },
  expectation: {
    possible: true,
    yaml: `
  /:
    get:
      responses:
        "200":
          description: Success
          content:
            application/json:
              schema:
                type: string
        default:
          description: Error
          content:
            application/json:
              schema:
                type: object
                properties:
                  errorCode:
                    type: number
                required:
                  - errorCode
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
        // @ts-expect-error: Response can not be used on methods
        @Response('200', { schema: Type.String() }) _res: string,
      ): void {}
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
