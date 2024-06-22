import { createGroup } from "./create-group.mjs";
import { joinGroup } from "./join-group.mjs";
import { leaveGroup} from "./leave-group.mjs";

export async function handler(event) {
    console.info('[Groups manager]: Handling incoming request', event)

    try {
        let body;
        switch (event.resource) {
            case '/groups':
                body = await createGroup(event)
                break
            case '/groups/{groupId}/members':
                body = await joinGroup(event)
                break
            case '/groups/{groupId}/members/{userId}':
                body = await leaveGroup(event)
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
