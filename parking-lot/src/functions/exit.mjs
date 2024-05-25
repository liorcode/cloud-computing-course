import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

const CHARGE_PER_15_MIN = 10 / 4;  // Define charge per 15 minutes based on hourly $10 rate
const TABLE_NAME = process.env.TABLE_NAME;

const dynamo = DynamoDBDocument.from(new DynamoDB());

export async function parkingLotExit(event) {
  const { ticketId } = event.queryStringParameters;

  if (!ticketId) {
    throw new Error('Missing ticketId parameter');
  }

  const result = await dynamo.get({
    TableName: TABLE_NAME,
    Key: { ticketId }
  });

  if (!result.Item) {
    throw new Error(`Ticket ID ${ticketId} not found`);
  }

  const { plate, parkingLot, entryTime } = result.Item;

  const parkedTimeMinutes = calcParkTimeMinutes(entryTime);
  const parkedTimeFormatted = formatParkingTime(parkedTimeMinutes)
  const charge = calcParkingCharge(parkedTimeMinutes);

  await dynamo.delete({ TableName: TABLE_NAME, Key: { ticketId } });

  return { plate, parkingLot, parkedTime: parkedTimeFormatted, charge: `$${charge}` }
}

const calcParkTimeMinutes = (entryTime) => {
  const exitTime = new Date();
  const entryDate = new Date(entryTime);
  return Math.ceil((exitTime - entryDate) / 60000);  // convert to minutes
}

const formatParkingTime = (parkedTimeMinutes) =>
  `${Math.floor(parkedTimeMinutes / 60)} hours, ${parkedTimeMinutes % 60} minutes`;

const calcParkingCharge = (parkedTimeMinutes) => 
  Math.ceil(parkedTimeMinutes / 15) * CHARGE_PER_15_MIN;
