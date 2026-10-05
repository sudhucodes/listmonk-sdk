import type { HttpClient } from '../client';
import type {
  Campaign,
  CampaignsListResult,
  CampaignStatus,
  CreateCampaignOptions,
  ListCampaignsParams,
  TestCampaignOptions,
  UpdateCampaignOptions,
} from '../types/campaigns';
import type { ListmonkResponse } from '../types/common';

export class Campaigns {
  constructor(private readonly client: HttpClient) {}

  /**
   * Create a new campaign.
   *
   * @example
   * ```ts
   * const { data, error } = await listmonk.campaigns.create({
   *   name: 'Monthly Newsletter',
   *   subject: 'September Updates!',
   *   lists: [1],
   *   body: '<p>Check out our latest release!</p>',
   *   content_type: 'html',
   * });
   * ```
   */
  public async create(payload: CreateCampaignOptions): Promise<ListmonkResponse<Campaign>> {
    const formattedSendAt =
      payload.send_at instanceof Date ? payload.send_at.toISOString() : payload.send_at;

    return this.client.post<Campaign>('/campaigns', {
      type: payload.type ?? 'regular',
      content_type: payload.content_type ?? 'richtext',
      messenger: payload.messenger ?? 'email',
      ...payload,
      send_at: formattedSendAt,
    });
  }

  /**
   * Retrieve a campaign by ID.
   *
   * @example
   * ```ts
   * const { data, error } = await listmonk.campaigns.get(1);
   * ```
   */
  public async get(id: number): Promise<ListmonkResponse<Campaign>> {
    return this.client.get<Campaign>(`/campaigns/${id}`);
  }

  /**
   * List or search campaigns with pagination.
   *
   * @example
   * ```ts
   * const { data, error } = await listmonk.campaigns.list({
   *   status: 'running',
   *   page: 1,
   *   per_page: 10,
   * });
   * ```
   */
  public async list(params: ListCampaignsParams = {}): Promise<ListmonkResponse<CampaignsListResult>> {
    return this.client.get<CampaignsListResult>('/campaigns', {
      page: params.page,
      per_page: params.per_page,
      query: params.query,
      status: params.status,
      order_by: params.order_by,
      dir: params.dir,
    });
  }

  /**
   * Update an existing campaign.
   *
   * @example
   * ```ts
   * const { data, error } = await listmonk.campaigns.update(1, {
   *   subject: 'Updated Subject Line',
   * });
   * ```
   */
  public async update(id: number, payload: UpdateCampaignOptions): Promise<ListmonkResponse<Campaign>> {
    const formattedSendAt =
      payload.send_at instanceof Date ? payload.send_at.toISOString() : payload.send_at;

    return this.client.put<Campaign>(`/campaigns/${id}`, {
      ...payload,
      send_at: formattedSendAt,
    });
  }

  /**
   * Change campaign status ('scheduled', 'running', 'paused', 'cancelled').
   *
   * @example
   * ```ts
   * const { data, error } = await listmonk.campaigns.changeStatus(1, 'running');
   * ```
   */
  public async changeStatus(id: number, status: CampaignStatus): Promise<ListmonkResponse<Campaign>> {
    return this.client.put<Campaign>(`/campaigns/${id}/status`, { status });
  }

  /**
   * Start a campaign (set status to 'running').
   *
   * @example
   * ```ts
   * const { data, error } = await listmonk.campaigns.start(1);
   * ```
   */
  public async start(id: number): Promise<ListmonkResponse<Campaign>> {
    return this.changeStatus(id, 'running');
  }

  /**
   * Pause an active campaign (set status to 'paused').
   *
   * @example
   * ```ts
   * const { data, error } = await listmonk.campaigns.pause(1);
   * ```
   */
  public async pause(id: number): Promise<ListmonkResponse<Campaign>> {
    return this.changeStatus(id, 'paused');
  }

  /**
   * Cancel a campaign (set status to 'cancelled').
   *
   * @example
   * ```ts
   * const { data, error } = await listmonk.campaigns.cancel(1);
   * ```
   */
  public async cancel(id: number): Promise<ListmonkResponse<Campaign>> {
    return this.changeStatus(id, 'cancelled');
  }

  /**
   * Delete a campaign by ID.
   *
   * @example
   * ```ts
   * const { data, error } = await listmonk.campaigns.delete(1);
   * ```
   */
  public async delete(id: number): Promise<ListmonkResponse<boolean>> {
    return this.client.delete<boolean>(`/campaigns/${id}`);
  }

  /**
   * Preview a campaign's rendered HTML.
   *
   * @example
   * ```ts
   * const { data: html, error } = await listmonk.campaigns.preview(1);
   * ```
   */
  public async preview(id: number): Promise<ListmonkResponse<string>> {
    return this.client.get<string>(`/campaigns/${id}/preview`);
  }

  /**
   * Send a test email for this campaign.
   *
   * @example
   * ```ts
   * const { data, error } = await listmonk.campaigns.test({
   *   id: 1,
   *   emails: ['test@example.com'],
   * });
   * ```
   */
  public async test(options: TestCampaignOptions): Promise<ListmonkResponse<boolean>> {
    return this.client.post<boolean>(`/campaigns/${options.id}/test`, {
      subscribers: options.subscribers,
      emails: options.emails,
    });
  }
}
