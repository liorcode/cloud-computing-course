import * as aws from "@pulumi/aws";

export function createRole() {
  // Create a new IAM role for the Lambda function
  const role = new aws.iam.Role("parkingLotLambdaRole", {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
      Service: "lambda.amazonaws.com",
    }),
  });

    // Attach the AWS managed policy for Lambda basic execution to allow logging to CloudWatch
  new aws.iam.RolePolicyAttachment("parkingLotLambdaPolicy", {
    role: role.name,
    policyArn: aws.iam.ManagedPolicies.AWSLambdaBasicExecutionRole,
  });

  return role;
}