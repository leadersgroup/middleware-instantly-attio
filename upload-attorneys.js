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

const attorneys = [
  // West Palm Beach / Jupiter / Palm Beach
  { firstName: 'Michael', lastName: 'Tribuiani', email: 'info@tribuianilaw.com', phone: '561-420-5765', company: 'Tribuiani Law Firm' },
  { firstName: 'Craig', lastName: 'Snyder', email: 'info@estatebiz.net', phone: '561-627-8774', company: 'Craig F Snyder PA' },
  { firstName: 'Jami', lastName: 'Huber', email: 'info@jamihuberlaw.com', phone: '561-283-4770', company: 'Jami L Huber PA' },
  { firstName: 'John', lastName: 'Pankauski', email: 'info@pankauskilawfirm.com', phone: '561-855-0342', company: 'Pankauski Law Firm' },
  { firstName: 'Steven', lastName: 'Bankier', email: 'info@bankierlaw.com', phone: '561-266-9191', company: 'Bankier Snelling Zakin & Arlen' },
  // Coral Gables / Aventura / Weston
  { firstName: 'Daniel', lastName: 'Bachman', email: 'info@miamifloridaestateplanninglawyer.com', phone: '305-981-8889', company: 'Chepenik Trushin LLP' },
  { firstName: 'Jose', lastName: 'Lorenzo', email: 'info@joselorenzolaw.com', phone: '305-648-0404', company: 'Lorenzo Law Firm' },
  { firstName: 'David', lastName: 'Pollack', email: 'info@davidpollacklaw.com', phone: '305-712-7979', company: 'The Pollack Law Firm' },
  { firstName: 'Beatriz', lastName: 'Zyne', email: 'info@zynelaw.com', phone: '305-990-8126', company: 'Beatriz Zyne PA' },
  { firstName: 'Eric', lastName: 'Kane', email: 'info@erickanelaw.com', phone: '305-330-1335', company: 'Eric S Kane PL' },
  // Lakeland / Winter Haven
  { firstName: 'Craig', lastName: 'Mundy', email: 'info@mundylaw.com', phone: '863-647-3778', company: 'Craig A Mundy PA' },
  { firstName: 'Denise', lastName: 'Tessier', email: 'info@tessierlawfirm.com', phone: '863-220-7927', company: 'The Tessier Law Firm' },
  { firstName: 'William', lastName: 'McKinley', email: 'info@williammckinleylaw.com', phone: '863-537-6408', company: 'William McKinley Law PA' },
  { firstName: 'Matthew', lastName: 'Morrison', email: 'info@mtmprobate.com', phone: '863-250-2990', company: 'MTM Law Firm' },
  { firstName: 'Linda', lastName: 'Sutton', email: 'info@suttonlawfirm.net', phone: '863-533-8912', company: 'Sutton Law Firm' },
  // Melbourne / Vero Beach / Port St Lucie
  { firstName: 'Ganon', lastName: 'Studenberg', email: 'info@studenberglaw.com', phone: '321-726-2363', company: 'Studenberg Law' },
  { firstName: 'Matthew', lastName: 'Kulas', email: 'info@kulaslaw.com', phone: '772-207-0139', company: 'Kulas & Crawford' },
  { firstName: 'David', lastName: 'Albrecht', email: 'info@albrechtattorneyfla.com', phone: '772-353-4466', company: 'David F Albrecht PA' },
  { firstName: 'Sean', lastName: 'Loughlin', email: 'info@loughlinlawpa.com', phone: '772-742-4709', company: 'Loughlin Law PA' },
  { firstName: 'Andrew', lastName: 'Apfelbaum', email: 'info@amlawfl.com', phone: '772-236-4009', company: 'Apfelbaum Law' },
  // Daytona Beach / Palm Coast / St Augustine
  { firstName: 'Jerry', lastName: 'Wells', email: 'info@jerrybwells.com', phone: '386-253-6676', company: 'Jerry B Wells PL' },
  { firstName: 'Thomas', lastName: 'Upchurch', email: 'info@upchurchlaw.com', phone: '386-272-7445', company: 'Upchurch Law' },
  { firstName: 'Randal', lastName: 'Schecter', email: 'info@rlschecter.com', phone: '386-672-6550', company: 'Randal L Schecter PA' },
  { firstName: 'Grady', lastName: 'Williams', email: 'info@gradywilliamslaw.com', phone: '904-264-8800', company: 'Grady H Williams Jr PA' },
  { firstName: 'David', lastName: 'Kaney', email: 'info@kaneylaw.com', phone: '386-257-1222', company: 'KaneyLaw' },
  // Fort Myers / Cape Coral / Bonita Springs
  { firstName: 'Matthew', lastName: 'Linde', email: 'info@floridaprobatelitigator.com', phone: '239-939-7100', company: 'Linde Gould & Associates' },
  { firstName: 'Kelly', lastName: 'Fayer', email: 'info@fayerlaw.net', phone: '239-208-0189', company: 'Law Office of Kelly L Fayer PA' },
  { firstName: 'Barbara', lastName: 'Pizzolato', email: 'info@pizzolatolaw.com', phone: '239-225-7911', company: 'Barbara M Pizzolato PA' },
  { firstName: 'Aaron', lastName: 'Hampton', email: 'info@hamptonelderlaw.com', phone: '239-309-0090', company: 'Hampton Law' },
  { firstName: 'Jennifer', lastName: 'Neilson', email: 'info@nlaw.us', phone: '239-461-5529', company: 'Neilson Law PA' },
  { firstName: 'David', lastName: 'Platt', email: 'info@davidplattlaw.com', phone: '239-910-7177', company: 'David Platt Law' },
  // Hollywood / Pompano Beach / Deerfield Beach
  { firstName: 'Mark', lastName: 'Manceri', email: 'info@estateprobatelitigation.com', phone: '954-491-7099', company: 'Mark R Manceri PA' },
  { firstName: 'Cheryl', lastName: 'Bucker', email: 'info@cheryllaw.com', phone: '954-781-8230', company: 'Law Office of Cheryl Bucker PA' },
  { firstName: 'Robert', lastName: 'MacLean', email: 'info@maclean-ema.com', phone: '954-943-8060', company: 'MacLean and Ema PA' },
  { firstName: 'William', lastName: 'Johnston', email: 'info@johnstonandmetevia.com', phone: '954-942-6633', company: 'Johnston & Metevia PA' },
  { firstName: 'Robert', lastName: 'Elflorida', email: 'info@elflorida.com', phone: '954-951-7274', company: 'Estate Law of Florida PA' },
  // Kissimmee / Sanford / Deltona
  { firstName: 'Paula', lastName: 'Montoya', email: 'info@paulamontoyalaw.com', phone: '407-910-4466', company: 'Paula Montoya Law' },
  { firstName: 'Justin', lastName: 'Brick', email: 'info@boginmunns.com', phone: '407-578-1334', company: 'Bogin Munns & Munns' },
  { firstName: 'Cassandra', lastName: 'Harris-Starks', email: 'info@cassandraharrisstarks.com', phone: '407-870-7777', company: 'Law Office of Cassandra Harris-Starks' },
  { firstName: 'Diana', lastName: 'Bryant', email: 'info@delandattorney.com', phone: '386-734-3933', company: 'Bryant & de Parry PA' },
  { firstName: 'Thomas', lastName: 'Slonim', email: 'info@slonimlaw.com', phone: '407-495-2006', company: 'Slonim Law' },
  // Additional Areas
  { firstName: 'John', lastName: 'Rice', email: 'info@ricelawflorida.com', phone: '386-257-1222', company: 'Rice Law Firm' },
  { firstName: 'Timothy', lastName: 'Goan', email: 'info@timgoanlaw.com', phone: '386-439-3744', company: 'Tim Goan Law' },
  { firstName: 'Stephen', lastName: 'Miller', email: 'info@stephenmillerlaw.com', phone: '407-740-6599', company: 'Law Offices of Stephen K Miller PA' },
  { firstName: 'Sharon', lastName: 'Nussbickel', email: 'info@estate.legal', phone: '239-275-7272', company: 'The Nussbickel Law Firm PA' },
  { firstName: 'Richard', lastName: 'Pavese', email: 'info@paveselaw.com', phone: '239-334-2195', company: 'Pavese Law Firm' },
  { firstName: 'Elliot', lastName: 'Palevsky', email: 'info@elliotlegal.com', phone: '754-332-2101', company: 'The Elliot Legal Group PA' },
  { firstName: 'Kenneth', lastName: 'Artman', email: 'info@artmanlawoffice.com', phone: '863-577-4952', company: 'Artman Law Office' },
  { firstName: 'Collins', lastName: 'Brown', email: 'info@collinsbrownlaw.com', phone: '772-231-4440', company: 'Collins Brown Barkett' },
  { firstName: 'Thomas', lastName: 'Fennell', email: 'info@gouldcooksey.com', phone: '772-770-6160', company: 'Gould Cooksey Fennell PLLC' }
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
      hs_lead_status: 'NEW'
    }
  });
  return response.data;
}

async function uploadAttorneys() {
  console.log(`Uploading ${attorneys.length} attorneys to HubSpot...\n`);

  let success = 0;
  let failed = 0;

  for (const attorney of attorneys) {
    try {
      process.stdout.write(`${attorney.firstName} ${attorney.lastName}... `);
      await createContact(attorney);
      success++;
      console.log('✓');
      await new Promise(r => setTimeout(r, 200));
    } catch (error) {
      failed++;
      const msg = error.response?.data?.message || error.message;
      console.log(`✗ ${msg}`);
    }
  }

  console.log(`\nDone! Success: ${success}, Failed: ${failed}`);
}

uploadAttorneys();
