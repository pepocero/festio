const API_BASE = '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
	const res = await fetch(`${API_BASE}${path}`, {
		...options,
		credentials: 'include',
		headers: {
			...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
			...options.headers,
		},
	});

	const data = await res.json().catch(() => ({}));
	if (!res.ok) {
		throw new Error((data as { error?: string }).error ?? 'Error de servidor');
	}
	return data as T;
}

export interface User {
	id: string;
	email: string;
}

export interface TemplateConfig {
	layout: 'classic' | 'modern' | 'elegant';
	colors: {
		primary: string;
		secondary: string;
		background: string;
		text: string;
	};
	fonts: { title: string; body: string };
	backgroundImage?: string;
	customBackgroundKey?: string;
	backgroundPositionX?: number;
	backgroundPositionY?: number;
	hostFontSize?: number;
	heroGradient?: boolean;
	heroOverlay?: boolean;
	titlePositionX?: number;
	titlePositionY?: number;
}

export interface Template {
	id: string;
	slug: string;
	name: string;
	category: string;
	default_config: TemplateConfig;
	preview_image_key: string | null;
}

export interface Invitation {
	id: string;
	user_id: string;
	public_slug: string | null;
	template_id: string;
	title: string;
	host_name: string;
	event_date: string | null;
	event_end_date: string | null;
	timezone: string;
	location: string;
	message: string;
	config: TemplateConfig;
	status: 'draft' | 'published';
	created_at: string;
	updated_at: string;
	template_name?: string;
	template_category?: string;
	public_url?: string | null;
}

export const api = {
	register: (email: string, password: string) =>
		request<{ user: User }>('/auth/register', {
			method: 'POST',
			body: JSON.stringify({ email, password }),
		}),

	login: (email: string, password: string) =>
		request<{ user: User }>('/auth/login', {
			method: 'POST',
			body: JSON.stringify({ email, password }),
		}),

	logout: () => request<{ ok: boolean }>('/auth/logout', { method: 'POST' }),

	me: () => request<{ user: User | null }>('/auth/me'),

	getTemplates: () => request<{ templates: Template[] }>('/templates'),

	getInvitations: () => request<{ invitations: Invitation[] }>('/invitations'),

	getInvitation: (id: string) => request<{ invitation: Invitation }>(`/invitations/${id}`),

	createInvitation: (template_id: string, title?: string) =>
		request<{ invitation: Invitation }>('/invitations', {
			method: 'POST',
			body: JSON.stringify({ template_id, title }),
		}),

	updateInvitation: (id: string, data: Partial<Invitation> & { config?: TemplateConfig }) =>
		request<{ invitation: Invitation }>(`/invitations/${id}`, {
			method: 'PATCH',
			body: JSON.stringify(data),
		}),

	deleteInvitation: (id: string) =>
		request<{ ok: boolean }>(`/invitations/${id}`, { method: 'DELETE' }),

	publishInvitation: (id: string) =>
		request<{ invitation: Invitation }>(`/invitations/${id}/publish`, { method: 'POST' }),

	uploadImage: async (file: File) => {
		const form = new FormData();
		form.append('file', file);
		return request<{ asset: { id: string; url: string; r2_key: string } }>('/uploads', {
			method: 'POST',
			body: form,
		});
	},
};
