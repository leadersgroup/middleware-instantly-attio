/**
 * HubSpot Contact Upload Template
 * Use this as a base for uploading contacts via Claude agent
 */
const axios = require('axios');
const { PhoneNumberUtil, PhoneNumberFormat } = require('google-libphonenumber');
const config = require('./config');

const phoneUtil = PhoneNumberUtil.getInstance();

const HUBSPOT_TOKEN = config.hubspot.apiKey;
const OWNER_ID = '160932693'; // sales1@50deeds.com (Matt Enos)

const client = axios.create({
  baseURL: 'https://api.hubapi.com',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${HUBSPOT_TOKEN}`
  },
  timeout: 30000,
});

// ============================================
// CONTACTS TO UPLOAD - Replace with your data
// ============================================
const contacts = [
  // Example format:
  // { firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '555-123-4567', company: 'Acme Inc' },
];

// ============================================
// CONFIGURATION - Modify as needed
// ============================================
const CONFIG = {
  state: 'Tennessee',        // State to set for all contacts
  leadStatus: 'NEW',         // Lead status: NEW, IN_PROGRESS, OPEN, CONNECTED, etc.
  source: 'Claude',          // Marketing source name
  sourceType: 'INTEGRATION', // Source type
  rateLimit: 150,            // Delay between API calls (ms)
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function validatePhone(phone) {
  try {
    const parsed = phoneUtil.parse(phone, 'US');
    return phoneUtil.isValidNumber(parsed);
  } catch (error) {
    return false;
  }
}

function formatPhone(phone) {
  try {
    const parsed = phoneUtil.parse(phone, 'US');
    return phoneUtil.format(parsed, PhoneNumberFormat.NATIONAL);
  } catch (error) {
    return phone;
  }
}

async function createContact(contact) {
  const response = await client.post('/crm/v3/objects/contacts', {
    properties: {
      email: contact.email,
      firstname: contact.firstName,
      lastname: contact.lastName,
      phone: contact.phone,
      company: contact.company,
      state: CONFIG.state,
      hubspot_owner_id: OWNER_ID,
      hs_lead_status: CONFIG.leadStatus,
      // Marketing source tracking - Claude agent upload
      lead_source_name: CONFIG.source,
      lead_source_type: CONFIG.sourceType
    }
  });
  return response.data;
}

async function uploadContacts() {
  console.log('Validating phone numbers...\n');

  // Filter contacts with valid phone numbers
  const validContacts = contacts.filter(c => {
    const isValid = validatePhone(c.phone);
    if (!isValid) {
      console.log(`INVALID PHONE: ${c.firstName} ${c.lastName} - ${c.phone}`);
    }
    return isValid;
  });

  console.log(`\nValid contacts: ${validContacts.length}/${contacts.length}\n`);
  console.log(`Uploading ${validContacts.length} contacts to HubSpot...`);
  console.log(`State: ${CONFIG.state}`);
  console.log(`Source: ${CONFIG.source}\n`);

  let success = 0;
  let failed = 0;
  let exists = 0;

  for (let i = 0; i < validContacts.length; i++) {
    const contact = validContacts[i];
    const name = `${contact.firstName} ${contact.lastName}`;
    process.stdout.write(`[${i + 1}/${validContacts.length}] ${name}... `);

    try {
      await createContact(contact);
      success++;
      console.log('OK');
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      if (msg.includes('already exists')) {
        exists++;
        console.log('exists');
      } else {
        failed++;
        console.log(`FAILED: ${msg}`);
      }
    }

    // Rate limiting
    await new Promise(r => setTimeout(r, CONFIG.rateLimit));
  }

  console.log(`\nDone! New: ${success}, Exists: ${exists}, Failed: ${failed}`);
}

// Run if called directly
if (require.main === module) {
  if (contacts.length === 0) {
    console.log('No contacts to upload. Add contacts to the "contacts" array.');
  } else {
    uploadContacts();
  }
}

module.exports = { createContact, validatePhone, formatPhone, CONFIG };
