import { MikroTrace } from 'mikrotrace';

import { getCorrelationId } from '../utils/metadataUtils';

import { NetworkUserError } from '../../application/errors/errors';

/**
 * @description Call `User` service (`GetUserName`) and get response.
 */
export async function getUser(url: string, id: string, spanName: string) {
  const tracer = MikroTrace.continue();
  const span = tracer.start(spanName);

  const { traceId, spanId } = span.getConfiguration();

  const userResponse = await fetch(url, {
    method: 'POST',
    headers: {
      'x-correlation-id': getCorrelationId(),
      'x-trace-id': traceId,
      'x-span-id': spanId,
      'x-spanparent-id': spanId
    },
    body: JSON.stringify({ id })
  }).then((res: any) => {
    span.end();
    if (res.status >= 200 && res.status < 300) return res.json();
    else throw new NetworkUserError();
  });

  return userResponse;
}
