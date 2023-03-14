import { Context, APIGatewayProxyResult, APIGatewayProxyEventV2 } from 'aws-lambda';
import { MikroLog } from 'mikrolog';
import { MikroTrace } from 'mikrotrace';

import { getUser } from '../../network/getUser';
import { getGreetingPhrase } from '../../network/getGreetingPhrases';
import { emitEvent } from '../../network/emitEvent';

import { produceCorrelationId, getCorrelationId } from '../../utils/metadataUtils';
import { randomlyInjectError } from '../../utils/randomlyInjectError';

import { metadataConfig } from '../../../config/metadata';
import { spanNames } from '../../../config/spanNames';

import {
  MissingRequestBodyError,
  MissingIdError,
  MissingEnvVarsError
} from '../../../application/errors/errors';

const REGION = process.env.REGION || '';
const GET_USER_NAME_SERVICE_URL = process.env.GET_USER_NAME_SERVICE_URL || '';
const GREETING_PHRASES_SERVICE_URL = process.env.GREETING_PHRASES_SERVICE_URL || '';
const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME || '';

/**
 * @description Check for presence of required environment variables.
 */
function checkRequiredEnvVars() {
  if (!REGION || !GET_USER_NAME_SERVICE_URL || !GREETING_PHRASES_SERVICE_URL || !EVENT_BUS_NAME)
    throw new MissingEnvVarsError();
}

/**
 * @description The `Greet` function is the entry point for the service.
 *
 * It integrates with another out-of-context AWS service (`User`) and with
 * an external service (`GreetingPhrase`) hosted on Mockachino (`https://www.mockachino.com`).
 */
export async function handler(
  event: APIGatewayProxyEventV2,
  context: Context
): Promise<APIGatewayProxyResult> {
  /////////////////
  // START SETUP //
  /////////////////
  process.env.__CORRELATIONID__ = produceCorrelationId(event, context);

  const logger = MikroLog.start({
    metadataConfig,
    event,
    context,
    correlationId: getCorrelationId()
  }); // MikroLog will also make certain AWS context available in the environment; see below with correlation ID

  const tracer = MikroTrace.start({
    serviceName: metadataConfig?.service,
    correlationId: getCorrelationId()
  });
  ///////////////
  // END SETUP //
  ///////////////

  try {
    return await handleSuccess({ logger, tracer, event, context });
  } catch (error: any) {
    return await handleError({ logger, tracer, error });
  }
}

/**
 * @description The intended, functional flow.
 */
async function handleSuccess(input: SuccessInput) {
  /////////////////
  // START SETUP //
  /////////////////
  const { tracer, logger, event } = input;

  checkRequiredEnvVars();

  const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  if (!body || JSON.stringify(body) === '{}') throw new MissingRequestBodyError();

  const id = body.id;
  if (!id) throw new MissingIdError();
  ///////////////
  // END SETUP //
  ///////////////

  const span = tracer.start(spanNames['fullSpan']);
  logger.log('Attempting to fulfill request...');

  randomlyInjectError();

  const user = await getUser(GET_USER_NAME_SERVICE_URL, id, spanNames['userSpan']);
  const phrase = await getGreetingPhrase(GREETING_PHRASES_SERVICE_URL, spanNames['apiSpan']);
  const message = phrase ? phrase.replace('{{NAME}}', user) : '';

  await emitEvent(message, spanNames['emitSpan'], REGION, EVENT_BUS_NAME);

  span.end();

  return {
    statusCode: 200,
    body: JSON.stringify(message)
  };
}

/**
 * @description In case something happens.
 */
async function handleError(input: ErrorInput) {
  const { tracer, logger, error } = input;

  const statusCode = error?.message === 'Random error occurred!' ? 500 : 400;
  /**
   * It's possible we haven't caught all errors.
   * In that case, let's check for uncaught standard
   * errors and log them out so they are visible for
   * our tools.
   */
  if (error.name === 'Error') logger.error(error.message);

  /**
   * Closes all traces at once. If we don't do this,
   * we are going to have blanks in our trace history.
   */
  tracer.endAll();

  return {
    statusCode,
    body: JSON.stringify(error.message)
  };
}

type SuccessInput = {
  tracer: MikroTrace;
  logger: MikroLog;
  event: APIGatewayProxyEventV2;
  context: Context;
};

type ErrorInput = {
  tracer: MikroTrace;
  logger: MikroLog;
  error: any;
};
