# Cloud Computing HW2 - Messaging app

## Introduction

This project uses Pulumi to create a cloud infrastructure for a messaging app.
It consists of an API Gateway, Lambda, DynamoDB and SQS.

## Code

The code is organized as follows:

### Infrastructure code
- `index.ts`: The main Pulumi program that defines the infrastructure. It uses the following files:
- `src/infrastructure/lambdas/*`: Creates the Lambda functions.
- `src/infrastructure/api`: Creates the API gateway.
- `src/infrastructure/dynamodb.ts`: Creates the DynamoDB table.
- `src/infrastructure/queue.ts`: Creates the group messages SQS.
- `src/infrastructure/role.ts`: Creates the IAM role for the Lambda functions.

### Lambda function code
- `src/functions/group-message-processor`: The Lambda function for processing messages sent to a group using SQS.
- `src/functions/groups`: The Lambda function for groups management.
- `src/functions/messages`: The Lambda function for messages sending and receiving.
- `src/functions/users`: The Lambda function for users management.

## Deployment

To deploy the infrastructure, you need to have Pulumi installed and configured.

Make sure to also define your AWS credentials in the environment variables:

```bash
export AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY
export AWS_SECRET_ACCESS_KEY=YOUR_SECRET
```

Then, you can run the following commands:

```bash
npm install
pulumi up
```

This will output the `apiEndpoint`.

To remove the infrastructure, you can run:

```bash
pulumi destroy
```

## API


The API is a REST API that allows users to interact with the system, as described below.

* No Authentication or Authorization is implemented for simplicity.
* All the APIs assume no validation is needed for the input parameters, and that the input is always correct.

The API has the following endpoints:

### Users

#### `POST /users`: 
Create a new user. Returns the created user id.

#### `POST /users/block`

Block a user.

Body parameters (as JSON):
- `blockedId`: The id of the user to block
- `blockerId`: The id of the blocking user

##### Example:
```json
POST /users/block

{
    "blockedId": "e9c93258-2246-4ec0-ab44-2a2198186050",
    "blockerId": "fc05a386-27ce-4ca7-acea-289adc8cc9ff"
}
```

### Groups

#### `POST /groups`

Create a new group. Returns the created group id.

#### `POST /groups/{groupId}/members/`

Add a member to a group of id `groupId`.

Body Parameters:
- `userId`: The id of the user to add to the group `groupId`

#### Example

```json
POST /groups/a8c93258-2246-4ec0-ab44-2a2198186140/members/`

{
    "userId": "e9c93258-2246-4ec0-ab44-2a2198186050",
}
```

#### `DELETE /groups/{groupId}/members/{userId}`

Remove user `userId` from group `groupId`.

### Messages

#### `POST /messages/user/{recipient}`

Send a message to a user of id `recipient`.  
If the recipient has blocked the sender, the message will not be sent and an error will be returned.

Parameters:

- `sender`: The id of the sender
- `content`: The content of the message


#### Example

```json
POST /messages/user/fc05a386-27ce-4ca7-acea-289adc8cc9ff


{
    "sender": "e9c93258-2246-4ec0-ab44-2a2198186050",
    "content": "Hi there"
}
```

#### `POST /messages/group/{groupId}`

Send a message to a group of id `groupId`.  
This function uses an SQS queue to send the messages asynchronously to each member of the group.

**Note**: When sending a group message, we do not check for blocked users (same as WhatsApp for example).

Body Parameters:

- `sender`: The id of the sender
- `content`: The content of the message

#### Example

```json

