import { z } from 'zod'

export const alertSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  store_id: z.string().uuid().optional(),
  category_id: z.number().int().positive().optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export type AlertSchemaValues = z.infer<typeof alertSchema>
export type LoginSchemaValues = z.infer<typeof loginSchema>
export type SignupSchemaValues = z.infer<typeof signupSchema>
