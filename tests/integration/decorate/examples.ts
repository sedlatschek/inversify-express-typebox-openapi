import { Type } from '@sinclair/typebox';
import { Body, Controller, Examples, Post, Query } from '../../../src';
import { DecoratorSpecification, DecoratorTest } from './decorate.test';

const controller: DecoratorSpecification = {
  controller: () => {
    @Controller('/')
    // @ts-expect-error: Examples can not be used on controllers
    @Examples()
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
      // @ts-expect-error: Examples can not be used on methods
      @Examples()
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
      @Post('/users')
      public createUser(
        @Examples({
          admin: { value: { name: 'admin' } },
          guest: { value: { name: 'guest' } },
        })
        @Body(Type.Object({ name: Type.String() }))
        _userDto: {
          name: string;
        },
        @Examples({
          push: { value: 'PUSH' },
          wait: { value: 'WAIT' },
        })
        @Query('mode', Type.Optional(Type.String()))
        _mode?: string,
      ): void {}
    }
    return () => new TestController();
  },
  expectation: {
    possible: true,
    yaml: `
  /users:
    post:
      responses: {}
      parameters:
        - name: mode
          in: query
          schema:
            type: string
          required: false
          examples:
            push:
              value: PUSH
            wait:
              value: WAIT
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
              required:
                - name
            examples:
              admin:
                value:
                  name: admin
              guest:
                value:
                  name: guest
      operationId: TestController_createUser
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