POST /messages/group/a8c93258-2246-4ec0-ab44-2a2198186140
{
    "sender": "e9c93258-2246-4ec0-ab44-2a2198186050",
    "content": "Hi there"
}
```

The group message processor lambda will read from the SQS queue and create an entry of the message for each group member.

*Note*: for simplicity, we did not use a DLQ. In a real-world scenario, we would use a DLQ to retry messages that could not be processed successfully.


#### `GET /messages/{recipient}?date={date}`

Get all messages sent to a user of id `recipient`.
This gets both direct messages and messages sent to groups the user is a member of.

If the amount of messages is too large (excceeds the MESSAGES_PER_PAGE), the response will include a `nextPageToken` that can be used to get the next page of messages.

##### Example

`GET /messages/a8c93258-2246-4ec0-ab44-2a2198186140?date=2024-06-24T10:00:00.000Z`


The response will be as in the following format:

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

Query parameters:

- `date` - (In ISO format) The date from which to get the messages. If not provided, all messages are returned (up to the page limit).  
This is useful to get only new messages since the last time the user checked for messages (assuming this "last fetch date" is saved locally in the app client).
This parameter is also used for pagination - you need to pass the `nextPageToken` from the previous response to get the next page of messages.


## Scaling considerations

We will analyze the scalability and cost of the system for different loads.

**Note**: We will mostly discuss load related to messages, since the user and group management is assumed to be negligible in terms of load.

### DynamoDB

All the databases are currently using the on-demand (`PAY_PER_REQUEST`) billing mode, which allows for automatic scaling based on the traffic.

Once the traffic gets more predictable, it might be beneficial to switch to provisioned capacity to save costs, 
especially for the `messages` table since it will be the most used table.

#### Query performance

All the tables are partitioned by a random UUID to distribute the data evenly across the partitions.
All the queries are using the hash key, or the hash key and sort key, which allows for efficient queries.

Messages are fetched from the `messages` table using the `recipient-date-index`, which uses the `recipient` and `date` fields as the hash key and sort key.
This allows us to efficiently get all messages sent to a user after a given date, which is useful for getting new messages since the last time the user checked for messages.


### Lambda functions

AWS Lambda scales automatically by increasing the number of concurrent instances based on the traffic.
That means that when more users will use the app at the same time, lambda will provision more instances to handle the load, until the concurrency limit is reached (1000 by default).

Since lambda functions are billed based on the number of invocations and the execution time, it is important to make sure the functions are efficient and fast. This will also help us support more messages per second.

- Our "create" users/groups/direct message lambdas are simple and should be very fast. All they do is write to the database and return the generated id.
- Our "send group message" lambda is also very fast, since all it does is write to the SQS queue.
- Our "get messages" lambda is a little complex, since it needs to read from the database and return the messages. This is why it was important to make sure the queries are efficient and that the function is fast to avoid high costs.
The response size is limited to MESSAGES_PER_PAGE, which allows us to get a page of messages at a time, and the query is efficient since it uses the `recipient-date-index` to get the messages efficiently.
- Our "group message processor" lambda reads from the SQS and duplicates the message to all the members of the group. It reads in batches of 10 messages, which allows it to process the messages efficiently and in parallel.

Assuming that each lambda execution time will be around 100ms, that means each lambda instance can handle around 10 messages per second.
This means that with 1000 concurrent instances, we can handle around 10,000 messages per second.
Over this number, we will need to increase the concurrency limit, or else the operations will be throttled - which means we will need to handle the throttling errors in the client by retrying.

### SQS

When a Lambda function is triggered by the SQS, AWS automatically scales the Lambda function horizontally by invoking more instances of the function to process the messages in the queue. 
This means that as the number of messages in the queue increases, more Lambda instances will be run to process those messages concurrently.

We are charged based on the number of messages and the amount of data transferred (message size) in the queue.

We have set the batch size to 10 to reduce the number of invocations and to process the messages in parallel.


### Handling different user loads

- With **1000s** of users, the current configuration should handle the traffic efficiently with very low cost. Since we use on-demand capacity for DynamoDB and Lambda, the cost will be low, and the system will scale automatically to handle the traffic.
- With **10,000s** of users, the cost will still be relatively low (since AWS charges by the million requests), but costs might start to increase. We will need to monitor the traffic and consider switching to provisioned capacity for DynamoDB to save costs. Auto-scaling can be configured to manage spikes in traffic.
- With **millions** of users, the system will still scale automatically to handle the traffic, but we risk hitting the 1000 concurrency limit, which will lead to throttling. That means we will need to handle the throttling errors in the client by retrying.   
Also, it could become too expensive and unpredictable to use on-demand capacity, 
especially if there are bursts of requests, causing DynamoDB and Lambda to scale without limits, which could lead to unusual high costs. 
We should consider switching to provisioned capacity based on expected traffic for both DynamoDB and the messages Lambda, to allow us to control the cost.

### Cost calculation For 1000 users (numbers can be adjusted based on the expected traffic):

- Assume 1,000 users * 10 messages/day * 30 days = 300,000 direct messages.
- Group messages: Assume an average group size of 10 members. 300,000 * 10 = 3,000,000 messages.

#### Lambda Cost:
- Invocations: 300,000 (direct messages)
- Duration: Assume 100ms per invocation.
- Total Duration: 300,000 * 0.1s = 30,000 seconds = 8.33 hours of Lambda execution time per month.
- Total Memory: The minimal 128 MB will be enough.
- Cost: Since 30,000 seconds * 128 MB/1024 = 3.75 GB-seconds, this falls under the free tier (up to 400,000 GB-seconds of compute time per month)

#### DynamoDB Cost:
- Writes: 300,000 writes (direct messages) + 3,000,000 writes (group messages) = 3,300,000 writes/month.
- Reads: Assume 10,000 reads/month for retrievals + 300,000 reads for checking blocked users, when sending direct messages (one check per message).
- Storage: Assuming a message will be 1KB at most: 300,000 messages * 1 KB = 300 MB.
  Cost: Using PAY_PER_REQUEST:
  - Writes: 3,300,000 * $1.25 per million = $4.125
  - Reads: 310,000 * $0.25 per million = $0.0775
  - Storage: 300 MB * $0.25/GB = $0.075

### SQS Cost:
- Messages: 3,300,000 messages to process.
- Cost: 3,300,000 * $0.40 per million = $1.32
