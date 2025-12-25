const express = require('express');
const crypto = require('crypto');
const config = require('./config');
const hubspotSyncHandler = require('./hubspot-sync-handler');

const app = express();

// Parse JSON bodies
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'instantly-hubspot-sync',
    timestamp: new Date().toISOString(),
    sync_enabled: config.sync.enabled,
    integrations: {
      hubspot: !!config.hubspot.apiKey,
      instantly: !!config.instantly.apiKey,
    },
  });
});

/**
 * Webhook endpoint for HubSpot lifecycle stage changes
 * Register this URL in HubSpot Developer Portal: https://middleware-instantly-attio-production.up.railway.app/webhook/hb-lifecycle-change
 */
app.post('/webhook/hb-lifecycle-change', async (req, res) => {
  console.log('\n========================================');
  console.log('HUBSPOT WEBHOOK RECEIVED');
  console.log('========================================');

  try {
    // Verify webhook signature if configured
    if (config.hubspot.webhookSecret) {
      const signature = req.headers['x-hubspot-signature-v3'];
      if (signature) {
        // HubSpot v3 signature verification
        const requestBody = JSON.stringify(req.body);
        const timestamp = req.headers['x-hubspot-request-timestamp'];
        const uri = `https://${req.headers.host}${req.originalUrl}`;
        const sourceString = `${req.method}${uri}${requestBody}${timestamp}`;

        const expectedSignature = crypto
          .createHmac('sha256', config.hubspot.webhookSecret)
          .update(sourceString)
          .digest('base64');

        if (signature !== expectedSignature) {
          console.log('Invalid HubSpot webhook signature');
          return res.status(401).json({ error: 'Invalid signature' });
        }
      }
    }

    const event = req.body;
    console.log('Payload:', JSON.stringify(event, null, 2));

    if (!config.sync.enabled) {
      console.log('Sync disabled, skipping');
      return res.json({ received: true, synced: false, reason: 'Sync disabled' });
    }

    // Process the webhook payload
    const result = await hubspotSyncHandler.handleHubSpotWebhook(event);

    res.json({
      received: true,
      ...result,
    });
  } catch (error) {
    console.error('Error processing HubSpot webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Webhook endpoint for Instantly -> HubSpot sync
 * Configure this URL in Instantly: https://your-server.com/webhook/instantly-hubspot
 */
app.post('/webhook/instantly-hubspot', async (req, res) => {
  console.log('\n========================================');
  console.log('INSTANTLY WEBHOOK RECEIVED');
  console.log('========================================');

  try {
    // Verify webhook signature if configured
    if (config.instantly.webhookSecret) {
      const signature = req.headers['x-instantly-signature'];
      if (signature) {
        const expectedSignature = crypto
          .createHmac('sha256', config.instantly.webhookSecret)
          .update(JSON.stringify(req.body))
          .digest('hex');

        if (signature !== expectedSignature) {
          console.log('Invalid Instantly webhook signature');
          return res.status(401).json({ error: 'Invalid signature' });
        }
      }
    }

    const event = req.body;
    console.log('Event Type:', event.event_type);
    console.log('Payload:', JSON.stringify(event, null, 2));

    if (!config.sync.enabled) {
      console.log('Sync disabled, skipping');
      return res.json({ received: true, synced: false, reason: 'Sync disabled' });
    }

    // Process the event - sync to HubSpot
    const result = await hubspotSyncHandler.handleInstantlyEvent(event);

    res.json({
      received: true,
      ...result,
    });
  } catch (error) {
    console.error('Error processing Instantly webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Manual trigger endpoint - sync a specific lead to HubSpot
 */
app.post('/sync/lead', async (req, res) => {
  const { email, first_name, last_name, campaign_name } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const result = await hubspotSyncHandler.handleInstantlyEvent({
      event_type: 'manual_sync',
      lead_email: email,
      first_name: first_name || '',
      last_name: last_name || '',
      campaign_name: campaign_name || 'Manual Sync',
      timestamp: new Date().toISOString(),
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * List all configured settings (for debugging)
 */
app.get('/config', (req, res) => {
  res.json({
    instantly: {
      apiUrl: config.instantly.apiUrl,
      hasApiKey: !!config.instantly.apiKey,
      hasWebhookSecret: !!config.instantly.webhookSecret,
    },
    hubspot: {
      apiUrl: config.hubspot.apiUrl,
      hasApiKey: !!config.hubspot.apiKey,
      hasWebhookSecret: !!config.hubspot.webhookSecret,
    },
    sync: config.sync,
    fieldMappings: config.fieldMappings,
  });
});

/**
 * Setup endpoint - Register HubSpot webhook subscription
 */
app.post('/setup/webhook', async (req, res) => {
  try {
    const { webhookUrl } = req.body;

    if (!webhookUrl) {
      return res.status(400).json({ error: 'webhookUrl is required' });
    }

    console.log('\n[SETUP] Registering HubSpot webhook subscription');
    const hubspotService = require('./hubspot-service');
    const result = await hubspotService.registerWebhookSubscription(webhookUrl);

    res.json({
      success: true,
      message: 'HubSpot webhook subscription registered successfully',
      details: result,
    });
  } catch (error) {
    console.error('Error registering webhook:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Test endpoint - simulate Instantly event
 */
app.post('/test/instantly', async (req, res) => {
  const testEvent = {
    event_type: req.body.event_type || 'email_sent',
    lead_email: req.body.email || 'test@example.com',
    first_name: req.body.first_name || 'Test',
    last_name: req.body.last_name || 'User',
    campaign_name: req.body.campaign || 'Test Campaign',
    campaign_id: 'test-campaign-id',
    timestamp: new Date().toISOString(),
    workspace: 'test-workspace',
  };

  console.log('\n[TEST] Simulating Instantly event:', testEvent);
  const result = await hubspotSyncHandler.handleInstantlyEvent(testEvent);
  res.json(result);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('INSTANTLY <-> HUBSPOT SYNC MIDDLEWARE');
  console.log('========================================');
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${config.server.env}`);
  console.log(`Sync enabled: ${config.sync.enabled}`);
  console.log('');
  console.log('Integrations:');
  console.log(`  HubSpot:   ${config.hubspot.apiKey ? 'Configured' : 'Not configured'}`);
  console.log(`  Instantly: ${config.instantly.apiKey ? 'Configured' : 'Not configured'}`);
  console.log('');
  console.log('Webhook endpoints:');
  console.log(`  Instantly -> HubSpot: POST /webhook/instantly-hubspot`);
  console.log(`  HubSpot Lifecycle:    POST /webhook/hb-lifecycle-change`);
  console.log('');
  console.log('Utility endpoints:');
  console.log(`  Health:       GET  /health`);
  console.log(`  Config:       GET  /config`);
  console.log(`  Setup:        POST /setup/webhook`);
  console.log(`  Sync Lead:    POST /sync/lead`);
  console.log(`  Test:         POST /test/instantly`);
  console.log('========================================\n');
});

module.exports = app;
