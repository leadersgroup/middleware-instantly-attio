# HubSpot Webhook Setup Guide

Follow these steps to manually register the webhook in HubSpot for lifecycle stage change notifications.

## Prerequisites

- Your middleware server is running (default: `http://localhost:3001`)
- Your server is publicly accessible with HTTPS (for production) or a tunneling service like ngrok (for local testing)
- HubSpot Admin access

## Step 1: Get Your Webhook URL

Your webhook endpoint is: **`https://www.50deeds.com/hbwebhook_lifecyclechange`**

(Already created and configured)

## Step 2: Log Into HubSpot Developer Portal

1. Go to [HubSpot Developer Portal](https://app.hubspot.com/l/developers)
2. Select your app/account
3. Click on **"App Info"** in the left sidebar

## Step 3: Register Webhook Endpoint

1. In the left sidebar, click **"Webhooks"**
2. Under **"Webhook Settings"**, enter your webhook URL in the **"Webhook target URL"** field:
   - Enter: `https://www.50deeds.com/hbwebhook_lifecyclechange`
3. Click **"Save"** button
4. HubSpot will send a test request to verify the endpoint is reachable

## Step 4: Subscribe to Lifecycle Stage Changes

1. Still in the **"Webhooks"** section, look for **"Subscriptions"**
2. Click **"Create subscription"** button
3. Configure the subscription:

### Subscription Details

- **Event Type**: Select `contact.propertyChange`
- **Property**: Enter `lifecyclestage`
- **Subscription URL**: Should auto-populate with your webhook URL

4. Click **"Create"** button

## Step 5: Verify Webhook is Active

1. Go back to the Webhooks section
2. You should see your subscription listed under "Subscriptions"
3. Status should show as **"Active"**

## Step 6: Test the Webhook

You can test the webhook by manually changing a contact's lifecycle stage in HubSpot:

1. Go to **Contacts** in your HubSpot portal
2. Open any contact
3. Change the **Lifecycle stage** property to `trial`
4. Save the contact

Your middleware should receive the webhook and:
1. Detect the lifecycle stage change to `trial`
2. Retrieve the contact's details
3. Submit the contact to the trial form
4. This triggers the HubSpot automation to enroll in the trial sequence

## Step 7: Monitor Webhook Activity

You can view webhook logs in HubSpot to confirm events are being sent:

1. Go to **Webhooks** → **Logs** (if available in your HubSpot version)
2. Check for recent webhook deliveries
3. View request/response details for debugging

## Webhook Event Payload

When a contact's lifecycle stage changes, HubSpot sends a POST request with this structure:

```json
[
  {
    "objectId": "12345",
    "changeSource": "CRM_UI",
    "changes": [
      {
        "propertyName": "lifecyclestage",
        "oldValue": "lead",
        "newValue": "trial"
      }
    ]
  }
]
```

Your middleware's `handleHubSpotWebhook()` method processes this and automatically submits to the trial form.

## Troubleshooting

### Webhook Not Triggering
- Verify the webhook URL is correct and publicly accessible
- Check HubSpot webhook logs for delivery status
- Ensure the `lifecyclestage` property name matches exactly
- Confirm the subscription is marked as "Active"

### Trial Form Submission Failing
- Check server logs for form submission errors
- Verify the form ID is correct: `5099b1d0-f5d2-474f-8fe6-2b390bbf4adb`
- Ensure contact has `firstname`, `lastname`, and `email` fields populated

### Testing Locally with ngrok
- Keep ngrok running while testing
- Each time you restart ngrok, you get a new URL - update HubSpot webhook settings
- Use `ngrok http 3001 --domain=your-static-domain` if you have a paid ngrok account for static URLs

## Alternative: Programmatic Setup

If you prefer to register the webhook programmatically instead of manually, you can call the setup endpoint:

```bash
curl -X POST http://localhost:3001/setup/webhook \
  -H "Content-Type: application/json" \
  -d '{"webhookUrl": "https://www.50deeds.com/hbwebhook_lifecyclechange"}'
```

This will automatically register the webhook via the HubSpot API.

## Related Files

- **Webhook Handler**: `hubspot-sync-handler.js` → `handleHubSpotWebhook()` method
- **Trial Form Submission**: `hubspot-sync-handler.js` → `submitToTrialForm()` method
- **HubSpot Service**: `hubspot-service.js` → webhook management methods
- **Server Endpoint**: `server.js` → `/webhook/hubspot` route
