import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

const TABLE_NAME = process.env.BLOCKED_USERS_TABLE;
const dynamo = DynamoDBDocument.from(new DynamoDB());

export async function blockUser(event) {
    const { blockedId, blockerId } = JSON.parse(event.body);

    if (!blockerId || !blockedId) {
        throw new Error('Missing required parameters');
    }

    await dynamo.put({
        TableName: TABLE_NAME,
        Item: {
            blockerId,
            blockedId,
        }
    });

    console.info(`User ${blockedId} was blocked by ${blockerId}`)

    return { status: `User ${blockedId} was blocked` };
}
