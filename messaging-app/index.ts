import { createDb, createLambdas, createRole } from './src/infrastructure'

const role = createRole();
const createdTableNames = createDb(role);
const { messagesApi, usersApi, groupsApi} = createLambdas(role, createdTableNames);

// Export the URL of the APIs
export const messagesApiUrl = messagesApi.url;
export const usersApiUrl = usersApi.url;
export const groupsApiUrl = groupsApi.url;
