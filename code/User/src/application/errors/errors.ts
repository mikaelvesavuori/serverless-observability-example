import { MikroLog } from 'mikrolog';

/**
 * @description Used when we are unable to find a user with the provided ID.
 */
export class GetUserNameError extends Error {
  constructor(id: string) {
    super(id);
    this.name = 'GetUserNameError';
    const message = `Unable to find user with ID '${id}'!`;
    this.message = message;

    const logger = new MikroLog();
    logger.error(message);
  }
}

/**
 * @description Used when the payload is missing a request body or if it is empty.
 */
export class MissingRequestBodyError extends Error {
  constructor() {
    super();
    this.name = 'MissingRequestBodyError';
    const message = `Missing request body!`;
    this.message = message;

    const logger = new MikroLog();
    logger.error(message);
  }
}

/**
 * @description Used when the payload is missing an ID.
 */
export class MissingIdError extends Error {
  constructor() {
    super();
    this.name = 'MissingIdError';
    const message = `Missing ID!`;
    this.message = message;

    const logger = new MikroLog();
    logger.error(message);
  }
}
