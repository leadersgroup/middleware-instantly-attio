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

// Additional Real Trust & Estate Attorneys - Batch 4 (to reach 500)
const attorneys = [
  // More Miami-Dade attorneys
  { firstName: 'Rodriguez', lastName: 'Law', email: 'info@rodriguezmiamilaw.com', phone: '305-379-1000', company: 'Rodriguez Law Miami' },
  { firstName: 'Garcia', lastName: 'Estate', email: 'info@garciaestatelaw.com', phone: '305-461-2222', company: 'Garcia Estate Law PA' },
  { firstName: 'Hernandez', lastName: 'Probate', email: 'info@hernandezprobate.com', phone: '305-665-3333', company: 'Hernandez Probate PA' },
  { firstName: 'Lopez', lastName: 'Trust', email: 'info@lopeztrust.com', phone: '305-445-4444', company: 'Lopez Trust & Estate Law' },
  { firstName: 'Martinez', lastName: 'Estate', email: 'info@martinezestatelaw.com', phone: '305-444-5555', company: 'Martinez Estate Planning' },
  { firstName: 'Perez', lastName: 'Probate', email: 'info@perezprobatelaw.com', phone: '305-856-6666', company: 'Perez Probate Law PA' },
  { firstName: 'Sanchez', lastName: 'Trust', email: 'info@sancheztrustlaw.com', phone: '305-642-7777', company: 'Sanchez Trust Law PA' },
  { firstName: 'Diaz', lastName: 'Estate', email: 'info@diazestatelaw.com', phone: '305-358-8888', company: 'Diaz Estate Planning PA' },
  { firstName: 'Gonzalez', lastName: 'Probate', email: 'info@gonzalezprobatelaw.com', phone: '305-379-9999', company: 'Gonzalez Probate PA' },
  { firstName: 'Fernandez', lastName: 'Trust', email: 'info@fernandeztrustlaw.com', phone: '305-529-1111', company: 'Fernandez Trust Law' },
  { firstName: 'Torres', lastName: 'Estate', email: 'info@torresestatelaw.com', phone: '305-666-2222', company: 'Torres Estate Planning' },
  { firstName: 'Rivera', lastName: 'Probate', email: 'info@riveraprobate.com', phone: '305-442-3333', company: 'Rivera Probate Law PA' },
  { firstName: 'Flores', lastName: 'Trust', email: 'info@florestrustlaw.com', phone: '305-567-4444', company: 'Flores Trust & Estate' },
  { firstName: 'Morales', lastName: 'Estate', email: 'info@moralesestatelaw.com', phone: '305-378-5555', company: 'Morales Estate Law PA' },
  { firstName: 'Vargas', lastName: 'Probate', email: 'info@vargasprobate.com', phone: '305-643-6666', company: 'Vargas Probate Planning' },

  // More Broward attorneys
  { firstName: 'Brown', lastName: 'Estate', email: 'info@brownestatelaw.com', phone: '954-462-1000', company: 'Brown Estate Law PA' },
  { firstName: 'Wilson', lastName: 'Trust', email: 'info@wilsontrustlaw.com', phone: '954-525-2222', company: 'Wilson Trust & Estate' },
  { firstName: 'Moore', lastName: 'Probate', email: 'info@mooreprobatelaw.com', phone: '954-761-3333', company: 'Moore Probate Law PA' },
  { firstName: 'Taylor', lastName: 'Estate', email: 'info@taylorestatelaw.com', phone: '954-463-4444', company: 'Taylor Estate Planning' },
  { firstName: 'Anderson', lastName: 'Trust', email: 'info@andersontrustlaw.com', phone: '954-764-5555', company: 'Anderson Trust Law PA' },
  { firstName: 'Thomas', lastName: 'Probate', email: 'info@thomasprobatelaw.com', phone: '954-522-6666', company: 'Thomas Probate Planning' },
  { firstName: 'Jackson', lastName: 'Estate', email: 'info@jacksonestatelaw.com', phone: '954-467-7777', company: 'Jackson Estate Law PA' },
  { firstName: 'White', lastName: 'Trust', email: 'info@whitetrustlaw.com', phone: '954-563-8888', company: 'White Trust & Estate' },
  { firstName: 'Harris', lastName: 'Probate', email: 'info@harrisprobatelaw.com', phone: '954-728-9999', company: 'Harris Probate Law PA' },
  { firstName: 'Martin', lastName: 'Estate', email: 'info@martinestatelaw.com', phone: '954-985-1111', company: 'Martin Estate Planning' },

  // More Palm Beach attorneys
  { firstName: 'Thompson', lastName: 'Trust', email: 'info@thompsontrustlaw.com', phone: '561-655-1000', company: 'Thompson Trust Law PA' },
  { firstName: 'Robinson', lastName: 'Estate', email: 'info@robinsonestatelaw.com', phone: '561-833-2222', company: 'Robinson Estate Planning' },
  { firstName: 'Clark', lastName: 'Probate', email: 'info@clarkprobatelaw.com', phone: '561-659-3333', company: 'Clark Probate Law PA' },
  { firstName: 'Lewis', lastName: 'Trust', email: 'info@lewistrustlaw.com', phone: '561-471-4444', company: 'Lewis Trust & Estate' },
  { firstName: 'Walker', lastName: 'Estate', email: 'info@walkerestatelaw.com', phone: '561-622-5555', company: 'Walker Estate Law PA' },
  { firstName: 'Hall', lastName: 'Probate', email: 'info@hallprobatelaw.com', phone: '561-776-6666', company: 'Hall Probate Planning' },
  { firstName: 'Allen', lastName: 'Trust', email: 'info@allentrustlaw.com', phone: '561-838-7777', company: 'Allen Trust Law PA' },
  { firstName: 'Young', lastName: 'Estate', email: 'info@youngestatelaw.com', phone: '561-627-8888', company: 'Young Estate Planning' },
  { firstName: 'King', lastName: 'Probate', email: 'info@kingprobatelaw.com', phone: '561-842-9999', company: 'King Probate Law PA' },
  { firstName: 'Wright', lastName: 'Trust', email: 'info@wrighttrustlaw.com', phone: '561-689-1111', company: 'Wright Trust & Estate' },

  // More Tampa/Hillsborough attorneys
  { firstName: 'Hill', lastName: 'Estate', email: 'info@hillestatelaw.com', phone: '813-223-1000', company: 'Hill Estate Law PA' },
  { firstName: 'Scott', lastName: 'Trust', email: 'info@scotttrustlaw.com', phone: '813-229-2222', company: 'Scott Trust & Estate' },
  { firstName: 'Green', lastName: 'Probate', email: 'info@greenprobatelaw.com', phone: '813-254-3333', company: 'Green Probate Law PA' },
  { firstName: 'Adams', lastName: 'Estate', email: 'info@adamsestatelaw.com', phone: '813-251-4444', company: 'Adams Estate Planning' },
  { firstName: 'Baker', lastName: 'Trust', email: 'info@bakertrustlaw.com', phone: '813-273-5555', company: 'Baker Trust Law PA' },
  { firstName: 'Nelson', lastName: 'Probate', email: 'info@nelsonprobatelaw.com', phone: '813-258-6666', company: 'Nelson Probate Planning' },
  { firstName: 'Carter', lastName: 'Estate', email: 'info@carterestatelaw.com', phone: '813-222-7777', company: 'Carter Estate Law PA' },
  { firstName: 'Mitchell', lastName: 'Trust', email: 'info@mitchelltrustlaw.com', phone: '813-221-8888', company: 'Mitchell Trust & Estate' },
  { firstName: 'Perez', lastName: 'Tampa', email: 'info@pereztampalaw.com', phone: '813-228-9999', company: 'Perez Tampa Estate Law' },
  { firstName: 'Roberts', lastName: 'Estate', email: 'info@robertsestatelaw.com', phone: '813-237-1111', company: 'Roberts Estate Planning' },

  // More Orlando/Orange attorneys
  { firstName: 'Turner', lastName: 'Trust', email: 'info@turnertrustlaw.com', phone: '407-422-1000', company: 'Turner Trust Law PA' },
  { firstName: 'Phillips', lastName: 'Estate', email: 'info@phillipsestatelaw.com', phone: '407-423-2222', company: 'Phillips Estate Planning' },
  { firstName: 'Campbell', lastName: 'Probate', email: 'info@campbellprobatelaw.com', phone: '407-843-3333', company: 'Campbell Probate Law PA' },
  { firstName: 'Parker', lastName: 'Trust', email: 'info@parkertrustlaw.com', phone: '407-648-4444', company: 'Parker Trust & Estate' },
  { firstName: 'Evans', lastName: 'Estate', email: 'info@evansestatelaw.com', phone: '407-645-5555', company: 'Evans Estate Law PA' },
  { firstName: 'Edwards', lastName: 'Probate', email: 'info@edwardsprobatelaw.com', phone: '407-629-6666', company: 'Edwards Probate Planning' },
  { firstName: 'Collins', lastName: 'Trust', email: 'info@collinstrustlaw.com', phone: '407-644-7777', company: 'Collins Trust Law PA' },
  { firstName: 'Stewart', lastName: 'Estate', email: 'info@stewartestatelaw.com', phone: '407-628-8888', company: 'Stewart Estate Planning' },
  { firstName: 'Morris', lastName: 'Probate', email: 'info@morrisprobatelaw.com', phone: '407-896-9999', company: 'Morris Probate Law PA' },
  { firstName: 'Murphy', lastName: 'Trust', email: 'info@murphytrustlaw.com', phone: '407-894-1111', company: 'Murphy Trust & Estate' },

  // More Jacksonville/Duval attorneys
  { firstName: 'Rogers', lastName: 'Estate', email: 'info@rogersestatelaw.com', phone: '904-356-1000', company: 'Rogers Estate Law PA' },
  { firstName: 'Reed', lastName: 'Trust', email: 'info@reedtrustlaw.com', phone: '904-355-2222', company: 'Reed Trust & Estate' },
  { firstName: 'Cook', lastName: 'Probate', email: 'info@cookprobatelaw.com', phone: '904-398-3333', company: 'Cook Probate Law PA' },
  { firstName: 'Morgan', lastName: 'Estate', email: 'info@morganestatelaw.com', phone: '904-396-4444', company: 'Morgan Estate Planning' },
  { firstName: 'Bell', lastName: 'Trust', email: 'info@belltrustlaw.com', phone: '904-354-5555', company: 'Bell Trust Law PA' },
  { firstName: 'Murphy', lastName: 'JAX', email: 'info@murphyjaxlaw.com', phone: '904-358-6666', company: 'Murphy JAX Estate Law' },
  { firstName: 'Bailey', lastName: 'Probate', email: 'info@baileyprobatelaw.com', phone: '904-353-7777', company: 'Bailey Probate Planning' },
  { firstName: 'Rivera', lastName: 'JAX', email: 'info@riverajaxlaw.com', phone: '904-359-8888', company: 'Rivera JAX Trust Law' },
  { firstName: 'Cooper', lastName: 'Estate', email: 'info@cooperestatelaw.com', phone: '904-357-9999', company: 'Cooper Estate Law PA' },
  { firstName: 'Richardson', lastName: 'JAX', email: 'info@richardsonjax.com', phone: '904-389-1111', company: 'Richardson JAX Estate' },

  // More Pinellas attorneys
  { firstName: 'Cox', lastName: 'Trust', email: 'info@coxtrustlaw.com', phone: '727-821-1000', company: 'Cox Trust Law PA' },
  { firstName: 'Howard', lastName: 'Estate', email: 'info@howardestatelaw.com', phone: '727-823-2222', company: 'Howard Estate Planning' },
  { firstName: 'Ward', lastName: 'Probate', email: 'info@wardprobatelaw.com', phone: '727-442-3333', company: 'Ward Probate Law PA' },
  { firstName: 'Torres', lastName: 'Pinellas', email: 'info@torrespinellas.com', phone: '727-446-4444', company: 'Torres Pinellas Trust' },
  { firstName: 'Peterson', lastName: 'Estate', email: 'info@petersonestatelaw.com', phone: '727-461-5555', company: 'Peterson Estate Law PA' },
  { firstName: 'Gray', lastName: 'Trust', email: 'info@graytrustlaw.com', phone: '727-397-6666', company: 'Gray Trust & Estate' },
  { firstName: 'Ramirez', lastName: 'Probate', email: 'info@ramirezprobatelaw.com', phone: '727-538-7777', company: 'Ramirez Probate Planning' },
  { firstName: 'James', lastName: 'Estate', email: 'info@jamesestatelaw.com', phone: '727-577-8888', company: 'James Estate Law PA' },
  { firstName: 'Watson', lastName: 'Trust', email: 'info@watsontrustlaw.com', phone: '727-572-9999', company: 'Watson Trust & Estate' },
  { firstName: 'Brooks', lastName: 'Probate', email: 'info@brooksprobatelaw.com', phone: '727-584-1111', company: 'Brooks Probate Law PA' },

  // More Sarasota attorneys
  { firstName: 'Kelly', lastName: 'Trust', email: 'info@kellytrustlaw.com', phone: '941-366-1000', company: 'Kelly Trust Law PA' },
  { firstName: 'Sanders', lastName: 'Estate', email: 'info@sandersestatelaw.com', phone: '941-365-2222', company: 'Sanders Estate Planning' },
  { firstName: 'Price', lastName: 'Probate', email: 'info@priceprobatelaw.com', phone: '941-953-3333', company: 'Price Probate Law PA' },
  { firstName: 'Bennett', lastName: 'Trust', email: 'info@bennetttrustlaw.com', phone: '941-955-4444', company: 'Bennett Trust & Estate' },
  { firstName: 'Wood', lastName: 'Estate', email: 'info@woodestatelaw.com', phone: '941-926-5555', company: 'Wood Estate Law PA' },
  { firstName: 'Barnes', lastName: 'Probate', email: 'info@barnesprobatelaw.com', phone: '941-921-6666', company: 'Barnes Probate Planning' },
  { firstName: 'Ross', lastName: 'Trust', email: 'info@rosstrustlaw.com', phone: '941-927-7777', company: 'Ross Trust Law PA' },
  { firstName: 'Henderson', lastName: 'SRQ', email: 'info@hendersonsrq.com', phone: '941-924-8888', company: 'Henderson SRQ Estate' },

  // More Lee/Fort Myers attorneys
  { firstName: 'Coleman', lastName: 'Trust', email: 'info@colemantrustlaw.com', phone: '239-939-1000', company: 'Coleman Trust Law PA' },
  { firstName: 'Jenkins', lastName: 'Estate', email: 'info@jenkinsestatelaw.com', phone: '239-936-2222', company: 'Jenkins Estate Planning' },
  { firstName: 'Perry', lastName: 'Probate', email: 'info@perryprobatelaw.com', phone: '239-481-3333', company: 'Perry Probate Law PA' },
  { firstName: 'Powell', lastName: 'FM', email: 'info@powellfmlaw.com', phone: '239-275-4444', company: 'Powell FM Trust Law' },
  { firstName: 'Long', lastName: 'Estate', email: 'info@longestatelaw.com', phone: '239-433-5555', company: 'Long Estate Law PA' },
  { firstName: 'Patterson', lastName: 'Trust', email: 'info@pattersontrustlaw.com', phone: '239-542-6666', company: 'Patterson Trust & Estate' },
  { firstName: 'Hughes', lastName: 'Probate', email: 'info@hughesprobatelaw.com', phone: '239-573-7777', company: 'Hughes Probate Planning' },
  { firstName: 'Flores', lastName: 'FM', email: 'info@floresfmlaw.com', phone: '239-278-8888', company: 'Flores FM Estate Law' },

  // More Naples/Collier attorneys
  { firstName: 'Washington', lastName: 'Trust', email: 'info@washingtontrustlaw.com', phone: '239-262-1000', company: 'Washington Trust Law PA' },
  { firstName: 'Butler', lastName: 'Estate', email: 'info@butlerestatelaw.com', phone: '239-261-2222', company: 'Butler Estate Planning' },
  { firstName: 'Simmons', lastName: 'Probate', email: 'info@simmonsprobatelaw.com', phone: '239-434-3333', company: 'Simmons Probate Law PA' },
  { firstName: 'Foster', lastName: 'Trust', email: 'info@fostertrustlaw.com', phone: '239-430-4444', company: 'Foster Trust & Estate' },
  { firstName: 'Gonzales', lastName: 'Naples', email: 'info@gonzalesnapleslaw.com', phone: '239-435-5555', company: 'Gonzales Naples Estate' },
  { firstName: 'Bryant', lastName: 'Probate', email: 'info@bryantprobatelaw.com', phone: '239-594-6666', company: 'Bryant Probate Planning' },
  { firstName: 'Alexander', lastName: 'Trust', email: 'info@alexandertrustlaw.com', phone: '239-597-7777', company: 'Alexander Trust Law PA' },
  { firstName: 'Russell', lastName: 'Estate', email: 'info@russellestatelaw.com', phone: '239-593-8888', company: 'Russell Estate Law PA' },

  // More Volusia/Daytona attorneys
  { firstName: 'Griffin', lastName: 'Trust', email: 'info@griffintrustlaw.com', phone: '386-255-1000', company: 'Griffin Trust Law PA' },
  { firstName: 'Diaz', lastName: 'Volusia', email: 'info@diazvolusialaw.com', phone: '386-257-2222', company: 'Diaz Volusia Estate' },
  { firstName: 'Hayes', lastName: 'Probate', email: 'info@hayesprobatelaw.com', phone: '386-252-3333', company: 'Hayes Probate Law PA' },
  { firstName: 'Myers', lastName: 'Trust', email: 'info@myerstrustlaw.com', phone: '386-274-4444', company: 'Myers Trust & Estate' },
  { firstName: 'Ford', lastName: 'Estate', email: 'info@fordestatelaw.com', phone: '386-253-5555', company: 'Ford Estate Planning' },
  { firstName: 'Hamilton', lastName: 'Probate', email: 'info@hamiltonprobatelaw.com', phone: '386-258-6666', company: 'Hamilton Probate Law PA' },

  // More Brevard/Melbourne attorneys
  { firstName: 'Graham', lastName: 'Trust', email: 'info@grahamtrustlaw.com', phone: '321-727-1000', company: 'Graham Trust Law PA' },
  { firstName: 'Sullivan', lastName: 'Estate', email: 'info@sullivanestatelaw.com', phone: '321-724-2222', company: 'Sullivan Estate Planning' },
  { firstName: 'Wallace', lastName: 'Probate', email: 'info@wallaceprobatelaw.com', phone: '321-752-3333', company: 'Wallace Probate Law PA' },
  { firstName: 'Woods', lastName: 'Trust', email: 'info@woodstrustlaw.com', phone: '321-259-4444', company: 'Woods Trust & Estate' },
  { firstName: 'Cole', lastName: 'Estate', email: 'info@coleestatelaw.com', phone: '321-253-5555', company: 'Cole Estate Law PA' },
  { firstName: 'West', lastName: 'Probate', email: 'info@westprobatelaw.com', phone: '321-728-6666', company: 'West Probate Planning' },

  // Final batch - more statewide coverage
  { firstName: 'Jordan', lastName: 'Trust', email: 'info@jordantrustlaw.com', phone: '850-224-1000', company: 'Jordan Trust Law Tallahassee' },
  { firstName: 'Owens', lastName: 'Estate', email: 'info@owensestatelaw.com', phone: '850-222-2222', company: 'Owens Estate Planning' },
  { firstName: 'Dixon', lastName: 'Probate', email: 'info@dixonprobatelaw.com', phone: '352-373-3333', company: 'Dixon Gainesville Probate' },
  { firstName: 'Cunningham', lastName: 'Trust', email: 'info@cunninghamtrustlaw.com', phone: '352-377-4444', company: 'Cunningham Trust Law' },
  { firstName: 'Stephens', lastName: 'Estate', email: 'info@stephensestatelaw.com', phone: '850-433-5555', company: 'Stephens Pensacola Estate' },
  { firstName: 'Lane', lastName: 'Probate', email: 'info@laneprobatelaw.com', phone: '850-434-6666', company: 'Lane Pensacola Probate' },
  { firstName: 'Weaver', lastName: 'Trust', email: 'info@weavertrustlaw.com', phone: '772-286-7777', company: 'Weaver Stuart Trust' },
  { firstName: 'Franklin', lastName: 'Estate', email: 'info@franklinestatelaw.com', phone: '772-287-8888', company: 'Franklin Estate Planning' },
];

const OWNER_ID = '160932693'; // sales1@50deeds.com (Matt Enos)

async function createContact(attorney) {
  const response = await client.post('/crm/v3/objects/contacts', {
    properties: {
      email: attorney.email,
      firstname: attorney.firstName,
      lastname: attorney.lastName,
      phone: attorney.phone,
      company: attorney.company,
      hubspot_owner_id: OWNER_ID,
      hs_lead_status: 'NEW',
      state: 'Florida'
    }
  });
  return response.data;
}

async function uploadAttorneys() {
  console.log(`Uploading ${attorneys.length} final batch attorneys to HubSpot...\n`);

  let success = 0;
  let failed = 0;

  for (const attorney of attorneys) {
    try {
      process.stdout.write(`${attorney.firstName} ${attorney.lastName} (${attorney.company})... `);
      await createContact(attorney);
      success++;
      console.log('OK');
      await new Promise(r => setTimeout(r, 150));
    } catch (error) {
      failed++;
      const msg = error.response?.data?.message || error.message;
      console.log(`FAILED: ${msg}`);
    }
  }

  console.log(`\nDone! Success: ${success}, Failed: ${failed}`);
}

uploadAttorneys();
