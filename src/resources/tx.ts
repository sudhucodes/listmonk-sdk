import type { HttpClient } from '../client';
import type { ListmonkResponse } from '../types/common';
import type { SendTransactionalOptions, TransactionalResponse } from '../types/tx';

export class Transactional {
  constructor(private readonly client: HttpClient) {}

  /**
   * Send a transactional email using a pre-configured template in Listmonk.
   *
   * @example
   * ```ts
   * // Using shorthand `to`:
   * const { data, error } = await listmonk.tx.send({
   *   to: 'user@example.com',
   *   template_id: 2,
   *   data: {
   *     name: 'Alice',
   *     reset_url: 'https://example.com/reset?token=xyz',
   *   },
   * });
   *
   * // Or with direct Listmonk parameters:
   * const { data, error } = await listmonk.tx.send({
   *   subscriber_email: 'user@example.com',
   *   template_id: 2,
   *   data: { order_id: '12345' },
   *   subscriber_mode: 'fallback',
   * });
   * ```
   */
  public async send(payload: SendTransactionalOptions): Promise<ListmonkResponse<TransactionalResponse>> {
    const body: Record<string, any> = { ...payload };

    // Support ergonomic `to` parameter
    if (payload.to) {
      if (Array.isArray(payload.to)) {
        body.subscriber_emails = payload.to;
      } else {
        body.subscriber_email = payload.to;
      }
      delete body.to;
    }

    const res = await this.client.post<any>('/tx', body);

    if (res.error) {
      return { data: null, error: res.error };
    }

    // Normalise result to TransactionalResponse
    if (typeof res.data === 'boolean') {
      return {
        data: { sent: res.data },
        error: null,
      };
    }

    if (res.data && typeof res.data === 'object') {
      return {
        data: {
          sent: true,
          ...res.data,
        },
        error: null,
      };
    }

    return {
      data: { sent: true },
      error: null,
    };
  }
}
