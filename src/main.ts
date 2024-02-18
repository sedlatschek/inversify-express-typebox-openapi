import 'reflect-metadata';
import { Container } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';

import './ExampleController';
import { parseContainer } from './parse';
import { injectControllers } from './generate';
import { OpenApiBuilder } from 'openapi3-ts/oas31';

// set up container
let container = new Container();

// create server
let server = new InversifyExpressServer(container);
let app = server.build();

const openApi = OpenApiBuilder.create();
const controllers = parseContainer(container);
injectControllers(openApi, controllers);

console.log(JSON.stringify(parseContainer(container), null, 2));
console.log(openApi.getSpecAsYaml());
