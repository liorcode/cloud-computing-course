import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { Output } from "@pulumi/pulumi";

export function createMessagingLambda(role: aws.iam.Role, env: Record<string, Output<string>>, groupMessagesQueue: aws.sqs.Queue) {
  const messagesLambda = new aws.lambda.Function("messagesLambda", {
    runtime: aws.lambda.Runtime.NodeJS18dX,
    code: new pulumi.asset.AssetArchive({
      ".": new pulumi.asset.FileArchive("./src/functions/messages"),
    }),
    handler: "index.handler",
    role: role.arn,
    environment: {
      variables: env,
    }
  });

  // Create a custom policy to allow the role to send messages to the SQS queue
  const sqsSendMessagePolicy = new aws.iam.Policy("sqsSendMessagePolicy", {
    policy: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "sqs:SendMessage",
          Effect: "Allow",
          Resource: groupMessagesQueue.arn,
        },
      ],
    },
  });
  new aws.iam.RolePolicyAttachment("groupManagerLambdaPolicyAttachment", {
    role: role.name,
    policyArn: sqsSendMessagePolicy.arn,
  });

  return messagesLambda;
}
