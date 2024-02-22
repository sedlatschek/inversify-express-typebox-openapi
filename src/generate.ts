import {
  OpenApiBuilder,
  OperationObject,
  ParameterObject,
  PathItemObject,
} from 'openapi3-ts/oas31';
import { Controller, Operation, Parameter } from './type';

export const injectControllers = (
  builder: OpenApiBuilder,
  controllers: Controller[],
): OpenApiBuilder => {
  for (const controller of controllers) {
    for (const route of controller.routes) {
      const pathItem: PathItemObject = {};
      for (const operation of route.operations) {
        if (!operation.method) {
          throw new Error('Operation method is required');
        }
        pathItem[operation.method] =
          convertOperationToOperationObject(operation);
      }
      builder.addPath(getRoutePath(controller.path, route.path), pathItem);
    }
  }

  return builder;
};

const pathSlashReplaceRegex = /\/\/+/g;
const pathParamReplaceRegex = /:([^/]+)/g;

const getRoutePath = (controllerPath: string, routePath: string): string => {
  return `${controllerPath}/${routePath}`
    .replace(pathSlashReplaceRegex, '/')
    .replace(pathParamReplaceRegex, '{$1}');
};

const convertOperationToOperationObject = (
  operation: Operation,
): OperationObject => {
  const operationObject = { ...operation };
  delete operationObject.method;

  (operationObject as OperationObject).parameters =
    operationObject.parameters?.map((parameter: Parameter): ParameterObject => {
      const { index: _, ...parameterObject } = parameter;
      return parameterObject;
    }) as ParameterObject[] | undefined;

  return operationObject;
};
