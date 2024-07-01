import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const { MESSAGES_TABLE, GROUP_MEMBERS_TABLE } = process.env;

const dynamo = DynamoDBDocument.from(new DynamoDB());

export async function handle(event) {
    for (const record of event.Records) {
        const { group, sender, content, date } = JSON.parse(record.body);

        const groupUsers = await getGroupMembers(group);

        // Send message to each user in the group
        for (const user of groupUsers) {
            const recipient = user.userId;
            if (recipient === sender) {
                continue;
            }

            const messageId = randomUUID();

            console.info(`Sending group message of ${sender} to user ${recipient}`)

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
        }

    }
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
