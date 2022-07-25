import { MikroLog } from 'mikrolog';

/**
 * @description Used when we are unable to fetch a greeting phrase.
 */
export class GreetingPhraseError extends Error {
  constructor(randomNumber: string) {
    super(randomNumber);
    this.name = 'GreetingPhraseError';
    const message = `Unable to get a greeting phrase with the random number '${randomNumber}'!`;
    this.message = message;

    const logger = MikroLog.start();
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

    const logger = MikroLog.start();
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

    const logger = MikroLog.start();
    logger.error(message);
  }
}

/**
 * @description Used when we failed to emit an event.
 */
export class FailureToEmitEventError extends Error {
  constructor() {
    super();
    this.name = 'FailureToEmitEventError';
    const message = `Failed to emit event!`;
    this.message = message;

    const logger = MikroLog.start();
    logger.error(message);
  }
}

/**
 * @description Used when we are missing required environment variables.
 */
export class MissingEnvVarsError extends Error {
  constructor() {
    super();
    this.name = 'MissingEnvVarsError';
    const message = `Missing required environment variables!`;
    this.message = message;

    const logger = MikroLog.start();
    logger.error(message);
  }
}

/**
 * @description Used when we are not getting an OK status from the user service.
 */
export class NetworkUserError extends Error {
  constructor() {
    super();
    this.name = 'FetchUserError';
    const message = `Did not receive a 200-class status from the user service!`;
    this.message = message;

    const logger = MikroLog.start();
    logger.error(message);
  }
}

/**
 * @description Used when we are not getting an OK status from the greeting service.
 */
export class NetworkGreetingError extends Error {
  constructor() {
    super();
    this.name = 'FetchGreetingError';
    const message = `Did not receive a 200-class status from the greeting service!`;
    this.message = message;

    const logger = MikroLog.start();
    logger.error(message);
  }
}
