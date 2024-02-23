import { expect, describe, it } from 'vitest';
import { getRoutePath } from '../../src/generate';

describe('generate', () => {
  describe('getRoutePath', () => {
    it('concatenates with one slash', () => {
      for (const paths of [
        ['/api', '/test'],
        ['/api/', '/test'],
        ['/api/', 'test'],
        ['/api', 'test'],
      ]) {
        const result = getRoutePath(paths[0], paths[1]);
        expect(result, `${paths[0]}, ${paths[1]}`).toBe('/api/test');
      }
    });
  });
});
