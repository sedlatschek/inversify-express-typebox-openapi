import 'reflect-metadata';
import { Container } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';

import './ExampleController';
import { parseContainer } from './parse';

// set up container
let container = new Container();

// create server
let server = new InversifyExpressServer(container);
let app = server.build();

console.log(JSON.stringify(parseContainer(container), null, 2));
