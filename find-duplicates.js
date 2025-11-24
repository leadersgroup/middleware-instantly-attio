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

  while (true) {
    const params = {
      limit: 100,
      properties: 'email,firstname,lastname,phone,company'
    };
    if (after) params.after = after;

    const response = await client.get('/crm/v3/objects/contacts', { params });
    allContacts = allContacts.concat(response.data.results);

    if (response.data.paging && response.data.paging.next && response.data.paging.next.after) {
      after = response.data.paging.next.after;
    } else {
      break;
    }
  }

  return allContacts;
}

getAllContacts().then(contacts => {
  console.log(`Total contacts: ${contacts.length}\n`);

  // Find duplicates by first+last name
  const nameMap = {};
  contacts.forEach(c => {
    const name = `${c.properties.firstname || ''} ${c.properties.lastname || ''}`.trim().toLowerCase();
    if (!nameMap[name]) nameMap[name] = [];
    nameMap[name].push(c);
  });

  console.log('=== POTENTIAL DUPLICATES (same name) ===\n');
  let dupCount = 0;
  Object.entries(nameMap).forEach(([name, items]) => {
    if (items.length > 1) {
      dupCount++;
      console.log(`${name.toUpperCase()}:`);
      items.forEach(c => {
        console.log(`  - ${c.properties.email} | ${c.properties.phone} | ID: ${c.id}`);
      });
      console.log('');
    }
  });

  console.log(`Found ${dupCount} names with duplicates`);
}).catch(err => console.error('Error:', err.message));
