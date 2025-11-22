# Instantly.ai <-> Attio Bi-Directional Sync Middleware

A Node.js middleware that syncs data between Instantly.ai (cold email) and Attio (CRM) in real-time via webhooks.

## Features

- **Instantly → Attio**: Sync email events (opens, clicks, replies, bounces, etc.)
- **Attio → Instantly**: Sync lead status changes back to campaigns
- Auto-create/update contacts in Attio
- Create follow-up tasks for interested leads
- Activity logging as notes in Attio

## Quick Start

### 1. Install Dependencies

```bash
cd instantly-attio-sync
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your API keys:

```env
# Instantly.ai - Get from Settings > Integrations > API
INSTANTLY_API_KEY=your_instantly_api_key

# Attio - Get from Settings > Developers > API Keys
ATTIO_API_KEY=your_attio_api_key

PORT=3001
```

### 3. Start the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

### 4. Expose to Internet (for webhooks)

Use ngrok for local development:

```bash
ngrok http 3001
```

You'll get a URL like: `https://abc123.ngrok.io`

### 5. Configure Webhooks

#### In Instantly.ai:

1. Go to **Settings** → **Integrations** → **Webhooks**
2. Click **Add Webhook**
3. URL: `https://your-server.com/webhook/instantly`
4. Select events: `all_events` (or specific ones)
5. Select campaign (or all campaigns)

#### In Attio:

Option A - Via API (recommended):
```bash
curl -X POST http://localhost:3001/setup/attio-webhook \
  -H "Content-Type: application/json" \
  -d '{"publicUrl": "https://your-server.com"}'
```

Option B - Via Attio Dashboard:
1. Go to **Settings** → **Developers** → **Webhooks**
2. Add webhook URL: `https://your-server.com/webhook/attio`
3. Subscribe to: `record.created`, `record.updated`, `record.deleted`

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/config` | GET | View configuration (no secrets) |
| `/webhook/instantly` | POST | Receive Instantly events |
| `/webhook/attio` | POST | Receive Attio events |
| `/sync/lead` | POST | Manually sync a lead |
| `/test/instantly` | POST | Test with simulated event |
| `/setup/attio-webhook` | POST | Register Attio webhook |

## Event Mappings

### Instantly → Attio Status

| Instantly Event | Attio Status |
|-----------------|--------------|
| `email_sent` | Contacted |
| `email_opened` | Engaged |
| `reply_received` | Replied |
| `lead_interested` | Interested |
| `lead_not_interested` | Not Interested |
| `lead_meeting_booked` | Meeting Scheduled |
| `email_bounced` | Bounced |
| `lead_unsubscribed` | Unsubscribed |

### Attio → Instantly Status

| Attio Status | Instantly Status |
|--------------|------------------|
| Interested | Interested |
| Not Interested | Not Interested |
| Meeting Scheduled | Meeting Booked |
| Closed Won | Closed |
| Closed Lost | Not Interested |

## Attio Custom Attributes

For full functionality, create these custom attributes in Attio:

1. **instantly_status** (Text) - Current Instantly status
2. **campaign_name** (Text) - Active campaign name
3. **last_instantly_event** (Date) - Last event timestamp

To create in Attio:
1. Go to **People** → **Customize**
2. Add custom attributes

## Testing

### Test Instantly Webhook Locally

```bash
curl -X POST http://localhost:3001/test/instantly \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "reply_received",
    "email": "attorney@lawfirm.com",
    "campaign": "Trust Attorney Outreach"
  }'
```

### Manual Sync a Lead

```bash
# Sync lead from Instantly to Attio
curl -X POST http://localhost:3001/sync/lead \
  -H "Content-Type: application/json" \
  -d '{
    "email": "attorney@lawfirm.com",
    "direction": "attio"
  }'
```

## Deployment

### Railway

1. Push to GitHub
2. Connect repo to Railway
3. Add environment variables
4. Deploy

### Render

1. Create Web Service
2. Connect repo
3. Set environment variables
4. Build command: `npm install`
5. Start command: `npm start`

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## Troubleshooting

### Webhook not receiving events

1. Check server is running: `curl http://localhost:3001/health`
2. Verify ngrok is active and URL matches webhook config
3. Check Instantly webhook is enabled and correct campaign selected

### Attio API errors

1. Verify API key has correct permissions
2. Check custom attributes exist in your Attio workspace
3. Look at server logs for detailed error messages

### Events not syncing

1. Check `SYNC_ENABLED=true` in .env
2. Verify field mappings in `config.js`
3. Review server console for processing logs

## License

MIT
