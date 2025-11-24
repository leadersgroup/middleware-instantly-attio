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
  let allContacts = [];
  let after = undefined;

  console.log('Fetching all contacts from HubSpot...\n');

  while (true) {
    const params = {
      limit: 100,
      properties: 'email,firstname,lastname,state'
    };
    if (after) params.after = after;

    const response = await client.get('/crm/v3/objects/contacts', { params });
    allContacts = allContacts.concat(response.data.results);

    console.log(`Fetched ${allContacts.length} contacts...`);

    if (response.data.paging?.next?.after) {
      after = response.data.paging.next.after;
    } else {
      break;
    }
  }

  return allContacts;
}

async function updateContactState(contactId) {
  await client.patch(`/crm/v3/objects/contacts/${contactId}`, {
    properties: {
      state: 'Florida'
    }
  });
}

async function updateAllStates() {
  const contacts = await getAllContacts();
  console.log(`\nTotal contacts: ${contacts.length}\n`);
  console.log('Updating state/region to Florida...\n');

  let updated = 0;
  let failed = 0;

  for (const contact of contacts) {
    try {
      const name = `${contact.properties.firstname || ''} ${contact.properties.lastname || ''}`.trim() || contact.properties.email;
      process.stdout.write(`${name}... `);
      await updateContactState(contact.id);
      updated++;
      console.log('OK');
      await new Promise(r => setTimeout(r, 100));
    } catch (error) {
      failed++;
      console.log(`FAILED: ${error.response?.data?.message || error.message}`);
    }
  }

  console.log(`\nDone! Updated: ${updated}, Failed: ${failed}`);
}

updateAllStates();
