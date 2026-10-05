import type { ListmonkError, ListmonkResponse } from './types/common';

export interface ListmonkOptions {
  /**
   * Base URL of the Listmonk instance.
   * Examples: 'http://localhost:9000' or 'https://newsletter.mydomain.com'
   * Can also be set via process.env.LISTMONK_URL or process.env.LISTMONK_ENDPOINT.
   */
  url?: string;
  endpoint?: string;
  host?: string;
  baseUrl?: string;

  /**
   * Admin or API username.
   * Can also be set via process.env.LISTMONK_USERNAME.
   * Defaults to 'admin' if not provided.
   */
  username?: string;

  /**
   * API Key, password, or token.
   * Can also be set via process.env.LISTMONK_API_KEY, process.env.LISTMONK_KEY, or process.env.LISTMONK_PASSWORD.
   */
  key?: string;
  apiKey?: string;
  token?: string;
  password?: string;

  /** Custom fetch implementation (defaults to native globalThis.fetch) */
  fetch?: typeof fetch;

  /** Request timeout in milliseconds */
  timeout?: number;

  /** Custom default headers sent with every request */
  headers?: Record<string, string>;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  query?: Record<string, string | number | boolean | Array<string | number> | undefined | null>;
  body?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
}

/**
 * Base64 helper compatible with Node.js, Bun, Deno, and modern browser/edge environments.
 */
function toBase64(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str).toString('base64');
  }
  if (typeof btoa !== 'undefined') {
    return btoa(str);
  }
  throw new Error('No base64 encoding available in current runtime');
}

export class HttpClient {
  public readonly baseUrl: string;
  private readonly authHeader?: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly fetchFn: typeof fetch;
  private readonly defaultTimeout: number;

  constructor(options: ListmonkOptions = {}) {
    // Resolve URL
    const rawUrl =
      options.url ||
      options.endpoint ||
      options.host ||
      options.baseUrl ||
      (typeof process !== 'undefined' ? process.env?.LISTMONK_URL || process.env?.LISTMONK_ENDPOINT : '') ||
      'http://localhost:9000';

    this.baseUrl = rawUrl.replace(/\/+$/, '');

    // Resolve credentials
    const username =
      options.username ||
      (typeof process !== 'undefined' ? process.env?.LISTMONK_USERNAME : '') ||
      'admin';

    const key =
      options.key ||
      options.apiKey ||
      options.token ||
      options.password ||
      (typeof process !== 'undefined'
        ? process.env?.LISTMONK_API_KEY || process.env?.LISTMONK_KEY || process.env?.LISTMONK_PASSWORD
        : '');

    if (username && key) {
      this.authHeader = `Basic ${toBase64(`${username}:${key}`)}`;
    }

    this.fetchFn = options.fetch || globalThis.fetch.bind(globalThis);
    this.defaultTimeout = options.timeout ?? 30000;
    this.defaultHeaders = {
      Accept: 'application/json',
      ...options.headers,
    };
  }

  /**
   * Builds the absolute endpoint URL, ensuring `/api` prefix is correctly handled.
   */
  public buildUrl(
    path: string,
    query?: Record<string, string | number | boolean | Array<string | number> | undefined | null>
  ): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    // If the path does not already include /api and baseUrl does not already include /api
    const apiPath =
      cleanPath.startsWith('/api/') || this.baseUrl.endsWith('/api')
        ? cleanPath
        : `/api${cleanPath}`;

    const url = new URL(`${this.baseUrl}${apiPath}`);

    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v === undefined || v === null) continue;
        if (Array.isArray(v)) {
          for (const item of v) {
            url.searchParams.append(k, String(item));
          }
        } else {
          url.searchParams.set(k, String(v));
        }
      }
    }

    return url.toString();
  }

  /**
   * Main request method returning Resend-style { data, error } results.
   */
  public async request<T>(path: string, options: RequestOptions = {}): Promise<ListmonkResponse<T>> {
    const method = options.method || 'GET';
    const targetUrl = this.buildUrl(path, options.query);

    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...options.headers,
    };

    if (this.authHeader && !headers['Authorization'] && !headers['authorization']) {
      headers['Authorization'] = this.authHeader;
    }

    let bodyData: BodyInit | undefined;
    if (options.body !== undefined) {
      if (typeof options.body === 'string' || options.body instanceof FormData || options.body instanceof Blob) {
        bodyData = options.body as BodyInit;
      } else {
        headers['Content-Type'] = 'application/json';
        bodyData = JSON.stringify(options.body);
      }
    }

    const controller = new AbortController();
    const timeout = options.timeout ?? this.defaultTimeout;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await this.fetchFn(targetUrl, {
        method,
        headers,
        body: bodyData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle 204 No Content
      if (response.status === 204) {
        return { data: true as unknown as T, error: null };
      }

      // Try reading response text
      const text = await response.text();
      let json: any = null;
      if (text) {
        try {
          json = JSON.parse(text);
        } catch {
          json = null;
        }
      }

      if (!response.ok) {
        const errorMessage =
          (json && (json.message || json.data || json.error)) ||
          text ||
          response.statusText ||
          `Request failed with status ${response.status}`;

        return {
          data: null,
          error: {
            name: 'ListmonkError',
            message: String(errorMessage),
            statusCode: response.status,
            raw: json ?? text,
          },
        };
      }

      // Listmonk wraps successful API payloads in { "data": ... }
      const payload: T = json && typeof json === 'object' && 'data' in json ? json.data : (json as T);

      return {
        data: payload,
        error: null,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);

      const isAbort = err?.name === 'AbortError' || controller.signal.aborted;
      const error: ListmonkError = {
        name: isAbort ? 'TimeoutError' : 'NetworkError',
        message: isAbort ? `Request timed out after ${timeout}ms` : err?.message || 'Network request failed',
        raw: err,
      };

      return {
        data: null,
        error,
      };
    }
  }

  public get<T>(path: string, query?: RequestOptions['query']): Promise<ListmonkResponse<T>> {
    return this.request<T>(path, { method: 'GET', query });
  }

  public post<T>(path: string, body?: unknown, query?: RequestOptions['query']): Promise<ListmonkResponse<T>> {
    return this.request<T>(path, { method: 'POST', body, query });
  }

  public put<T>(path: string, body?: unknown, query?: RequestOptions['query']): Promise<ListmonkResponse<T>> {
    return this.request<T>(path, { method: 'PUT', body, query });
  }

  public delete<T>(path: string, query?: RequestOptions['query']): Promise<ListmonkResponse<T>> {
    return this.request<T>(path, { method: 'DELETE', query });
  }
}
