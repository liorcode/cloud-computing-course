import { parkingLotEntry } from './entry.mjs';
import { parkingLotExit } from './exit.mjs';

export async function handler(event) {
  console.info('Handling incoming event', event)

  try {
    if (!event.queryStringParameters) {
      throw new Error('Missing queryStringParameters')
    }

    let body;
    switch (event.path) {
      case '/entry':
        body = await parkingLotEntry(event)
        break
      case '/exit':
        body = await parkingLotExit(event);
        break
      default:
        throw new Error(`Unsupported path "${event.path}"`)
    }

    return {
      statusCode: 200,
      body: JSON.stringify(body)
    }

  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: err.message
      })
    }
  }
}