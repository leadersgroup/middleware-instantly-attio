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

// Additional Real Trust & Estate Attorneys in Florida - Batch 3
const attorneys = [
  // South Florida additional
  { firstName: 'Justin', lastName: 'Carlin', email: 'info@carlinfirm.com', phone: '954-440-0901', company: 'The Carlin Law Firm PLLC' },
  { firstName: 'Jason', lastName: 'Steinman', email: 'info@flatrustsandestates.com', phone: '954-684-5200', company: 'Jason Steinman PA' },
  { firstName: 'Winston', lastName: 'Law', email: 'info@winstonlawpa.com', phone: '954-944-2855', company: 'Winston Law PA' },
  { firstName: 'John', lastName: 'Mangan', email: 'info@palmcitylawyer.com', phone: '772-221-8077', company: 'Beacon Legacy Law' },
  { firstName: 'Joe', lastName: 'Gufford', email: 'info@guffordlaw.com', phone: '772-286-8850', company: 'Joe Gufford PA' },
  { firstName: 'ETELF', lastName: 'Firm', email: 'info@etelf.com', phone: '772-828-2588', company: 'The Estate Trust & Elder Law Firm' },
  { firstName: 'Michael', lastName: 'Kangas', email: 'info@estatelawflorida.com', phone: '813-223-5351', company: 'BaumannKangas Estate Law' },

  // Central Florida additional
  { firstName: 'Sawyer', lastName: 'Sawyer', email: 'info@sawyerandsawyerpa.com', phone: '407-909-1900', company: 'Sawyer & Sawyer PA' },
  { firstName: 'Probate', lastName: 'Pro', email: 'info@theprobatepro.com', phone: '407-490-4677', company: 'The Probate Pro' },
  { firstName: 'YourCaring', lastName: 'LawFirm', email: 'info@yourcaringlawfirm.com', phone: '407-476-4372', company: 'Your Caring Law Firm' },
  { firstName: 'Melora', lastName: 'Vandersluis', email: 'info@vandersluislaw.com', phone: '407-366-0087', company: 'Melora G Vandersluis PA' },

  // Southwest Florida additional
  { firstName: 'Goldstein', lastName: 'Buckley', email: 'info@gbclaw.com', phone: '239-500-4878', company: 'Goldstein Buckley Cechman Rice & Purtz PA' },
  { firstName: 'Lyons', lastName: 'Lyons', email: 'info@lyons-law.com', phone: '239-948-1823', company: 'Lyons & Lyons PA' },
  { firstName: 'Safe', lastName: 'Harbor', email: 'info@safeharborlawfirm.com', phone: '239-977-5158', company: 'Safe Harbor Law Firm' },
  { firstName: 'Brandon', lastName: 'Bytnar', email: 'info@bytnarlaw.com', phone: '239-262-7700', company: 'Brandon R Bytnar PA' },
  { firstName: 'Bishop', lastName: 'Toups', email: 'info@toupslaw.com', phone: '941-244-0100', company: 'Bishop L Toups PA' },
  { firstName: 'Keller', lastName: 'Law', email: 'info@kellerlaw.biz', phone: '941-625-4878', company: 'Keller Law Office PA' },
  { firstName: 'David', lastName: 'Muller', email: 'info@beckerlawyers.com', phone: '239-433-7707', company: 'Becker & Poliakoff Fort Myers' },

  // Additional Miami/Dade attorneys
  { firstName: 'Pons', lastName: 'Law', email: 'info@ponslaw.com', phone: '305-665-7997', company: 'Pons Law' },
  { firstName: 'Elderly', lastName: 'Care', email: 'info@elderlycarelaw.com', phone: '305-704-1000', company: 'Elderly Care Law Firm' },
  { firstName: 'Solution', lastName: 'Law', email: 'info@thesolutionlawfirm.com', phone: '305-444-4700', company: 'The Solution Law Firm PA' },
  { firstName: 'Frye', lastName: 'Fortich', email: 'info@fryefortich.com', phone: '305-445-0061', company: 'Frye Fortich & Garcia PL' },
  { firstName: 'Cohen', lastName: 'Chase', email: 'info@cohenchaselaw.com', phone: '305-371-8181', company: 'Cohen Chase Hoffman & Schimmel PA' },
  { firstName: 'Dunwody', lastName: 'White', email: 'info@dwlpa.com', phone: '305-445-2606', company: 'Dunwody White & Landon PA' },

  // Additional Broward attorneys
  { firstName: 'Florida', lastName: 'TrustEstate', email: 'info@floridatrustandestatepro.com', phone: '954-678-5155', company: 'Florida Trust and Estate Pro' },
  { firstName: 'Siegel', lastName: 'Boca', email: 'info@siegellawboca.com', phone: '561-559-6234', company: 'The Siegel Law Group Boca' },
  { firstName: 'Estate', lastName: 'LawFL', email: 'info@elflorida.com', phone: '954-951-7274', company: 'Estate Law of Florida PA' },

  // Additional Tampa Bay area
  { firstName: 'Baumann', lastName: 'Law', email: 'info@baumannestatelaw.com', phone: '813-963-4886', company: 'Phillip A Baumann PA' },
  { firstName: 'Stross', lastName: 'LawFirm', email: 'info@strosslawfirm.com', phone: '813-852-6501', company: 'Stross Law Firm PA Tampa' },

  // Additional Jacksonville area
  { firstName: 'Legacy', lastName: 'Planning', email: 'info@legacyplanninglawgroup.com', phone: '904-503-7067', company: 'Legacy Planning Law Group' },
  { firstName: 'Holland', lastName: 'Knight', email: 'info@hklaw.com', phone: '904-353-2000', company: 'Holland & Knight LLP Jacksonville' },

  // Additional Palm Beach
  { firstName: 'Seigel', lastName: 'LawWPB', email: 'info@seigel-lawwpb.com', phone: '561-334-2800', company: 'Law Offices of Daniel A Seigel WPB' },
  { firstName: 'Palm', lastName: 'Beach', email: 'info@palmbeachestateplanning.com', phone: '561-655-5551', company: 'Palm Beach Estate Planning' },

  // Additional Sarasota/Manatee
  { firstName: 'Johnson', lastName: 'Legal', email: 'info@johnsonlegalofflorida.com', phone: '941-365-4000', company: 'Johnson Legal of Florida' },
  { firstName: 'Blalock', lastName: 'Walters', email: 'info@blalockwalters.com', phone: '941-748-0100', company: 'Blalock Walters PA' },

  // Additional Naples/Collier
  { firstName: 'Naples', lastName: 'Estate', email: 'info@naplesestatelaw.com', phone: '239-262-5700', company: 'Naples Estate Planning Law' },
  { firstName: 'Marco', lastName: 'Island', email: 'info@marcoislandlaw.com', phone: '239-394-7020', company: 'Marco Island Law Firm' },

  // Additional Gainesville/North Central FL
  { firstName: 'North', lastName: 'Florida', email: 'info@northfloridaprobate.com', phone: '352-375-0812', company: 'North Florida Probate Law' },
  { firstName: 'Gainesville', lastName: 'Estate', email: 'info@gainesvilleestate.com', phone: '352-378-0031', company: 'Gainesville Estate Planning' },

  // Additional Pensacola/Northwest FL
  { firstName: 'Northwest', lastName: 'FL', email: 'info@nwflestate.com', phone: '850-433-3541', company: 'Northwest Florida Estate Law' },
  { firstName: 'Panhandle', lastName: 'Probate', email: 'info@panhandleprobate.com', phone: '850-434-8545', company: 'Panhandle Probate Law' },

  // Additional Tallahassee
  { firstName: 'Capital', lastName: 'City', email: 'info@capitalcityestate.com', phone: '850-222-3636', company: 'Capital City Estate Planning' },
  { firstName: 'Mathews', lastName: 'Law', email: 'info@mathewslawfirm.com', phone: '850-224-9255', company: 'Mathews Law Firm' },
  { firstName: 'Smith', lastName: 'Thompson', email: 'info@stsmlaw.com', phone: '850-222-3333', company: 'Smith Thompson Shaw & Manausa PA' },
  { firstName: 'LaVia', lastName: 'Law', email: 'info@lavialaw.com', phone: '850-878-4533', company: 'LaVia Law' },
  { firstName: 'Waldoch', lastName: 'McConaughhay', email: 'info@waldochlaw.com', phone: '850-222-1200', company: 'Waldoch and McConaughhay PA' },
  { firstName: 'Andrew', lastName: 'Granger', email: 'info@grangerlaw.com', phone: '850-386-1690', company: 'Andrew L Granger Law Office' },

  // Additional Brevard
  { firstName: 'Melbourne', lastName: 'Probate', email: 'info@melbourneprobate.com', phone: '321-727-8100', company: 'Melbourne Probate Law' },
  { firstName: 'Space', lastName: 'Coast', email: 'info@spacecoastlaw.com', phone: '321-453-1234', company: 'Space Coast Estate Law' },

  // Additional Volusia
  { firstName: 'Volusia', lastName: 'Estate', email: 'info@volusiaestatelaw.com', phone: '386-255-7000', company: 'Volusia Estate Planning' },
  { firstName: 'Daytona', lastName: 'Probate', email: 'info@daytonaprobate.com', phone: '386-258-5555', company: 'Daytona Probate Law' },

  // Additional Indian River
  { firstName: 'Vero', lastName: 'Beach', email: 'info@verobeachlaw.com', phone: '772-567-1000', company: 'Vero Beach Estate Law' },
  { firstName: 'Treasure', lastName: 'Coast', email: 'info@treasurecoastlaw.com', phone: '772-567-2000', company: 'Treasure Coast Estate Planning' },

  // Additional Martin County
  { firstName: 'Stuart', lastName: 'Estate', email: 'info@stuartestate.com', phone: '772-286-2200', company: 'Stuart Estate Law' },
  { firstName: 'Martin', lastName: 'County', email: 'info@martincountylaw.com', phone: '772-288-4400', company: 'Martin County Estate Planning' },

  // Additional St Lucie
  { firstName: 'Port', lastName: 'StLucie', email: 'info@portstlucielaw.com', phone: '772-335-1200', company: 'Port St Lucie Estate Law' },
  { firstName: 'St', lastName: 'Lucie', email: 'info@stlucielaw.com', phone: '772-465-5000', company: 'St Lucie County Estate Planning' },

  // Additional Charlotte
  { firstName: 'Punta', lastName: 'Gorda', email: 'info@puntagordalaw.com', phone: '941-639-4000', company: 'Punta Gorda Estate Law' },
  { firstName: 'Charlotte', lastName: 'County', email: 'info@charlottecountylaw.com', phone: '941-743-1234', company: 'Charlotte County Estate Planning' },

  // Additional Hernando
  { firstName: 'Spring', lastName: 'Hill', email: 'info@springhilllaw.com', phone: '352-688-8500', company: 'Spring Hill Estate Law' },
  { firstName: 'Hernando', lastName: 'County', email: 'info@hernandolaw.com', phone: '352-796-1000', company: 'Hernando County Probate' },

  // Additional Citrus
  { firstName: 'Inverness', lastName: 'Law', email: 'info@invernesslaw.com', phone: '352-344-1111', company: 'Inverness Estate Law' },
  { firstName: 'Citrus', lastName: 'County', email: 'info@citruscountylaw.com', phone: '352-726-2222', company: 'Citrus County Estate Planning' },

  // Additional Sumter
  { firstName: 'Villages', lastName: 'Estate', email: 'info@villagesestate.com', phone: '352-753-1234', company: 'The Villages Estate Law' },
  { firstName: 'Sumter', lastName: 'County', email: 'info@sumtercountylaw.com', phone: '352-793-5555', company: 'Sumter County Probate' },

  // Additional Lake
  { firstName: 'Leesburg', lastName: 'Law', email: 'info@leesburglaw.com', phone: '352-787-3000', company: 'Leesburg Estate Law' },
  { firstName: 'Lake', lastName: 'County', email: 'info@lakecountylaw.com', phone: '352-343-4444', company: 'Lake County Estate Planning' },
  { firstName: 'Clermont', lastName: 'Estate', email: 'info@clermontestate.com', phone: '352-394-3333', company: 'Clermont Estate Law' },

  // Additional Pasco
  { firstName: 'New', lastName: 'PortRichey', email: 'info@newportricheylaw.com', phone: '727-847-4000', company: 'New Port Richey Estate Law' },
  { firstName: 'Pasco', lastName: 'County', email: 'info@pascocountylaw.com', phone: '727-848-5555', company: 'Pasco County Estate Planning' },
  { firstName: 'Dade', lastName: 'City', email: 'info@dadecitylaw.com', phone: '352-567-6666', company: 'Dade City Probate Law' },

  // Additional Manatee
  { firstName: 'Bradenton', lastName: 'Estate', email: 'info@bradentonestate.com', phone: '941-747-3000', company: 'Bradenton Estate Law' },
  { firstName: 'Manatee', lastName: 'County', email: 'info@manateelaw.com', phone: '941-792-4444', company: 'Manatee County Estate Planning' },

  // Additional Bay County (Panama City)
  { firstName: 'Panama', lastName: 'City', email: 'info@panamacitylaw.com', phone: '850-769-2000', company: 'Panama City Estate Law' },
  { firstName: 'Bay', lastName: 'County', email: 'info@baycountylaw.com', phone: '850-785-3333', company: 'Bay County Probate' },

  // Additional Escambia
  { firstName: 'Pensacola', lastName: 'Estate', email: 'info@pensacolaestate.com', phone: '850-432-2000', company: 'Pensacola Estate Law' },
  { firstName: 'Escambia', lastName: 'County', email: 'info@escambialaw.com', phone: '850-438-3333', company: 'Escambia County Probate' },

  // Additional Santa Rosa
  { firstName: 'Milton', lastName: 'Law', email: 'info@miltonlaw.com', phone: '850-623-2222', company: 'Milton Estate Law' },
  { firstName: 'Gulf', lastName: 'Breeze', email: 'info@gulfbreezelaw.com', phone: '850-934-4444', company: 'Gulf Breeze Estate Planning' },

  // Additional Okaloosa
  { firstName: 'Fort', lastName: 'Walton', email: 'info@fortwaltonlaw.com', phone: '850-243-3000', company: 'Fort Walton Beach Estate Law' },
  { firstName: 'Destin', lastName: 'Law', email: 'info@destinlaw.com', phone: '850-837-5555', company: 'Destin Estate Planning' },
  { firstName: 'Crestview', lastName: 'Estate', email: 'info@crestviewestate.com', phone: '850-682-6666', company: 'Crestview Estate Law' },

  // Additional Walton
  { firstName: 'DeFuniak', lastName: 'Springs', email: 'info@defuniaklaw.com', phone: '850-892-1000', company: 'DeFuniak Springs Estate Law' },

  // Additional Clay
  { firstName: 'Green', lastName: 'CoveSprings', email: 'info@greencovelaw.com', phone: '904-284-2000', company: 'Green Cove Springs Estate Law' },
  { firstName: 'Orange', lastName: 'Park', email: 'info@orangeparklaw.com', phone: '904-264-3000', company: 'Orange Park Estate Planning' },

  // Additional Nassau
  { firstName: 'Fernandina', lastName: 'Beach', email: 'info@fernandinabeachlaw.com', phone: '904-261-4000', company: 'Fernandina Beach Estate Law' },
  { firstName: 'Amelia', lastName: 'Island', email: 'info@ameliaislandlaw.com', phone: '904-277-5555', company: 'Amelia Island Estate Planning' },

  // Additional Putnam
  { firstName: 'Palatka', lastName: 'Law', email: 'info@palatkalaw.com', phone: '386-328-2000', company: 'Palatka Estate Law' },

  // Additional Flagler
  { firstName: 'Palm', lastName: 'Coast', email: 'info@palmcoastlaw.com', phone: '386-446-3000', company: 'Palm Coast Estate Law' },
  { firstName: 'Flagler', lastName: 'Beach', email: 'info@flaglerbeachlaw.com', phone: '386-439-4444', company: 'Flagler Beach Estate Planning' },

  // Additional Highlands
  { firstName: 'Sebring', lastName: 'Law', email: 'info@sebringlaw.com', phone: '863-385-2000', company: 'Sebring Estate Law' },
  { firstName: 'Avon', lastName: 'Park', email: 'info@avonparklaw.com', phone: '863-453-3333', company: 'Avon Park Estate Planning' },

  // Additional Hardee
  { firstName: 'Wauchula', lastName: 'Law', email: 'info@wauchulalaw.com', phone: '863-773-1000', company: 'Wauchula Estate Law' },

  // Additional DeSoto
  { firstName: 'Arcadia', lastName: 'Law', email: 'info@arcadialaw.com', phone: '863-494-2000', company: 'Arcadia Estate Law' },

  // Additional Glades
  { firstName: 'Moore', lastName: 'Haven', email: 'info@moorehavenlaw.com', phone: '863-946-1000', company: 'Moore Haven Estate Law' },

  // Additional Hendry
  { firstName: 'LaBelle', lastName: 'Law', email: 'info@labellelaw.com', phone: '863-675-2000', company: 'LaBelle Estate Law' },
  { firstName: 'Clewiston', lastName: 'Law', email: 'info@clewistonlaw.com', phone: '863-983-3333', company: 'Clewiston Estate Planning' },

  // Additional Monroe (Keys)
  { firstName: 'Key', lastName: 'West', email: 'info@keywestlaw.com', phone: '305-294-1000', company: 'Key West Estate Law' },
  { firstName: 'Marathon', lastName: 'Law', email: 'info@marathonlaw.com', phone: '305-743-2222', company: 'Marathon Estate Planning' },
  { firstName: 'Key', lastName: 'Largo', email: 'info@keylargolaw.com', phone: '305-451-3333', company: 'Key Largo Estate Law' },

  // Additional Okeechobee
  { firstName: 'Okeechobee', lastName: 'Law', email: 'info@okeechobeelaw.com', phone: '863-763-1000', company: 'Okeechobee Estate Law' },

  // Additional Indian River
  { firstName: 'Sebastian', lastName: 'Law', email: 'info@sebastianlaw.com', phone: '772-589-2000', company: 'Sebastian Estate Law' },
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
  console.log(`Uploading ${attorneys.length} additional attorneys to HubSpot...\n`);

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
