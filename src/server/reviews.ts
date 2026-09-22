import { createServerFn } from '@tanstack/react-start'
import { desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '@/lib/db'
import { reviews } from '@/db/schema'

export const listReviews = createServerFn({ method: 'GET' })
  .validator((productId: string) => productId)
  .handler(async ({ data: productId }) => {
    const db = await getDb()
    return db.select().from(reviews).where(eq(reviews.productId, productId)).orderBy(desc(reviews.createdAt))
  })

const reviewSchema = z.object({
  productId: z.string(),
  customerName: z.string().min(2, 'Please enter your name'),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(3, 'Please write a short review').max(500),
})

export const addReview = createServerFn({ method: 'POST' })
  .validator(reviewSchema)
  .handler(async ({ data }) => {
    const db = await getDb()
    const id = crypto.randomUUID()
    await db.insert(reviews).values({
      id,
      productId: data.productId,
      customerName: data.customerName,
      rating: data.rating,
      comment: data.comment,
      createdAt: new Date().toISOString(),
    })
    return { id }
  })
