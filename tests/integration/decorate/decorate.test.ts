import 'reflect-metadata';
import { Container } from 'inversify';
import {
  InversifyExpressServer,
  cleanUpMetadata,
} from 'inversify-express-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { generateSpecAsYaml } from '../../../src';
import bodyTest from './body';
import cookieTest from './cookie';
import getTest from './get';
import headerTest from './header';
import operationIdTest from './operationId';
import pathTest from './path';
import queryTest from './query';

export type DecoratorSpecification = {
  controller: () => void;
  expectation: {
    possible: boolean;
    yaml?: string;
  };
};

export type DecoratorTest = {
  name: string;
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
    bodyTest,
    cookieTest,
    getTest,
    headerTest,
    operationIdTest,
    pathTest,
    queryTest,
  ];

  for (const decoratorTest of decoratorTests) {
    for (const [decoratorType, test] of Object.entries(decoratorTest.tests)) {
      if (test.expectation.possible) {
        it(`should be possible to specify ${decoratorTest.name} on ${decoratorType}`, () => {
          expect(test.expectation.yaml).toBeDefined();

          test.controller();

          const container = new Container();
          const server = new InversifyExpressServer(container);
          server.build();

          expect(generateSpecAsYaml(container)).toBe(test.expectation.yaml);
        });
      }
    }
  }
});
