import { z } from 'zod';

export const accessKeySchema = z.object({
  key: z.string().min(1, 'Access key is required').max(256),
});

export const submissionSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(200),
  email: z.string().email('Invalid email address').max(200),
  phone: z.string().min(1, 'Phone number is required').max(50),
  agreementAccepted: z.literal('on', { error: 'You must accept the agreement to proceed' }),
});

export const adminLoginSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

export const agreementUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  content: z.string().min(1, 'Agreement content is required').max(50000),
});

export const customFieldSchema = z.object({
  field_name: z.string().min(1).max(100).regex(/^[a-z0-9_]+$/, 'Must be lowercase letters, numbers, and underscores'),
  label: z.string().min(1, 'Label is required').max(200),
  field_type: z.enum(['text', 'email', 'tel', 'textarea', 'select']),
  placeholder: z.string().max(200).optional(),
  is_required: z.coerce.number().min(0).max(1),
  options: z.string().optional(),
});

export const accessKeyUpdateSchema = z.object({
  key: z.string().min(1, 'Access key is required').max(256),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(12, 'New password must be at least 12 characters')
    .regex(/[A-Z]/, 'New password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'New password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'New password must contain at least one number'),
});
