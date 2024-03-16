import { Static, Type } from '@sinclair/typebox';
import express from 'express';
import { inject } from 'inversify';
import { response } from 'inversify-express-utils';
import {
  Body,
  Controller,
  Delete,
  Description,
  OperationId,
  Path,
  Post,
  Put,
  Response,
  Summary,
  Tags,
} from '../../src';
import { IdentifiableObject } from '../../src';
import { ExampleObjectOf } from '../../src/type';

const imageSchema = Type.Object(
  {
    id: Type.Number(),
    imageId: Type.Number(),
    url: Type.String(),
  },
  { $id: 'Image' },
);

type Image = Static<typeof imageSchema>;

const imageExample1: IdentifiableObject<ExampleObjectOf<Image>> = {
  $id: 'ImageExample',
  value: {
    id: 123,
    imageId: 546545,
    url: 'https://example.com/image.png',
  },
};

export const images: Image[] = [];

@Controller('/api/images')
@Tags('Image')
export class TestOaController310Image {
  public someRandomProperty: string;

  public constructor(@inject('SomeService') someService: string) {
    this.someRandomProperty = someService;
  }

  @Post('/', 'Create a new image')
  @Summary('Create a new image')
  @Response(201, {
    description: 'Image created',
    content: { schema: imageSchema },
  })
  public createImage(
    @Body({ schema: imageSchema, examples: { imageExample1 } }) image: Image,
    @response() res: express.Response,
  ): void {
    images.push(image);
    res.status(201).send(image);
  }

  @Put('/:imageId', 'Update a existing image')
  @Response(200, { content: { schema: imageSchema } })
  @Response(404, { description: 'Image not found' })
  public updateImage(
    @Description("The image's id")
    @Path('imageId', { schema: Type.Number() })
    imageId: number,
    @Body({ schema: imageSchema, examples: { imageExample1 } })
    image: Image,
    @response() res: express.Response,
  ): void {
    const index = images.findIndex((p) => p.id === imageId);
    if (index) {
      images[index] = image;
      res.send(image);
      return;
    }
    res.status(404).send('Image not found');
  }

  @Delete('/:imageId')
  @Description('Delete a image')
  @Response(200, { description: 'Image deleted' })
  @Response(404, { description: 'Image not found' })
  @OperationId('deleteImage')
  public del(
    @Path('imageId', { schema: Type.Number(), description: 'The image id' })
    imageId: number,
    @response() res: express.Response,
  ): void {
    const index = images.findIndex((p) => p.id === imageId);
    if (index) {
      images.splice(index, 1);
      res.send('Image deleted');
      return;
    }
    res.status(404).send('Image not found');
  }
}
