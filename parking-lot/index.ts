import { createApi, createDb, createLambda, createRole } from './src/infrastructure'

const role = createRole();
const table = createDb(role);
const parkingLotLambda = createLambda(role, table.name);
const api = createApi(parkingLotLambda);

// Export the URL of the API
export const baseUrl = api.url;
export const entryApi = api.url.apply(url => `${url}entry`);
export const exitApi = api.url.apply(url => `${url}exit`);
