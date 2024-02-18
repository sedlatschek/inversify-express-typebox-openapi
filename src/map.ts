import { TSchema } from '@sinclair/typebox';
import { SchemaObject } from 'openapi3-ts/oas31';

export function mapTypeBoxSchemaToOpenAPISchema(
  typeBoxSchema: TSchema,
): SchemaObject {
  const schema: SchemaObject = {};
  switch (typeBoxSchema.type) {
    case 'string':
    case 'number':
    case 'boolean':
      schema.type = typeBoxSchema.type;
      break;
    case 'null':
    case 'undefined':
      schema.type = 'null';
      break;
    case 'object':
      schema.type = 'object';
      schema.properties = {};
      if (typeBoxSchema.properties) {
        for (const key of Object.keys(typeBoxSchema.properties)) {
          schema.properties![key] = mapTypeBoxSchemaToOpenAPISchema(
            typeBoxSchema.properties[key],
          );
        }
      }
      if (typeBoxSchema.required) {
        schema.required = typeBoxSchema.required;
      }
      break;
    case 'array':
      schema.type = 'array';
      if (!typeBoxSchema.items) {
        throw new Error('Array schema must have an "items" property');
      }
      // Map the item schema of the array
      schema.items = mapTypeBoxSchemaToOpenAPISchema(typeBoxSchema.items);
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
