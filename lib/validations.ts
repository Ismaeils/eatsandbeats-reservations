import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  restaurantName: z.string().min(2, 'Restaurant name must be at least 2 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  reservationDeposit: z.number().min(0, 'Deposit must be non-negative'),
  averageSeatingTime: z.number().int().min(15).max(300),
  tableLayout: z.array(z.string().min(1)).min(1, 'At least one table is required'),
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

