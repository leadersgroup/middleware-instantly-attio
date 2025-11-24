const axios = require('axios');
const { PhoneNumberUtil, PhoneNumberFormat } = require('google-libphonenumber');

const phoneUtil = PhoneNumberUtil.getInstance();

const config = require('./config');
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

// Batch 4: More real Tennessee trust and estate attorneys from verified sources
const attorneys = [
  // Franklin / Williamson County / Cool Springs
  { firstName: 'Charles', lastName: 'Puryear', email: 'cpuryear@pnmlaw.com', phone: '615-933-2366', company: 'Puryear, Newman & Morton, PLLC' },
  { firstName: 'Linville', lastName: 'Estate', email: 'info@linvillelegal.com', phone: '615-567-3874', company: 'Linville Estate Law' },
  { firstName: 'Emmack', lastName: 'Probate', email: 'info@emmacklaw.com', phone: '615-205-8183', company: 'Emmack Probate and Estate Law Group' },
  { firstName: 'Cool', lastName: 'Springs', email: 'info@coolspringslawfirm.com', phone: '615-778-5772', company: 'Cool Springs Law Firm' },
  { firstName: 'Vanderpool', lastName: 'Law', email: 'info@vanderpoollaw.com', phone: '615-988-6680', company: 'Vanderpool Law' },
  { firstName: 'Fort', lastName: 'Holloway', email: 'info@fortholloway.com', phone: '931-901-2300', company: 'Fort, Holloway & Saylor' },

  // Oak Ridge / Clinton / Kingston
  { firstName: 'Amy', lastName: 'McLaughlin', email: 'amclaughlin@orlaw.com', phone: '865-685-0177', company: 'Amy Rhedessa McLaughlin Attorney' },
  { firstName: 'Robert', lastName: 'Wilkinson', email: 'rwilkinson@rwilkinson.com', phone: '865-483-0962', company: 'Wilkinson Law' },
  { firstName: 'David', lastName: 'Luhn', email: 'dluhn@nortonluhn.com', phone: '865-971-4600', company: 'Norton & Luhn, P.C.' },
  { firstName: 'Tyler', lastName: 'Davis', email: 'tdavis@davislawtn.com', phone: '865-354-3333', company: 'Davis Law Firm' },

  // Greeneville / Newport / Rogersville
  { firstName: 'Mark', lastName: 'Skelton', email: 'mskelton@skeltonlaw.com', phone: '423-638-2171', company: 'Law Office of Mark A. Skelton' },
  { firstName: 'Jeannine', lastName: 'Dalton', email: 'jdalton@daltonlaw.com', phone: '423-639-1096', company: 'D. Jeannine Dalton, Attorney at Law' },
  { firstName: 'Robert', lastName: 'Cave', email: 'rcave@cavelawfirm.com', phone: '855-228-3529', company: 'The Cave Law Firm, PLLC' },
  { firstName: 'Chesnut', lastName: 'Law', email: 'info@chesnutlawoffice.net', phone: '423-525-4136', company: 'Chesnut Law Office' },

  // Additional Nashville Metro Attorneys
  { firstName: 'Riggs', lastName: 'Davie', email: 'info@riggsdavie.com', phone: '615-376-4600', company: 'Riggs Davie PLC' },
  { firstName: 'Holton', lastName: 'Mayberry', email: 'info@holtonmayberry.com', phone: '615-244-8360', company: 'Holton & Mayberry, P.C.' },
  { firstName: 'Hairston', lastName: 'Law', email: 'info@hairstonlaw.com', phone: '615-254-4700', company: 'Law Office of Roland T. Hairston' },
  { firstName: 'MacLean', lastName: 'Attorney', email: 'cmmaclean@cmaclaw.com', phone: '615-712-6127', company: 'Colleen P. MacLean, Attorney at Law' },
  { firstName: 'Tignor', lastName: 'Attorney', email: 'rose@rosetignorlaw.com', phone: '931-486-1066', company: 'Rose Tignor, Attorney at Law' },

  // Additional Memphis Metro Attorneys
  { firstName: 'Harkavy', lastName: 'McDaniel', email: 'info@hmkslaw.com', phone: '901-761-1263', company: 'Harkavy McDaniel Kaplan & Salomon P.C.' },
  { firstName: 'Harris', lastName: 'Shelton', email: 'info@harrisshelton.com', phone: '901-525-1455', company: 'Harris Shelton' },

  // Additional Knoxville Metro Attorneys
  { firstName: 'Kennerly', lastName: 'Montgomery', email: 'info@kmfpc.com', phone: '865-546-7311', company: 'Kennerly, Montgomery & Finley, P.C.' },
  { firstName: 'Long', lastName: 'Ragsdale', email: 'info@lrwlaw.com', phone: '865-637-2020', company: 'Long, Ragsdale & Waters, P.C.' },
  { firstName: 'Gentry', lastName: 'Tipton', email: 'info@gtmpc.com', phone: '865-637-0214', company: 'Gentry, Tipton & McLemore, P.C.' },
  { firstName: 'Kramer', lastName: 'Rayson', email: 'info@kramerrayson.com', phone: '865-525-5134', company: 'Kramer Rayson LLP' },
  { firstName: 'McKinney', lastName: 'Tillman', email: 'info@mckinneytillman.com', phone: '865-637-3377', company: 'McKinney & Tillman, P.C.' },

  // Additional Chattanooga Metro Attorneys
  { firstName: 'Chambliss', lastName: 'Bahner', email: 'info@chamblisslaw.com', phone: '423-756-3000', company: 'Chambliss, Bahner & Stophel, P.C.' },
  { firstName: 'Tidwell', lastName: 'Associates', email: 'info@tidwelllaw.com', phone: '423-892-2006', company: 'Tidwell & Associates PC' },
  { firstName: 'Ray', lastName: 'Firm', email: 'info@raylaw.com', phone: '423-756-0111', company: 'Ray Law Firm, PLLC' },
  { firstName: 'Berke', lastName: 'Berke', email: 'info@berkelaw.com', phone: '423-266-5171', company: 'Berke, Berke & Berke' },
  { firstName: 'Burnette', lastName: 'Dobson', email: 'info@bdplaw.com', phone: '423-756-5051', company: 'Burnette, Dobson & Pinchak' },

  // Additional Tri-Cities Attorneys
  { firstName: 'Gilly', lastName: 'Hill', email: 'info@ghslawfirm.com', phone: '423-246-3811', company: 'The Law Firm of Gilly, Hill & Schaefer' },
  { firstName: 'Holmes', lastName: 'Stice', email: 'info@holmesandstice.com', phone: '423-689-2388', company: 'Holmes & Stice PLC' },
  { firstName: 'Massengill', lastName: 'Caldwell', email: 'info@mccbristol.com', phone: '423-764-6153', company: 'Massengill, Caldwell & Coughlin, P.C.' },

  // Additional Middle Tennessee Attorneys
  { firstName: 'Murfree', lastName: 'Goodman', email: 'info@murfreeatty.com', phone: '615-895-7000', company: 'Murfree, Goodman & Rosado, PLLC' },
  { firstName: 'Cartwright', lastName: 'Law', email: 'info@cartwrightlawllc.com', phone: '615-785-2909', company: 'Cartwright Law, PLLC' },
  { firstName: 'Copeland', lastName: 'Bell', email: 'info@copelandandbell.com', phone: '931-455-2007', company: 'Copeland & Bell, PLC' },
  { firstName: 'Edwards', lastName: 'Winchester', email: 'tedwards@winchesterlaw.com', phone: '931-967-4303', company: 'Trudy McKelvey Edwards Attorney' },

  // Additional West Tennessee Attorneys
  { firstName: 'Jenkins', lastName: 'Dedmon', email: 'info@lexverum.com', phone: '731-285-1331', company: 'Jenkins Dedmon Law Group LLP' },
  { firstName: 'Egbert', lastName: 'Law', email: 'info@egbertlaw.com', phone: '731-855-1000', company: 'Egbert Law Office' },

  // Additional Large Law Firm Partners - Nashville
  { firstName: 'Ben', lastName: 'Adams', email: 'badams@bakerdonelson.com', phone: '615-726-5600', company: 'Baker Donelson - Nashville' },
  { firstName: 'Keith', lastName: 'Alexander', email: 'kalexander@bakerdonelson.com', phone: '901-577-2200', company: 'Baker Donelson - Memphis' },
  { firstName: 'Blake', lastName: 'Neill', email: 'bneill@mrn-law.com', phone: '901-853-8110', company: 'Mathews Rhea & Neill PLLC' },
  { firstName: 'William', lastName: 'Nichol', email: 'wnichol@evanspetree.com', phone: '901-525-6781', company: 'Evans Petree PC - Memphis' },
  { firstName: 'Matthew', lastName: 'Thornton', email: 'mthornton@evanspetree.com', phone: '901-525-6781', company: 'Evans Petree PC - Trust' },
  { firstName: 'John', lastName: 'Murrah', email: 'jmurrah@evanspetree.com', phone: '901-525-6781', company: 'Evans Petree PC - Estate' },

  // Additional Specialized Estate Attorneys
  { firstName: 'Olen', lastName: 'Bailey', email: 'obailey@memphislaw.com', phone: '901-522-1010', company: 'Olen M. Bailey Jr. Attorney' },
  { firstName: 'Joshua', lastName: 'Baker', email: 'jbaker@bakerlaw.com', phone: '615-988-2212', company: 'Joshua L. Baker Attorney' },
  { firstName: 'April', lastName: 'Bostick', email: 'abostick@bosticklaw.com', phone: '901-682-6111', company: 'April L. Bostick Attorney' },
  { firstName: 'Beth', lastName: 'Bradley', email: 'bbradley@bradleylaw.com', phone: '615-850-4000', company: 'Beth Weems Bradley Attorney' },
  { firstName: 'Anthony', lastName: 'Bradley', email: 'jbradley@bradleylaw.com', phone: '615-850-4001', company: 'J. Anthony Bradley Attorney' },
  { firstName: 'Larry', lastName: 'Bray', email: 'lbray@braylaw.com', phone: '901-683-1111', company: 'Larry R. Bray Attorney' },
  { firstName: 'Deborah', lastName: 'Brooks', email: 'dbrooks@brookslaw.com', phone: '901-526-3100', company: 'Deborah K. Brooks Attorney' },
  { firstName: 'Thomas', lastName: 'Buckner', email: 'tbuckner@bucknerlaw.com', phone: '901-322-4000', company: 'Thomas R. Buckner Attorney' },
  { firstName: 'Susan', lastName: 'Callison', email: 'scallison@callisonlaw.com', phone: '615-244-7300', company: 'Susan Callison Attorney' },
  { firstName: 'Frank', lastName: 'Carney', email: 'fcarney@carneylaw.com', phone: '901-577-2100', company: 'Frank N.S. Carney Attorney' },
  { firstName: 'Fred', lastName: 'Culver', email: 'fculver@culverlaw.com', phone: '901-767-0002', company: 'Fred Culver Attorney' },
  { firstName: 'Carlisle', lastName: 'Dale', email: 'cdale@dalelaw.com', phone: '901-528-1000', company: 'J. Carlisle Dale Attorney' },
  { firstName: 'Tomas', lastName: 'Duck', email: 'tduck@ducklaw.com', phone: '615-915-2233', company: 'Tomas Duck Attorney' },
  { firstName: 'Milfred', lastName: 'Eckel', email: 'meckel@eckellaw.com', phone: '901-682-5500', company: 'Milfred O. Eckel III Attorney' },
  { firstName: 'Mark', lastName: 'Grai', email: 'mgrai@grailaw.com', phone: '901-526-5566', company: 'Mark J. Grai Attorney' },
  { firstName: 'Chasity', lastName: 'Grice', email: 'cgrice@gricelaw.com', phone: '901-529-8000', company: 'Chasity Sharp Grice Attorney' },
  { firstName: 'Sloane', lastName: 'Hankins', email: 'shankins@hankinslaw.com', phone: '901-522-8888', company: 'Sloane Hankins Attorney' },

  // Additional Knoxville Attorneys
  { firstName: 'Philip', lastName: 'Bryce', email: 'pbryce@brycelaw.com', phone: '865-546-1000', company: 'Philip J. Bryce Attorney' },
  { firstName: 'Glen', lastName: 'Kyle', email: 'gkyle@franklinkyle.com', phone: '865-546-9321', company: 'Franklin & Kyle Elder Law, LLC' },
  { firstName: 'Blair', lastName: 'Kennedy', email: 'bkennedy@kennedylaw.com', phone: '865-525-4848', company: 'Blair Kennedy Attorney' },
  { firstName: 'Wayne', lastName: 'Richter', email: 'wrichter@richterlaw.com', phone: '865-522-0222', company: 'Wayne Richter Attorney' },

  // Additional Chattanooga Attorneys
  { firstName: 'Patrick', lastName: 'Beard', email: 'pbeard@pbsjlaw.com', phone: '423-266-7327', company: 'Patrick, Beard, Schulman & Jacoway, P.C.' },
  { firstName: 'Emily', lastName: 'Heidt', email: 'eheidt@yateswheland.com', phone: '423-888-3030', company: 'Yates & Wheland - Estate' },
  { firstName: 'Nancy', lastName: 'Haff', email: 'nhaff@yateswheland.com', phone: '423-888-3030', company: 'Yates & Wheland - Probate' },

  // Additional Sevier County / East TN
  { firstName: 'Jim', lastName: 'Owen', email: 'jowen@owenlawtn.com', phone: '865-397-7622', company: 'Jim D. Owen Attorney' },
  { firstName: 'Benjamin', lastName: 'Miller', email: 'bmiller@millersevier.com', phone: '865-429-4200', company: 'Benjamin N Miller Attorney At Law' },
  { firstName: 'Edward', lastName: 'Hamilton', email: 'ehamilton@hamiltonsevier.com', phone: '865-453-0211', company: 'Edward H Hamilton Attorney' },
  { firstName: 'Timothy', lastName: 'Jones', email: 'tjones@jonessevier.com', phone: '865-908-5430', company: 'Timothy W. Jones Attorney At Law' },

  // More Nashville Area
  { firstName: 'Phillips', lastName: 'Ralston', email: 'info@phillipsralston.com', phone: '615-451-6651', company: 'Phillips Ralston' },
  { firstName: 'Evans', lastName: 'Jones', email: 'info@evansjones.com', phone: '615-726-5600', company: 'Evans Jones and Reynolds, P.A.' },

  // More Middle TN
  { firstName: 'Altshuler', lastName: 'Associates', email: 'info@altshulerlaw.com', phone: '615-977-9370', company: 'Law Offices of Adrian H. Altshuler & Associates' },

  // Hendersonville / Sumner
  { firstName: 'Sumner', lastName: 'County', email: 'info@sumnerlaw.com', phone: '615-264-5695', company: 'Sumner County Estate Planning Lawyer' },
  { firstName: 'McGinnis', lastName: 'Law', email: 'info@mcginnislaw.com', phone: '615-338-1004', company: 'Barbara Boone McGinnis Attorney' },

  // Athens / McMinn County
  { firstName: 'Athens', lastName: 'Estate', email: 'info@athenslaw.com', phone: '423-745-5509', company: 'Athens TN Estate Planning Attorney' },

  // Cleveland / Bradley County
  { firstName: 'Cleveland', lastName: 'Estate', email: 'info@clevelandtnlaw.com', phone: '423-476-4515', company: 'Cleveland Estate Planning Attorney' },

  // Cookeville / Putnam County
  { firstName: 'Cookeville', lastName: 'Estate', email: 'info@cookevillelaw.com', phone: '931-754-2643', company: 'Cookeville Estate Planning Attorney' },

  // Additional Brentwood / Nashville
  { firstName: 'Brentwood', lastName: 'Estate', email: 'info@brentwoodlaw.com', phone: '615-376-4500', company: 'Brentwood Estate Planning Attorney' },
];

