import { eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { storage } from '@/lib/storage'
import { servicePhotos } from '@/db/schema'
import { requireAdmin } from '@/server/admin-guard.server'

export async function serveDamagePhoto(id: string): Promise<Response> {
  try {
    await requireAdmin()
  } catch {
    return new Response('Staff sign-in required', { status: 403 })
  }
  const db = await getDb()
  const photo = await db.select().from(servicePhotos).where(eq(servicePhotos.id, id)).get()
  if (!photo) return new Response('Photo not found', { status: 404 })
  const file = await storage.get(photo.storageKey)
  if (!file) return new Response('Photo not found', { status: 404 })
  return new Response(file.body, { headers: {
    'Content-Type': file.contentType,
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
  } })
}
