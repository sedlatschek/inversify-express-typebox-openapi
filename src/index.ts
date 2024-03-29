import { Container } from 'inversify';
import { OpenApiBuilder } from 'openapi3-ts/oas31';
import { stringify } from 'yaml';
import { injectControllersIntoBuilder } from './generate/generate';
import { parseContainer } from './parse';

export * from './decorate';

export {
  IdentifiableObject,
  isIdentifiableObject,
  identifiable,
  withoutId,
} from './generate/reference';

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
  containerOrOpenApiBuilder: Container | OpenApiBuilder,
  builder?: OpenApiBuilder,
): string => {
  const openApiBuilder =
    containerOrOpenApiBuilder instanceof Container
      ? generateSpec(containerOrOpenApiBuilder, builder)
      : containerOrOpenApiBuilder;
  return openApiBuilder.getSpecAsJson();
};

export const generateSpecAsYaml = (
  containerOrOpenApiBuilder: Container | OpenApiBuilder,
  builder?: OpenApiBuilder,
): string => {
  const spec =
    containerOrOpenApiBuilder instanceof Container
      ? generateSpec(containerOrOpenApiBuilder, builder).getSpec()
      : containerOrOpenApiBuilder.getSpec();
  return stringify(spec, {
    aliasDuplicateObjects: false,
    anchorPrefix: 'oa',
  });
};
