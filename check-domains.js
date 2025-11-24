const axios = require('axios');
const config = require('./config');
const HUBSPOT_TOKEN = config.hubspot.apiKey;
const client = axios.create({
  baseURL: 'https://api.hubapi.com',
  headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + HUBSPOT_TOKEN },
  timeout: 30000,
});

async function getAllContacts() {
  let all = [];
  let after = undefined;
  while (true) {
    const params = { limit: 100, properties: 'email,firstname,lastname' };
    if (after) params.after = after;
    const r = await client.get('/crm/v3/objects/contacts', { params });
    all = all.concat(r.data.results);
    if (r.data.paging && r.data.paging.next) after = r.data.paging.next.after;
    else break;
  }
  return all;
}

getAllContacts().then(contacts => {
  // Extract unique domains
  const domains = new Map();
  contacts.forEach(c => {
    const email = c.properties.email || '';
    const domain = email.split('@')[1];
    if (domain && !domains.has(domain)) {
      domains.set(domain, {
        domain: domain,
        name: (c.properties.firstname || '') + ' ' + (c.properties.lastname || ''),
        id: c.id,
        email: email
      });
    }
  });

  console.log('Total contacts: ' + contacts.length);
  console.log('Unique domains: ' + domains.size + '\n');

  // Show random sample of domains to check
  const domainList = Array.from(domains.values());
  const shuffled = domainList.sort(() => 0.5 - Math.random());
  console.log('=== RANDOM DOMAINS TO CHECK ===\n');
  shuffled.slice(0, 25).forEach((d, i) => {
    console.log((i+1) + '. ' + d.domain + ' | ' + d.name + ' | ' + d.email + ' | ID:' + d.id);
  });
});
