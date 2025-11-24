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
      properties: 'email,firstname,lastname,phone'
    };
    if (after) params.after = after;

    const response = await client.get('/crm/v3/objects/contacts', { params });
    allContacts = allContacts.concat(response.data.results);

    console.log(`Fetched ${allContacts.length} contacts so far...`);

    if (response.data.paging?.next?.after) {
      after = response.data.paging.next.after;
    } else {
      break;
    }
  }

  return allContacts;
}

async function deleteContact(contactId) {
  await client.delete(`/crm/v3/objects/contacts/${contactId}`);
}

async function deleteFakeContacts() {
  const contacts = await getAllContacts();
  console.log(`\nTotal contacts found: ${contacts.length}\n`);

  // Find fake contacts (those with 555- phone pattern)
  const fakeContacts = contacts.filter(c => {
    const phone = c.properties?.phone || '';
    return phone.includes('555-');
  });

  console.log(`Found ${fakeContacts.length} fake contacts with 555- phone numbers\n`);

  if (fakeContacts.length === 0) {
    console.log('No fake contacts to delete.');
    return;
  }

  let deleted = 0;
  let failed = 0;

  for (const contact of fakeContacts) {
    try {
      process.stdout.write(`Deleting ${contact.properties.firstname} ${contact.properties.lastname} (${contact.properties.phone})... `);
      await deleteContact(contact.id);
      deleted++;
      console.log('deleted');
      await new Promise(r => setTimeout(r, 100)); // Rate limiting
    } catch (error) {
      failed++;
      console.log(`FAILED: ${error.message}`);
    }
  }

  console.log(`\nDone! Deleted: ${deleted}, Failed: ${failed}`);
}

deleteFakeContacts();
