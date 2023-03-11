import { MikroTrace } from 'mikrotrace';

import { GreetingPhraseError, NetworkGreetingError } from '../../application/errors/errors';

/**
 * @description Call `GreetingPhrase` service and get response.
 */
export async function getGreetingPhrase(url: string, spanName: string) {
  const tracer = MikroTrace.continue();
  const span = tracer.start(spanName);

  const greetingPhraseResponse = await fetch(url).then((res: any) => {
    if (res.status >= 200 && res.status < 300) return res.json();
    else throw new NetworkGreetingError();
  });

  const { greetingPhrases } = greetingPhraseResponse;
  const maximum = greetingPhrases.length - 1;
  const randomNumber = Math.floor(Math.random() * (maximum + 1));
  const phrase = greetingPhrases[randomNumber];

  span.end();

  if (!phrase) throw new GreetingPhraseError(`${randomNumber}`);
  return phrase;
}
