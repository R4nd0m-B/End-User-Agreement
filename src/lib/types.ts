export interface Agreement {
  id: number;
  version: number;
  title: string;
  content: string;
  created_at: string;
  is_active: number;
}

export interface CustomField {
  id: number;
  field_name: string;
  label: string;
  field_type: 'text' | 'email' | 'tel' | 'textarea' | 'select';
  placeholder: string | null;
  is_required: number;
  options: string | null;
  sort_order: number;
  is_active: number;
  created_at: string;
}

export interface Submission {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  agreement_version: number;
  accepted: number;
  custom_data: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface Setting {
  key: string;
  value: string;
}

export interface Session {
  id: string;
  created_at: string;
  expires_at: string;
}

export interface AuditLog {
  id: number;
  action: string;
  details: string | null;
  created_at: string;
}

export interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface Branding {
  company_name: string;
  logo_url: string;
  tagline: string;
  page_heading: string;
  page_description: string;
  form_heading: string;
  form_description: string;
  primary_color: string;
}
