// Safe to import from routes and components: getSessionUser is a server function (its handler
// only runs on the server). The server-only helpers live in ./session.server.ts.
import { createServerFn } from '@tanstack/react-start'
import { currentUser } from './session.server'

export type { SessionUser } from './session.server'

/** For route loaders and beforeLoad: `const user = await getSessionUser()`. */
export const getSessionUser = createServerFn({ method: 'GET' }).handler(async () => currentUser())
