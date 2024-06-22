import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

const TABLE_NAME = process.env.GROUP_MEMBERS_TABLE;
const dynamo = DynamoDBDocument.from(new DynamoDB());

export async function leaveGroup(event) {
    const { groupId, userId } = event.pathParameters;

    if (!groupId || !userId) {
        throw new Error('Missing required parameters');
    }

    await dynamo.delete({
        TableName: TABLE_NAME,
        Key: {
            groupId,
            userId,
        }
    });

    console.info(`User ${userId} left group ${groupId}`)

    return { status: `User ${userId} left group ${groupId}` };
}
