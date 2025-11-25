const axios = require('axios');
const config = require('./config');

const HUBSPOT_TOKEN = config.hubspot.apiKey;

const client = axios.create({
  baseURL: 'https://api.hubapi.com',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${HUBSPOT_TOKEN}`
  },
  timeout: 10000,
});

async function getUsers() {
  try {
    const response = await client.get('/crm/v3/objects/users', {
      params: {
        limit: 100,
        properties: ['firstname', 'lastname', 'email']
      }
    });

    console.log('\n=== HubSpot Users ===\n');
    response.data.results.forEach(user => {
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.properties.email}`);
      console.log(`Name: ${user.properties.firstname} ${user.properties.lastname}`);
      console.log('---');
    });
  } catch (error) {
    console.error('Error fetching users:', error.response?.data || error.message);
  }
}

getUsers();
