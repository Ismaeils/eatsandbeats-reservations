import { z } from 'zod'

// Opening hours schema for a single day
const openingHourSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  isOpen: z.boolean(),
  openTime: z.string().nullable(),
  closeTime: z.string().nullable(),
})

// Floor plan element schema
const floorPlanElementSchema = z.object({
  id: z.string(),
  type: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  rotation: z.number(),
  tableId: z.string().optional(),
  capacity: z.number().optional(),
  shape: z.string().optional(),
  label: z.string().optional(),
  hasView: z.boolean().optional(),
  color: z.string().optional(),
  opacity: z.number().optional(),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  restaurantName: z.string().min(2, 'Restaurant name must be at least 2 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  reservationDeposit: z.number().min(0, 'Deposit must be non-negative'),
  averageSeatingTime: z.number().int().min(15).max(300),
  // Opening hours for all 7 days
  openingHours: z.array(openingHourSchema).length(7, 'Opening hours for all 7 days are required'),
  // Floor plan data
  floorPlan: z.object({
    name: z.string().min(1).default('Main Floor'),
    width: z.number().int().min(400).default(800),
    height: z.number().int().min(300).default(600),
    elements: z.array(floorPlanElementSchema),
  }),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const sendInvitationSchema = z.object({
  phoneNumber: z.string().min(10, 'Invalid phone number'),
})

export const updateReservationSchema = z.object({
  timeFrom: z.string().datetime().optional(),
  timeTo: z.string().datetime().optional(),
  tableId: z.string().optional(),
})

export const updateRestaurantConfigSchema = z.object({
  logoUrl: z.string().url().optional().nullable(),
  reservationDeposit: z.number().min(0).optional(),
  averageSeatingTime: z.number().int().min(15).max(300).optional(),
  reservationDuration: z.number().int().min(30).max(480).optional(),
  slotGranularity: z.number().int().min(5).max(60).optional(),
  tableLayout: z.array(z.string().min(1)).optional(),
  cuisines: z.array(z.string()).optional(),
})

