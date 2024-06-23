import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { Output } from "@pulumi/pulumi";

export function creatGroupMessageProcessorLambda(role: aws.iam.Role, env: Record<string, Output<string>>, groupMessagesQueue: aws.sqs.Queue) {
  const groupMessageProcessorLambda = new aws.lambda.Function("groupMessageProcessor", {
    runtime: aws.lambda.Runtime.NodeJS18dX,
    code: new pulumi.asset.AssetArchive({
      ".": new pulumi.asset.FileArchive("./src/functions/group-message-processor"),
    }),
    handler: "index.handle",
    role: role.arn,
    environment: {
      variables: env,
    }
  });

  // Trigger the group message processor when a message is added to the queue
  new aws.lambda.EventSourceMapping("groupMessageProcessorEventSourceMapping", {
    eventSourceArn: groupMessagesQueue.arn,
    functionName: groupMessageProcessorLambda.arn,
    batchSize: 10, // Process up to 10 messages at a time
  });

  // Create a custom policy to allow the role to read messages from the SQS queue
  const sqsPolicy = new aws.iam.Policy("messagesProcessorSQSPolicy", {
    description: "Policy to allow the message processor function to read messages from SQS queue",
    policy: pulumi.output({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Action: [
            "sqs:ReceiveMessage",
            "sqs:DeleteMessage",
            "sqs:GetQueueAttributes"
          ],
          Resource: groupMessagesQueue.arn,
        },
      ],
    }),
  });
  new aws.iam.RolePolicyAttachment("messagesProcessorSQSPolicyAttachment", {
    role: role.name,
    policyArn: sqsPolicy.arn,
  });

  return groupMessageProcessorLambda
}
