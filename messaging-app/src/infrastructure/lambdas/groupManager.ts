import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { Output } from "@pulumi/pulumi";

export function createGroupManagerLambda(role: aws.iam.Role, env: Record<string, Output<string>>) {
  return new aws.lambda.Function("groupsManager", {
    runtime: aws.lambda.Runtime.NodeJS18dX,
    code: new pulumi.asset.AssetArchive({
      ".": new pulumi.asset.FileArchive("./src/functions/groups"),
    }),
    handler: "index.handler",
    role: role.arn,
    environment: {
      variables: env,
    },
  });
}
