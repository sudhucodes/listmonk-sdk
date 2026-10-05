import { HttpClient, type ListmonkOptions } from "./client";
import { Campaigns } from "./resources/campaigns";
import { Lists } from "./resources/lists";
import { Subscribers } from "./resources/subscribers";
import { Templates } from "./resources/templates";
import { Transactional } from "./resources/tx";
import type { ListmonkResponse } from "./types/common";

/**
 * ListMonk SDK client.
 *
 * @example
 * ```ts
 * import { ListMonk } from 'listmonk-sdk';
 *
 * const listmonk = new ListMonk({
 *   url: 'http://localhost:9000',
 *   username: 'admin',
 *   key: 'my_api_key_or_password',
 * });
 *
 * // Create a subscriber (Resend-like { data, error } syntax)
 * const { data, error } = await listmonk.subscribers.create({
 *   email: 'alex@example.com',
 *   name: 'Alex Smith',
 *   lists: [1],
 * });
 *
 * if (error) {
 *   console.error('Failed to create subscriber:', error.message);
 * } else {
 *   console.log('Subscriber created:', data.id);
 * }
 * ```
 */
export class ListMonk {
    private readonly client: HttpClient;

    /** Manage subscribers and list subscriptions */
    public readonly subscribers: Subscribers;

    /** Manage campaigns (creation, scheduling, previews, stats) */
    public readonly campaigns: Campaigns;

    /** Send transactional emails using templates */
    public readonly tx: Transactional;

    /** Manage mailing lists */
    public readonly lists: Lists;

    /** Manage email templates */
    public readonly templates: Templates;

    constructor(options: ListmonkOptions = {}) {
        this.client = new HttpClient(options);

        this.subscribers = new Subscribers(this.client);

        this.campaigns = new Campaigns(this.client);

        this.tx = new Transactional(this.client);

        this.lists = new Lists(this.client);

        this.templates = new Templates(this.client);
    }

    /**
     * Get ListMonk instance system info and version.
     * Calls GET /api/about
     */
    public async about(): Promise<ListmonkResponse<Record<string, any>>> {
        return this.client.get("/about");
    }

    /**
     * Check ListMonk system health.
     * Calls GET /api/health
     */
    public async health(): Promise<ListmonkResponse<Record<string, any>>> {
        return this.client.get("/health");
    }
}

// Re-export all types and client
export * from "./client";
export { Campaigns } from "./resources/campaigns";
export { Lists } from "./resources/lists";
export { Subscribers } from "./resources/subscribers";
export { Templates } from "./resources/templates";
export { Transactional } from "./resources/tx";
export * from "./types/campaigns";
export * from "./types/common";
export * from "./types/lists";
export * from "./types/subscribers";
export * from "./types/templates";
export * from "./types/tx";

export default ListMonk;
