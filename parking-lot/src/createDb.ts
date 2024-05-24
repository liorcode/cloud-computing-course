import * as aws from "@pulumi/aws";

export function createDb(role: aws.iam.Role) {
  const table = new aws.dynamodb.Table("parkingLot", {
    attributes: [
      { name: "ticketId", type: "S" },
    ],
    hashKey: "ticketId",
    billingMode: "PAY_PER_REQUEST",
  });

  new aws.iam.RolePolicy("parkingLotDbPolicy", {
    role: role.id,
    policy: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: [
            "dynamodb:PutItem",
            "dynamodb:GetItem",
            "dynamodb:UpdateItem",
            "dynamodb:DeleteItem",
          ],
          Effect: "Allow",
          Resource: table.arn,
        },
      ],
    },
  });

  return table;
}