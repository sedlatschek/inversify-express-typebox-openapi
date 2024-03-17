import { Controller, Get, OperationId } from '../../../src';

@Controller('/')
@OperationId('X')
export class TestController {
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
      operationId: X_get
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
