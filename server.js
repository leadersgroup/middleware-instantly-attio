const express = require('express');
const crypto = require('crypto');
const config = require('./config');
const syncHandler = require('./sync-handler');
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
    service: 'instantly-attio-hubspot-sync',
    timestamp: new Date().toISOString(),
    sync_enabled: config.sync.enabled,
    integrations: {
      attio: !!config.attio.apiKey,
      hubspot: !!config.hubspot.apiKey,
      instantly: !!config.instantly.apiKey,
    },
  });
});

/**
 * Webhook endpoint for Instantly.ai events
 * Configure this URL in Instantly: https://your-server.com/webhook/instantly
 */
app.post('/webhook/instantly', async (req, res) => {
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

    // Process the event
    const result = await syncHandler.handleInstantlyEvent(event);

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
 * Webhook endpoint for Attio events
 * Register this URL in Attio: https://your-server.com/webhook/attio
 */
app.post('/webhook/attio', async (req, res) => {
  console.log('\n========================================');
  console.log('ATTIO WEBHOOK RECEIVED');
  console.log('========================================');

  try {
    // Verify webhook signature if configured
    if (config.attio.webhookSecret) {
      const signature = req.headers['x-attio-signature'];
      if (signature) {
        const expectedSignature = crypto
          .createHmac('sha256', config.attio.webhookSecret)
          .update(JSON.stringify(req.body))
          .digest('hex');

        if (signature !== expectedSignature) {
          console.log('Invalid Attio webhook signature');
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

    // Process the webhook payload (contains events array)
    const result = await syncHandler.handleAttioWebhook(event);

    res.json({
      received: true,
      ...result,
    });
  } catch (error) {
    console.error('Error processing Attio webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Webhook endpoint for HubSpot events
 * Register this URL in HubSpot Developer Portal: https://your-server.com/webhook/hubspot
 */
app.post('/webhook/hubspot', async (req, res) => {
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
 * Configure this URL in Instantly for HubSpot sync: https://your-server.com/webhook/instantly-hubspot
 */
app.post('/webhook/instantly-hubspot', async (req, res) => {
  console.log('\n========================================');
  console.log('INSTANTLY WEBHOOK (HUBSPOT) RECEIVED');
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
    console.error('Error processing Instantly webhook for HubSpot:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Manual trigger endpoint - sync a specific lead
 */
app.post('/sync/lead', async (req, res) => {
  const { email, direction } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    if (direction === 'attio') {
      // Create a fake event to trigger sync
      const result = await syncHandler.handleInstantlyEvent({
        event_type: 'manual_sync',
        lead_email: email,
        timestamp: new Date().toISOString(),
      });
      res.json(result);
    } else if (direction === 'instantly') {
      const result = await syncHandler.handleAttioEvent({
        event_type: 'record.updated',
        data: {
          record: {
            values: {
              email_addresses: [{ email_address: email }],
            },
          },
        },
      });
      res.json(result);
    } else {
      res.status(400).json({ error: 'Direction must be "attio" or "instantly"' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Setup Attio webhook programmatically
 */
app.post('/setup/attio-webhook', async (req, res) => {
  const { publicUrl } = req.body;

  if (!publicUrl) {
    return res.status(400).json({ error: 'publicUrl is required' });
  }

  try {
    const result = await syncHandler.setupAttioWebhook(publicUrl);
    res.json({ success: true, webhook: result });
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
    attio: {
      apiUrl: config.attio.apiUrl,
      hasApiKey: !!config.attio.apiKey,
      hasWebhookSecret: !!config.attio.webhookSecret,
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
 * Test endpoint - simulate Instantly event
 */
app.post('/test/instantly', async (req, res) => {
  const testEvent = {
    event_type: req.body.event_type || 'email_sent',
    lead_email: req.body.email || 'test@example.com',
    campaign_name: req.body.campaign || 'Test Campaign',
    campaign_id: 'test-campaign-id',
    timestamp: new Date().toISOString(),
    workspace: 'test-workspace',
  };

  console.log('\n[TEST] Simulating Instantly event:', testEvent);
  const result = await syncHandler.handleInstantlyEvent(testEvent);
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
  console.log('INSTANTLY <-> ATTIO/HUBSPOT SYNC MIDDLEWARE');
  console.log('========================================');
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${config.server.env}`);
  console.log(`Sync enabled: ${config.sync.enabled}`);
  console.log('');
  console.log('Integrations:');
  console.log(`  Attio:    ${config.attio.apiKey ? 'Configured' : 'Not configured'}`);
  console.log(`  HubSpot:  ${config.hubspot.apiKey ? 'Configured' : 'Not configured'}`);
  console.log(`  Instantly: ${config.instantly.apiKey ? 'Configured' : 'Not configured'}`);
  console.log('');
  console.log('Webhook endpoints:');
  console.log(`  Instantly -> Attio:   POST /webhook/instantly`);
  console.log(`  Instantly -> HubSpot: POST /webhook/instantly-hubspot`);
  console.log(`  Attio -> Instantly:   POST /webhook/attio`);
  console.log(`  HubSpot -> Instantly: POST /webhook/hubspot`);
  console.log('');
  console.log('Utility endpoints:');
  console.log(`  Health:    GET  /health`);
  console.log(`  Config:    GET  /config`);
  console.log(`  Sync Lead: POST /sync/lead`);
  console.log(`  Test:      POST /test/instantly`);
  console.log('========================================\n');
});

module.exports = app;
