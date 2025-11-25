const axios = require('axios');
require('dotenv').config();

const HUBSPOT_TOKEN = process.env.HUBSPOT_API_KEY;

if (!HUBSPOT_TOKEN) {
  console.error('HUBSPOT_API_KEY not set in .env');
  process.exit(1);
}

const client = axios.create({
  baseURL: 'https://api.hubapi.com',
  headers: {
    'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function getUsers() {
  try {
    console.log('Fetching HubSpot users...\n');

    const response = await client.get('/crm/v3/objects/users', {
      params: {
        limit: 100,
        properties: ['email', 'firstname', 'lastname']
      }
    });

    console.log('=== ALL HUBSPOT USERS ===\n');

    if (response.data.results.length === 0) {
      console.log('No users found');
      return;
    }

    response.data.results.forEach(user => {
      const props = user.properties;
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${props.email}`);
      console.log(`Name: ${props.firstname} ${props.lastname}`);
      console.log('---');
    });

  } catch (error) {
    if (error.response?.data) {
      console.error('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

getUsers();
