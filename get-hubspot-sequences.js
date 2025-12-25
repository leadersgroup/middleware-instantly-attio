#!/usr/bin/env node

/**
 * Get all HubSpot sequences and their IDs
 * Use this to find your sequence IDs to add to .env
 *
 * Run: node get-hubspot-sequences.js
 */

require('dotenv').config();
const hubspotService = require('./hubspot-service');

async function getSequences() {
  console.log('Fetching HubSpot sequences...\n');

  try {
    const sequences = await hubspotService.getSequences();

    if (!sequences || sequences.length === 0) {
      console.log('No sequences found. Make sure:');
      console.log('1. HUBSPOT_API_KEY is set in .env');
      console.log('2. You have HubSpot Starter plan or higher');
      console.log('3. Sequences are created in your HubSpot account');
      return;
    }

    console.log(`Found ${sequences.length} sequence(s):\n`);
    console.log('='.repeat(80));

    sequences.forEach((seq, index) => {
      console.log(`\n${index + 1}. ${seq.properties?.name}`);
      console.log(`   ID: ${seq.id}`);
      if (seq.properties?.description) {
        console.log(`   Description: ${seq.properties.description}`);
      }
    });

    console.log('\n' + '='.repeat(80));
    console.log('\nAdd these to your .env file:\n');

    // Auto-detect sequence names and suggest env vars
    const mapping = {
      'New Lead': 'HUBSPOT_SEQUENCE_NEW_LEAD',
      'Trial': 'HUBSPOT_SEQUENCE_TRIAL',
      'Customer': 'HUBSPOT_SEQUENCE_CUSTOMER',
      'Reengage': 'HUBSPOT_SEQUENCE_REENGAGE',
    };

    sequences.forEach(seq => {
      const name = seq.properties?.name || '';
      for (const [key, envVar] of Object.entries(mapping)) {
        if (name.toLowerCase().includes(key.toLowerCase())) {
          console.log(`${envVar}=${seq.id}`);
        }
      }
    });

    console.log('\nOr manually add based on the IDs above.');
    console.log('Example:');
    console.log('HUBSPOT_SEQUENCE_NEW_LEAD=123456');
    console.log('HUBSPOT_SEQUENCE_TRIAL=789012');

  } catch (error) {
    console.error('Error fetching sequences:', error.message);
    console.error('\nMake sure HUBSPOT_API_KEY is set in .env');
    process.exit(1);
  }
}

getSequences();
