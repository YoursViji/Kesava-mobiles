// Drizzle schema for this app's database (SQLite: MonstarX-managed in previews, Cloudflare D1 in
// production). Define tables here and create them with a migration; the auth tables below are
// created for every app automatically.
export * from './auth-schema'

import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  brand: text('brand').notNull(),
  category: text('category').notNull(),
  price: real('price').notNull(),
  originalPrice: real('original_price').notNull(),
  discountPercent: integer('discount_percent').notNull().default(0),
  tag: text('tag'),
  ram: text('ram').notNull(),
  storage: text('storage').notNull(),
  display: text('display').notNull(),
  camera: text('camera').notNull(),
  battery: text('battery').notNull(),
  processor: text('processor').notNull(),
  os: text('os').notNull(),
  colorFrom: text('color_from').notNull(),
  colorTo: text('color_to').notNull(),
  rating: real('rating').notNull().default(4.3),
  reviewsCount: integer('reviews_count').notNull().default(0),
  inStock: integer('in_stock', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
  imageUrl: text('image_url'),
  subcategory: text('subcategory'),
})
export type Product = typeof products.$inferSelect

export const serviceBookings = sqliteTable('service_bookings', {
  id: text('id').primaryKey(),
  trackingCode: text('tracking_code').notNull().unique(),
  customerName: text('customer_name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  deviceBrand: text('device_brand').notNull(),
  deviceModel: text('device_model').notNull(),
  serviceType: text('service_type').notNull(),
  issueDescription: text('issue_description').notNull(),
  preferredDate: text('preferred_date').notNull(),
  preferredTime: text('preferred_time').notNull(),
  status: text('status').notNull().default('received'),
  quoteAmount: real('quote_amount'),
  paymentStatus: text('payment_status').notNull().default('unpaid'),
  userId: text('user_id'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deliveryMode: text('delivery_mode').notNull().default('store_dropoff'),
  pickupAddress: text('pickup_address'),
})
export type ServiceBooking = typeof serviceBookings.$inferSelect

export const demoBookings = sqliteTable('demo_bookings', {
  id: text('id').primaryKey(),
  bookingCode: text('booking_code').notNull().unique(),
  productId: text('product_id').notNull(),
  productName: text('product_name').notNull(),
  customerName: text('customer_name').notNull(),
  phone: text('phone').notNull(),
  preferredDate: text('preferred_date').notNull(),
  preferredTime: text('preferred_time').notNull(),
  status: text('status').notNull().default('confirmed'),
  createdAt: text('created_at').notNull(),
})
export type DemoBooking = typeof demoBookings.$inferSelect

export const preLaunches = sqliteTable('pre_launches', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  brand: text('brand').notNull(),
  expectedPrice: text('expected_price').notNull(),
  tokenAmount: real('token_amount').notNull(),
  expectedDate: text('expected_date').notNull(),
  description: text('description').notNull(),
  colorFrom: text('color_from').notNull(),
  colorTo: text('color_to').notNull(),
  imageUrl: text('image_url'),
  createdAt: text('created_at').notNull(),
})
export type PreLaunch = typeof preLaunches.$inferSelect

export const preBookings = sqliteTable('pre_bookings', {
  id: text('id').primaryKey(),
  bookingCode: text('booking_code').notNull().unique(),
  launchId: text('launch_id').notNull(),
  launchName: text('launch_name').notNull(),
  customerName: text('customer_name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  tokenAmount: real('token_amount').notNull(),
  status: text('status').notNull().default('pending'),
  createdAt: text('created_at').notNull(),
})
export type PreBooking = typeof preBookings.$inferSelect

export const promotions = sqliteTable('promotions', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  text: text('text').notNull(),
  icon: text('icon').notNull().default('badge-percent'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull(),
})
export type Promotion = typeof promotions.$inferSelect

export const serviceUpdates = sqliteTable('service_updates', {
  id: text('id').primaryKey(),
  bookingId: text('booking_id').notNull(),
  status: text('status').notNull(),
  note: text('note'),
  createdAt: text('created_at').notNull(),
})
export type ServiceUpdate = typeof serviceUpdates.$inferSelect

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  orderCode: text('order_code').notNull().unique(),
  customerName: text('customer_name').notNull(),
  phone: text('phone').notNull(),
  totalAmount: real('total_amount').notNull(),
  status: text('status').notNull().default('pending'),
  createdAt: text('created_at').notNull(),
})
export type Order = typeof orders.$inferSelect

export const orderItems = sqliteTable('order_items', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull(),
  productId: text('product_id').notNull(),
  name: text('name').notNull(),
  price: real('price').notNull(),
  quantity: integer('quantity').notNull().default(1),
})
export type OrderItem = typeof orderItems.$inferSelect

export const exchangeLeads = sqliteTable('exchange_leads', {
  id: text('id').primaryKey(),
  claimCode: text('claim_code').notNull().unique(),
  customerName: text('customer_name').notNull(),
  phone: text('phone').notNull(),
  oldBrand: text('old_brand').notNull(),
  oldModel: text('old_model').notNull(),
  purchaseYear: integer('purchase_year').notNull(),
  condition: text('condition').notNull(),
  estimatedValue: real('estimated_value').notNull(),
  status: text('status').notNull().default('new'),
  createdAt: text('created_at').notNull(),
})
export type ExchangeLead = typeof exchangeLeads.$inferSelect

export const reviews = sqliteTable('reviews', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull(),
  customerName: text('customer_name').notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment').notNull(),
  createdAt: text('created_at').notNull(),
})
export type Review = typeof reviews.$inferSelect
