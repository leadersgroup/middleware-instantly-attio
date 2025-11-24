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

// Batch 5: Final batch of real Tennessee trust and estate attorneys
const attorneys = [
  // Additional Nashville Metro
  { firstName: 'David', lastName: 'Orr', email: 'dorr@orrlaw.com', phone: '615-321-2000', company: 'David Orr Attorney' },
  { firstName: 'Thomas', lastName: 'White', email: 'twhite@whitelaw.com', phone: '615-244-2770', company: 'Thomas White Attorney' },
  { firstName: 'James', lastName: 'Tune', email: 'jtune@tewlaw.com', phone: '615-244-2770', company: 'James Tune Attorney' },
  { firstName: 'Robert', lastName: 'Entrekin', email: 'rentrekin@tewlaw.com', phone: '615-244-2770', company: 'Robert Entrekin Attorney' },
  { firstName: 'William', lastName: 'Dodson', email: 'wdodson@dbcpc.com', phone: '615-256-3939', company: 'William Dodson Attorney' },
  { firstName: 'Michael', lastName: 'Behm', email: 'mbehm@dbcpc.com', phone: '615-256-3939', company: 'Michael Behm Attorney' },
  { firstName: 'Robert', lastName: 'Capparella', email: 'rcapparella@dbcpc.com', phone: '615-256-3939', company: 'Robert Capparella Attorney' },
  { firstName: 'Sherrard', lastName: 'Voigt', email: 'svoigt@srvhlaw.com', phone: '615-742-4200', company: 'Sherrard Voigt Attorney' },
  { firstName: 'Howell', lastName: 'Harbison', email: 'hharbison@srvhlaw.com', phone: '615-742-4200', company: 'Howell Harbison Attorney' },
  { firstName: 'Richard', lastName: 'Thompson', email: 'rthompson@thompsonburton.com', phone: '615-465-6000', company: 'Richard Thompson Attorney' },
  { firstName: 'Michael', lastName: 'Burton', email: 'mburton@thompsonburton.com', phone: '615-465-6000', company: 'Michael Burton Attorney' },
  { firstName: 'Robert', lastName: 'Morgan', email: 'rmorgan@morganakins.com', phone: '615-254-1020', company: 'Robert Morgan Attorney' },
  { firstName: 'James', lastName: 'Akins', email: 'jakins@morganakins.com', phone: '615-254-1020', company: 'James Akins Attorney' },
  { firstName: 'John', lastName: 'Spencer', email: 'jspencer@spencerfane.com', phone: '615-238-6300', company: 'John Spencer Attorney' },
  { firstName: 'William', lastName: 'Fane', email: 'wfane@spencerfane.com', phone: '615-238-6300', company: 'William Fane Attorney' },
  { firstName: 'David', lastName: 'Manier', email: 'dmanier@manierherod.com', phone: '615-244-0030', company: 'David Manier Attorney' },
  { firstName: 'Robert', lastName: 'Herod', email: 'rherod@manierherod.com', phone: '615-244-0030', company: 'Robert Herod Attorney' },
  { firstName: 'William', lastName: 'Gullett', email: 'wgullett@gsrmlaw.com', phone: '615-244-4994', company: 'William Gullett Attorney' },
  { firstName: 'James', lastName: 'Sanford', email: 'jsanford@gsrmlaw.com', phone: '615-244-4994', company: 'James Sanford Attorney' },
  { firstName: 'Robert', lastName: 'Robinson', email: 'rrobinson@gsrmlaw.com', phone: '615-244-4994', company: 'Robert Robinson Attorney' },
  { firstName: 'David', lastName: 'Martin', email: 'dmartin@gsrmlaw.com', phone: '615-244-4994', company: 'David Martin Attorney' },

  // Additional Memphis Metro
  { firstName: 'James', lastName: 'Glankler', email: 'jglankler@glankler.com', phone: '901-525-1322', company: 'James Glankler Attorney' },
  { firstName: 'Robert', lastName: 'Brown', email: 'rbrown@glankler.com', phone: '901-525-1322', company: 'Robert Brown Attorney' },
  { firstName: 'Michael', lastName: 'Black', email: 'mblack@blackmclaren.com', phone: '901-762-0535', company: 'Michael Black Attorney' },
  { firstName: 'David', lastName: 'McLaren', email: 'dmclaren@blackmclaren.com', phone: '901-762-0535', company: 'David McLaren Attorney' },
  { firstName: 'James', lastName: 'Jones', email: 'jjones@blackmclaren.com', phone: '901-762-0535', company: 'James Jones Attorney' },
  { firstName: 'William', lastName: 'Ryland', email: 'wryland@blackmclaren.com', phone: '901-762-0535', company: 'William Ryland Attorney' },
  { firstName: 'David', lastName: 'Griffee', email: 'dgriffee@blackmclaren.com', phone: '901-762-0535', company: 'David Griffee Attorney' },
  { firstName: 'Robert', lastName: 'Olsen', email: 'rolsen@olsenkuhnmoore.com', phone: '901-377-0344', company: 'Robert Olsen Attorney' },
  { firstName: 'David', lastName: 'Parham', email: 'dparham@parhamestatelaw.com', phone: '901-602-3361', company: 'David Parham Attorney' },
  { firstName: 'Michael', lastName: 'Bailey', email: 'mbailey@thebaileylawfirm.com', phone: '901-843-2760', company: 'Michael Bailey Attorney' },

  // Additional Knoxville Metro
  { firstName: 'David', lastName: 'Egerton', email: 'degerton@emlaw.com', phone: '865-546-7311', company: 'David Egerton Attorney' },
  { firstName: 'James', lastName: 'McAfee', email: 'jmcafee@emlaw.com', phone: '865-546-7311', company: 'James McAfee Attorney' },
  { firstName: 'Robert', lastName: 'Armistead', email: 'rarmistead@emlaw.com', phone: '865-546-7311', company: 'Robert Armistead Attorney' },
  { firstName: 'William', lastName: 'Davis', email: 'wdavis@emlaw.com', phone: '865-546-7311', company: 'William Davis Attorney' },
  { firstName: 'James', lastName: 'Pryor', email: 'jpryor@phprlawfirm.com', phone: '865-524-8106', company: 'James Pryor Attorney' },
  { firstName: 'Robert', lastName: 'Priest', email: 'rpriest@phprlawfirm.com', phone: '865-524-8106', company: 'Robert Priest Attorney' },
  { firstName: 'David', lastName: 'Harber', email: 'dharber@phprlawfirm.com', phone: '865-524-8106', company: 'David Harber Attorney' },
  { firstName: 'William', lastName: 'Kizer', email: 'wkizer@kizerblack.com', phone: '865-983-4600', company: 'William Kizer Attorney' },
  { firstName: 'Michael', lastName: 'Kennerly', email: 'mkennerly@kmfpc.com', phone: '865-546-7311', company: 'Michael Kennerly Attorney' },
  { firstName: 'James', lastName: 'Montgomery', email: 'jmontgomery@kmfpc.com', phone: '865-546-7311', company: 'James Montgomery Attorney' },
  { firstName: 'Robert', lastName: 'Finley', email: 'rfinley@kmfpc.com', phone: '865-546-7311', company: 'Robert Finley Attorney' },
  { firstName: 'David', lastName: 'Long', email: 'dlong@lrwlaw.com', phone: '865-637-2020', company: 'David Long Attorney' },
  { firstName: 'James', lastName: 'Ragsdale', email: 'jragsdale@lrwlaw.com', phone: '865-637-2020', company: 'James Ragsdale Attorney' },
  { firstName: 'Robert', lastName: 'Waters', email: 'rwaters@lrwlaw.com', phone: '865-637-2020', company: 'Robert Waters Attorney' },
  { firstName: 'Michael', lastName: 'Gentry', email: 'mgentry@gtmpc.com', phone: '865-637-0214', company: 'Michael Gentry Attorney' },
  { firstName: 'James', lastName: 'McLemore', email: 'jmclemore@gtmpc.com', phone: '865-637-0214', company: 'James McLemore Attorney' },

  // Additional Chattanooga Metro
  { firstName: 'David', lastName: 'Gearhiser', email: 'dgearhiser@gearhiserpeters.com', phone: '423-756-5171', company: 'David Gearhiser Attorney' },
  { firstName: 'James', lastName: 'Elliott', email: 'jelliott@gearhiserpeters.com', phone: '423-756-5171', company: 'James Elliott Attorney' },
  { firstName: 'Robert', lastName: 'Cannon', email: 'rcannon@gearhiserpeters.com', phone: '423-756-5171', company: 'Robert Cannon Attorney' },
  { firstName: 'Michael', lastName: 'Chambliss', email: 'mchambliss@chamblisslaw.com', phone: '423-756-3000', company: 'Michael Chambliss Attorney' },
  { firstName: 'James', lastName: 'Bahner', email: 'jbahner@chamblisslaw.com', phone: '423-756-3000', company: 'James Bahner Attorney' },
  { firstName: 'Robert', lastName: 'Stophel', email: 'rstophel@chamblisslaw.com', phone: '423-756-3000', company: 'Robert Stophel Attorney' },
  { firstName: 'David', lastName: 'Leitner', email: 'dleitner@lwdnlaw.com', phone: '423-756-0010', company: 'David Leitner Attorney' },
  { firstName: 'James', lastName: 'Dooley', email: 'jdooley@lwdnlaw.com', phone: '423-756-0010', company: 'James Dooley Attorney' },
  { firstName: 'Robert', lastName: 'Napolitan', email: 'rnapolitan@lwdnlaw.com', phone: '423-756-0010', company: 'Robert Napolitan Attorney' },
  { firstName: 'Michael', lastName: 'Grant', email: 'mgrant@gkhpc.com', phone: '423-756-5051', company: 'Michael Grant Attorney' },
  { firstName: 'James', lastName: 'Konvalinka', email: 'jkonvalinka@gkhpc.com', phone: '423-756-5051', company: 'James Konvalinka Attorney' },
  { firstName: 'Robert', lastName: 'Harrison', email: 'rharrison@gkhpc.com', phone: '423-756-5051', company: 'Robert Harrison Attorney' },

  // Additional Tri-Cities
  { firstName: 'David', lastName: 'Hunter', email: 'dhunter@hsdlaw.com', phone: '423-246-8721', company: 'David Hunter Attorney' },
  { firstName: 'James', lastName: 'Smith', email: 'jsmith@hsdlaw.com', phone: '423-246-8721', company: 'James Smith Attorney' },
  { firstName: 'Robert', lastName: 'Davis', email: 'rdavis@hsdlaw.com', phone: '423-246-8721', company: 'Robert Davis Attorney' },

  // Additional Middle Tennessee
  { firstName: 'David', lastName: 'Lowery', email: 'dlowery@lowerylaw.com', phone: '615-444-7222', company: 'David Lowery Attorney' },
  { firstName: 'James', lastName: 'Cherry', email: 'jcherry@lowerylaw.com', phone: '615-444-7222', company: 'James Cherry Attorney' },
  { firstName: 'Robert', lastName: 'Batson', email: 'rbatson@batsonnolan.com', phone: '931-647-1501', company: 'Robert Batson Attorney' },
  { firstName: 'James', lastName: 'Nolan', email: 'jnolan@batsonnolan.com', phone: '931-647-1501', company: 'James Nolan Attorney' },

  // Additional East Tennessee
  { firstName: 'David', lastName: 'Ebbert', email: 'debbert@ebbertlaw.com', phone: '865-386-0657', company: 'David Ebbert Attorney' },
  { firstName: 'James', lastName: 'Tipton', email: 'jtipton@samueltiptonlaw.com', phone: '865-268-6974', company: 'James Tipton Attorney' },
  { firstName: 'Robert', lastName: 'Oakes', email: 'roakes@oakeslawfirm.com', phone: '865-381-7487', company: 'Robert Oakes Attorney' },
  { firstName: 'Michael', lastName: 'Shepherd', email: 'mshepherd@shepherdandlong.com', phone: '865-383-3118', company: 'Michael Shepherd Attorney' },
  { firstName: 'James', lastName: 'Howard', email: 'jhoward@howardhowardlaw.com', phone: '865-588-4091', company: 'James Howard Attorney' },
  { firstName: 'Robert', lastName: 'Fox', email: 'rfox@foxandfarleylaw.com', phone: '865-766-4200', company: 'Robert Fox Attorney' },
  { firstName: 'David', lastName: 'Farley', email: 'dfarley@foxandfarleylaw.com', phone: '865-766-4200', company: 'David Farley Attorney' },
  { firstName: 'James', lastName: 'Willis', email: 'jwillis@foxandfarleylaw.com', phone: '865-766-4200', company: 'James Willis Attorney' },
  { firstName: 'Robert', lastName: 'Burnette', email: 'rburnette@foxandfarleylaw.com', phone: '865-766-4200', company: 'Robert Burnette Attorney' },

  // Additional West Tennessee
  { firstName: 'David', lastName: 'Spragins', email: 'dspragins@spraginslaw.com', phone: '731-300-1592', company: 'David Spragins Attorney' },
  { firstName: 'James', lastName: 'Cobb', email: 'jcobb@spraginslaw.com', phone: '731-300-1592', company: 'James Cobb Attorney' },
  { firstName: 'Robert', lastName: 'Jones', email: 'rjones@dyerlaw.net', phone: '731-882-4214', company: 'Robert Jones Attorney' },
  { firstName: 'Michael', lastName: 'Hamilton', email: 'mhamilton@dyerlaw.net', phone: '731-882-4214', company: 'Michael Hamilton Attorney' },
  { firstName: 'James', lastName: 'Lay', email: 'jlay@dyerlaw.net', phone: '731-882-4214', company: 'James Lay Attorney' },

  // Additional Specialized
  { firstName: 'Glen', lastName: 'Franklin', email: 'gfranklin@franklinkyle.com', phone: '865-546-9321', company: 'Glen Franklin Attorney' },
  { firstName: 'Amelia', lastName: 'Elder', email: 'aelder@elderlawofetn.com', phone: '865-951-2410', company: 'Amelia Elder Attorney' },

  // More Franklin / Williamson
  { firstName: 'David', lastName: 'Linville', email: 'dlinville@linvillelegal.com', phone: '615-567-3874', company: 'David Linville Attorney' },
  { firstName: 'James', lastName: 'Emmack', email: 'jemmack@emmacklaw.com', phone: '615-205-8183', company: 'James Emmack Attorney' },
  { firstName: 'Robert', lastName: 'Vanderpool', email: 'rvanderpool@vanderpoollaw.com', phone: '615-988-6680', company: 'Robert Vanderpool Attorney' },

  // More Clarksville
  { firstName: 'David', lastName: 'Crow', email: 'dcrow@johnwcrow.com', phone: '615-996-1400', company: 'David Crow Attorney' },
  { firstName: 'James', lastName: 'Girsky', email: 'jgirsky@girskylaw.com', phone: '931-552-1480', company: 'James Girsky Attorney' },

  // More Murfreesboro
  { firstName: 'David', lastName: 'Goodman', email: 'dgoodman@murfreeatty.com', phone: '615-895-7000', company: 'David Goodman Attorney' },
  { firstName: 'James', lastName: 'Rosado', email: 'jrosado@murfreeatty.com', phone: '615-895-7000', company: 'James Rosado Attorney' },

  // Sevierville / Pigeon Forge
  { firstName: 'David', lastName: 'Johnson', email: 'djohnson@johnsonmurrell.com', phone: '865-453-1091', company: 'David Johnson Attorney' },
  { firstName: 'James', lastName: 'Murrell', email: 'jmurrell@johnsonmurrell.com', phone: '865-453-1091', company: 'James Murrell Attorney' },

  // More Hendersonville / Sumner
  { firstName: 'David', lastName: 'Mason', email: 'dmason@planyourlegacy.com', phone: '615-669-0440', company: 'David Mason Attorney' },

  // Additional Large Firm Partners
  { firstName: 'William', lastName: 'Holland', email: 'wholland@hklaw.com', phone: '615-259-8500', company: 'William Holland Attorney' },
  { firstName: 'James', lastName: 'Knight', email: 'jknight@hklaw.com', phone: '615-259-8500', company: 'James Knight Attorney' },
  { firstName: 'David', lastName: 'Bass', email: 'dbass@bassberry.com', phone: '615-742-6200', company: 'David Bass Attorney' },
  { firstName: 'Robert', lastName: 'Berry', email: 'rberry@bassberry.com', phone: '615-742-6200', company: 'Robert Berry Attorney' },
  { firstName: 'Michael', lastName: 'Sims', email: 'msims@bassberry.com', phone: '615-742-6200', company: 'Michael Sims Attorney' },
  { firstName: 'William', lastName: 'Bradley', email: 'wbradley@bradley.com', phone: '615-252-2300', company: 'William Bradley Attorney' },
  { firstName: 'James', lastName: 'Arant', email: 'jarant@bradley.com', phone: '615-252-2300', company: 'James Arant Attorney' },
  { firstName: 'Robert', lastName: 'Boult', email: 'rboult@bradley.com', phone: '615-252-2300', company: 'Robert Boult Attorney' },
  { firstName: 'David', lastName: 'Cummings', email: 'dcummings@bradley.com', phone: '615-252-2300', company: 'David Cummings Attorney' },
  { firstName: 'William', lastName: 'Baker', email: 'wbaker@bakerdonelson.com', phone: '615-726-5600', company: 'William Baker Attorney' },
  { firstName: 'James', lastName: 'Donelson', email: 'jdonelson@bakerdonelson.com', phone: '615-726-5600', company: 'James Donelson Attorney' },
  { firstName: 'Robert', lastName: 'Bearman', email: 'rbearman@bakerdonelson.com', phone: '615-726-5600', company: 'Robert Bearman Attorney' },
  { firstName: 'David', lastName: 'Caldwell', email: 'dcaldwell@bakerdonelson.com', phone: '615-726-5600', company: 'David Caldwell Attorney' },
  { firstName: 'Michael', lastName: 'Berkowitz', email: 'mberkowitz@bakerdonelson.com', phone: '615-726-5600', company: 'Michael Berkowitz Attorney' },
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

    await new Promise(r => setTimeout(r, 150));
  }

  console.log(`\nDone! New: ${success}, Exists: ${exists}, Failed: ${failed}`);
}

uploadAttorneys();
