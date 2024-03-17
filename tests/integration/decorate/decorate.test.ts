import 'reflect-metadata';
import { globSync } from 'glob';
import { Container } from 'inversify';
import {
  InversifyExpressServer,
  cleanUpMetadata,
} from 'inversify-express-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { generateSpecAsYaml } from '../../../src';
import { ucfirst } from '../../../src/utilize';

const titleRegex = /[/\\](\w+)\.(class|method|parameter)\.ts$/;

describe('decorate', async () => {
  afterEach(() => {
    cleanUpMetadata();
  });

  for (const file of globSync([
    `${__dirname}/*.class.ts`,
    `${__dirname}/*.method.ts`,
    `${__dirname}/*.parameter.ts`,
  ])) {
    const decoratorName = file.match(titleRegex)?.[1];
    if (!decoratorName) {
      throw new Error('Decorator title is missing');
    }

    const decoratorType = file.match(titleRegex)?.[2];
    if (!decoratorType) {
      throw new Error('Decorator type is missing');
    }

    it(`should specify ${ucfirst(decoratorName)} on ${decoratorType}`, async () => {
      const test = await import(file);
      expect(test.expectedYaml).toBeDefined();
      expect(test.TestController).toBeDefined();

      const container = new Container();
      const server = new InversifyExpressServer(container);
      server.build();

      expect(generateSpecAsYaml(container)).toBe(test.expectedYaml);
    });
  }
});
