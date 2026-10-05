# listmonk-sdk

A lightweight, fully type-safe TypeScript SDK for [Listmonk](https://listmonk.app) featuring a modern, Resend-inspired `{ data, error }` ergonomic API. Zero external runtime dependencies. Works with Node.js (18+), Bun, Deno, Next.js, Cloudflare Workers, and edge runtimes.

---

## Features

- **Resend-style API**: Methods return `{ data, error }` promises so you never have to wrap calls in verbose `try/catch` blocks.
- **Top 5 Essential Resources**:
  - **Subscribers**: create, subscribe, search, get, update, delete, blocklist
  - **Campaigns**: create, start, pause, cancel, preview, test
  - **Transactional (`tx`)**: send template-based emails with shorthand `to` parameter
  - **Lists**: create, list, inspect, and manage mailing lists
  - **Templates**: list, retrieve, and preview campaign/transactional templates
- **Ergonomic Aliases**: Flexible naming like `listmonk.subscriber.subscribe`, `listmonk.campaigns.create` (or `listmonk.campan.create`), `listmonk.tx.send`.
- **Zero Runtime Dependencies**: Uses native `fetch` and built-in runtimes.
- **Dual Package**: Full CommonJS and ESM support with auto-generated TypeScript declarations (`.d.ts`).

---

## Installation

```bash
npm install listmonk-sdk
# or
pnpm add listmonk-sdk
# or
yarn add listmonk-sdk
# or
bun add listmonk-sdk
```

---

## Quickstart

```typescript
import { Listmonk } from 'listmonk-sdk';

// Initialize the client
const listmonk = new Listmonk({
  url: 'http://localhost:9000', // Or your self-hosted domain
  username: 'admin',
  key: 'my_api_key_or_password',
});

// 1. Subscribe or create a subscriber
const { data: subscriber, error: subError } = await listmonk.subscriber.subscribe({
  email: 'alex@example.com',
  name: 'Alex Smith',
  lists: [1], // Target list ID(s)
  attribs: { city: 'Bengaluru', signup_source: 'website' },
});

if (subError) {
  console.error('Failed to subscribe:', subError.message);
} else {
  console.log('Subscribed with ID:', subscriber?.id);
}
```

You can also use environment variables:
```bash
LISTMONK_URL=http://localhost:9000
LISTMONK_USERNAME=admin
LISTMONK_API_KEY=your_token
```

```typescript
// Reads LISTMONK_URL, LISTMONK_USERNAME, and LISTMONK_API_KEY automatically
const listmonk = new Listmonk();
```

---

## Usage Guide

### 1. Subscribers (`listmonk.subscribers` / `listmonk.subscriber`)

#### Create a subscriber:
```typescript
const { data, error } = await listmonk.subscribers.create({
  email: 'john@example.com',
  name: 'John Doe',
  status: 'enabled',
  lists: [1],
  attribs: { plan: 'pro' },
  preconfirm_subscriptions: true,
});
```

#### High-level Subscribe:
```typescript
// Administrative subscribe
const { data, error } = await listmonk.subscriber.subscribe({
  email: 'jane@example.com',
  name: 'Jane Doe',
  lists: [1, 2],
});

// Or public subscription via UUIDs
const { data, error } = await listmonk.subscriber.subscribe({
  email: 'jane@example.com',
  list_uuids: ['091c5324-bca8-4775-8120-eef41f9a150c'],
});
```

#### Get, List, and Delete:
```typescript
// Get by ID
const { data: subscriber } = await listmonk.subscribers.get(42);

// Query with pagination
const { data: result } = await listmonk.subscribers.list({
  page: 1,
  per_page: 25,
  query: "subscribers.attribs->>'plan' = 'pro'",
});

// Delete
const { data: ok } = await listmonk.subscribers.delete(42);
```

---

### 2. Campaigns (`listmonk.campaigns` / `listmonk.campaign` / `listmonk.campan`)

#### Create a campaign:
```typescript
const { data: campaign, error } = await listmonk.campaigns.create({
  name: 'Product Launch Announcement',
  subject: '🚀 Introducing our new product line!',
  lists: [1],
  body: '<h1>Welcome!</h1><p>We are excited to share our latest release with you.</p>',
  content_type: 'html', // 'html' | 'markdown' | 'richtext' | 'plain'
});
```

#### Manage Campaign Lifecycle:
```typescript
const campaignId = campaign.id;

// Start sending
await listmonk.campaigns.start(campaignId);

// Pause campaign
await listmonk.campaigns.pause(campaignId);

// Cancel campaign
await listmonk.campaigns.cancel(campaignId);

// Preview rendered HTML
const { data: html } = await listmonk.campaigns.preview(campaignId);

// Send a test email
await listmonk.campaigns.test({
  id: campaignId,
  emails: ['tester@example.com'],
});
```

---

### 3. Transactional Emails (`listmonk.tx` / `listmonk.transactional`)

Send instant trigger-based emails (password resets, OTPs, receipts) through pre-configured Listmonk templates:

```typescript
const { data, error } = await listmonk.tx.send({
  to: 'customer@example.com', // Ergonomic shorthand for subscriber_email
  template_id: 3,
  data: {
    name: 'Customer',
    reset_link: 'https://example.com/reset?token=abc',
    code: '948201',
  },
  // Allows sending to non-existing subscribers if configured
  subscriber_mode: 'fallback',
});

if (error) {
  console.error('Transactional send failed:', error.message);
} else {
  console.log('Transactional email sent successfully!');
}
```

---

### 4. Lists (`listmonk.lists` / `listmonk.list`)

```typescript
// Create list
const { data: newList } = await listmonk.lists.create({
  name: 'Weekly Digest',
  type: 'public', // 'public' | 'private'
  optin: 'single', // 'single' | 'double'
  tags: ['weekly', 'tech'],
});

// Fetch all lists
const { data: allLists } = await listmonk.lists.list({
  page: 1,
  per_page: 50,
});

// Get specific list
const { data: list } = await listmonk.lists.get(newList.id);
```

---

### 5. Templates (`listmonk.templates` / `listmonk.template`)

```typescript
// List all templates
const { data: templates } = await listmonk.templates.list();

// Get specific template
const { data: template } = await listmonk.templates.get(1);

// Preview a template
const { data: previewHtml } = await listmonk.templates.preview(1);
```

---

### 6. System & Health

```typescript
const { data: about } = await listmonk.about();
console.log('Listmonk version:', about?.version);

const { data: health } = await listmonk.health();
console.log('Listmonk healthy:', health?.healthy);
```

---

## Error Handling

Like the Resend SDK, methods never throw on typical HTTP or API errors. Every call returns `{ data, error }`:

```typescript
const { data, error } = await listmonk.subscribers.create({
  email: 'invalid-email',
});

if (error) {
  console.log(error.name);       // e.g. "ListmonkError" or "NetworkError"
  console.log(error.message);    // e.g. "invalid email format"
  console.log(error.statusCode); // e.g. 400
  return;
}

// `data` is fully typed here!
console.log(data.id);
```

---

## Configuration Options

```typescript
interface ListmonkOptions {
  url?: string;             // Base URL (defaults to process.env.LISTMONK_URL or http://localhost:9000)
  endpoint?: string;        // Alias for url
  username?: string;        // Admin/API username (defaults to process.env.LISTMONK_USERNAME or 'admin')
  key?: string;             // API key, password or token (defaults to process.env.LISTMONK_API_KEY)
  apiKey?: string;          // Alias for key
  password?: string;        // Alias for key
  timeout?: number;         // Request timeout in ms (default: 30000)
  fetch?: typeof fetch;     // Custom fetch implementation
  headers?: Record<string, string>; // Extra headers sent with all requests
}
```

---

## License

MIT
