import type { PaginatedResult, PaginationParams } from './common';

export type CampaignStatus = 'draft' | 'scheduled' | 'running' | 'paused' | 'cancelled' | 'finished';

export type CampaignType = 'regular' | 'optin';

export type CampaignContentType = 'richtext' | 'html' | 'markdown' | 'plain' | 'visual';

export interface CampaignListItem {
  id: number;
  name: string;
}

export interface Campaign {
  id: number;
  created_at: string;
  updated_at: string;
  uuid: string;
  name: string;
  subject: string;
  from_email: string;
  body: string;
  altbody?: string;
  content_type: CampaignContentType;
  status: CampaignStatus;
  type: CampaignType;
  tags: string[];
  template_id?: number;
  messenger: string;
  send_at?: string;
  started_at?: string;
  to_send?: number;
  sent?: number;
  lists: CampaignListItem[];
  headers?: Array<Record<string, string>>;
}

export interface CreateCampaignOptions {
  name: string;
  subject: string;
  lists: number[];
  type?: CampaignType;
  content_type?: CampaignContentType;
  body: string;
  altbody?: string;
  from_email?: string;
  body_source?: string;
  send_at?: string | Date;
  messenger?: string;
  template_id?: number;
  tags?: string[];
  headers?: Array<Record<string, string>>;
}

export interface UpdateCampaignOptions {
  name?: string;
  subject?: string;
  lists?: number[];
  type?: CampaignType;
  content_type?: CampaignContentType;
  body?: string;
  altbody?: string;
  from_email?: string;
  body_source?: string;
  send_at?: string | Date;
  messenger?: string;
  template_id?: number;
  tags?: string[];
  headers?: Array<Record<string, string>>;
}

export interface ListCampaignsParams extends PaginationParams {
  query?: string;
  status?: CampaignStatus | string;
}

export type CampaignsListResult = PaginatedResult<Campaign>;

export interface TestCampaignOptions {
  id: number;
  subscribers?: string[];
  emails?: string[];
}