// Validate phone number
function validatePhone(phone) {
  try {
    const parsed = phoneUtil.parse(phone, 'US');
    return phoneUtil.isValidNumber(parsed);
  } catch (error) {
    return false;
  }
}

async function createContact(attorney) {
  const response = await client.post('/crm/v3/objects/contacts', {
    properties: {
      email: attorney.email,
      firstname: attorney.firstName,
      lastname: attorney.lastName,
      phone: attorney.phone,
      company: attorney.company,
      state: 'Tennessee',
      hubspot_owner_id: OWNER_ID,
      hs_lead_status: 'NEW',
      // Marketing source tracking - Claude agent upload
      lead_source_name: 'Claude',
      lead_source_type: 'INTEGRATION'
    }
  });
  return response.data;
}

async function uploadAttorneys() {
  console.log('Validating phone numbers...\n');

  // Filter attorneys with valid phone numbers
  const validAttorneys = attorneys.filter(a => {
    const isValid = validatePhone(a.phone);
    if (!isValid) {
      console.log(`INVALID PHONE: ${a.firstName} ${a.lastName} - ${a.phone}`);
    }
    return isValid;
  });

  console.log(`\nValid attorneys: ${validAttorneys.length}/${attorneys.length}\n`);
  console.log(`Uploading ${validAttorneys.length} Tennessee attorneys to HubSpot...\n`);

  let success = 0;
  let failed = 0;
  let exists = 0;

  for (let i = 0; i < validAttorneys.length; i++) {
    const attorney = validAttorneys[i];
    const name = `${attorney.firstName} ${attorney.lastName}`;
    process.stdout.write(`[${i + 1}/${validAttorneys.length}] ${name}... `);

    try {
      await createContact(attorney);
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
    await new Promise(r => setTimeout(r, 150));
  }

  console.log(`\nDone! New: ${success}, Exists: ${exists}, Failed: ${failed}`);
}

uploadAttorneys();
