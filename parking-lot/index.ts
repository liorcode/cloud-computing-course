import { createApi, createDb, createLambda, createRole } from './src'

const role = createRole();
const table = createDb(role);
const parkingLotLambda = createLambda(role, table.name);
const api = createApi(parkingLotLambda);

// Export the URL of the API
export const url = api.url;
