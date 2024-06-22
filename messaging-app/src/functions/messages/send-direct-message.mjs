import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const MESSAGE_TABLE = process.env.MESSAGES_TABLE;
const BLOCKED_USERS_TABLE = process.env.BLOCKED_USERS_TABLE;
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
        TableName: MESSAGE_TABLE,
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

async function isUserBlocked(blocker, blocked) {
    const resp = await dynamo.get({
        TableName: BLOCKED_USERS_TABLE,
        Key: {
            blocker,
            blocked,
        }
    });

    // return true if the user is blocked
    return !!resp.Item;
}
