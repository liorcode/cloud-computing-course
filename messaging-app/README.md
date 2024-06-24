# Cloud Computing HW2 - Messaging app

## Introduction

This project uses Pulumi to create a cloud infrastructure for a messaging app.
It consists of an API Gateway, Lambda, DynamoDB and SQS.

## Code

The code is organized as follows:

### Infrastructure code
- `index.ts`: The main Pulumi program that defines the infrastructure. It uses the following files:
- `src/infrastructure/lambda.ts`: The Lambda functions and APIs.
- `src/infrastructure/dynamodb.ts`: The DynamoDB table.
- `src/infrastructure/role.ts`: The IAM role for the Lambda functions.

### Lambda function code
- `src/functions/groups`: The Lambda function for groups management
- `src/functions/group-message-processor`: The Lambda function for processing messages send to a group using SQS
- `src/functions/users`: The Lambda function for users management
- `src/functions/messages`: The Lambda function for messages sending and receiving

## Deployment

To deploy the infrastructure, you need to have Pulumi installed and configured.

Make sure to also define your AWS credentials in the environment variables:

```bash
export AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY
export AWS_SECRET_ACCESS_KEY=YOUR_SECRET
```

Then, you can run the following commands:

```bash
pulumi up
```

This will output the `apiEndpoint`

To remove the infrastructure, you can run:

```bash
pulumi destroy
```

## API

The API Gateway has the following routes:

### Users

#### `POST /users`: 
Create a new user. Returns the created user id

#### `POST /users/block`

Block a user.

Parameters:
- `blockedId`: The id of the user to block
- `blockerId`: The id of the blocking user

### Groups

#### `POST /groups`

Create a new group. Returns the created group id

#### `POST /groups/{groupId}/members/`

Add a member to a group of id `groupId`

Parameters:
- `userId`: The id of the user to add to the group

#### `DELETE /groups/{groupId}/members/{userId}`

Remove user `userId` from group `groupId`

### Messages


#### `POST /messages/user/{recipient}`

Send a message to a user of id `recipient`.  
If the recipient has blocked the sender, the message will not be sent and an error will be returned.

Parameters:

- `sender`: The id of the sender
- `content`: The content of the message

#### `POST /messages/group/{groupId}`

Send a message to a group of id `groupId`.  
This function uses an SQS queue to send the messages asynchronously to each member of the group.

Parameters:

- `sender`: The id of the sender
- `content`: The content of the message

#### `GET /messages/{recipient}`

Get all messages sent to a user of id `recipient`.
This gets both direct messages and messages sent to groups the user is a member of.

If the amount of messages is too large (excceeds the MESSAGES_PER_PAGE), the response will include a `nextPageToken` that can be used to get the next page of messages.

The response will be in the following format:

```json
{
  "messages": [
    {
      "sender": "f0141691-fa99-4b23-a654-c713be79f847",
      "content": "message1",
      "recipient": "7a5cfc0e-6213-4e47-99a7-db29bf461a14",
      "date": "2024-06-24T10:49:53.159Z",
      "messageId": "b4891667-065b-41d3-878f-8875b89fdb72"
    },
    {
      "sender": "f0141691-fa99-4b23-a654-c713be79f847",
      "content": "message2",
      "recipient": "7a5cfc0e-6213-4e47-99a7-db29bf461a14",
      "date": "2024-06-24T10:55:45.809Z",
      "messageId": "8ecffb80-d337-453b-91da-5d2fd07f8e0b"
    }
  ],
  "nextPageToken": "2024-06-24T10:55:45.809Z"
}
```

Parameters:

- `date` - Optional: The date from which to get the messages. If not provided, all messages are returned.  
This is useful to get only new messages since the last time the user checked for messages,
and also for pagination - you need to pass the `nextPageToken` from the previous response to get the next page of messages.
