import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const { MESSAGES_TABLE, BLOCKED_USERS_TABLE } = process.env;
const dynamo = DynamoDBDocument.from(new DynamoDB());

export async function sendDirectMessage(event) {
    const { sender, content } = JSON.parse(event.body);
    const { recipient } = event.pathParameters;

    if (!recipient || !sender || !content) {
        throw new Error('Missing required parameters');
    }

    if (await isUserBlocked(sender, recipient)) {
        throw new Error('You are blocked by this user');
    }

    const date = new Date().toISOString();
    const messageId = randomUUID();

    await dynamo.put({
        TableName: MESSAGES_TABLE,
        Item: {
            messageId,
            date,
            recipient,
            sender,
            content,
        }
    });

    console.info(`Sending message ${messageId} to user ${recipient}`)

    return { status: `Message ${messageId} sent to user ${recipient}` };
}

async function isUserBlocked(blockerId, blockedId) {
    const resp = await dynamo.get({
        TableName: BLOCKED_USERS_TABLE,
        Key: {
            blockerId,
            blockedId,
        }
    });

    // return true if the user is blocked
    return !!resp.Item;
}
