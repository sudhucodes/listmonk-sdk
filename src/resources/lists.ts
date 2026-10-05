import type { HttpClient } from '../client';
import type { ListmonkResponse } from '../types/common';
import type {
  CreateListOptions,
  ListListsParams,
  ListsResult,
  SubscriptionList,
  UpdateListOptions,
} from '../types/lists';

export class Lists {
  constructor(private readonly client: HttpClient) {}

  /**
   * Create a new subscriber list.
   *
   * @example
   * ```ts
   * const { data, error } = await listmonk.lists.create({
   *   name: 'Product Updates',
   *   type: 'public',
   *   optin: 'single',
   *   tags: ['product', 'newsletter'],
   * });
   * ```
   */
  public async create(payload: CreateListOptions): Promise<ListmonkResponse<SubscriptionList>> {
    return this.client.post<SubscriptionList>('/lists', {
      type: payload.type ?? 'public',
      optin: payload.optin ?? 'single',
      tags: payload.tags ?? [],
      ...payload,
    });
  }

  /**
   * Retrieve a list by its numeric ID.
   *
   * @example
   * ```ts
   * const { data, error } = await listmonk.lists.get(1);
   * ```
   */
  public async get(id: number): Promise<ListmonkResponse<SubscriptionList>> {
    return this.client.get<SubscriptionList>(`/lists/${id}`);
  }

  /**
   * List or search subscriber lists with pagination.
   *
   * @example
   * ```ts
   * const { data, error } = await listmonk.lists.list({
   *   page: 1,
   *   per_page: 50,
   * });
   * ```
   */
  public async list(params: ListListsParams = {}): Promise<ListmonkResponse<ListsResult>> {
    return this.client.get<ListsResult>('/lists', {
      page: params.page,
      per_page: params.per_page,
      query: params.query,
      type: params.type,
      order_by: params.order_by,
      dir: params.dir,
    });
  }

  /**
   * Update an existing list.
   *
   * @example
   * ```ts
   * const { data, error } = await listmonk.lists.update(1, {
   *   name: 'VIP Newsletter',
   * });
   * ```
   */
  public async update(id: number, payload: UpdateListOptions): Promise<ListmonkResponse<SubscriptionList>> {
    return this.client.put<SubscriptionList>(`/lists/${id}`, payload);
  }

  /**
   * Delete a list by numeric ID.
   *
   * @example
   * ```ts
   * const { data, error } = await listmonk.lists.delete(1);
   * ```
   */
  public async delete(id: number): Promise<ListmonkResponse<boolean>> {
    return this.client.delete<boolean>(`/lists/${id}`);
  }
}
