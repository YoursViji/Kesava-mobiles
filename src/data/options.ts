// Plain shop options the public pages and the admin screens both need.
// Kept out of the server modules so a page can use them without pulling server-only code into the published site.

export const ADMIN_EMAIL = 'kesava@gmail.com'

export const DEMO_STATUSES = ['confirmed', 'completed', 'cancelled'] as const
export const EXCHANGE_LEAD_STATUSES = ['new', 'contacted', 'converted', 'expired'] as const
export const PRE_BOOKING_STATUSES = ['pending', 'notified', 'converted', 'cancelled'] as const
export const DELIVERY_STATUSES = ['processing', 'shipped', 'delivered'] as const
export const HOME_DELIVERY_FEE = 99
export const PROMO_ICONS = ['repeat', 'landmark', 'badge-percent', 'sparkles', 'shield-check'] as const
export const SERVICE_STATUSES = ['received', 'diagnosed', 'quoted', 'repairing', 'ready', 'completed'] as const

export const SERVICE_TYPES = [
  'Screen Repair',
  'Battery Replacement',
  'Charging Port Issue',
  'Water Damage',
  'Software / OS Issue',
  'Camera Repair',
  'Speaker / Mic Issue',
  'Other',
] as const

export const DELIVERY_MODES = ['store_dropoff', 'doorstep'] as const

export const serviceTypes = SERVICE_TYPES
export const deliveryModes = DELIVERY_MODES
