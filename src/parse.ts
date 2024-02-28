import { Container } from 'inversify';
import { getControllersFromContainer as getInversifyControllersFromContainer } from 'inversify-express-utils';
import { getControllerMetadata } from './reflect';
import { ControllerMetadata } from './type';

export const parseContainer = (container: Container): ControllerMetadata[] => {
  const inversifyControllers = getInversifyControllersFromContainer(
    container,
    true,
  );
  return inversifyControllers
    .map((controller): ControllerMetadata | undefined =>
      getControllerMetadata(controller.constructor),
    )
    .filter((metadata): metadata is ControllerMetadata => !!metadata);
};
