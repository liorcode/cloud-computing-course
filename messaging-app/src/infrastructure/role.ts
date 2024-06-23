import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

export function createRole(groupMessagesQueue: aws.sqs.Queue) {
  // Create a new IAM role for the Lambda function
  const role = new aws.iam.Role("messagingAppLambdaRole", {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
      Service: "lambda.amazonaws.com",
    }),
  });

  // Attach the AWS managed policy for Lambda basic execution to allow logging to CloudWatch
  new aws.iam.RolePolicyAttachment("messagingAppLambdaPolicy", {
    role: role.name,
    policyArn: aws.iam.ManagedPolicies.AWSLambdaBasicExecutionRole,
  });

  return role;
}
