import 'reflect-metadata';
import { TSchema } from '@sinclair/typebox';
import assert from 'assert';
import {
  HandlerDecorator,
  Middleware,
  controller,
  httpDelete,
  httpGet,
  httpHead,
  httpPatch,
  httpPost,
  httpPut,
  queryParam,
  requestBody,
  requestParam,
} from 'inversify-express-utils';
import {
  ExternalDocumentationObject,
  ParameterLocation,
  ParameterStyle,
  SecurityRequirementObject,
} from 'openapi3-ts/oas31';
import {
  addBodyMetadata,
  addControllerMetadata,
  addOperationMetadata,
  addParametersMetadata,
  addResponsesMetadata,
} from './reflect';
import {
  ExamplesObjectOf,
  OperationMethod,
  ParameterParameters,
  ResponseParameters,
} from './type';
import { ucfirst } from './utilize';

export const Controller = (
  path: string,
  ...middleware: Array<Middleware>
): ClassDecorator => {
  return (target: object): void => {
    addControllerMetadata(target, {
      config: { path },
    });
    controller(path, ...middleware)(target);
  };
};

export type InversifyMethodDecorator = (
  path: string,
  ...middleware: Array<Middleware>
) => HandlerDecorator;

const operationDecoratorFactory = (
  inversifyMethodDecorator: InversifyMethodDecorator,
  method: OperationMethod,
): ((
  path: string,
  description?: string,
  ...middleware: Array<Middleware>
) => HandlerDecorator) => {
  return (
    path: string,
    description?: string,
    ...middleware: Array<Middleware>
  ) => {
    return (
      target: object,
      propertyKey: string,
      descriptor: PropertyDescriptor,
    ) => {
      addOperationMetadata(target, propertyKey, {
        config: { method, path },
        metadataProperties: { description },
      });
      inversifyMethodDecorator(path, ...middleware)(
        target,
        propertyKey,
        descriptor,
      );
    };
  };
};

export const Get = operationDecoratorFactory(httpGet, 'get');
export const Post = operationDecoratorFactory(httpPost, 'post');
export const Patch = operationDecoratorFactory(httpPatch, 'patch');
export const Put = operationDecoratorFactory(httpPut, 'put');
export const Head = operationDecoratorFactory(httpHead, 'head');
export const Delete = operationDecoratorFactory(httpDelete, 'delete');

export type InversifyParameterDecorator = (
  paramName?: string,
) => ParameterDecorator;

const parameterDecoratorFactory = (
  inversifyParameterDecorator: InversifyParameterDecorator,
  type: ParameterLocation,
): (<
  TTarget extends object,
  TPropertyKey extends string | symbol | undefined,
  TParameterIndex extends number,
  TTSchema extends TSchema,
>(
  name: string,
  schema: TTSchema,
  parameters?: ParameterParameters<TTSchema>,
) => (
  target: TTarget,
  methodName: TPropertyKey,
  parameterIndex: TParameterIndex,
) => void) => {
  return <
    TTarget extends object,
    TPropertyKey extends string | symbol | undefined,
    TParameterIndex extends number,
    TTSchema extends TSchema,
  >(
    name: string,
    schema: TTSchema,
    parameters?: ParameterParameters<TTSchema>,
  ): ((
    target: TTarget,
    methodName: TPropertyKey,
    parameterIndex: TParameterIndex,
  ) => void) => {
    return (
      target: TTarget,
      methodName: TPropertyKey,
      parameterIndex: TParameterIndex,
    ) => {
      assert(
        !!methodName,
        `${ucfirst(type)} decorator can only be used on parameters`,
      );
      addParametersMetadata(
        target,
        methodName,
        parameterIndex,
        { schema, ...parameters },
        {
          name,
          in: type,
        },
      );
      inversifyParameterDecorator(name)(target, methodName, parameterIndex);
    };
  };
};

export const Path = parameterDecoratorFactory(requestParam, 'path');
export const Query = parameterDecoratorFactory(queryParam, 'query');
export const Cookie = parameterDecoratorFactory(queryParam, 'cookie');
export const Header = parameterDecoratorFactory(queryParam, 'header');

export const Body = <
  TTarget extends object,
  TPropertyKey extends string | symbol | undefined,
  TParameterIndex extends number,
  TTSchema extends TSchema,
>(
  schema: TTSchema,
  parameters?: ParameterParameters<TTSchema>,
): ((
  target: TTarget,
  propertyKey: TPropertyKey,
  parameterIndex: TParameterIndex,
) => void) => {
  return (
    target: TTarget,
    propertyKey: TPropertyKey,
    parameterIndex: TParameterIndex,
  ) => {
    assert(!!propertyKey, 'Body decorator can only be used on parameters');
    addBodyMetadata(target, propertyKey, parameterIndex, {
      schema,
      ...parameters,
    });
    requestBody()(target, propertyKey, parameterIndex);
  };
};

export function Response<
  TTarget extends object,
  TPropertyKey extends string | symbol,
  TSchemaType extends TSchema,
>(
  statusCode: string | number,
  parameters: ResponseParameters<TSchemaType>,
): (target: TTarget, propertyKey: TPropertyKey) => void {
  return (target: TTarget, propertyKey: TPropertyKey) => {
    addResponsesMetadata(
      target,
      propertyKey,
      statusCode.toString(),
      parameters,
    );
  };
}

export const AllowEmptyValue = (): ParameterDecorator => {
  return (
    target: object,
    propertyKey: string | symbol | undefined,
    parameterIndex: number,
  ) => {
    assert(
      !!propertyKey,
      'AllowEmptyValue decorator can only be used on parameters',
    );
    addParametersMetadata(target, propertyKey, parameterIndex, {
      allowEmptyValue: true,
    });
  };
};

