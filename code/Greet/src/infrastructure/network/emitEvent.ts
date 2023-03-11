import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { MikroTrace } from 'mikrotrace';

import { produceDynamicMetadata } from '../utils/metadataUtils';

import { FailureToEmitEventError } from '../../application/errors/errors';

/**
 * @description Emit an event using AWS EventBridge.
 */
export async function emitEvent(
  message: string,
  spanName: string,
  region: string,
  eventBusName: string
) {
  const tracer = MikroTrace.continue();
  const span = tracer.start(spanName);
  const metadata = produceDynamicMetadata();
  const { traceId, spanId } = span.getConfiguration();

  const eventBridge = new EventBridgeClient({ region });

  const command = {
    EventBusName: eventBusName,
    Source: 'observabilitydemo.greet',
    DetailType: 'Greet',
    Detail: JSON.stringify({
      metadata: {
        ...metadata,
        traceId,
        spanId,
        spanParentId: spanId
      },
      data: message
    })
  };
  const event = new PutEventsCommand({ Entries: [command] });

  const result = await eventBridge.send(event);
  span.end();

  if (result['FailedEntryCount'] && result['FailedEntryCount'] > 0)
    throw new FailureToEmitEventError();
}
