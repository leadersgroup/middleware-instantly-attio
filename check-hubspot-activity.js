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

async function checkRecentActivity() {
  // Get today's date at 3:00am and 4:00am (window around 3:54am)
  const today = new Date();
  today.setHours(3, 0, 0, 0);
  const startTime = today.getTime();

  today.setHours(4, 30, 0, 0);
  const endTime = today.getTime();

  console.log('Checking HubSpot activity between:');
  console.log(`  Start: ${new Date(startTime).toISOString()}`);
  console.log(`  End:   ${new Date(endTime).toISOString()}`);
  console.log('');

  try {
    // Search for contacts created in that window
    const response = await client.post('/crm/v3/objects/contacts/search', {
      filterGroups: [{
        filters: [{
          propertyName: 'createdate',
          operator: 'BETWEEN',
          highValue: endTime.toString(),
          value: startTime.toString(),
        }],
      }],
      properties: ['email', 'firstname', 'lastname', 'phone', 'company', 'state', 'createdate', 'hs_lead_status', 'hs_object_source'],
      sorts: [{ propertyName: 'createdate', direction: 'ASCENDING' }],
      limit: 100,
    });

    const contacts = response.data.results || [];

    if (contacts.length === 0) {
      console.log('No contacts created in that time window.');
      console.log('\nLet me check for recently modified contacts...\n');

      // Try checking last modified
      const modifiedResponse = await client.post('/crm/v3/objects/contacts/search', {
        filterGroups: [{
          filters: [{
            propertyName: 'lastmodifieddate',
            operator: 'BETWEEN',
            highValue: endTime.toString(),
            value: startTime.toString(),
          }],
        }],
        properties: ['email', 'firstname', 'lastname', 'phone', 'company', 'state', 'createdate', 'lastmodifieddate', 'hs_lead_status'],
        sorts: [{ propertyName: 'lastmodifieddate', direction: 'ASCENDING' }],
        limit: 100,
      });

      const modifiedContacts = modifiedResponse.data.results || [];

      if (modifiedContacts.length === 0) {
        console.log('No contacts modified in that time window either.');
      } else {
        console.log(`Found ${modifiedContacts.length} contacts modified between 3:00am - 4:30am:\n`);
        modifiedContacts.forEach((c, i) => {
          const p = c.properties;
          console.log(`${i + 1}. ${p.firstname || ''} ${p.lastname || ''}`);
          console.log(`   Email: ${p.email || 'N/A'}`);
          console.log(`   Phone: ${p.phone || 'N/A'}`);
          console.log(`   Company: ${p.company || 'N/A'}`);
          console.log(`   State: ${p.state || 'N/A'}`);
          console.log(`   Lead Status: ${p.hs_lead_status || 'N/A'}`);
          console.log(`   Created: ${p.createdate}`);
          console.log(`   Modified: ${p.lastmodifieddate}`);
          console.log('');
        });
      }
    } else {
      console.log(`Found ${contacts.length} contacts created between 3:00am - 4:30am:\n`);
      contacts.forEach((c, i) => {
        const p = c.properties;
        console.log(`${i + 1}. ${p.firstname || ''} ${p.lastname || ''}`);
        console.log(`   Email: ${p.email || 'N/A'}`);
        console.log(`   Phone: ${p.phone || 'N/A'}`);
        console.log(`   Company: ${p.company || 'N/A'}`);
        console.log(`   State: ${p.state || 'N/A'}`);
        console.log(`   Lead Status: ${p.hs_lead_status || 'N/A'}`);
        console.log(`   Source: ${p.hs_object_source || 'N/A'}`);
        console.log(`   Created: ${p.createdate}`);
        console.log('');
      });
    }

    // Also check for notes created in that window
    console.log('\n--- Checking for notes created in that window ---\n');
    try {
      const notesResponse = await client.post('/crm/v3/objects/notes/search', {
        filterGroups: [{
          filters: [{
            propertyName: 'hs_createdate',
            operator: 'BETWEEN',
            highValue: endTime.toString(),
            value: startTime.toString(),
          }],
        }],
        properties: ['hs_note_body', 'hs_createdate', 'hs_timestamp'],
        limit: 50,
      });

      const notes = notesResponse.data.results || [];
      if (notes.length === 0) {
        console.log('No notes created in that time window.');
      } else {
        console.log(`Found ${notes.length} notes:\n`);
        notes.forEach((n, i) => {
          console.log(`${i + 1}. Created: ${n.properties.hs_createdate}`);
          console.log(`   Body: ${n.properties.hs_note_body?.substring(0, 200) || 'N/A'}...`);
          console.log('');
        });
      }
    } catch (noteErr) {
      console.log('Could not search notes:', noteErr.message);
    }

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

checkRecentActivity();
