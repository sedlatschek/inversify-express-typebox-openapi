import 'reflect-metadata';
import { Container } from 'inversify';
import {
  InversifyExpressServer,
  cleanUpMetadata,
} from 'inversify-express-utils';
import { basename } from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import { generateSpecAsYaml } from '../../../src';
import { ucfirst } from '../../../src/utilize';
import allowEmptyValueTest from './allowEmptyValue';
import allowReservedTest from './allowReserved';
import bodyTest from './body';
import cookieTest from './cookie';
import deleteTest from './delete';
import deprecatedTest from './deprecated';
import descriptionTest from './description';
import exampleTest from './example';
import examplesTest from './examples';
import explodeTest from './explode';
import externalDocsTest from './externalDocs';
import getTest from './get';
import headTest from './head';
import headerTest from './header';
import operationIdTest from './operationId';
import patchTest from './patch';
import pathTest from './path';
import postTest from './post';
import putTest from './put';
import queryTest from './query';
import responseTest from './response';
import securityTest from './security';
import styleTest from './style';
import summaryTest from './summary';

export type DecoratorSpecification = {
  controller: () => void;
  expectation: {
    possible: boolean;
    yaml?: string;
  };
};

export type DecoratorTest = {
  filename: string;
  tests: {
    controller: DecoratorSpecification;
    method: DecoratorSpecification;
    parameter: DecoratorSpecification;
  };
};

describe('decorate', async () => {
  afterEach(() => {
    cleanUpMetadata();
  });

  const decoratorTests: DecoratorTest[] = [
    allowEmptyValueTest,
    allowReservedTest,
    bodyTest,
    cookieTest,
    deleteTest,
    deprecatedTest,
    descriptionTest,
    exampleTest,
    examplesTest,
    explodeTest,
    externalDocsTest,
    getTest,
    headTest,
    headerTest,
    operationIdTest,
    patchTest,
    pathTest,
    postTest,
    putTest,
    queryTest,
    responseTest,
    securityTest,
    styleTest,
    summaryTest,
  ];

  for (const decoratorTest of decoratorTests) {
    for (const [decoratorType, test] of Object.entries(decoratorTest.tests)) {
      if (test.expectation.possible) {
        it(`should be possible to specify ${ucfirst(basename(decoratorTest.filename).replace(/\.ts$/, ''))} on ${decoratorType}`, () => {
          expect(test.expectation.yaml).toBeDefined();

          test.controller();

          const container = new Container();
          const server = new InversifyExpressServer(container);
          server.build();

          expect(generateSpecAsYaml(container)).toBe(`openapi: 3.1.0
info:
  title: app
  version: version
paths:
  ${test.expectation.yaml?.trim()}
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
`);
        });
      }
    }
  }
});
