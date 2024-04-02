import { Type } from '@sinclair/typebox';
import { Controller, ExternalDocs, Get, Post, Query } from '../../../src';
import { DecoratorSpecification, DecoratorTest } from './decorate.test';

const controller: DecoratorSpecification = {
  controller: () => {
    @Controller('/')
    @ExternalDocs({
      url: 'https://example.org/docs.md',
      description: 'External Docs',
    })
    class TestController {
      @Get('/')
      public get(): void {}

      @Post('/')
      public post(): void {}
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
      externalDocs:
        url: https://example.org/docs.md
        description: External Docs
    post:
      responses: {}
      operationId: TestController_post
      externalDocs:
        url: https://example.org/docs.md
        description: External Docs
`,
  },
};

const method: DecoratorSpecification = {
  controller: () => {
    @Controller('/')
    class TestController {
      @ExternalDocs({
        url: 'https://example.org/docs.md',
        description: 'External Docs',
      })
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
      externalDocs:
        url: https://example.org/docs.md
        description: External Docs
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
        @ExternalDocs({
          url: 'https://example.org/docs.md',
          description: 'External Docs',
        })
        @Query('q', Type.String())
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
          schema:
            type: string
          required: true
          externalDocs:
            url: https://example.org/docs.md
            description: External Docs
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
