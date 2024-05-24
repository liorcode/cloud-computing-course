import * as aws from "@pulumi/aws";

export function createRole() {
  const role = new aws.iam.Role("parkingLotLambdaRole", {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
      Service: "lambda.amazonaws.com",
    }),
  });
  return role;
}