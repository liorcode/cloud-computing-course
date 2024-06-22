import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

const TABLE_NAME = process.env.GROUP_MEMBERS_TABLE;
const dynamo = DynamoDBDocument.from(new DynamoDB());

export async function joinGroup(event) {
    const { userId } = JSON.parse(event.body);
    const { groupId } = event.pathParameters;

    if (!groupId || !userId) {
        throw new Error('Missing required parameters');
    }

    await dynamo.put({
        TableName: TABLE_NAME,
        Item: {
            groupId,
            userId,
        }
    });

    console.info(`User ${userId} joined group ${groupId}`)

    return { status: `joined group ${groupId}` };
}
