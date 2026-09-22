import { createFileRoute } from '@tanstack/react-router'
import { seedProductImages } from '@/server/media'

export const Route = createFileRoute('/api/seed-images')({
  server: {
    handlers: {
      GET: async () => Response.json(await seedProductImages()),
    },
  },
})
