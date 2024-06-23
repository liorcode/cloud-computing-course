import { sendDirectMessage} from "./send-direct-message.mjs";
import { sendGroupMessage } from "./send-group-message.mjs";
import { getMessages } from "./get-messages.mjs";

export async function handler(event) {
    console.info('[Messages lambda] Handling request', event)

    try {
        let body;
        switch (event.resource) {
            case '/messages/{recipient}':
                body = await getMessages(event)
                break
            case '/messages/user/{recipient}':
                body = await sendDirectMessage(event)
                break
            case '/messages/group/{group}':
                body = await sendGroupMessage(event)
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
