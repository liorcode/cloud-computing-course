import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const { MESSAGE_QUEUE_URL, AWS_REGION } = process.env;

const sqs = new SQSClient({ region: AWS_REGION });

export async function sendGroupMessage(event) {
    const { sender, content } = JSON.parse(event.body);
    const { group } = event.pathParameters;

    if (!group || !sender || !content) {
        throw new Error('Missing required parameters');
    }

    // generate the date here, and not in the SQS processor, to make sure all recipients receive the message with the same timestamp and correct order
    const date = new Date().toISOString();

    // send message to queue
    await sqs.send(new SendMessageCommand({
        QueueUrl: MESSAGE_QUEUE_URL,
        MessageBody: JSON.stringify({ group, sender, content, date }),
    }));

    return { status: `Message sent to group ${group}` };
}
