import { lambda } from "@pulumi/aws";
import * as apigateway from "@pulumi/aws-apigateway";

export function createApi(userManagerLambda: lambda.Function, groupsManagerLambda: lambda.Function, messagingLambda: lambda.Function) {
  return new apigateway.RestAPI("usersApi", {
    binaryMediaTypes: [],
    routes: [
      // Create user
      { path: "/users", method: "POST", eventHandler: userManagerLambda },
      // Block user
      { path: "/users/block", method: "POST", eventHandler: userManagerLambda },

      // Create group
      { path: "/groups", method: "POST", eventHandler: groupsManagerLambda },
      // Add member to group
      { path: "/groups/{groupId}/members", method: "POST", eventHandler: groupsManagerLambda },
      // Remove member from group
      { path: "/groups/{groupId}/members/{userId}", method: "DELETE", eventHandler: groupsManagerLambda },

      // Send message to userId
      { path: "/messages/user/{recipient}", method: "POST", eventHandler: messagingLambda },
      // Send message to groupId
      { path: "/messages/group/{group}", method: "POST", eventHandler: messagingLambda },
      // get messages for userId
      { path: "/messages/{recipient}", method: "GET", eventHandler: messagingLambda },
    ]
  })
}
