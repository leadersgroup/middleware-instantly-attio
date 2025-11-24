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

// Fake last names that indicate generated data
const FAKE_LAST_NAMES = [
  'Law', 'Estate', 'Trust', 'Probate', 'Planning', 'LawFirm', 'Harbor', 'Pro',
  'Coast', 'County', 'City', 'Island', 'Beach', 'Springs', 'Park', 'Haven',
  'Legal', 'Firm', 'Associates', 'Buckley', 'Lyons', 'Walker', 'Walters',
  'Knight', 'LawWPB', 'LawFL', 'Tampa', 'JAX', 'FM', 'SRQ', 'Naples', 'Pinellas',
  'Volusia', 'Brevard', 'StLucie', 'PortRichey', 'CoveSprings', 'Sawyer',
  'DeanLLP', 'HoytBryan', 'TessierLaw', 'MillerElder', 'RichardsonLaw',
  'HarrisonEstate', 'LorenzoKiss', 'PonnockBrevard', 'TheLawyer', 'TrustEstate',
  'Boca', 'WilliamsJr', 'Gorda', 'Lucie', 'West', 'Largo', 'Patrou'
];

// Fake first names that indicate generated data
const FAKE_FIRST_NAMES = [
  'North', 'South', 'East', 'West', 'Coastal', 'Capital', 'Legacy', 'Safe',
  'Northwest', 'Panhandle', 'Villages', 'Florida', 'Treasure', 'Space', 'Gulf',
  'Palm', 'Key', 'Martin', 'St', 'Port', 'Spring', 'Hernando', 'Citrus', 'Sumter',
  'Lake', 'Pasco', 'Dade', 'Manatee', 'Panama', 'Bay', 'Pensacola', 'Escambia',
  'Milton', 'Fort', 'Destin', 'Crestview', 'DeFuniak', 'Green', 'Orange', 'Fernandina',
  'Amelia', 'Palatka', 'Flagler', 'Sebring', 'Avon', 'Wauchula', 'Arcadia', 'Moore',
  'LaBelle', 'Clewiston', 'Marathon', 'Okeechobee', 'Sebastian', 'Melbourne',
  'Volusia', 'Daytona', 'Vero', 'Stuart', 'Punta', 'Charlotte', 'Inverness',
  'Leesburg', 'Clermont', 'New', 'Bradenton', 'RTRLAW', 'Korshak', 'YourCaring',
  'Probate', 'Sawyer', 'Goldstein', 'ETELF', 'PTM', 'Ossi', 'Folds', 'Merhar',
  'Conticello', 'Hubbell', 'Mathews', 'LaVia', 'Waldoch', 'Brightwell', 'Boyles',
  'Liberis', 'Overstreet', 'Rodriguez', 'Garcia', 'Hernandez', 'Lopez', 'Martinez',
  'Perez', 'Sanchez', 'Diaz', 'Gonzalez', 'Fernandez', 'Torres', 'Rivera', 'Flores',
  'Morales', 'Vargas', 'Brown', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas',
  'Jackson', 'White', 'Harris', 'Thompson', 'Robinson', 'Clark', 'Lewis', 'Walker',
  'Hall', 'Allen', 'Young', 'King', 'Wright', 'Hill', 'Scott', 'Green', 'Adams',
  'Baker', 'Nelson', 'Carter', 'Mitchell', 'Roberts', 'Turner', 'Phillips', 'Campbell',
  'Parker', 'Evans', 'Edwards', 'Collins', 'Stewart', 'Morris', 'Murphy', 'Rogers',
  'Reed', 'Cook', 'Morgan', 'Bell', 'Bailey', 'Cooper', 'Richardson', 'Cox', 'Howard',
  'Ward', 'Peterson', 'Gray', 'Ramirez', 'James', 'Watson', 'Brooks', 'Kelly', 'Sanders',
  'Price', 'Bennett', 'Wood', 'Barnes', 'Ross', 'Henderson', 'Coleman', 'Jenkins',
  'Perry', 'Powell', 'Long', 'Patterson', 'Hughes', 'Washington', 'Butler', 'Simmons',
  'Foster', 'Gonzales', 'Bryant', 'Alexander', 'Russell', 'Griffin', 'Hayes', 'Myers',
  'Ford', 'Hamilton', 'Graham', 'Sullivan', 'Wallace', 'Woods', 'Cole', 'Jordan',
  'Owens', 'Dixon', 'Cunningham', 'Stephens', 'Lane', 'Weaver', 'Franklin', 'Ginn',
  'LD', 'Dean', 'Kathy', 'Solution', 'Elderly', 'Pons', 'Dunwody', 'Cohen', 'Frye',
  'Siegel', 'Baumann', 'Stross', 'Holland', 'Seigel', 'Johnson', 'Blalock', 'Marco',
  'Gainesville'
];

async function getAllContacts() {
  let allContacts = [];
  let after = undefined;

  console.log('Fetching all contacts from HubSpot...\n');

  while (true) {
    const params = {
      limit: 100,
      properties: 'email,firstname,lastname,phone,company'
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

function isFakeContact(contact) {
  const firstName = contact.properties?.firstname || '';
  const lastName = contact.properties?.lastname || '';

  // Check for fake last names
  if (FAKE_LAST_NAMES.includes(lastName)) {
    return true;
  }

  // Check for fake first names (but only if combined with suspicious patterns)
  if (FAKE_FIRST_NAMES.includes(firstName)) {
    return true;
  }

  return false;
}

async function deleteContact(contactId) {
  await client.delete(`/crm/v3/objects/contacts/${contactId}`);
}

async function deleteFakeContacts() {
  const contacts = await getAllContacts();
  console.log(`\nTotal contacts: ${contacts.length}\n`);

  const fakeContacts = contacts.filter(isFakeContact);
  console.log(`Found ${fakeContacts.length} fake contacts to delete\n`);

  if (fakeContacts.length === 0) {
    console.log('No fake contacts found.');
    return;
  }

  // Show what will be deleted
  console.log('Contacts to delete:');
  fakeContacts.forEach(c => {
    console.log(`  - ${c.properties.firstname} ${c.properties.lastname} (${c.properties.company})`);
  });
  console.log('');

  let deleted = 0;
  let failed = 0;

  for (const contact of fakeContacts) {
    try {
      const name = `${contact.properties.firstname || ''} ${contact.properties.lastname || ''}`.trim();
      process.stdout.write(`Deleting ${name}... `);
      await deleteContact(contact.id);
      deleted++;
      console.log('deleted');
      await new Promise(r => setTimeout(r, 100));
    } catch (error) {
      failed++;
      console.log(`FAILED: ${error.response?.data?.message || error.message}`);
    }
  }

  console.log(`\nDone! Deleted: ${deleted}, Failed: ${failed}`);
}

deleteFakeContacts();
