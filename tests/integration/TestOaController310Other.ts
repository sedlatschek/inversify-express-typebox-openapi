import { Static, Type } from '@sinclair/typebox';
import {
  httpDelete,
  httpPost,
  httpPut,
  requestBody,
  requestParam,
  response,
} from 'inversify-express-utils';
import express from 'express';

export const otherSchema = Type.Object(
  {
    id: Type.Number(),
    name: Type.String(),
  },
  { $id: 'Other' },
);

export type Other = Static<typeof otherSchema>;

export const others: Other[] = [];

export class TestOaController310Other {
  @httpPost('/')
  public createOther(
    @requestBody() other: Other,
    @response() res: express.Response,
  ): void {
    others.push(other);
    res.status(201).send(other);
  }

  @httpPut('/:otherId')
  public updateOther(
    @requestParam('otherId') otherId: number,
    @requestBody() other: Other,
    @response() res: express.Response,
  ): void {
    const index = others.findIndex((other) => other.id === otherId);
    if (index) {
      others[index] = other;
      res.send(other);
      return;
    }
    res.status(404).send('Other not found');
  }

  @httpDelete('/:otherId')
  public del(
    @requestParam('otherId') otherId: number,
    @response() res: express.Response,
  ): void {
    const index = others.findIndex((other) => other.id === otherId);
    if (index) {
      others.splice(index, 1);
      res.send('Other deleted');
      return;
    }
    res.status(404).send('Other not found');
  }
}
