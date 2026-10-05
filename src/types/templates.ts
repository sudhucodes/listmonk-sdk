export type TemplateType = 'campaign' | 'tx';

export interface Template {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  type: TemplateType;
  subject?: string;
  body: string;
  is_default: boolean;
}

export interface CreateTemplateOptions {
  name: string;
  type: TemplateType;
  body: string;
  subject?: string;
  is_default?: boolean;
}

export interface UpdateTemplateOptions {
  name?: string;
  type?: TemplateType;
  body?: string;
  subject?: string;
  is_default?: boolean;
}
