import { Container } from 'inversify';
import {
  Controller as InversifyController,
  ControllerMethodMetadata,
  getControllerMetadata as getInversifyControllerMetadata,
  getControllerMethodMetadata as getInversifyControllerMethodMetadata,
  getControllersFromContainer as getInversifyControllersFromContainer,
} from 'inversify-express-utils';
import { Controller, Route } from './type';
import { getControllerMetadata, getOperationMetadata } from './reflect';
import { OperationObject } from 'openapi3-ts/oas31';

export type ParsedController = Controller & {
  baseOperationObject: OperationObject;
};

export const parseContainer = (container: Container): ParsedController[] => {
  const inversifyControllers = getInversifyControllersFromContainer(
    container,
    true,
  );
  return parseControllers(inversifyControllers);
};

export const parseControllers = (
  inversifyControllers: InversifyController[],
): ParsedController[] => {
  return inversifyControllers.map((controller): ParsedController => {
    const inversifyControllerMetadata = getInversifyControllerMetadata(
      controller.constructor,
    );
    const inversifyMethodMetadata = getInversifyControllerMethodMetadata(
      controller.constructor,
    );

    const controllerMetadata = getControllerMetadata(controller.constructor);
    const routes = parseRoutes(inversifyMethodMetadata);

    return {
      name: inversifyControllerMetadata.target.name,
      path: inversifyControllerMetadata.path,
      routes,
      baseOperationObject: controllerMetadata?.baseOperationObject ?? {},
    };
  });
};

export const parseRoutes = (
  inversifyControllerMethod: ControllerMethodMetadata[],
): Route[] => {
  return inversifyControllerMethod.map((method): Route => {
    const operationMetadata = getOperationMetadata(method.target, method.key);
    const operationMetadatas = operationMetadata ? [operationMetadata] : [];
    return {
      path: method.path,
      operationMetadatas,
    };
  });
};
