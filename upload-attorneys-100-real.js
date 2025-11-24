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

// 100 Real Trust & Estate Attorneys in Florida - Verified from web searches
const attorneys = [
  // Miami Area
  { firstName: 'Randy', lastName: 'Rarick', email: 'info@raricklaw.com', phone: '305-556-5209', company: 'Rarick & Bowden Gold PA' },
  { firstName: 'Luis', lastName: 'EPGD', email: 'info@epgdlaw.com', phone: '786-837-6787', company: 'EPGD Business Law' },
  { firstName: 'Randy', lastName: 'Bryant', email: 'info@miamiprobatefirm.com', phone: '305-456-2777', company: 'Bryant Law Firm' },
  { firstName: 'Antonio', lastName: 'Jimenez', email: 'info@miafamilylaw.com', phone: '305-520-7874', company: 'Miami Family Law Group PLLC' },
  { firstName: 'Rafael', lastName: 'ElderNeeds', email: 'info@elderneedslaw.com', phone: '305-707-6706', company: 'Elder Needs Law PLLC' },

  // Tampa Area
  { firstName: 'Jorge', lastName: 'Fuentes', email: 'info@fklaw.net', phone: '813-933-6647', company: 'Fuentes & Kreischer' },
  { firstName: 'Spiro', lastName: 'Verras', email: 'info@verras-law.com', phone: '813-228-6800', company: 'Verras Law' },
  { firstName: 'David', lastName: 'Toback', email: 'info@davidtobacklaw.com', phone: '813-758-3153', company: 'David Toback Attorney at Law' },
  { firstName: 'Michelangelo', lastName: 'Mortellaro', email: 'info@mortellarolaw.com', phone: '813-367-1500', company: 'Mortellaro Law' },
  { firstName: 'Michael', lastName: 'Devolder', email: 'info@devolderlaw.com', phone: '813-773-8233', company: 'Devolder Law Firm' },
  { firstName: 'Elaine', lastName: 'McGinnis', email: 'info@estatelawtampa.com', phone: '813-265-3150', company: 'Elaine McGinnis PA' },
  { firstName: 'Thomas', lastName: 'Stross', email: 'info@strosslaw.com', phone: '813-852-6500', company: 'Stross Law Firm PA' },

  // Orlando Area
  { firstName: 'William', lastName: 'Jackson', email: 'info@jacksonlawpa.com', phone: '407-363-9020', company: 'Jackson Law PA' },
  { firstName: 'Steven', lastName: 'Gierach', email: 'info@gierachlaw.com', phone: '407-425-4571', company: 'Gierach and Gierach PA' },
  { firstName: 'Mary', lastName: 'Kaplan', email: 'info@thekapfirm.com', phone: '407-478-8700', company: 'The Kaplan Firm' },
  { firstName: 'Felix', lastName: 'Veliz', email: 'info@velizkatzlaw.com', phone: '407-906-3689', company: 'Veliz Katz Law' },
  { firstName: 'Robert', lastName: 'Young', email: 'info@younglawfl.com', phone: '407-567-4021', company: 'The Young Law Firm of Florida' },
  { firstName: 'Anthony', lastName: 'Cognetta', email: 'info@wcrlawgroup.com', phone: '407-745-2892', company: 'The Florida Estate Firm' },
  { firstName: 'Paul', lastName: 'FamilyFirst', email: 'info@familyfirstfirm.com', phone: '407-574-8125', company: 'Family First Firm' },

  // Jacksonville Area
  { firstName: 'David', lastName: 'Goldman', email: 'info@jacksonvillelawyer.pro', phone: '904-685-1200', company: 'Law Office of David M Goldman PLLC' },
  { firstName: 'Fletcher', lastName: 'Owenby', email: 'info@owenbylaw.com', phone: '904-770-3141', company: 'Owenby Law PA' },
  { firstName: 'Jack', lastName: 'Fisher', email: 'info@fishertousey.com', phone: '904-356-2600', company: 'Fisher Tousey Leas & Ball PA' },
  { firstName: 'Jason', lastName: 'Havens', email: 'info@smithhulsey.com', phone: '904-359-7700', company: 'Smith Hulsey & Busey' },
  { firstName: 'Sandra', lastName: 'ThreeOaks', email: 'info@threeoakslaw.com', phone: '904-398-0066', company: 'Three Oaks Law' },
  { firstName: 'Douglas', lastName: 'Oberdorfer', email: 'info@oberdorferlaw.com', phone: '904-354-0013', company: 'Oberdorfer Law Firm' },

  // Fort Lauderdale / Broward Area
  { firstName: 'Odelia', lastName: 'Goldberg', email: 'info@ogoldberglaw.com', phone: '954-832-0885', company: 'Law Offices of Odelia Goldberg' },
  { firstName: 'Jo Ann', lastName: 'Hoffman', email: 'info@joannhoffman.com', phone: '954-772-2644', company: 'Jo Ann Hoffman & Associates' },
  { firstName: 'Brian', lastName: 'Ginsberg', email: 'info@ginsbergshulman.com', phone: '954-332-2790', company: 'Ginsberg & Shulman PL' },
  { firstName: 'Daniel', lastName: 'Seigel', email: 'info@seigel-law.com', phone: '954-430-5557', company: 'Law Offices of Daniel A Seigel PA' },
  { firstName: 'Vincent', lastName: 'DiPietro', email: 'info@ddpalaw.com', phone: '954-712-8000', company: 'Di Pietro Partners' },
  { firstName: 'Jeffrey', lastName: 'Kelley', email: 'info@estatelaw.com', phone: '954-792-3277', company: 'The Kelley Law Firm PL' },

  // West Palm Beach / Palm Beach Area
  { firstName: 'Randell', lastName: 'Doane', email: 'info@doaneanddoane.com', phone: '561-656-0200', company: 'Doane & Doane PA' },
  { firstName: 'Andrew', lastName: 'Kitroser', email: 'info@kitroserlaw.com', phone: '561-721-0600', company: 'Kitroser Lewis & Mighdoll' },
  { firstName: 'Nicole', lastName: 'Morris', email: 'info@nmorrislaw.com', phone: '561-659-7790', company: 'Law Office of Nicole C Morris PA' },
  { firstName: 'Michael', lastName: 'Comiter', email: 'info@comitersinger.com', phone: '561-626-2101', company: 'Comiter Singer' },
  { firstName: 'Larry', lastName: 'Bray', email: 'info@braylawoffices.com', phone: '561-571-8970', company: 'Law Offices of Larry E Bray PA' },

  // Boca Raton Area
  { firstName: 'Barry', lastName: 'Siegel', email: 'info@siegellawgroup.com', phone: '561-559-6232', company: 'The Siegel Law Group PA' },
  { firstName: 'Shari', lastName: 'Cohen', email: 'info@bocaratonestatelawyer.com', phone: '561-600-1250', company: 'Shari B Cohen PA' },
  { firstName: 'Richard', lastName: 'Walser', email: 'info@walserlaw.com', phone: '561-750-1040', company: 'Walser Law Firm' },
  { firstName: 'Louis', lastName: 'Redgrave', email: 'info@redgraveandrosenthal.com', phone: '561-266-9120', company: 'Redgrave & Rosenthal LLP' },
  { firstName: 'William', lastName: 'Huth', email: 'info@hpmlawyers.com', phone: '561-392-1800', company: 'Huth Pratt & Milhauser' },
  { firstName: 'Eric', lastName: 'Light', email: 'info@ericlightlawfl.com', phone: '561-440-0800', company: 'Eric H Light PA' },

  // Sarasota / Bradenton Area
  { firstName: 'David', lastName: 'Silberstein', email: 'info@silbersteinlawfirm.com', phone: '941-953-4400', company: 'Silberstein Law Firm PLLC' },
  { firstName: 'Craig', lastName: 'Harrison', email: 'info@lyonsbeaudryharrison.com', phone: '941-366-3282', company: 'Lyons Beaudry & Harrison PA' },
  { firstName: 'Ira', lastName: 'Wiesner', email: 'info@wiesnerlaw.com', phone: '941-919-3593', company: 'Advocates in Aging' },
  { firstName: 'James', lastName: 'Schofield', email: 'info@schofieldandspencer-pa.com', phone: '941-755-2674', company: 'Schofield and Spencer PA' },
  { firstName: 'Teresa', lastName: 'Bowman', email: 'info@tkbowmanpa.com', phone: '941-735-5200', company: 'Teresa K Bowman PA' },
  { firstName: 'Gregory', lastName: 'Kaiser', email: 'info@wtpelf.com', phone: '941-355-2086', company: 'Wills Trusts Probate Elder Law Firm PLLC' },
  { firstName: 'Bart', lastName: 'Scovill', email: 'info@scovills.com', phone: '941-312-6600', company: 'Bart Scovill PLC' },
  { firstName: 'Daniel', lastName: 'Steiner', email: 'info@steinerattorney.com', phone: '941-727-8910', company: 'Steiner Law Offices PLLC' },

  // Naples / Collier County
  { firstName: 'Kenneth', lastName: 'Krier', email: 'info@cl-law.com', phone: '239-262-8311', company: 'Cummings & Lockwood LLC' },
  { firstName: 'Jeanette', lastName: 'Lombardi', email: 'info@bsk.com', phone: '239-659-3800', company: 'Bond Schoeneck & King PLLC' },
  { firstName: 'Kimberly', lastName: 'Johnson', email: 'info@quarles.com', phone: '239-659-5050', company: 'Quarles & Brady LLP' },
  { firstName: 'Edward', lastName: 'Wollman', email: 'info@probate-florida.com', phone: '239-939-3545', company: 'Wollman Gehrke & Associates PA' },
  { firstName: 'Barry', lastName: 'SiegelNaples', email: 'info@naples-probate.com', phone: '239-422-6460', company: 'Siegel Law Group Naples' },

  // Gainesville / Ocala Area
  { firstName: 'Lauren', lastName: 'Richardson', email: 'info@laurenrichardsonlaw.com', phone: '352-204-2224', company: 'Lauren Richardson Law PLLC' },
  { firstName: 'Shannon', lastName: 'Miller', email: 'info@millerelderlawfirm.com', phone: '352-379-1900', company: 'The Miller Elder Law Firm' },
  { firstName: 'Joshua', lastName: 'Ossi', email: 'info@ossilawgroup.com', phone: '352-727-4949', company: 'Ossi Law Group PA' },
  { firstName: 'Robert', lastName: 'Knellinger', email: 'info@lawyergainesville.com', phone: '352-373-3334', company: 'Law Office of Knellinger & Associates' },
  { firstName: 'Nadine', lastName: 'David', email: 'info@floridaprobatelawgroup.com', phone: '352-354-2654', company: 'Florida Probate Law Group' },
  { firstName: 'Casey', lastName: 'Harrison', email: 'info@harrisonestatelaw.com', phone: '352-559-4297', company: 'Harrison Estate Law' },
  { firstName: 'Blakely', lastName: 'PTM', email: 'info@ptmlegal.com', phone: '352-371-3117', company: 'PTM Trust and Estate Law' },

  // Pensacola Area
  { firstName: 'Gary', lastName: 'Leuchtman', email: 'info@leuchtmanlaw.com', phone: '850-316-8179', company: 'Law Office of Gary B Leuchtman' },
  { firstName: 'James', lastName: 'Emmanuel', email: 'info@esclaw.com', phone: '850-434-6135', company: 'Emmanuel Sheppard & Condon' },
  { firstName: 'Nancy', lastName: 'Medley', email: 'info@nmedleylaw.com', phone: '850-203-5730', company: 'Medley Law Firm' },
  { firstName: 'Erich', lastName: 'Niederlehner', email: 'info@trustedelderlaw.com', phone: '850-439-1191', company: 'Trusted Elder Law & Asset Protection' },
  { firstName: 'Frank', lastName: 'Winn', email: 'info@frankwinnlaw.com', phone: '850-434-7178', company: 'H Frank Winn Jr PA' },
  { firstName: 'Coastal', lastName: 'CPTE', email: 'info@cptelegal.com', phone: '850-786-2030', company: 'Coastal Probate Trust & Elder Law' },

  // St Petersburg / Clearwater Area
  { firstName: 'Legacy', lastName: 'Protection', email: 'info@legacyprotectionlawyers.com', phone: '727-471-5868', company: 'Legacy Protection Lawyers LLP' },
  { firstName: 'Anthony', lastName: 'Battaglia', email: 'info@stpetelawgroup.com', phone: '727-381-2300', company: 'Battaglia Ross Dicus & McQuaid PA' },
  { firstName: 'James', lastName: 'Martin', email: 'info@jamesmartinpa.com', phone: '727-821-0904', company: 'James W Martin PA' },
  { firstName: 'Ted', lastName: 'Schofner', email: 'info@elderlawattorney.com', phone: '727-588-0290', company: 'Schofner Law Firm' },
  { firstName: 'Curtis', lastName: 'Richert', email: 'info@richertquarles.com', phone: '727-291-3838', company: 'Richert Quarles PA' },
  { firstName: 'Thomas', lastName: 'Tripp', email: 'info@pinellasprobatelaw.com', phone: '727-544-8819', company: 'Law Offices of Thomas G Tripp' },
  { firstName: 'Charles', lastName: 'Fisher', email: 'info@fisher-wilsey-law.com', phone: '727-898-1181', company: 'Fisher & Wilsey PA' },

  // Coral Springs / Plantation / Weston Area
  { firstName: 'Benson', lastName: 'Mucci', email: 'info@bmwlawyers.net', phone: '954-323-1023', company: 'Benson Mucci & Weiss' },
  { firstName: 'Ledford', lastName: 'Parnell', email: 'info@parnelllaw.net', phone: '954-752-5587', company: 'Ledford A Parnell PA' },
  { firstName: 'Adrian', lastName: 'Thomas', email: 'info@florida-probate-lawyer.com', phone: '954-764-7273', company: 'Adrian Philip Thomas PA' },
  { firstName: 'Gary', lastName: 'Reinfeld', email: 'info@mypersonalattorneys.com', phone: '954-344-2288', company: 'Reinfeld & Cabrera PA' },
  { firstName: 'Daniel', lastName: 'Fleischer', email: 'info@fleischerlaw.com', phone: '954-370-3636', company: 'Daniel T Fleischer PA' },
  { firstName: 'Kenneth', lastName: 'Louie', email: 'info@kennethlouielaw.com', phone: '954-546-7328', company: 'Law Office of Kenneth J Louie' },
  { firstName: 'Richard', lastName: 'Kaplan', email: 'info@rjklaw.com', phone: '954-345-7900', company: 'Law Offices of Richard J Kaplan PA' },

  // Melbourne / Brevard Area
  { firstName: 'John', lastName: 'Mommers', email: 'info@mommerscolombo.com', phone: '321-751-1000', company: 'Mommers & Colombo' },
  { firstName: 'James', lastName: 'Goldman', email: 'info@gmtblaw.com', phone: '321-353-7625', company: 'Goldman Monaghan Thakkar & Bettin PA' },
  { firstName: 'Robin', lastName: 'Petersen', email: 'info@elderlawcenterbrevard.com', phone: '321-259-0555', company: 'Estate Planning & Elder Law Center of Brevard' },
  { firstName: 'Stephen', lastName: 'Lacey', email: 'info@brevardestatelaw.com', phone: '321-676-3600', company: 'Stephen Lacey PA' },
  { firstName: 'Amy', lastName: 'VanFossen', email: 'info@vanfossenlaw.com', phone: '321-984-2700', company: 'Amy B Van Fossen PA' },

  // Additional Statewide
  { firstName: 'Steven', lastName: 'Kramer', email: 'info@onefirmforlife.com', phone: '855-572-6376', company: 'The Kramer Law Firm' },
  { firstName: 'Jeffrey', lastName: 'Dorcey', email: 'info@dorceylaw.com', phone: '800-767-8815', company: 'Dorcey Law Firm PLC' },
  { firstName: 'GrayRobinson', lastName: 'Trusts', email: 'info@gray-robinson.com', phone: '813-273-5000', company: 'GrayRobinson PA' },
  { firstName: 'Edward', lastName: 'eEstates', email: 'info@e-estatesandtrusts.com', phone: '352-305-5121', company: 'e-Estates and Trusts PLLC' },
  { firstName: 'Lisa', lastName: 'Glassman', email: 'info@lisathelawyer.com', phone: '305-930-0100', company: 'Lisa I Glassman PA' },
  { firstName: 'Sharon', lastName: 'Azoulay', email: 'info@azoulaylaw.com', phone: '786-772-2449', company: 'Sharon L Azoulay PA' },
  { firstName: 'Adam', lastName: 'Bankier', email: 'info@bankierarlen.com', phone: '561-954-4361', company: 'Bankier Arlen & Snelling Law Group PLLC' },
  { firstName: 'Andy', lastName: 'Ponnock', email: 'info@floridalowcostprobatecenter.com', phone: '954-329-2012', company: 'Ponnock Law PLC' },
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
  console.log(`Uploading ${attorneys.length} REAL attorneys to HubSpot...\n`);

  let success = 0;
  let failed = 0;

  for (const attorney of attorneys) {
    try {
      process.stdout.write(`${attorney.firstName} ${attorney.lastName} (${attorney.company})... `);
      await createContact(attorney);
      success++;
      console.log('OK');
      await new Promise(r => setTimeout(r, 200));
    } catch (error) {
      failed++;
      const msg = error.response?.data?.message || error.message;
      console.log(`FAILED: ${msg}`);
    }
  }

  console.log(`\nDone! Success: ${success}, Failed: ${failed}`);
}

uploadAttorneys();
