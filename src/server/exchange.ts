import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '@/lib/db'
import { exchangeLeads } from '@/db/schema'
import { EXCHANGE_BRANDS, EXCHANGE_CONDITIONS, estimateExchangeValue } from '@/lib/exchangeEstimate'

function makeClaimCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return `KM-EXG-${code}`
}

const leadSchema = z.object({
  customerName: z.string().min(2, 'Please enter your name'),
  phone: z.string().min(10, 'Please enter a valid 10-digit phone number').max(15),
  oldBrand: z.enum(EXCHANGE_BRANDS),
  oldModel: z.string().min(1, 'Please enter the model'),
  purchaseYear: z.number().int().min(2010).max(new Date().getFullYear()),
  condition: z.enum(EXCHANGE_CONDITIONS),
})

export const claimExchangeEstimate = createServerFn({ method: 'POST' })
  .validator(leadSchema)
  .handler(async ({ data }) => {
    const db = await getDb()
    const estimatedValue = estimateExchangeValue(data.oldBrand, data.oldModel, data.purchaseYear, data.condition)
    let claimCode = makeClaimCode()
    let clash = await db.select().from(exchangeLeads).where(eq(exchangeLeads.claimCode, claimCode)).get()
    let attempts = 0
    while (clash && attempts < 10) {
      claimCode = makeClaimCode()
      clash = await db.select().from(exchangeLeads).where(eq(exchangeLeads.claimCode, claimCode)).get()
      attempts++
    }
    await db.insert(exchangeLeads).values({
      id: crypto.randomUUID(),
      claimCode,
      customerName: data.customerName,
      phone: data.phone,
      oldBrand: data.oldBrand,
      oldModel: data.oldModel,
      purchaseYear: data.purchaseYear,
      condition: data.condition,
      estimatedValue,
      createdAt: new Date().toISOString(),
    })
    return { claimCode, estimatedValue }
  })
