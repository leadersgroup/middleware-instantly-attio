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

// Batch 3: More real Tennessee trust and estate attorneys from verified sources
const attorneys = [
  // Sevierville / Sevier County
  { firstName: 'Alexander', lastName: 'Johnson', email: 'ajohnson@johnsonmurrell.com', phone: '865-453-1091', company: 'Johnson, Murrell & Associates' },
  { firstName: 'Laura', lastName: 'Reagan', email: 'lreagan@reaganlaw.com', phone: '865-774-1312', company: 'Laura L. Reagan Attorney' },
  { firstName: 'Catherine', lastName: 'Cox', email: 'ecox@coxlawtn.com', phone: '865-293-1037', company: 'E. Catherine Cox Attorney' },

  // Gallatin / Sumner County / Mt Juliet / Lebanon
  { firstName: 'Jay', lastName: 'Johnson', email: 'jay@jayjohnsonlawfirm.com', phone: '731-206-9700', company: 'Johnson Law Firm' },
  { firstName: 'Lowery', lastName: 'Cherry', email: 'info@lowerylaw.com', phone: '615-444-7222', company: 'Lowery, Lowery & Cherry, PLLC' },
  { firstName: 'Yancy', lastName: 'Belcher', email: 'yancy@yancybelcher.com', phone: '615-758-3388', company: 'Attorney Yancy Belcher' },
  { firstName: 'Donnavon', lastName: 'Vasek', email: 'dvasek@vaseklaw.com', phone: '615-488-7949', company: 'Donnavon K. Vasek Attorney' },
  { firstName: 'William', lastName: 'Moore', email: 'wmoore@moorelawgallatin.com', phone: '615-451-2100', company: 'Law Office of William L Moore Jr.' },
  { firstName: 'Turnbow', lastName: 'Law', email: 'info@turnbowlawtn.com', phone: '615-645-4877', company: 'Turnbow Law' },

  // Columbia / Maury County / Lawrenceburg / Pulaski
  { firstName: 'Boston', lastName: 'Holt', email: 'info@bhsdlaw.com', phone: '931-201-9452', company: 'Boston, Holt & Durham, PLLC' },
  { firstName: 'Alan', lastName: 'Betz', email: 'alan@alanbetz.com', phone: '931-279-7926', company: 'Law Office of Alan C. Betz' },
  { firstName: 'Christopher', lastName: 'Williams', email: 'cwilliams@pulaski.com', phone: '931-363-6500', company: 'J. Christopher Williams Attorney' },
  { firstName: 'Adrian', lastName: 'Altshuler', email: 'adrian@altshulerlaw.com', phone: '615-977-9370', company: 'Law Offices of Adrian H. Altshuler & Associates' },

  // McMinnville / Sparta / Upper Cumberland
  { firstName: 'Griffin', lastName: 'Law', email: 'info@griffinlawgroup.org', phone: '931-837-2050', company: 'Griffin Law Group, PLLC' },
  { firstName: 'Daniel', lastName: 'Barnes', email: 'dbarnes@barneslaw.com', phone: '615-597-6725', company: 'Daniel Barnes Attorney' },
  { firstName: 'Randall', lastName: 'Kirby', email: 'rkirby@kirbylaw.com', phone: '615-374-3070', company: 'Randall Glyn Kirby Attorney' },

  // Kingsport / Bristol / Elizabethton
  { firstName: 'Stephen', lastName: 'Gilly', email: 'sgilly@ghslawfirm.com', phone: '423-246-3811', company: 'The Law Firm of Gilly, Hill & Schaefer' },
  { firstName: 'McVey', lastName: 'Law', email: 'info@mcveylawfirm.com', phone: '423-765-0743', company: 'The McVey Law Firm' },
  { firstName: 'TriCities', lastName: 'Law', email: 'info@tricitieslawfirm.com', phone: '423-732-7040', company: 'Tri-Cities Law Firm' },
  { firstName: 'James', lastName: 'Holmes', email: 'jholmes@holmesandstice.com', phone: '423-689-2388', company: 'Holmes & Stice PLC' },
  { firstName: 'Myers', lastName: 'Massengill', email: 'mmassengill@mccbristol.com', phone: '423-764-6153', company: 'Massengill, Caldwell & Coughlin, P.C.' },

  // Maryville / Alcoa / Loudon / Blount County
  { firstName: 'Costner', lastName: 'Greene', email: 'info@costnergreene.com', phone: '865-982-1920', company: 'Costner Greene' },
  { firstName: 'Shepherd', lastName: 'Long', email: 'info@shepherdandlong.com', phone: '865-324-0522', company: 'Shepherd & Long - Maryville' },
  { firstName: 'Nicholas', lastName: 'Black', email: 'nblack@kizerblack.com', phone: '865-977-6899', company: 'Nicholas A. Black Attorney' },
  { firstName: 'James', lastName: 'Snyder', email: 'jsnyder@lawpractice.net', phone: '865-984-1111', company: 'James H. Snyder, Jr. Attorney' },

  // Additional Nashville Metro
  { firstName: 'Cook', lastName: 'Tillman', email: 'info@cooktillmanlaw.com', phone: '615-370-2747', company: 'Cook Tillman Law Group' },
  { firstName: 'Sherrard', lastName: 'Roe', email: 'info@srvhlaw.com', phone: '615-742-4200', company: 'Sherrard Roe Voigt & Harbison, PLC' },
  { firstName: 'Thompson', lastName: 'Burton', email: 'info@thompsonburton.com', phone: '615-465-6000', company: 'Thompson Burton PLLC' },
  { firstName: 'Tune', lastName: 'Entrekin', email: 'info@tewlaw.com', phone: '615-244-2770', company: 'Tune, Entrekin & White, P.C.' },
  { firstName: 'Spencer', lastName: 'Fane', email: 'info@spencerfane.com', phone: '615-238-6300', company: 'Spencer Fane LLP' },
  { firstName: 'Morgan', lastName: 'Akins', email: 'info@morganakins.com', phone: '615-254-1020', company: 'Morgan & Akins, PLLC' },
  { firstName: 'Dodson', lastName: 'Parker', email: 'info@dbcpc.com', phone: '615-256-3939', company: 'Dodson Parker Behm & Capparella, P.C.' },
  { firstName: 'Lannom', lastName: 'Williams', email: 'info@lannomwilliams.com', phone: '615-444-2900', company: 'Lannom & Williams, PLLC' },

  // Additional Memphis Metro
  { firstName: 'Glankler', lastName: 'Brown', email: 'info@glankler.com', phone: '901-525-1322', company: 'Glankler Brown, PLLC' },
  { firstName: 'Black', lastName: 'McLaren', email: 'info@blackmclaren.com', phone: '901-762-0535', company: 'Black McLaren Jones Ryland & Griffee, P.C.' },
  { firstName: 'Olsen', lastName: 'Kuhn', email: 'info@olsenkuhnmoore.com', phone: '901-377-0344', company: 'Olsen, Kuhn & Moore' },

  // Additional Knoxville Metro
  { firstName: 'Egerton', lastName: 'McAfee', email: 'info@emlaw.com', phone: '865-546-7311', company: 'Egerton, McAfee, Armistead & Davis, P.C.' },
  { firstName: 'Pryor', lastName: 'Priest', email: 'info@phprlawfirm.com', phone: '865-524-8106', company: 'Pryor, Priest & Harber' },
  { firstName: 'Kizer', lastName: 'Black', email: 'info@kizerblack.com', phone: '865-983-4600', company: 'Kizer & Black, Attorneys, PLLC' },
  { firstName: 'Volunteer', lastName: 'Law', email: 'info@volunteerlawpllc.com', phone: '865-326-4430', company: 'Volunteer Law PLLC' },
  { firstName: 'LaFevor', lastName: 'Slaughter', email: 'info@lafevorandslaughter.com', phone: '865-674-4088', company: 'LaFevor & Slaughter' },
  { firstName: 'Mandy', lastName: 'Hancock', email: 'info@mandyhancock.com', phone: '865-292-2307', company: 'Mandy Hancock Law, PLLC' },

  // Additional Chattanooga Metro
  { firstName: 'Meyer', lastName: 'Burnett', email: 'info@meyerburnett.com', phone: '423-265-1100', company: 'Meyer & Burnett, PLLC' },
  { firstName: 'Grant', lastName: 'Konvalinka', email: 'info@gkhpc.com', phone: '423-756-5051', company: 'Grant Konvalinka & Harrison, P.C.' },
  { firstName: 'Leitner', lastName: 'Williams', email: 'info@lwdnlaw.com', phone: '423-756-0010', company: 'Leitner Williams Dooley & Napolitan, PLLC' },
  { firstName: 'Burns', lastName: 'Henry', email: 'info@burnshk.com', phone: '423-476-3171', company: 'Burns Henry & Kirksey, P.C.' },
  { firstName: 'Swafford', lastName: 'Jenkins', email: 'info@sjrlaw.com', phone: '423-942-3165', company: 'Swafford, Jenkins & Raines' },

  // Additional Middle Tennessee
  { firstName: 'Reynolds', lastName: 'Potter', email: 'info@rprvlaw.com', phone: '615-446-4370', company: 'Reynolds, Potter, Ragan & Vandivort, PLC' },
  { firstName: 'Puryear', lastName: 'Newman', email: 'info@pnmlaw.com', phone: '615-790-2323', company: 'Puryear, Newman & Morton, PLLC' },
  { firstName: 'Hartzog', lastName: 'Silva', email: 'info@hartzogsilva.com', phone: '615-771-9400', company: 'Hartzog & Silva, PLLC' },
  { firstName: 'Thrailkill', lastName: 'Harris', email: 'info@thwblaw.com', phone: '615-373-2330', company: 'Thrailkill, Harris, Wood & Boswell' },
  { firstName: 'Carter', lastName: 'Shelton', email: 'info@csj.law', phone: '615-383-0073', company: 'Carter Shelton Jones, PLC' },
  { firstName: 'Martin', lastName: 'Heller', email: 'info@mhpslaw.com', phone: '615-256-0500', company: 'Martin Heller Potempa & Sheppard' },

  // Additional West Tennessee
  { firstName: 'Spragins', lastName: 'Barnett', email: 'info@spraginslaw.com', phone: '731-300-1592', company: 'Spragins, Barnett & Cobb, PLC' },

  // Additional East Tennessee
  { firstName: 'Hunter', lastName: 'Smith', email: 'info@hsdlaw.com', phone: '423-246-8721', company: 'Hunter, Smith & Davis, LLP - Kingsport' },
  { firstName: 'Elder', lastName: 'East', email: 'info@elderlawofetn.com', phone: '865-951-2410', company: 'Elder Law of East Tennessee' },

  // Additional Large Firms
  { firstName: 'Holland', lastName: 'Knight', email: 'info@hklaw.com', phone: '615-259-8500', company: 'Holland & Knight LLP - Nashville' },
  { firstName: 'Bass', lastName: 'Berry', email: 'info@bassberry.com', phone: '615-742-6200', company: 'Bass, Berry + Sims PLC' },
  { firstName: 'Bradley', lastName: 'Arant', email: 'info@bradley.com', phone: '615-252-2300', company: 'Bradley Arant Boult Cummings LLP' },
  { firstName: 'Husch', lastName: 'Blackwell', email: 'info@huschblackwell.com', phone: '423-755-2652', company: 'Husch Blackwell LLP - Chattanooga' },
  { firstName: 'Baker', lastName: 'Donelson', email: 'info@bakerdonelson.com', phone: '423-756-2010', company: 'Baker Donelson - Chattanooga' },
  { firstName: 'Lewis', lastName: 'Thomason', email: 'info@lewisthomasson.com', phone: '615-259-1366', company: 'Lewis Thomason, P.C. - Nashville' },
  { firstName: 'Manier', lastName: 'Herod', email: 'info@manierherod.com', phone: '615-244-0030', company: 'Manier & Herod, PC' },
  { firstName: 'Gullett', lastName: 'Sanford', email: 'info@gsrmlaw.com', phone: '615-244-4994', company: 'Gullett Sanford Robinson Martin PLLC' },

  // Additional Specialized Firms
  { firstName: 'Elder', lastName: 'Nashville', email: 'info@elderlawofnashville.com', phone: '615-933-0035', company: 'Elder Law of Nashville PLC' },
  { firstName: 'Fruitful', lastName: 'Firm', email: 'info@fruitfulfirm.com', phone: '615-490-8878', company: 'The Fruitful Firm' },
  { firstName: 'Handelsman', lastName: 'Law', email: 'info@handelsmanlaw.com', phone: '615-915-1324', company: 'Handelsman Law' },
  { firstName: 'Hazard', lastName: 'Law', email: 'info@hazardlawpllc.com', phone: '615-790-7535', company: 'Hazard Law, PLLC' },
  { firstName: 'Hayes', lastName: 'Law', email: 'info@hayeslawpllc.com', phone: '615-730-3524', company: 'Hayes Law, PLLC' },
  { firstName: 'Herring', lastName: 'PC', email: 'info@herringpc.com', phone: '615-329-9500', company: 'D. Jefferson Herring, PC' },
  { firstName: 'Hubbell', lastName: 'Firm', email: 'info@hubbelllaw.com', phone: '931-490-0099', company: 'The Hubbell Firm' },
  { firstName: 'Nemer', lastName: 'LLP', email: 'info@nemerllp.com', phone: '615-651-8505', company: 'Nemer LLP' },
  { firstName: 'Notestine', lastName: 'Law', email: 'info@notestinelaw.com', phone: '615-256-8585', company: 'Notestine Law Firm' },
  { firstName: 'Mulvaney', lastName: 'Law', email: 'info@mulvaneylaw.com', phone: '615-800-7096', company: 'Mulvaney Law' },
  { firstName: 'Freeman', lastName: 'Bracey', email: 'info@freemanandbrancey.com', phone: '615-859-2276', company: 'Freeman & Bracey, PLC' },
  { firstName: 'Wolaver', lastName: 'Carter', email: 'info@wchlaw.com', phone: '931-388-1890', company: 'Wolaver, Carter & Heffington' },
  { firstName: 'Columbia', lastName: 'Law', email: 'info@columbiamediationlaw.com', phone: '931-490-2700', company: 'Columbia Law and Mediation, PLLC' },

  // More Chattanooga
  { firstName: 'Jelks', lastName: 'Law', email: 'info@jelkslaw.com', phone: '423-414-4028', company: 'Jelks Law, PLLC' },
  { firstName: 'Shekari', lastName: 'Law', email: 'info@shekarilaw.com', phone: '423-702-6702', company: 'Shekari Law, PLLC' },
  { firstName: 'Walliser', lastName: 'Law', email: 'info@walliserlawfirm.com', phone: '423-752-0544', company: 'The Walliser Law Firm, PLLC' },
  { firstName: 'VanDolson', lastName: 'Law', email: 'info@vandolsonlaw.com', phone: '423-266-5666', company: 'Van Dolson Law Office' },
  { firstName: 'William', lastName: 'Brown', email: 'info@wjbrownlaw.com', phone: '423-479-3333', company: 'William J. Brown & Associates, PLLC' },

  // More Knoxville
  { firstName: 'Haines', lastName: 'Firm', email: 'info@hainesfirm.com', phone: '865-522-1222', company: 'The Haines Firm' },
  { firstName: 'Ellis', lastName: 'Law', email: 'info@ellislaw.com', phone: '865-524-1111', company: 'Ellis Law Firm, LLC' },

  // More Memphis
  { firstName: 'Laughlin', lastName: 'Law', email: 'info@laughlinlaw.com', phone: '901-218-7820', company: 'Law Office of Harry Laughlin, III' },

  // Crossville / Cookeville
  { firstName: 'Cumberland', lastName: 'Legacy', email: 'info@cumberlandlegacylaw.com', phone: '931-250-8585', company: 'Cumberland Legacy Law' },
  { firstName: 'Simpson', lastName: 'Law', email: 'info@simpsonlawtn.com', phone: '931-340-7444', company: 'Law Office of Donna Simpson' },

  // Tullahoma Area
  { firstName: 'Aaron', lastName: 'Law', email: 'info@dougaaronlaw.com', phone: '931-728-3550', company: 'Doug Aaron Law' },
  { firstName: 'Hull', lastName: 'Lane', email: 'info@tullahomaattorneys.com', phone: '931-455-5478', company: 'Hull, Ray, Rieder & Lane P.C.' },
  { firstName: 'Robertson', lastName: 'Gregory', email: 'info@rworshamlaw.com', phone: '931-455-5407', company: 'Robertson Worsham Gregory Giffin & Hoskins' },
  { firstName: 'Firm', lastName: 'PC', email: 'info@thefirm.law', phone: '931-222-4010', company: 'The Law Firm, PC' },

  // Clarksville
  { firstName: 'Dahl', lastName: 'Law', email: 'info@dahllaw.com', phone: '931-245-5060', company: 'Law Office of Taylor R. Dahl' },
  { firstName: 'Kennedy', lastName: 'Firm', email: 'info@kennedylawfirmpllc.com', phone: '931-444-5620', company: 'Kennedy Law Firm, PLLC' },

  // Cleveland
  { firstName: 'Miller', lastName: 'Firm', email: 'info@millerlawfirmtn.com', phone: '423-464-6852', company: 'Miller Law Firm' },
  { firstName: 'Tapper', lastName: 'Law', email: 'info@jacktapper.com', phone: '423-472-9512', company: 'Jack W. Tapper, Attorney at Law' },

  // Dyersburg / West TN
  { firstName: 'Jones', lastName: 'PLC', email: 'info@dyerlaw.net', phone: '731-882-4214', company: 'Jones Lay PLC' },

  // Murfreesboro
  { firstName: 'Smith', lastName: 'Lepp', email: 'info@smithandlepp.com', phone: '615-893-5538', company: 'The Law Office of Smith & Lepp' },
  { firstName: 'Freeze', lastName: 'Law', email: 'info@freezelaw.com', phone: '615-848-7975', company: 'Ryan A. Freeze Attorney' },
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
