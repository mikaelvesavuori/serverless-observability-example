import { randomUUID } from 'crypto';

/**
 * @description Get dynamic user metadata from process environment.
 * These should have all been set when MikroLog was first instantiated.
 */
export function produceDynamicMetadata(): Record<string, any> {
  const timeNow = Date.now();

  const metadata = {
    id: randomUUID(),
    timestamp: `${timeNow}`,
    timestampHuman: new Date(timeNow).toISOString(),
    correlationId: process.env.__CORRELATIONID__ || '',
    user: process.env.__USER__ || '',
    route: process.env.__ROUTE__ || '',
    region: process.env.__REGION__ || '',
    runtime: process.env.__RUNTIME__ || '',
    functionName: process.env.__FUNCTIONNAME__ || '',
    functionMemorySize: process.env.__FUNCTIONMEMSIZE__ || '',
    functionVersion: process.env.__FUNCTIONVERSION__ || '',
    stage: process.env.__STAGE__ || '',
    accountId: process.env.__ACCOUNTID__ || '',
    requestTimeEpoch: process.env.__REQTIMEEPOCH__ || ''
  };

  const filteredMetadata: any = {};

  Object.entries(metadata).forEach((entry: any) => {
    const [key, value] = entry;
    if (value) filteredMetadata[key] = value;
  });

  return filteredMetadata;
}

/**
 * Utility to get correlation ID from environment.
 */
export const getCorrelationId = () => process.env.__CORRELATIONID__ || '';

/**
 * Utility to set correlation ID in environment.
 */
export function produceCorrelationId(event: any, context: any): string {
  // Check first if this is 1) via event, 2) via header (API), or 3) set new one from AWS request ID, else set as empty
  if (
    event &&
    event['detail'] &&
    event['detail']['metadata'] &&
    event['detail']['metadata']['correlationId']
  )
    return event['detail']['metadata']['correlationId'];
  else if (event && event['headers'] && event['headers']['x-correlation-id'])
    return event['headers']['x-correlation-id'];
  else if (context && context['awsRequestId']) return context['awsRequestId'];
  return '';
}