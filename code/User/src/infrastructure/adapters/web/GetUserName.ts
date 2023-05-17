import { Context, APIGatewayProxyResult, APIGatewayProxyEventV2 } from 'aws-lambda';
import { MikroLog } from 'mikrolog';

import { metadataConfig } from '../../../config/metadata';

import {
  MissingRequestBodyError,
  MissingIdError,
  GetUserNameError
} from '../../../application/errors/errors';

/**
 * @description The `GetUserName` function is the primary entry point for the `User` service.
 *
 * It is called from the `Greet` service.
 */
export async function handler(
  event: APIGatewayProxyEventV2,
  context: Context
): Promise<APIGatewayProxyResult> {
  /////////////////
  // START SETUP //
  /////////////////
  const logger = MikroLog.start({ metadataConfig, event, context });

  try {
    logger.log('Getting user name...');
    const traceparent = event.headers?.['traceparent'] || 'unknown';
    logger.log(`traceparent is ${traceparent}`);

    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    if (!body || JSON.stringify(body) === '{}') throw new MissingRequestBodyError();

    const id = body.id;
    if (!id) throw new MissingIdError();
    ///////////////
    // END SETUP //
    ///////////////

    randomlyInjectError();

    const user = getUserById(parseInt(id));
    if (!user) throw new GetUserNameError(id);

    logger.log('Successfully responded to request');

    return {
      statusCode: 200,
      body: JSON.stringify(user)
    };
  } catch (error: any) {
    logger.error(error.message);

    return {
      statusCode: 400,
      body: JSON.stringify(error.message)
    };
  }
}

/**
 * @description Use chance to calculate if we get an error or not.
 */
function randomlyInjectError() {
  const randomNumber = Math.floor(Math.random() * (100 + 1));
  if (randomNumber > 80) throw new Error('Random error occurred!');
}

/**
 * @description Get the user name for the numerary user ID that has been provided.
 */
function getUserById(id: number) {
  const users = ['Mikael', 'Peter', 'Jessica', 'Cheyenne'];
  const user = users[id];

  return user;
}
