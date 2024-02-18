import 'reflect-metadata';
import { Container } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';

import './examples/UserController';
import './examples/PostController';
import { parseContainer } from './parse';
import { injectControllers } from './generate';
import { OpenApiBuilder } from 'openapi3-ts/oas31';

// set up container
const container = new Container();

// create server
const server = new InversifyExpressServer(container);
server.build();

const openApi = OpenApiBuilder.create();
const controllers = parseContainer(container);
injectControllers(openApi, controllers);

console.log('\n' + openApi.getSpecAsYaml());
