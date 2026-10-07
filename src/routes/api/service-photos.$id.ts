import { createFileRoute } from '@tanstack/react-router'
import { serveDamagePhoto } from '@/server/damage-photo.server'

export const Route = createFileRoute('/api/service-photos/$id')({
  server: { handlers: { GET: ({ params }) => serveDamagePhoto(params.id) } },
})
