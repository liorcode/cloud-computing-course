import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

const TABLE_NAME = process.env.MESSAGES_TABLE;
const dynamo = DynamoDBDocument.from(new DynamoDB());

export async function getMessages(event) {
    const { date } = event.queryStringParameters;
    const { recipient } = event.pathParameters;

    console.info(`Getting messages for user ${recipient} after ${date}`)

    // if date is not provided, fetch all messages
    const fromDate = date ? date : "1970-01-01T00:00:00.000Z"

    const result = await dynamo.query({
        TableName: TABLE_NAME,
        IndexName: "recipient-date-index",
        KeyConditionExpression: "#recipient = :recipient and #date > :fromDate",
        ExpressionAttributeNames: {
            "#recipient": "recipient",
            "#date": "date",
        },
        ExpressionAttributeValues: {
            ":recipient": recipient,
            ":fromDate": fromDate,
        }
    });

    return result.Items;
}