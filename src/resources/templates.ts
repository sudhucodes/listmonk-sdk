import type { HttpClient } from '../client';
import type { ListmonkResponse } from '../types/common';
import type {
  CreateTemplateOptions,
  Template,
  UpdateTemplateOptions,
} from '../types/templates';

export class Templates {
  constructor(private readonly client: HttpClient) {}

  /**
   * Retrieve all email templates.
   *
   * @example
   * ```ts
   * const { data, error } = await listmonk.templates.list();
   * ```
   */
  public async list(): Promise<ListmonkResponse<Template[]>> {
    return this.client.get<Template[]>('/templates');
  }

  /**
   * Retrieve a specific template by its numeric ID.
   *
   * @example
   * ```ts
   * const { data, error } = await listmonk.templates.get(1);
   * ```
   */
  public async get(id: number): Promise<ListmonkResponse<Template>> {
    return this.client.get<Template>(`/templates/${id}`);
  }

  /**
   * Create a new template.
   *
   * @example
   * ```ts
   * const { data, error } = await listmonk.templates.create({
   *   name: 'Welcome Email',
   *   type: 'tx',
   *   body: '<h1>Welcome, {{ .Tx.Data.name }}!</h1>',
   * });
   * ```
   */
  public async create(payload: CreateTemplateOptions): Promise<ListmonkResponse<Template>> {
    return this.client.post<Template>('/templates', payload);
  }

  /**
   * Update an existing template.
   *
   * @example
   * ```ts
   * const { data, error } = await listmonk.templates.update(1, {
   *   body: '<h1>Updated Welcome!</h1>',
   * });
   * ```
   */
  public async update(id: number, payload: UpdateTemplateOptions): Promise<ListmonkResponse<Template>> {
    return this.client.put<Template>(`/templates/${id}`, payload);
  }

  /**
   * Delete a template by numeric ID.
   *
   * @example
   * ```ts
   * const { data, error } = await listmonk.templates.delete(1);
   * ```
   */
  public async delete(id: number): Promise<ListmonkResponse<boolean>> {
    return this.client.delete<boolean>(`/templates/${id}`);
  }

  /**
   * Preview a template's rendered output.
   *
   * @example
   * ```ts
   * const { data, error } = await listmonk.templates.preview(1);
   * ```
   */
  public async preview(id: number): Promise<ListmonkResponse<string>> {
    return this.client.get<string>(`/templates/${id}/preview`);
  }
}
