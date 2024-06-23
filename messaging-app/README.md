# Cloud Computing HW1 - Messaging app

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

This will output the following:
- groupsApiUrl - The URL of the groups endpoint
- messagesApiUrl: - The URL of the messages endpoint
- usersApiUrl - The URL of the users endpoint

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

### Messages

### Groups
