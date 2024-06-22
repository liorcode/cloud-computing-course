import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { Output } from "@pulumi/pulumi";
import * as apigateway from "@pulumi/aws-apigateway";

export function createLambdas(role: aws.iam.Role, tableNames: Record<string, Output<string>>) {
  const userManagerLambda = new aws.lambda.Function("userManager", {
    runtime: aws.lambda.Runtime.NodeJS18dX,
    code: new pulumi.asset.AssetArchive({
      ".": new pulumi.asset.FileArchive("./src/functions/users"),
    }),
    handler: "index.handler",
    role: role.arn,
    environment: {
      variables: {
        USERS_TABLE: tableNames.users,
        BLOCKED_USERS_TABLE: tableNames.blockedUsers,
      },
    },
  });

  const usersApi = new apigateway.RestAPI("usersApi", {
    binaryMediaTypes: [],
    routes: [
      // Create user
      { path: "/users", method: "POST", eventHandler: userManagerLambda },
      // Block user
      { path: "/users/block", method: "POST", eventHandler: userManagerLambda },
    ]
  })

  const groupsManagerLambda = new aws.lambda.Function("groupsManager", {
    runtime: aws.lambda.Runtime.NodeJS18dX,
    code: new pulumi.asset.AssetArchive({
      ".": new pulumi.asset.FileArchive("./src/functions/groups"),
    }),
    handler: "index.handler",
    role: role.arn,
    environment: {
      variables: {
        GROUPS_TABLE: tableNames.groups,
        GROUP_MEMBERS_TABLE: tableNames.groupMembers,
      },
    },
  });

  const groupsApi = new apigateway.RestAPI("groupsApi", {
    binaryMediaTypes: [],
    routes: [
      { path: "/groups", method: "POST", eventHandler: groupsManagerLambda },
      { path: "/groups/{groupId}/members", method: "POST", eventHandler: groupsManagerLambda },
      { path: "/groups/{groupId}/members/{userId}", method: "DELETE", eventHandler: groupsManagerLambda }
    ]
  })

  const messagingAppLambda = new aws.lambda.Function("messages", {
    runtime: aws.lambda.Runtime.NodeJS18dX,
    code: new pulumi.asset.AssetArchive({
      ".": new pulumi.asset.FileArchive("./src/functions/messages"),
    }),
    handler: "index.handler",
    role: role.arn,
    environment: {
      variables: {
        USERS_TABLE: tableNames.users,
        MESSAGES_TABLE: tableNames.messages,
        GROUPS_TABLE: tableNames.groups,
        GROUP_MEMBERS_TABLE: tableNames.groupMembers,
        BLOCKED_USERS_TABLE: tableNames.blockedUsers,
      },
    },
  });

  const messagesApi = new apigateway.RestAPI("messagesApi", {
    binaryMediaTypes: [],
    routes: [
      // Send message to userId
      { path: "/messages/user/{recipient}", method: "POST", eventHandler: messagingAppLambda },
      // Send message to groupId
      { path: "/messages/group/{group}", method: "POST", eventHandler: messagingAppLambda },
      // get messages for userId
      { path: "/messages/{recipient}", method: "GET", eventHandler: messagingAppLambda },
    ]
  });

  return {
    messagesApi,
    usersApi,
    groupsApi
  }
}
