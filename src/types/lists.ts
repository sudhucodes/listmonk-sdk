import type { PaginatedResult, PaginationParams } from './common';

export type ListType = 'public' | 'private';
export type ListOptin = 'single' | 'double';

export interface SubscriptionList {
  id: number;
  created_at: string;
  updated_at: string;
  uuid: string;
  name: string;
  type: ListType;
  optin: ListOptin;
  tags: string[];
  description?: string;
  subscriber_count?: number;
}

export interface CreateListOptions {
  name: string;
  type?: ListType;
  optin?: ListOptin;
  tags?: string[];
  description?: string;
}

export interface UpdateListOptions {
  name?: string;
  type?: ListType;
  optin?: ListOptin;
  tags?: string[];
  description?: string;
}

export interface ListListsParams extends PaginationParams {
  query?: string;
  type?: ListType;
}

export type ListsResult = PaginatedResult<SubscriptionList>;
