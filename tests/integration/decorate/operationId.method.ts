import { Controller, Get, OperationId } from '../../../src';

@Controller('/')
export class TestController {
  @OperationId('X')
  @Get('/')
  public get(): void {}
}

export const expectedYaml = `openapi: 3.1.0
info:
  title: app
  version: version
paths:
  /:
    get:
      responses: {}
      operationId: TestController_X
components:
  schemas: {}
  responses: {}
  parameters: {}
  examples: {}
  requestBodies: {}
  headers: {}
  securitySchemes: {}
  links: {}
  callbacks: {}
tags: []
servers: []
`;
