export type TransactionalFormat = 'html' | 'markdown' | 'plain';
export type SubscriberMode = 'default' | 'fallback' | 'external';

export interface SendTransactionalOptions {
  /** Ergonomic recipient email or list of emails (convenient shorthand) */
  to?: string | string[];

  /** Recipient email address */
  subscriber_email?: string;

  /** Recipient subscriber ID */
  subscriber_id?: number;

  /** Multiple recipient email addresses */
  subscriber_emails?: string[];

  /** Multiple recipient subscriber IDs */
  subscriber_ids?: number[];

  /** Transactional template ID configured in Listmonk */
  template_id: number;

  /** Dynamic template data accessible in Listmonk template via {{ .Tx.Data.* }} */
  data?: Record<string, any>;

  /** Custom sender email address */
  from_email?: string;

  /** Messenger to use, defaults to 'email' */
  messenger?: string;

  /** Optional custom headers */
  headers?: Array<Record<string, string>>;

  /** Format for alternate body: 'html', 'markdown', or 'plain' */
  format?: TransactionalFormat;

  /** Optional alternate body text */
  body?: string;

  /** Subscriber resolution mode: 'default' | 'fallback' | 'external' */
  subscriber_mode?: SubscriberMode;

  /** Optional attachments (file paths or buffers) */
  attachments?: Array<{
    name: string;
    content: string | Blob;
    contentType?: string;
  }>;
}

export interface TransactionalResponse {
  sent: boolean;
  message?: string;
  [key: string]: any;
}
