import * as aws from "@pulumi/aws";

export function createQueue() {
    return new aws.sqs.Queue("groupMessagesQueue", {
        visibilityTimeoutSeconds: 30,
    });
}
