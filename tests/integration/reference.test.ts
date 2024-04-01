import { Static, Type } from '@sinclair/typebox';
import {
  CallbackObject,
  ComponentsObject,
  HeaderObject,
  LinkObject,
  OperationObject,
  ParameterObject,
  RequestBodyObject,
  ResponseObject,
} from 'openapi3-ts/oas31';
import { describe, expect, it } from 'vitest';
import { identifiable } from '../../src';
import { createReferences } from '../../src/generate/create-references';
import { withoutId } from '../../src/generate/reference';
import { ExampleObjectOf } from '../../src/type';

describe('reference', () => {
  it('adds all reference origins to the components object', () => {
    const components: ComponentsObject = {};

    const numberSchema = Type.Number({ $id: 'NumberSchema' });
    const numberSchemaExampleOne = identifiable(
      { value: 1 },
      { $id: 'NumberExampleOne' },
    );
    const numberSchemaExampleTwo = identifiable(
      { value: 2 },
      { $id: 'NumberExampleTwo' },
    );

    const stringSchema = Type.String({ $id: 'StringSchema' });
    const stringSchemaExample = identifiable<ExampleObjectOf<string>>(
      { value: 'string' },
      {
        $id: 'StringSchemaExample',
      },
    );

    const userObjectSchema = Type.Object(
      {
        id: Type.Number(),
        name: Type.String(),
      },
      { $id: 'UserSchema' },
    );
    const userSchemaExamples = {
      UserExample1: identifiable<
        ExampleObjectOf<Static<typeof userObjectSchema>>
      >({ value: { id: 1, name: 'Test' } }, { $id: 'UserExample1' }),
      UserExample2: identifiable<
        ExampleObjectOf<Static<typeof userObjectSchema>>
      >({ value: { id: 2, name: 'Test2' } }, { $id: 'UserExample2' }),
    };

    const postContentObjectSchema = Type.Object(
      {
        title: Type.String(),
        body: Type.String(),
      },
      { $id: 'PostContentSchema' },
    );
    const postObjectSchema = Type.Object(
      {
        id: Type.Number(),
        content: postContentObjectSchema,
      },
      { $id: 'PostSchema' },
    );
    const postSchemaExamples = {
      PostExample1: identifiable(
        { id: 1, content: { title: 'Test', body: 'body' } },
        { $id: 'PostExample1' },
      ),
      PostExample2: identifiable(
        { id: 2, content: { title: 'Test2', body: 'body2' } },
        { $id: 'PostExample2' },
      ),
    };

    const someLink = identifiable<LinkObject>(
      {
        operationId: 'test',
        parameters: { test: 'test' },
      },
      { $id: 'SomeLink' },
    );

    const wwwAuthenticateHeader = identifiable<HeaderObject>(
      {
        description: 'The authentication method that should be used',
        schema: Type.String(),
      },
      { $id: 'WwwAuthenticateHeader' },
    );
    const rateLimitHeader = identifiable<HeaderObject>(
      {
        description: 'The number of allowed requests in the current period',
        schema: Type.Integer(),
      },
      { $id: 'RateLimitHeader' },
    );

    const xmlEncoding = {
      contentType: 'application/xml',
      headers: {
        'X-Rate-Limit': rateLimitHeader,
      },
    };

    const exampleParameter = identifiable<ParameterObject>(
      {
        name: 'test',
        in: 'query',
        description: 'Example parameter',
        required: true,
        schema: numberSchema,
        examples: {
          numberSchemaExampleOne,
          numberSchemaExampleTwo,
        },
        example: 0,
        content: {
          'application/json': {
            schema: stringSchema,
            examples: { stringSchemaExample },
            example: 'string',
            encoding: { xmlEncoding },
          },
        },
      },
      { $id: 'ExampleParameter' },
    );

    const exampleRequestBody = identifiable<RequestBodyObject>(
      {
        description: 'Example request body',
        content: {
          'application/json': {
            schema: userObjectSchema,
            examples: userSchemaExamples,
          },
        },
        required: true,
      },
      { $id: 'ExampleRequestBody' },
    );

    const example200Response = identifiable<ResponseObject>(
      {
        description: 'Example response',
        headers: {
          'WWW-Authenticate': wwwAuthenticateHeader,
        },
        content: {
          'application/json': {
            schema: postObjectSchema,
            examples: postSchemaExamples,
          },
        },
        links: {
          SomeLink: someLink,
        },
      },
      { $id: 'Example200Response' },
    );

    const callback = identifiable<CallbackObject>(
      {
        'http://example.com?test={test}': {
          post: {
            tags: ['test'],
            summary: 'This is just a test',
            description: 'This is just a test',
            operationId: 'test',
            parameters: [exampleParameter],
            requestBody: exampleRequestBody,
            responses: {
              200: example200Response,
            },
          },
        },
      },
      { $id: 'TestCallback' },
    );

    const operationObjects: OperationObject[] = [
      {
        tags: ['test'],
        summary: 'This is just a test',
        description: 'This is just a test',
        externalDocs: {
          url: 'https://example.org',
          description: 'Just some example website',
        },
        operationId: 'test',
        parameters: [exampleParameter],
        requestBody: exampleRequestBody,
        responses: {
          200: example200Response,
        },
        callbacks: {
          test: callback,
        },
      },
    ];

    createReferences(components, ...operationObjects);

    expect(components).to.deep.equal({
      schemas: {
        NumberSchema: withoutId(numberSchema),
        StringSchema: withoutId(stringSchema),
        UserSchema: withoutId(userObjectSchema),
        PostContentSchema: withoutId(postContentObjectSchema),
        PostSchema: withoutId(postObjectSchema),
      },
      responses: {
        Example200Response: withoutId(example200Response),
      },
      parameters: {
        ExampleParameter: withoutId(exampleParameter),
      },
      examples: {
        NumberExampleOne: withoutId(numberSchemaExampleOne),
        NumberExampleTwo: withoutId(numberSchemaExampleTwo),
        StringSchemaExample: withoutId(stringSchemaExample),
        UserExample1: withoutId(userSchemaExamples.UserExample1),
        UserExample2: withoutId(userSchemaExamples.UserExample2),
        PostExample1: withoutId(postSchemaExamples.PostExample1),
        PostExample2: withoutId(postSchemaExamples.PostExample2),
      },
      requestBodies: {
        ExampleRequestBody: withoutId(exampleRequestBody),
      },
      headers: {
        WwwAuthenticateHeader: withoutId(wwwAuthenticateHeader),
        RateLimitHeader: withoutId(rateLimitHeader),
      },
      links: {
        SomeLink: withoutId(someLink),
      },
      callbacks: { TestCallback: withoutId(callback) },
    });
  });
});
