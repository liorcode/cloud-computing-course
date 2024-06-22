import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const TABLE_NAME = process.env.GROUPS_TABLE
const dynamo = DynamoDBDocument.from(new DynamoDB());

export async function createGroup(event) {
    const groupId = randomUUID();

    await dynamo.put({
        TableName: TABLE_NAME,
        Item: {
            groupId,
        }
    });

    return { groupId };
}
