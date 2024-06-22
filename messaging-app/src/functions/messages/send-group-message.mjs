import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const MESSAGE_TABLE = process.env.MESSAGES_TABLE;
const GROUP_MEMBERS_TABLE = process.env.GROUP_MEMBERS_TABLE;
const BLOCKED_USERS_TABLE = process.env.BLOCKED_USERS_TABLE;
const dynamo = DynamoDBDocument.from(new DynamoDB());

export async function sendGroupMessage(event) {
    const { sender, content } = JSON.parse(event.body);
    const { group } = event.pathParameters;

    if (!group || !sender || !content) {
        throw new Error('Missing required parameters');
    }

    const date = new Date().toISOString();

    const groupUsers = await getGroupMembers(group);

    // Send message to each user in the group
    for (const user of groupUsers) {
        const recipient = user.userId;
        if (await isUserBlocked(sender, recipient)) {
            console.warn(`User ${sender} is blocked by ${recipient}`)
            continue; // Skip sending message to blocked users
        }

        const messageId = randomUUID();

        console.info(`Sending group message ${messageId} to user ${recipient}`)

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
    }

    return { status: `Message sent to group ${group}` };
}

async function getGroupMembers(groupId) {
    const result = await dynamo.query({
        TableName: GROUP_MEMBERS_TABLE,
        KeyConditionExpression: "groupId = :groupId",
        ExpressionAttributeValues: {
            ":groupId": groupId,
        }
    });

    return result.Items;
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
