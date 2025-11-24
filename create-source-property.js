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

async function createProperty(propertyDef) {
  try {
    const response = await client.post('/crm/v3/properties/contacts', propertyDef);
    console.log(`Created property: ${propertyDef.name}`);
    return response.data;
  } catch (error) {
    if (error.response?.data?.message?.includes('already exists')) {
      console.log(`Property already exists: ${propertyDef.name}`);
      return null;
    }
    console.error(`Error creating ${propertyDef.name}:`, error.response?.data || error.message);
    throw error;
  }
}

async function createSourceProperties() {
  console.log('Creating custom properties for contact source tracking...\n');

  // Create "Lead Source Name" property
  await createProperty({
    name: 'lead_source_name',
    label: 'Lead Source Name',
    type: 'string',
    fieldType: 'text',
    groupName: 'contactinformation',
    description: 'The source that created or updated this contact (e.g., Claude, Instantly)'
  });

  // Create "Lead Source Type" property
  await createProperty({
    name: 'lead_source_type',
    label: 'Lead Source Type',
    type: 'enumeration',
    fieldType: 'select',
    groupName: 'contactinformation',
    description: 'The type of source (e.g., INTEGRATION, MANUAL, IMPORT)',
    options: [
      { label: 'Integration', value: 'INTEGRATION', displayOrder: 1 },
      { label: 'Manual', value: 'MANUAL', displayOrder: 2 },
      { label: 'Import', value: 'IMPORT', displayOrder: 3 },
      { label: 'API', value: 'API', displayOrder: 4 }
    ]
  });

  console.log('\nDone! Custom properties created.');
  console.log('- lead_source_name: Text field for source name');
  console.log('- lead_source_type: Dropdown for source type');
}

createSourceProperties();
