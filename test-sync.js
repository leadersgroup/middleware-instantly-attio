/**
 * Test script for Instantly <-> Attio sync
 * Run: node test-sync.js
 */

require('dotenv').config();
const instantlyService = require('./instantly-service');
const attioService = require('./attio-service');
const syncHandler = require('./sync-handler');

async function testInstantlyConnection() {
  console.log('\n--- Testing Instantly Connection ---');
  try {
    const campaigns = await instantlyService.getCampaigns();
    console.log(`✅ Instantly connected! Found ${campaigns.length} campaigns`);
    if (campaigns.length > 0) {
      console.log('   Campaigns:', campaigns.slice(0, 3).map(c => c.name).join(', '));
    }
    return true;
  } catch (error) {
    console.log(`❌ Instantly connection failed: ${error.message}`);
    return false;
  }
}

async function testAttioConnection() {
  console.log('\n--- Testing Attio Connection ---');
  try {
    // Try to query people (will work even if empty)
    const person = await attioService.findPersonByEmail('test@example.com');
    console.log(`✅ Attio connected!`);
    return true;
  } catch (error) {
    console.log(`❌ Attio connection failed: ${error.message}`);
    return false;
  }
}

async function testInstantlyToAttioSync() {
  console.log('\n--- Testing Instantly → Attio Sync ---');

  const testEvent = {
    event_type: 'email_sent',
    lead_email: 'test-sync@example.com',
    campaign_name: 'Test Campaign',
    campaign_id: 'test-123',
    timestamp: new Date().toISOString(),
    workspace: 'test',
  };

  try {
    const result = await syncHandler.handleInstantlyEvent(testEvent);
    if (result.success) {
      console.log(`✅ Sync successful! Status: ${result.status}`);
    } else {
      console.log(`⚠️ Sync completed with issues: ${result.reason || result.error}`);
    }
    return result.success;
  } catch (error) {
    console.log(`❌ Sync failed: ${error.message}`);
    return false;
  }
}

async function testEventTypes() {
  console.log('\n--- Testing Different Event Types ---');

  const eventTypes = [
    'email_sent',
    'email_opened',
    'reply_received',
    'lead_interested',
    'email_bounced',
  ];

  for (const eventType of eventTypes) {
    const testEvent = {
      event_type: eventType,
      lead_email: `test-${eventType}@example.com`,
      campaign_name: 'Event Type Test',
      timestamp: new Date().toISOString(),
    };

    try {
      const result = await syncHandler.handleInstantlyEvent(testEvent);
      console.log(`  ${eventType}: ${result.success ? '✅' : '❌'} -> ${result.status || result.error}`);
    } catch (error) {
      console.log(`  ${eventType}: ❌ ${error.message}`);
    }

    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

async function runAllTests() {
  console.log('========================================');
  console.log('INSTANTLY <-> ATTIO SYNC TEST SUITE');
  console.log('========================================');

  // Check environment
  console.log('\n--- Environment Check ---');
  console.log(`INSTANTLY_API_KEY: ${process.env.INSTANTLY_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`ATTIO_API_KEY: ${process.env.ATTIO_API_KEY ? '✅ Set' : '❌ Missing'}`);

  if (!process.env.INSTANTLY_API_KEY || !process.env.ATTIO_API_KEY) {
    console.log('\n⚠️ Missing API keys. Copy .env.example to .env and add your keys.');
    return;
  }

  // Run tests
  const results = {
    instantly: await testInstantlyConnection(),
    attio: await testAttioConnection(),
  };

  if (results.instantly && results.attio) {
    results.sync = await testInstantlyToAttioSync();

    // Only run full event type tests if basic sync works
    if (results.sync) {
      console.log('\n--- Running Full Event Type Tests ---');
      await testEventTypes();
    }
  }

  // Summary
  console.log('\n========================================');
  console.log('TEST SUMMARY');
  console.log('========================================');
  console.log(`Instantly Connection: ${results.instantly ? '✅ Pass' : '❌ Fail'}`);
  console.log(`Attio Connection: ${results.attio ? '✅ Pass' : '❌ Fail'}`);
  console.log(`Sync Test: ${results.sync ? '✅ Pass' : '❌ Fail'}`);
  console.log('========================================\n');
}

// Run tests
runAllTests().catch(console.error);
