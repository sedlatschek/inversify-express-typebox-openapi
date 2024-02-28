import { type Container } from 'inversify';
import { OpenApiBuilder } from 'openapi3-ts/oas31';
import { parseContainer } from './parse';
import { injectControllersIntoBuilder } from './generate/generate';

export const generateSpec = (
  container: Container,
  builder?: OpenApiBuilder,
): OpenApiBuilder => {
  const openApi = builder || OpenApiBuilder.create();
  const controllers = parseContainer(container);
  injectControllersIntoBuilder(openApi, controllers);
  return openApi;
};

export const generateSpecAsJson = (
  container: Container,
  builder?: OpenApiBuilder,
): string => {
  return JSON.stringify(generateSpec(container, builder).getSpec());
};

export const generateSpecAsYaml = (
  container: Container,
  builder?: OpenApiBuilder,
): string => {
  return generateSpec(container, builder).getSpecAsYaml();
};
