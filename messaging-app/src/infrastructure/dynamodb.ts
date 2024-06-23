import * as aws from "@pulumi/aws";

export function createDb(role: aws.iam.Role) {
  const usersTable = new aws.dynamodb.Table("users", {
    attributes: [
      { name: "userId", type: "S" },
    ],
    hashKey: "userId",
    billingMode: "PAY_PER_REQUEST",
  });
  new aws.iam.RolePolicy("usersDbPolicy", {
    role: role.id,
    policy: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: [
            "dynamodb:PutItem",
          ],
          Effect: "Allow",
          Resource: usersTable.arn,
        },
      ],
    },
  });

  const messagesTable = new aws.dynamodb.Table("messages", {
    attributes: [
      { name: "messageId", type: "S" },
      { name: "recipient", type: "S" },
      { name: "date", type: "S" },
    ],
    hashKey: "messageId",
    rangeKey: "date",
    // add a composite index to query messages by recipient and date
    globalSecondaryIndexes: [{
      name: "recipient-date-index",
      hashKey: "recipient",
      rangeKey: "date",
      projectionType: "ALL",
    }],
    billingMode: "PAY_PER_REQUEST",
  });

  messagesTable.arn.apply(tableArn => {
    const indexArn = `${tableArn}/index/recipient-date-index`;

    new aws.iam.RolePolicy("messagesDbPolicy", {
      role: role.id,
      policy: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: [
              "dynamodb:PutItem",
              "dynamodb:GetItem",
              "dynamodb:Query"
            ],
            Effect: "Allow",
            Resource: [
              tableArn, // Main table ARN
              indexArn // Index ARN
            ]
          }
        ]
      }
    });
  });

  const groupsTable = new aws.dynamodb.Table("groups", {
    attributes: [
      { name: "groupId", type: "S" },
    ],
    hashKey: "groupId",
    billingMode: "PAY_PER_REQUEST",
  });
  new aws.iam.RolePolicy("groupsDbPolicy", {
    role: role.id,
    policy: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: [
            "dynamodb:PutItem",
            "dynamodb:GetItem",
            // "dynamodb:UpdateItem",
            // "dynamodb:DeleteItem",
          ],
          Effect: "Allow",
          Resource: groupsTable.arn,
        },
      ],
    },
  });

  const groupMembershipTable = new aws.dynamodb.Table("groupMembership", {
    attributes: [
      { name: "groupId", type: "S" },
      { name: "userId", type: "S" },
    ],
    hashKey: "groupId",
    rangeKey: "userId",
    billingMode: "PAY_PER_REQUEST",
  });

  new aws.iam.RolePolicy("groupMembershipDbPolicy", {
    role: role.id,
    policy: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: [
            "dynamodb:PutItem",
            "dynamodb:GetItem",
            "dynamodb:DeleteItem",
            "dynamodb:Query",
          ],
          Effect: "Allow",
          Resource: groupMembershipTable.arn,
        },
      ],
    },
  });

  const blockedUsersTable = new aws.dynamodb.Table("blockedUsers", {
    attributes: [
      { name: "blockerId", type: "S" },
      { name: "blockedId", type: "S" },
    ],
    hashKey: "blockerId",
    rangeKey: "blockedId",
    billingMode: "PAY_PER_REQUEST",
  });
  new aws.iam.RolePolicy("blockedUsersDbPolicy", {
    role: role.id,
    policy: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: [
            "dynamodb:PutItem",
            "dynamodb:GetItem",
          ],
          Effect: "Allow",
          Resource: blockedUsersTable.arn,
        },
      ],
    },
  });

  return {
    users: usersTable.name,
    messages: messagesTable.name,
    groups: groupsTable.name,
    groupMembers: groupMembershipTable.name,
    blockedUsers: blockedUsersTable.name,
  };
}
