import { createDb, createRole, createQueue, createApi } from './src/infrastructure'
import { creatGroupMessageProcessorLambda, createMessagingLambda, creatUserManagerLambda, createGroupManagerLambda } from './src/infrastructure/lambdas'

// Create the SQS queue
const groupMessagesQueue = createQueue();

// Create the IAM role for the Lambda functions
const role = createRole(groupMessagesQueue);

// Create the DynamoDB tables
const createdTableNames = createDb(role);

// Define the environment variables for the Lambda functions
const envVariables = {
  MESSAGE_QUEUE_URL: groupMessagesQueue.url,
  USERS_TABLE: createdTableNames.users,
  MESSAGES_TABLE: createdTableNames.messages,
  GROUPS_TABLE: createdTableNames.groups,
  GROUP_MEMBERS_TABLE: createdTableNames.groupMembers,
  BLOCKED_USERS_TABLE: createdTableNames.blockedUsers,
}

// Create the Lambda functions
const messagingLambda = createMessagingLambda(role, envVariables, groupMessagesQueue);
const userManagerLambda = creatUserManagerLambda(role, envVariables);
const groupsManagerLambda = createGroupManagerLambda(role, envVariables);
creatGroupMessageProcessorLambda(role, envVariables, groupMessagesQueue);

// Create the API Gateway
const api = createApi(userManagerLambda, groupsManagerLambda, messagingLambda);

// Export the URL of the APIs
export const apiEndpoint = api.url;
