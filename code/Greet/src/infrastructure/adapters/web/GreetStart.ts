import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';

import {
  GreetingPhraseError,
  NetworkUserError,
  NetworkGreetingError,
  FailureToEmitEventError
} from '../../../application/errors/errors';

import { randomlyInjectError } from '../../utils/randomlyInjectError';

import {
  MissingRequestBodyError,
  MissingIdError,
  MissingEnvVarsError
} from '../../../application/errors/errors';

const REGION = process.env.REGION || '';
const GET_USER_NAME_SERVICE_URL = process.env.GET_USER_NAME_SERVICE_URL || '';
const GREETING_PHRASES_SERVICE_URL = process.env.GREETING_PHRASES_SERVICE_URL || '';
const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME || '';

function checkRequiredEnvVars() {
  if (!REGION || !GET_USER_NAME_SERVICE_URL || !GREETING_PHRASES_SERVICE_URL || !EVENT_BUS_NAME)
    throw new MissingEnvVarsError();
}

/**
 * @description The Lambda handler function.
 */
export async function handler(event: any): Promise<any> {
  checkRequiredEnvVars();

  const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  if (!body || JSON.stringify(body) === '{}') throw new MissingRequestBodyError();

  const id = body.id;
  if (!id) throw new MissingIdError();

  console.log('Attempting to fulfill request...');

  randomlyInjectError();

  const user = await getUser(GET_USER_NAME_SERVICE_URL, id);
  const phrase = await getGreetingPhrase(GREETING_PHRASES_SERVICE_URL);
  const message = phrase ? phrase.replace('{{NAME}}', user) : '';

  await emitEvent(message, REGION, EVENT_BUS_NAME);

  return {
    statusCode: 200,
    body: JSON.stringify(message)
  };
}

/**
 * @description Get the user from the service.
 */
async function getUser(url: string, id: string) {
  const userResponse = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ id })
  }).then((res: any) => {
    if (res.status >= 200 && res.status < 300) return res.json();
    else throw new NetworkUserError();
  });

  return userResponse;
}

/**
 * @description Get our greeting phrases.
 */
async function getGreetingPhrase(url: string) {
  const greetingPhraseResponse = await fetch(url).then((res: any) => {
    if (res.status >= 200 && res.status < 300) return res.json();
    else throw new NetworkGreetingError();
  });

  const { greetingPhrases } = greetingPhraseResponse;
  const maximum = greetingPhrases.length - 1;
  const randomNumber = Math.floor(Math.random() * (maximum + 1));
  const phrase = greetingPhrases[randomNumber];

  if (!phrase) throw new GreetingPhraseError(`${randomNumber}`);
  return phrase;
}

/**
 * @description Emit event to EventBridge.
 */
async function emitEvent(message: string, region: string, eventBusName: string) {
  const eventBridge = new EventBridgeClient({ region });

  const command = {
    EventBusName: eventBusName,
    Source: 'observabilitydemo.greet',
    DetailType: 'Greet',
    Detail: JSON.stringify({
      data: message
    })
  };
  const event = new PutEventsCommand({ Entries: [command] });

  const result = await eventBridge.send(event);

  if (result['FailedEntryCount'] && result['FailedEntryCount'] > 0)
    throw new FailureToEmitEventError();
}
