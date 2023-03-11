import { EventBridgeEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { MikroLog } from 'mikrolog';

import { metadataConfig } from '../../../config/metadata';

/**
 * @description `LogGreetedUser` simply logs the user who made a request in the `User` context/service.
 */
export async function handler(
  event: EventBridgeEvent<any, any>,
  context: Context
): Promise<APIGatewayProxyResult> {
  try {
    /////////////////
    // START SETUP //
    /////////////////
    const logger = MikroLog.start({ metadataConfig, event, context });
    logger.log('Logging greeted user...');
    ///////////////
    // END SETUP //
    ///////////////

    randomlyInjectError();

    const body = event && typeof event === 'string' ? JSON.parse(event) : event;
    const user = body?.['detail']?.['data'];
    if (!user) logger.warn('Missing event detail...');
    else logger.log(`Greeting ${user}`!);

    return {
      statusCode: 200,
      body: ''
    };
  } catch (error: any) {
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
