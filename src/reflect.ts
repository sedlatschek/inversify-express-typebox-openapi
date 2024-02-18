import { TSchema } from '@sinclair/typebox';
import { Body, Parameter } from './type';
import { ParameterLocation } from 'openapi3-ts/oas31';

export enum METADATA_KEY {
  body = 'inversify-express-typebox-openapi:body',
  parameters = 'inversify-express-typebox-openapi:parameters',
}

export function getParametersMetadata(
  target: Object,
  methodName: string | symbol,
): Parameter[] | undefined {
  return (
    Reflect.getMetadata(METADATA_KEY.parameters, target, methodName) ??
    undefined
  );
}

export function addParametersMetadata(
  target: Object,
  methodName: string | symbol,
  type: ParameterLocation,
  schema: TSchema,
  name: string,
) {
  let metadata = getParametersMetadata(target, methodName);

  if (!metadata) {
    const parametersMetadata: Parameter[] = [];

    Reflect.defineMetadata(
      METADATA_KEY.parameters,
      parametersMetadata,
      target,
      methodName,
    );

    metadata = parametersMetadata;
  }

  metadata.push({ name, type, schema });
}

export function getBodyMetadata(
  target: Object,
  methodName: string | symbol,
): Body | undefined {
  return Reflect.getMetadata(METADATA_KEY.body, target, methodName);
}

export function addBodyMetadata(
  target: Object,
  methodName: string | symbol,
  schema: TSchema,
) {
  Reflect.defineMetadata(METADATA_KEY.body, { schema }, target, methodName);
}
