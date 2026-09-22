// SERVER-ONLY. Better Auth for this app's users, stored in the app's own database.
// Email + password is enabled; the users can be managed from MonstarX's Backend tab.
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin } from 'better-auth/plugins'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import * as authSchema from '../db/auth-schema'
import { getDb } from './db'
import { sendEmail } from './email'

async function create() {
  const db = await getDb()
  return betterAuth({
    appName: 'App',
    baseURL: process.env.BETTER_AUTH_URL || undefined,
    secret: process.env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, { provider: 'sqlite', schema: authSchema }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      // Password reset works out of the box: the link is emailed through MonstarX's email service.
      sendResetPassword: async ({ user, url }) => {
        await sendEmail({
          to: user.email,
          subject: 'Reset your password',
          text: `Hi ${user.name || 'there'},\n\nReset your password with this link (valid for one hour):\n${url}\n\nIf you did not ask for this, you can ignore this email.`,
        })
      },
    },
    plugins: [admin(), tanstackStartCookies()],
    // A MonstarX preview runs in a frame of the MonstarX workspace, on another site, where browsers drop SameSite=Lax
    // cookies: sign-in would create a session the app never sees again. Previews use cross-site cookies partitioned to
    // the workspace; published apps keep Better Auth's first-party defaults.
    advanced: process.env.MONSTARX_PREVIEW === '1' ? { defaultCookieAttributes: { sameSite: 'none', secure: true, partitioned: true } } : undefined,
  })
}

export type AppAuth = Awaited<ReturnType<typeof create>>

let instance: Promise<AppAuth> | null = null

export function getAuth(): Promise<AppAuth> {
  instance ??= create().catch((error: unknown) => {
    instance = null
    throw error
  })
  return instance
}
