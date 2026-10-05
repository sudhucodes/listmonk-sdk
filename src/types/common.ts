/**
 * Standard Result pattern response similar to Resend and Supabase SDKs.
 * If successful, `data` contains the requested payload and `error` is null.
 * If an error occurs, `data` is null and `error` contains detailed error metadata.
 */
export type ListmonkResponse<T> =
  | {
      data: T;
      error: null;
    }
  | {
      data: null;
      error: ListmonkError;
    };

export interface ListmonkError {
  name: string;
  message: string;
  statusCode?: number;
  raw?: unknown;
}

export interface PaginationParams {
  page?: number;
  per_page?: number;
  order_by?: string;
  dir?: 'ASC' | 'DESC' | 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  results: T[];
  total: number;
  page: number;
  per_page: number;
}
