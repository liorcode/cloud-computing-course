import * as aws from "@pulumi/aws";
import * as apigateway from "@pulumi/aws-apigateway";

export function createApi(parkingLotLambda: aws.lambda.Function) {
  return new apigateway.RestAPI("api", {
    routes: [
      { path: "/entry", method: "POST", eventHandler: parkingLotLambda },
      { path: "/exit", method: "POST", eventHandler: parkingLotLambda },
    ]
  });
}