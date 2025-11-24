const axios = require('axios');
const { PhoneNumberUtil, PhoneNumberFormat } = require('google-libphonenumber');

// Google's libphonenumber - No API limits, works offline
const phoneUtil = PhoneNumberUtil.getInstance();

// HubSpot config for fetching contacts
const config = require('./config');
const HUBSPOT_TOKEN = config.hubspot.apiKey;
const hubspot = axios.create({
  baseURL: 'https://api.hubapi.com',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${HUBSPOT_TOKEN}`
  },
  timeout: 30000,
});

// Validate a single phone number
function validatePhone(phone, countryCode = 'US') {
  if (!phone) {
    return { original: phone, valid: false, error: 'Empty phone number' };
  }

  try {
    const parsed = phoneUtil.parse(phone, countryCode);
    const isValid = phoneUtil.isValidNumber(parsed);
    const isPossible = phoneUtil.isPossibleNumber(parsed);
    const numberType = phoneUtil.getNumberType(parsed);

    // Number types: 0=FIXED_LINE, 1=MOBILE, 2=FIXED_LINE_OR_MOBILE, etc.
    const typeNames = ['FIXED_LINE', 'MOBILE', 'FIXED_LINE_OR_MOBILE', 'TOLL_FREE',
                       'PREMIUM_RATE', 'SHARED_COST', 'VOIP', 'PERSONAL_NUMBER',
                       'PAGER', 'UAN', 'VOICEMAIL', 'UNKNOWN'];

    return {
      original: phone,
      valid: isValid,
      possible: isPossible,
      type: typeNames[numberType] || 'UNKNOWN',
      national: phoneUtil.format(parsed, PhoneNumberFormat.NATIONAL),
      e164: phoneUtil.format(parsed, PhoneNumberFormat.E164),
      international: phoneUtil.format(parsed, PhoneNumberFormat.INTERNATIONAL),
      country: phoneUtil.getRegionCodeForNumber(parsed)
    };
  } catch (error) {
    return {
      original: phone,
      valid: false,
      error: error.message
    };
  }
}

// Validate a list of phone numbers
function validatePhoneList(phones) {
  console.log(`Validating ${phones.length} phone numbers...\n`);

  const results = { valid: [], invalid: [] };

  for (let i = 0; i < phones.length; i++) {
    const phone = phones[i];
    process.stdout.write(`[${i + 1}/${phones.length}] ${phone}... `);

    const result = validatePhone(phone);

    if (result.valid) {
      results.valid.push(result);
      console.log(`Valid (${result.national}) [${result.type}]`);
    } else {
      results.invalid.push(result);
      console.log(`INVALID${result.error ? ': ' + result.error : ''}`);
    }
  }

  return results;
}

// Fetch all contacts from HubSpot and validate their phone numbers
async function validateHubSpotContacts() {
  console.log('Fetching contacts from HubSpot...\n');

  let allContacts = [];
  let after = undefined;

  while (true) {
    const params = {
      limit: 100,
      properties: 'email,firstname,lastname,phone,company'
    };
    if (after) params.after = after;

    const response = await hubspot.get('/crm/v3/objects/contacts', { params });
    allContacts = allContacts.concat(response.data.results);

    console.log(`Fetched ${allContacts.length} contacts...`);

    if (response.data.paging?.next?.after) {
      after = response.data.paging.next.after;
    } else {
      break;
    }
  }

  console.log(`\nTotal contacts: ${allContacts.length}\n`);

  // Filter contacts with phone numbers
  const contactsWithPhones = allContacts.filter(c => c.properties.phone);
  console.log(`Contacts with phone numbers: ${contactsWithPhones.length}\n`);

  const results = { valid: [], invalid: [], noPhone: [] };

  for (let i = 0; i < contactsWithPhones.length; i++) {
    const contact = contactsWithPhones[i];
    const name = `${contact.properties.firstname || ''} ${contact.properties.lastname || ''}`.trim();
    const phone = contact.properties.phone;

    process.stdout.write(`[${i + 1}/${contactsWithPhones.length}] ${name} (${phone})... `);

    const result = validatePhone(phone);
    result.contactId = contact.id;
    result.name = name;
    result.email = contact.properties.email;
    result.company = contact.properties.company;

    if (result.valid) {
      results.valid.push(result);
      console.log(`Valid [${result.type}]`);
    } else {
      results.invalid.push(result);
      console.log(`INVALID`);
    }
  }

  return results;
}

// Main function
async function main() {
  const args = process.argv.slice(2);

  if (args[0] === '--hubspot') {
    // Validate all HubSpot contacts
    const results = await validateHubSpotContacts();

    console.log('\n' + '='.repeat(60));
    console.log('VALIDATION RESULTS');
    console.log('='.repeat(60));
    console.log(`Valid: ${results.valid.length}`);
    console.log(`Invalid: ${results.invalid.length}`);

    if (results.invalid.length > 0) {
      console.log('\nInvalid phone numbers:');
      results.invalid.forEach(r => {
        console.log(`  - ${r.name}: ${r.original} (${r.company || 'No company'})`);
      });
    }

  } else if (args.length > 0) {
    // Validate phone numbers from command line
    const results = validatePhoneList(args);

    console.log('\n' + '='.repeat(60));
    console.log(`Valid: ${results.valid.length}, Invalid: ${results.invalid.length}`);

    if (results.valid.length > 0) {
      console.log('\nFormatted valid numbers:');
      results.valid.forEach(r => {
        console.log(`  ${r.original} -> ${r.national} (${r.e164})`);
      });
    }

  } else {
    // Show usage
    console.log('Phone Number Validator using Google libphonenumber');
    console.log('(No API limits - runs locally)');
    console.log('');
    console.log('Usage:');
    console.log('  node validate-phones.js <phone1> <phone2> ...  - Validate specific numbers');
    console.log('  node validate-phones.js --hubspot              - Validate all HubSpot contacts');
    console.log('');
    console.log('Examples:');
    console.log('  node validate-phones.js 561-420-5765 305-981-8889');
    console.log('  node validate-phones.js --hubspot');
  }
}

main().catch(console.error);
