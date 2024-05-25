import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

export function createLambda(role: aws.iam.Role, tableName: pulumi.Output<string>) {
  const parkingLotLambda = new aws.lambda.Function("parkingLot", {
    runtime: aws.lambda.Runtime.NodeJS18dX,
    code: new pulumi.asset.AssetArchive({
      ".": new pulumi.asset.FileArchive("./src/functions"),
    }),
    handler: "index.handler",
    role: role.arn,
    environment: {
      variables: {
        TABLE_NAME: tableName,
      },
    },
  });

  return parkingLotLambda;
}