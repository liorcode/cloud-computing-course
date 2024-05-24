import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const TABLE_NAME = process.env.TABLE_NAME;
const dynamo = DynamoDBDocument.from(new DynamoDB());

export async function parkingLotEntry(event) {
  const { plate, parkingLot } = event.queryStringParameters;

  if (!plate || !parkingLot) {
    throw new Error('Missing plate or parkingLot parameter');
  }

  const ticketId = randomUUID();
  const entryTime = new Date().toISOString();

  const item = {
      ticketId,
      plate,
      parkingLot,
      entryTime
  };

  await dynamo.put({ TableName: TABLE_NAME, Item: item });

  return { ticketId }
}