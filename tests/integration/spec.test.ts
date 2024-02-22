import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { Container } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';
import { OpenApiBuilder } from 'openapi3-ts/oas31';
import { parseContainer } from '../../src/parse';
import { injectControllers } from '../../src/generate';

import './TestOaController310User';
import './TestOaController310Post';
import { readFile } from 'fs/promises';

const container = new Container();
const server = new InversifyExpressServer(container);
server.build();
const openApi = OpenApiBuilder.create();
openApi.addInfo({
  title: 'TestOa',
  version: '0.2.0',
  description: 'The expected OpenAPI 3.1.0 spec for the test controllers',
  contact: {
    email: 'developer@example.org',
  },
});
const controllers = parseContainer(container);
injectControllers(openApi, controllers);

describe('spec', async () => {
  it('is valid for OpenAPI 3.1.0', async () => {
    const spec = openApi.getSpecAsYaml();

    expect(spec).to.equal(
      await readFile('tests/integration/TestOaSpec310.yaml', 'utf8'),
    );
  });
});
