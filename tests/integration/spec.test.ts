import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { Container } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';
import './TestOaController310Posting';
import './TestOaController310Image';
import './TestOaController310Other';
import './TestOaController310User';
import './TestOaController310Post';
import { readFile } from 'fs/promises';
import { generateSpec, generateSpecAsYaml } from '../../src';

const container = new Container();
container.bind('SomeService').toConstantValue('SomeValue');

const server = new InversifyExpressServer(container);
server.build();

describe('spec', async () => {
  it('is valid for OpenAPI 3.1.0', async () => {
    const openApi = generateSpec(container);
    openApi
      .addInfo({
        title: 'TestOa',
        version: '0.2.0',
        description: 'The expected OpenAPI 3.1.0 spec for the test controllers',
        contact: {
          email: 'developer@example.org',
        },
      })
      .addSecurityScheme('basicAuth', { type: 'http', scheme: 'basic' })
      .addSecurityScheme('bearerAuth', {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      });

    const spec = generateSpecAsYaml(openApi);

    expect(spec).to.equal(
      await readFile('tests/integration/TestOaSpec310.yaml', 'utf8'),
    );
    expect(spec).to.not.include('$id');
  });
});
