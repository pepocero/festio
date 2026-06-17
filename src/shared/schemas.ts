import { z } from 'zod';

export const templateColorsSchema = z.object({
	primary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
	secondary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
	background: z.string().regex(/^#[0-9a-fA-F]{6}$/),
	text: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

export const templateFontsSchema = z.object({
	title: z.string().min(1).max(50),
	body: z.string().min(1).max(50),
});

export const templateConfigSchema = z.object({
	layout: z.enum(['classic', 'modern', 'elegant']),
	colors: templateColorsSchema,
	fonts: templateFontsSchema,
	backgroundImage: z.string().optional(),
	customBackgroundKey: z.string().optional(),
	backgroundPositionX: z.number().min(0).max(100).optional(),
	backgroundPositionY: z.number().min(0).max(100).optional(),
	hostFontSize: z.number().min(10).max(32).optional(),
	heroGradient: z.boolean().optional(),
	heroOverlay: z.boolean().optional(),
	titlePositionX: z.number().min(0).max(100).optional(),
	titlePositionY: z.number().min(0).max(100).optional(),
});

export const registerSchema = z.object({
	email: z.string().email().max(255).transform((v) => v.toLowerCase().trim()),
	password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
	email: z.string().email().max(255).transform((v) => v.toLowerCase().trim()),
	password: z.string().min(1).max(128),
});

export const createInvitationSchema = z.object({
	template_id: z.string().min(1),
	title: z.string().max(200).optional(),
	host_name: z.string().max(200).optional(),
});

export const updateInvitationSchema = z.object({
	title: z.string().max(200).optional(),
	host_name: z.string().max(200).optional(),
	event_date: z.string().datetime().nullable().optional(),
	event_end_date: z.string().datetime().nullable().optional(),
	timezone: z.string().max(64).optional(),
	location: z.string().max(500).optional(),
	message: z.string().max(2000).optional(),
	config: templateConfigSchema.optional(),
	template_id: z.string().min(1).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
export type UpdateInvitationInput = z.infer<typeof updateInvitationSchema>;
export type TemplateConfig = z.infer<typeof templateConfigSchema>;