export const AllowReserved = (): ParameterDecorator => {
  return (
    target: object,
    propertyKey: string | symbol | undefined,
    parameterIndex: number,
  ) => {
    assert(
      !!propertyKey,
      'AllowReserved decorator can only be used on parameters',
    );
    addParametersMetadata(target, propertyKey, parameterIndex, {
      allowReserved: true,
    });
  };
};

export const Deprecated = (): ClassDecorator &
  MethodDecorator &
  ParameterDecorator => {
  return (
    target: object,
    propertyKey?: string | symbol,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    descriptorOrParameterIndex?: TypedPropertyDescriptor<any>,
  ): void => {
    const metadataProperties = { deprecated: true, required: false };
    if (propertyKey === undefined) {
      addControllerMetadata(target, { metadataProperties });
    } else if (typeof descriptorOrParameterIndex === 'number') {
      addParametersMetadata(
        target,
        propertyKey,
        descriptorOrParameterIndex,
        metadataProperties,
      );
    } else {
      addOperationMetadata(target, propertyKey, {
        metadataProperties,
      });
    }
  };
};

export const Description = (
  description: string,
): ClassDecorator & MethodDecorator & ParameterDecorator => {
  return (
    target: object,
    propertyKey?: string | symbol,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    descriptorOrParameterIndex?: TypedPropertyDescriptor<any>,
  ): void => {
    const metadataProperties = { description };
    if (propertyKey === undefined) {
      addControllerMetadata(target, { metadataProperties });
    } else if (typeof descriptorOrParameterIndex === 'number') {
      addParametersMetadata(
        target,
        propertyKey,
        descriptorOrParameterIndex,
        metadataProperties,
      );
    } else {
      addOperationMetadata(target, propertyKey, {
        metadataProperties,
      });
    }
  };
};

export const Example = <T>(example: T): ParameterDecorator => {
  return (
    target: object,
    propertyKey: string | symbol | undefined,
    parameterIndex: number,
  ) => {
    assert(!!propertyKey, 'Example decorator can only be used on parameters');
    addParametersMetadata(target, propertyKey, parameterIndex, {
      example,
    });
  };
};

export const Examples = <T>(
  examples: ExamplesObjectOf<T>,
): ParameterDecorator => {
  return (
    target: object,
    propertyKey: string | symbol | undefined,
    parameterIndex: number,
  ) => {
    assert(!!propertyKey, 'Examples decorator can only be used on parameters');
    addParametersMetadata(target, propertyKey, parameterIndex, {
      examples,
    });
  };
};

export const Explode = (): ParameterDecorator => {
  return (
    target: object,
    propertyKey: string | symbol | undefined,
    parameterIndex: number,
  ) => {
    assert(!!propertyKey, 'Explode decorator can only be used on parameters');
    addParametersMetadata(target, propertyKey, parameterIndex, {
      explode: true,
    });
  };
};

export const ExternalDocs = (
  externalDocs: ExternalDocumentationObject,
): ClassDecorator & MethodDecorator & ParameterDecorator => {
  return (
    target: object,
    propertyKey?: string | symbol,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    descriptorOrParameterIndex?: TypedPropertyDescriptor<any>,
  ): void => {
    const metadataProperties = { externalDocs };
    if (propertyKey === undefined) {
      addControllerMetadata(target, { metadataProperties });
    } else if (typeof descriptorOrParameterIndex === 'number') {
      addParametersMetadata(
        target,
        propertyKey,
        descriptorOrParameterIndex,
        metadataProperties,
      );
    } else {
      addOperationMetadata(target, propertyKey, {
        metadataProperties,
      });
    }
  };
};

export const OperationId = (
  operationId: string,
): ClassDecorator & MethodDecorator => {
  return (target: object, propertyKey?: string | symbol | undefined) => {
    const metadataProperties = { operationId };
    if (propertyKey === undefined) {
      addControllerMetadata(target, { metadataProperties });
    } else {
      addOperationMetadata(target, propertyKey, {
        metadataProperties,
      });
    }
  };
};

export const Security = (
  securityObject: SecurityRequirementObject,
): ClassDecorator & MethodDecorator => {
  return (target: object, propertyKey?: string | symbol | undefined): void => {
    const metadataProperties = { security: [securityObject] };

    if (!propertyKey) {
      addControllerMetadata(target, { metadataProperties });
    } else {
      addOperationMetadata(target, propertyKey, {
        metadataProperties,
      });
    }
  };
};

export const Style = (style: ParameterStyle): ParameterDecorator => {
  return (
    target: object,
    propertyKey: string | symbol | undefined,
    parameterIndex: number,
  ) => {
    assert(!!propertyKey, 'Style decorator can only be used on parameters');
    addParametersMetadata(target, propertyKey, parameterIndex, { style });
  };
};

export const Summary = (summary: string): MethodDecorator => {
  return (target: object, propertyKey: string | symbol) => {
    const metadataProperties = { summary };
    addOperationMetadata(target, propertyKey, {
      metadataProperties,
    });
  };
};

export const Tags = (...tags: string[]): ClassDecorator & MethodDecorator => {
  return (target: object, propertyKey?: string | symbol | undefined): void => {
    const metadataProperties = { tags };

    if (!propertyKey) {
      addControllerMetadata(target, { metadataProperties });
    } else {
      addOperationMetadata(target, propertyKey, {
        metadataProperties,
      });
    }
  };
};
