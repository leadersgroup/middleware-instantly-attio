const axios = require('axios');

const config = require('./config');
const HUBSPOT_TOKEN = config.hubspot.apiKey;

const client = axios.create({
  baseURL: 'https://api.hubapi.com',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${HUBSPOT_TOKEN}`
  },
  timeout: 30000,
});

async function getAllContacts() {
  const allContacts = [];
  let after = null;

  console.log('Fetching all contacts from HubSpot...');

  do {
    const params = {
      limit: 100,
      properties: ['email', 'firstname', 'lastname', 'lead_source_name'],
    };

    if (after) {
      params.after = after;
    }

    const response = await client.get('/crm/v3/objects/contacts', { params });
    const contacts = response.data.results || [];
    allContacts.push(...contacts);

    after = response.data.paging?.next?.after || null;

    process.stdout.write(`\rFetched ${allContacts.length} contacts...`);

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 100));

  } while (after);

  console.log(`\nTotal contacts found: ${allContacts.length}`);
  return allContacts;
}

async function updateContact(contactId) {
  try {
    await client.patch(`/crm/v3/objects/contacts/${contactId}`, {
      properties: {
        lead_source_name: 'Claude',
        lead_source_type: 'INTEGRATION'
      }
    });
    return true;
  } catch (error) {
    console.error(`\nError updating contact ${contactId}:`, error.response?.data?.message || error.message);
    return false;
  }
}

async function updateAllContacts() {
  const contacts = await getAllContacts();

  if (contacts.length === 0) {
    console.log('No contacts to update.');
    return;
  }

  console.log(`\nUpdating ${contacts.length} contacts to source: Claude...\n`);

  let success = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];
    const currentSource = contact.properties?.lead_source_name;

    // Skip if already set to Claude
    if (currentSource === 'Claude') {
      skipped++;
      continue;
    }

    const name = `${contact.properties?.firstname || ''} ${contact.properties?.lastname || ''}`.trim() || contact.properties?.email || contact.id;

    process.stdout.write(`\r[${i + 1}/${contacts.length}] Updating ${name.substring(0, 30).padEnd(30)}...`);

    const updated = await updateContact(contact.id);
    if (updated) {
      success++;
    } else {
      failed++;
    }

    // Rate limiting - 100ms between updates
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\n\n========================================`);
  console.log('UPDATE COMPLETE');
  console.log('========================================');
  console.log(`Total contacts: ${contacts.length}`);
  console.log(`Updated: ${success}`);
  console.log(`Skipped (already Claude): ${skipped}`);
  console.log(`Failed: ${failed}`);
  console.log('========================================');
}

updateAllContacts();
