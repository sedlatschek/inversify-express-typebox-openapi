import {
  CallbacksObject,
  ComponentsObject,
  ContentObject,
  EncodingObject,
  ExampleObject,
  ExamplesObject,
  HeaderObject,
  HeadersObject,
  LinksObject,
  OperationObject,
  ParameterObject,
  ReferenceObject,
  RequestBodyObject,
  ResponseObject,
  ResponsesObject,
  SchemaObject,
  isReferenceObject,
} from 'openapi3-ts/oas31';
import { reference, referenceArray, referenceMap } from './reference';
import { hasProperty } from '../utilize';

export const createReferences = (
  components: ComponentsObject,
  ...operationObjects: OperationObject[]
): void => {
  for (const operationObject of operationObjects) {
    if (hasProperty(operationObject, 'parameters')) {
      processParameters(components, operationObject);
    }
    if (hasProperty(operationObject, 'requestBody')) {
      processRequestBody(components, operationObject);
    }
    if (hasProperty(operationObject, 'responses')) {
      processResponses(components, operationObject);
    }
    if (hasProperty(operationObject, 'callbacks')) {
      processCallbacks(components, operationObject);
    }
  }
};

export const processParameters = (
  components: ComponentsObject,
  object: {
    parameters: (ParameterObject | ReferenceObject)[];
  },
): void => {
  for (const parameterObject of object.parameters) {
    if (isReferenceObject(parameterObject)) {
      continue;
    }
    if (hasProperty(parameterObject, 'schema')) {
      processSchema(components, parameterObject);
    }
    if (hasProperty(parameterObject, 'examples')) {
      processExamples(components, parameterObject);
    }
    if (hasProperty(parameterObject, 'content')) {
      processContent(components, parameterObject);
    }
  }

  object.parameters = referenceArray<ParameterObject>(
    components,
    'parameters',
    object.parameters,
  );
};

export const processRequestBody = (
  components: ComponentsObject,
  object: {
    requestBody: RequestBodyObject | ReferenceObject;
  },
): void => {
  if (isReferenceObject(object.requestBody)) {
    return;
  }
  processContent(components, object.requestBody);

  object.requestBody = reference(
    components,
    'requestBodies',
    object.requestBody,
  );
};

export const processResponses = (
  components: ComponentsObject,
  object: { responses: ResponsesObject | ReferenceObject },
): void => {
  if (isReferenceObject(object.responses)) {
    return;
  }

  for (const response of Object.values(object.responses)) {
    if (hasProperty(response, 'content')) {
      processContent(components, response);
    }
    if (hasProperty(response, 'headers')) {
      processHeaders(components, response);
    }
    if (hasProperty(response, 'links')) {
      processLinks(components, response);
    }
  }

  object.responses = referenceMap<ResponseObject>(
    components,
    'responses',
    object.responses,
  );
};

export const processSchema = (
  components: ComponentsObject,
  object: { schema: SchemaObject | ReferenceObject },
): void => {
  object.schema = reference(components, 'schemas', object.schema);
};

export const processExamples = (
  components: ComponentsObject,
  object: { examples: ExamplesObject | ReferenceObject },
): void => {
  if (isReferenceObject(object.examples)) {
    return;
  }

  object.examples = referenceMap<ExampleObject>(
    components,
    'examples',
    object.examples,
  );
};

export const processHeaders = (
  components: ComponentsObject,
  object: { headers: HeadersObject },
): void => {
  object.headers = referenceMap<HeaderObject>(
    components,
    'headers',
    object.headers,
  );
};

export const processLinks = (
  components: ComponentsObject,
  object: { links: LinksObject },
): void => {
  object.links = referenceMap(components, 'links', object.links);
};

export const processCallbacks = (
  components: ComponentsObject,
  object: { callbacks: CallbacksObject },
): void => {
  if (isReferenceObject(object.callbacks)) {
    return;
  }

  if (!components.callbacks) {
    components.callbacks = {};
  }

  object.callbacks = referenceMap(components, 'callbacks', object.callbacks);
};

export const processContent = (
  components: ComponentsObject,
  object: { content: ContentObject },
): void => {
  for (const mediaType of Object.values(object.content)) {
    if (hasProperty(mediaType, 'schema')) {
      processSchema(components, mediaType);
    }
    if (hasProperty(mediaType, 'examples')) {
      processExamples(components, mediaType);
    }
    if (hasProperty(mediaType, 'encoding')) {
      processEncodingProperty(components, mediaType);
    }
  }
};

export const processEncodingProperty = (
  components: ComponentsObject,
  object: { encoding: EncodingObject },
): void => {
  for (const encodingProperty of Object.values(object.encoding)) {
    if (hasProperty(encodingProperty, 'headers')) {
      processHeaders(components, encodingProperty);
    }
  }
};
