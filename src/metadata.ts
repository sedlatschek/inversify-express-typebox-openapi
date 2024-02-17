import { TSchema } from '@sinclair/typebox';
import { ParameterMetadata, ParameterType } from './types';

export enum METADATA_KEY {
  parameters = 'inversify-express-typebox-openapi:parameters',
}

export function getParametersMetadata(
  target: Object,
  methodName: string | symbol,
): ParameterMetadata | undefined {
  return (
    Reflect.getMetadata(METADATA_KEY.parameters, target, methodName) ??
    undefined
  );
}

export function addParametersMetadata(
  target: Object,
  methodName: string | symbol,
  type: ParameterType,
  schema: TSchema,
  parameterName?: string,
) {
  let metadata = getParametersMetadata(target, methodName);

  if (!metadata) {
    const parameterMetadata: ParameterMetadata = {
      body: [],
      query: [],
      path: [],
      header: [],
    };

    Reflect.defineMetadata(
      METADATA_KEY.parameters,
      parameterMetadata,
      target,
      methodName,
    );

    metadata = parameterMetadata;
  }

  metadata[type].push({ name: parameterName, type, schema });
}
