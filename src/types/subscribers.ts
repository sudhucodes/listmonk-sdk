import type { PaginatedResult, PaginationParams } from './common';

export type SubscriberStatus = 'enabled' | 'disabled' | 'blocklisted';

export interface SubscriberListMembership {
  id: number;
  name: string;
  type: 'public' | 'private';
  subscription_status: 'unconfirmed' | 'confirmed' | 'unsubscribed';
  created_at?: string;
  updated_at?: string;
}

export interface Subscriber {
  id: number;
  created_at: string;
  updated_at: string;
  uuid: string;
  email: string;
  name: string;
  attribs: Record<string, any>;
  status: SubscriberStatus;
  lists: SubscriberListMembership[];
}

export interface CreateSubscriberOptions {
  email: string;
  name?: string;
  status?: SubscriberStatus;
  lists?: number[];
  attribs?: Record<string, any>;
  preconfirm_subscriptions?: boolean;
}

export interface SubscribeOptions {
  email: string;
  name?: string;
  /** Numerical list IDs for authenticated subscription (calls POST /api/subscribers) */
  lists?: number[];
  /** UUIDs of public lists for public form subscription (calls POST /api/public/subscription) */
  list_uuids?: string[];
  status?: SubscriberStatus;
  attribs?: Record<string, any>;
  preconfirm_subscriptions?: boolean;
  confirm?: boolean;
}

export interface UpdateSubscriberOptions {
  email?: string;
  name?: string;
  status?: SubscriberStatus;
  lists?: number[];
  attribs?: Record<string, any>;
  preconfirm_subscriptions?: boolean;
}

export interface ListSubscribersParams extends PaginationParams {
  query?: string;
  list_id?: number | number[];
}

export type SubscribersListResult = PaginatedResult<Subscriber>;

export interface PublicSubscriptionOptions {
  email: string;
  name?: string;
  list_uuids: string[];
  attribs?: Record<string, any>;
  confirm?: boolean;
}
