import { TSchema } from '@sinclair/typebox';
import { SchemaObject } from 'openapi3-ts/oas31';

export function mapTypeBoxSchemaToOpenAPISchema(
  typeBoxSchema: TSchema,
): SchemaObject {
  const schema: SchemaObject = {};

  switch (typeBoxSchema.type) {
    case 'string':
      schema.type = 'string';
      break;
    case 'number':
      schema.type = 'number';
      break;
    case 'boolean':
      schema.type = 'boolean';
      break;
    case 'object':
      schema.type = 'object';
      schema.properties = {};
      if (typeBoxSchema.properties) {
        Object.keys(typeBoxSchema.properties).forEach((key) => {
          schema.properties![key] = mapTypeBoxSchemaToOpenAPISchema(
            typeBoxSchema.properties[key],
          );
        });
      }
      if (typeBoxSchema.required) {
        schema.required = typeBoxSchema.required;
      }
      break;
    // Add more cases here to handle other types like 'array', 'enum', etc.
    default:
      throw new Error(`Unsupported type: ${typeBoxSchema.type}`);
  }

  // Add common properties if they exist
  if (typeBoxSchema.title) schema.title = typeBoxSchema.title;
  if (typeBoxSchema.description) schema.description = typeBoxSchema.description;
  // Continue with other possible common properties...

  return schema;
}
