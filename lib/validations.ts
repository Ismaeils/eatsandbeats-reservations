import { z } from 'zod'

// Opening hours schema for a single day
const openingHourSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  isOpen: z.boolean(),
  openTime: z.string().nullable(),
  closeTime: z.string().nullable(),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  restaurantName: z.string().min(2, 'Restaurant name must be at least 2 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  reservationDeposit: z.number().min(0, 'Deposit must be non-negative'),
  averageSeatingTime: z.number().int().min(15).max(300),
  maxSimultaneousReservations: z.number().int().min(1).max(1000).optional().default(10),
  // Opening hours for all 7 days
  openingHours: z.array(openingHourSchema).length(7, 'Opening hours for all 7 days are required'),
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
  numberOfPeople: z.number().int().min(1).max(100).optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'SEATED', 'COMPLETED', 'CANCELLED']).optional(),
})

export const updateRestaurantConfigSchema = z.object({
  logoUrl: z.string().url().optional().nullable(),
  reservationDeposit: z.number().min(0).optional(),
  averageSeatingTime: z.number().int().min(15).max(300).optional(),
  reservationDuration: z.number().int().min(30).max(480).optional(),
  slotGranularity: z.number().int().min(5).max(60).optional(),
  maxSimultaneousReservations: z.number().int().min(1).max(1000).optional(),
  cuisines: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
})
