import type { HttpClient } from '../client';
import type { ListmonkResponse } from '../types/common';
import type {
    CreateSubscriberOptions,
    ListSubscribersParams,
    PublicSubscriptionOptions,
    SubscribeOptions,
    Subscriber,
    SubscribersListResult,
    UpdateSubscriberOptions,
} from '../types/subscribers';

export class Subscribers {
    constructor(private readonly client: HttpClient) { }

    /**
     * Create a new subscriber with admin privileges.
     *
     * @example
     * ```ts
     * const { data, error } = await listmonk.subscribers.create({
     *   email: 'john@example.com',
     *   name: 'John Doe',
     *   lists: [1],
     *   attribs: { city: 'San Francisco' },
     *   status: 'enabled',
     * });
     * ```
     */
    public async create(payload: CreateSubscriberOptions): Promise<ListmonkResponse<Subscriber>> {
        return this.client.post<Subscriber>('/subscribers', {
            status: payload.status ?? 'enabled',
            preconfirm_subscriptions: payload.preconfirm_subscriptions ?? true,
            ...payload,
        });
    }

    /**
     * Subscribe an email address to one or more lists.
     *
     * If `list_uuids` are provided, it uses the public subscription endpoint (/api/public/subscription).
     * If numerical `lists` are provided, it uses the administrative subscriber creation endpoint (/api/subscribers).
     *
     * @example
     * ```tsp
     * const { data, error } = await listmonk.subscribers.subscribe({
     *   email: 'john@example.com',
     *   name: 'John Doe',
     *   lists: [1],
     * });
     * ```
     */
    public async subscribe(payload: SubscribeOptions): Promise<ListmonkResponse<Subscriber | boolean>> {
        if (payload.list_uuids && payload.list_uuids.length > 0) {
            const publicPayload: PublicSubscriptionOptions = {
                email: payload.email,
                name: payload.name,
                list_uuids: payload.list_uuids,
                attribs: payload.attribs,
                confirm: payload.confirm,
            };
            return this.client.post<boolean>('/public/subscription', publicPayload);
        }

        return this.create({
            email: payload.email,
            name: payload.name,
            status: payload.status ?? 'enabled',
            lists: payload.lists,
            attribs: payload.attribs,
            preconfirm_subscriptions: payload.preconfirm_subscriptions ?? true,
        });
    }

    /**
     * Retrieve a subscriber by their numeric ID.
     *
     * @example
     * ```ts
     * const { data, error } = await listmonk.subscribers.get(42);
     * ```
     */
    public async get(id: number): Promise<ListmonkResponse<Subscriber>> {
        return this.client.get<Subscriber>(`/subscribers/${id}`);
    }

    /**
     * Retrieve a subscriber by their email address.
     *
     * @param email The email address of the subscriber to retrieve.
     * @returns A promise resolving to the subscriber data or an error.
     */

    public async getByEmail(email: string): Promise<ListmonkResponse<SubscribersListResult>> {
        return this.list({
            query: `subscribers.email = '${email.replace(/'/g, "''")}'`,
            page: 1,
            per_page: 1,
        });
    }

    /**
     * List or search subscribers with pagination and query filtering.
     *
     * @example
     * ```ts
     * const { data, error } = await listmonk.subscribers.list({
     *   page: 1,
     *   per_page: 20,
     *   query: 'subscribers.email LIKE "%@example.com"',
     * });
     * ```
     */
    public async list(params: ListSubscribersParams = {}): Promise<ListmonkResponse<SubscribersListResult>> {
        return this.client.get<SubscribersListResult>('/subscribers', {
            page: params.page,
            per_page: params.per_page,
            query: params.query,
            order_by: params.order_by,
            dir: params.dir,
            list_id: params.list_id,
        });
    }

    /**
     * Update an existing subscriber.
     *
     * @example
     * ```ts
     * const { data, error } = await listmonk.subscribers.update(42, {
     *   name: 'Johnathan Doe',
     *   lists: [1, 2],
     * });
     * ```
     */
    public async update(id: number, payload: UpdateSubscriberOptions): Promise<ListmonkResponse<Subscriber>> {
        return this.client.put<Subscriber>(`/subscribers/${id}`, payload);
    }

    /**
     * Delete a subscriber by their numeric ID.
     *
     * @example
     * ```ts
     * const { data, error } = await listmonk.subscribers.delete(42);
     * ```
     */
    public async delete(id: number): Promise<ListmonkResponse<boolean>> {
        return this.client.delete<boolean>(`/subscribers/${id}`);
    }

    /**
     * Blocklist a subscriber by ID.
     *
     * @example
     * ```ts
     * const { data, error } = await listmonk.subscribers.blocklist(42);
     * ```
     */
    public async blocklist(id: number): Promise<ListmonkResponse<Subscriber>> {
        return this.update(id, { status: 'blocklisted' });
    }
}
