import { createAuthClient } from 'better-auth/react'

/**
 * Browser client for this app's accounts.
 *   await authClient.signUp.email({ name, email, password })
 *   await authClient.signIn.email({ email, password })
 *   await authClient.signOut()
 *   const { data: session } = authClient.useSession()
 */
export const authClient = createAuthClient()
