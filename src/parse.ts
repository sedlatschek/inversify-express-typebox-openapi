import { Container } from 'inversify';
import {
  Controller as InversifyController,
  ControllerMethodMetadata,
  getControllerMetadata,
  getControllerMethodMetadata,
  getControllersFromContainer,
} from 'inversify-express-utils';
import { Controller, Route } from './types';
import { getParametersMetadata } from './metadata';

export const parseContainer = (container: Container): Controller[] => {
  const inversifyControllers = getControllersFromContainer(container, true);
  return parseControllers(inversifyControllers);
};

export const parseControllers = (
  inversifyControllers: InversifyController[],
): Controller[] => {
  return inversifyControllers.map((controller): Controller => {
    const inversifyControllerMetadata = getControllerMetadata(
      controller.constructor,
    );
    const inversifyMethodMetadata = getControllerMethodMetadata(
      controller.constructor,
    );

    const routes = parseRoutes(inversifyMethodMetadata);

    return {
      name: inversifyControllerMetadata.target.name,
      path: inversifyControllerMetadata.path,
      routes,
    };
  });
};

export const parseRoutes = (
  inversifyControllerMethod: ControllerMethodMetadata[],
): Route[] => {
  return inversifyControllerMethod.map((method): Route => {
    const parameters = getParametersMetadata(method.target, method.key);

    return {
      method: method.method,
      path: method.path,
      parameters,
    };
  });
};
