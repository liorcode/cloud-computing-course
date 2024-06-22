import { registerUser } from './register-user.mjs';
import { blockUser } from "./block-user.mjs";

export async function handler(event) {
    console.info('[User manager] Handling request', event)

    try {
        let body;
        switch (event.resource) {
            case '/users':
                body = await registerUser(event)
                break
            case '/users/block':
                body = await blockUser(event)
                break
            default:
                throw new Error(`Unsupported path "${event.path}"`)
        }

        return {
            statusCode: 200,
            body: JSON.stringify(body)
        }

    } catch (err) {
        console.error('Error processing event', err);
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: `Error: ${err.message}. Check server logs for more details.`
            })
        }
    }
}
