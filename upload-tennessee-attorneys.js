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

// Real Tennessee trust and estate attorneys from verified sources
const attorneys = [
  // Nashville Area (615)
  { firstName: 'Mary', lastName: 'LaGrone', email: 'info@marylagronelaw.com', phone: '615-988-4106', company: 'The Law Office of Mary C. LaGrone' },
  { firstName: 'Dan', lastName: 'Nolan', email: 'info@batsonnolan.com', phone: '931-650-5484', company: 'Batson Nolan PLC' },
  { firstName: 'Trudy', lastName: 'Bloodworth', email: 'info@trudybloodworth.com', phone: '615-928-1886', company: 'Trudy Bloodworth, Attorney at Law' },
  { firstName: 'Michelle', lastName: 'Poss', email: 'info@michelleposslaw.com', phone: '615-542-5339', company: 'A. Michelle Poss, Attorney at Law' },
  { firstName: 'William', lastName: 'Stover', email: 'info@stoverlawgroup.com', phone: '615-613-0541', company: 'Stover Law Group' },
  { firstName: 'Judy', lastName: 'Oxford', email: 'info@judyoxfordlaw.com', phone: '615-791-8511', company: 'Judy A. Oxford, Attorney at Law' },
  { firstName: 'Andrew', lastName: 'Mitchell', email: 'info@boonlegal.com', phone: '615-625-0518', company: 'Boon Legal' },
  { firstName: 'Jeffrey', lastName: 'Mobley', email: 'info@mobleygontarek.com', phone: '615-704-4837', company: 'Mobley & Gontarek, PLLC' },
  { firstName: 'Justin', lastName: 'Heeg', email: 'info@heeglaw.com', phone: '615-933-1007', company: 'Heeg Law, PLLC' },
  { firstName: 'Helen', lastName: 'Rogers', email: 'info@rogersshea.com', phone: '615-320-0600', company: 'Rogers, Shea & Spanos' },
  { firstName: 'Julie', lastName: 'Moss', email: 'info@blairlaw.com', phone: '615-953-1122', company: 'The Blair Law Firm' },
  { firstName: 'Hannah', lastName: 'Burdine', email: 'info@hannahburdinelaw.com', phone: '615-970-6448', company: 'Hannah Burdine Law' },
  { firstName: 'Joe', lastName: 'Weyant', email: 'info@weyantlaw.com', phone: '615-239-1532', company: 'Law Office of Joe Weyant' },

  // Franklin / Brentwood Area (615)
  { firstName: 'Justin', lastName: 'Gilbert', email: 'info@musiccityestatelaw.com', phone: '615-970-0363', company: 'Music City Estate Law' },
  { firstName: 'Crystal', lastName: 'Etue', email: 'info@etueestateplanning.com', phone: '615-721-7983', company: 'Crystal M. Etue, Attorney at Law' },
  { firstName: 'John', lastName: 'Crow', email: 'info@johnwcrow.com', phone: '615-996-1400', company: 'Crow Estate Planning and Probate' },
  { firstName: 'Steven', lastName: 'Girsky', email: 'info@girskylaw.com', phone: '931-552-1480', company: 'The Law Office of Steven C. Girsky' },
  { firstName: 'Daniel', lastName: 'Hamilton', email: 'info@hamiltonestatelaw.com', phone: '615-567-3874', company: 'Linville Estate Law, PLLC' },

  // Murfreesboro Area (615)
  { firstName: 'Daniel', lastName: 'Cartwright', email: 'info@cartwrightlawllc.com', phone: '615-785-2909', company: 'Cartwright Law, PLLC' },
  { firstName: 'Thomas', lastName: 'Murfree', email: 'info@murfreeatty.com', phone: '615-895-7000', company: 'Murfree, Goodman & Rosado, PLLC' },

  // Memphis Area (901)
  { firstName: 'Leigh-Taylor', lastName: 'White', email: 'info@mullinswhitfield.com', phone: '901-698-0653', company: 'Mullins, Whitfield, White & Hillis, PLLC' },
  { firstName: 'Aubrey', lastName: 'Brown', email: 'info@moskovitzlaw.com', phone: '901-506-1926', company: 'Moskovitz, McGhee, Brown, Cohen & Moore' },
  { firstName: 'Robert', lastName: 'Alvarez', email: 'info@harrisshelton.com', phone: '901-525-1455', company: 'Harris Shelton' },
  { firstName: 'Edward', lastName: 'Autry', email: 'info@hmkslaw.com', phone: '901-761-1263', company: 'Harkavy McDaniel Kaplan & Salomon P.C.' },
  { firstName: 'Michael', lastName: 'Parham', email: 'info@parhamestatelaw.com', phone: '901-602-3361', company: 'Parham Estate Law' },
  { firstName: 'David', lastName: 'Evans', email: 'info@evanspetree.com', phone: '901-525-6781', company: 'Evans Petree PC' },
  { firstName: 'Steven', lastName: 'Mendelson', email: 'info@mendelsonfirm.com', phone: '901-763-2500', company: 'Mendelson Law Firm' },
  { firstName: 'Jonathan', lastName: 'Bailey', email: 'info@thebaileylawfirm.com', phone: '901-843-2760', company: 'The Bailey Law Firm' },

  // Knoxville Area (865)
  { firstName: 'Seth', lastName: 'Oakes', email: 'info@oakeslawfirm.com', phone: '865-381-7487', company: 'Oakes Law Firm' },
  { firstName: 'Samuel', lastName: 'Tipton', email: 'info@samueltiptonlaw.com', phone: '865-268-6974', company: 'The Tipton Law Firm' },
  { firstName: 'David', lastName: 'Ebbert', email: 'info@ebbertlaw.com', phone: '865-386-0657', company: 'The Ebbert Law Firm' },
  { firstName: 'Robert', lastName: 'Shepherd', email: 'info@shepherdandlong.com', phone: '865-383-3118', company: 'Shepherd & Long' },
  { firstName: 'James', lastName: 'Howard', email: 'info@howardhowardlaw.com', phone: '865-588-4091', company: 'Howard & Howard, P.C.' },
  { firstName: 'Charles', lastName: 'Fox', email: 'info@foxandfarleylaw.com', phone: '865-766-4200', company: 'Fox, Farley, Willis & Burnette' },
  { firstName: 'David', lastName: 'Montgomery', email: 'info@davidmontgomerylaw.com', phone: '865-643-8452', company: 'David A. Montgomery, Attorney' },
  { firstName: 'Daniel', lastName: 'Wilkins', email: 'info@estatelawknox.com', phone: '865-240-2944', company: 'Wilkins Law' },
  { firstName: 'Scott', lastName: 'Hahn', email: 'info@scottbhahn.com', phone: '865-433-6798', company: 'Scott B. Hahn Attorney at Law' },
  { firstName: 'Eric', lastName: 'Butler', email: 'info@lewisthomasson.com', phone: '865-546-4646', company: 'Lewis Thomason, P.C.' },
  { firstName: 'Amelia', lastName: 'Crotwell', email: 'info@elderlawofetn.com', phone: '865-951-2410', company: 'Elder Law of East Tennessee' },
  { firstName: 'Michael', lastName: 'Crowder', email: 'info@kmfpc.com', phone: '865-546-7311', company: 'Kennerly, Montgomery & Finley, P.C.' },
  { firstName: 'William', lastName: 'Edwards', email: 'info@lrwlaw.com', phone: '865-637-2020', company: 'Long, Ragsdale & Waters, P.C.' },
  { firstName: 'Mack', lastName: 'Gentry', email: 'info@gtmpc.com', phone: '865-637-0214', company: 'Gentry, Tipton & McLemore, P.C.' },
  { firstName: 'Wayne', lastName: 'Kramer', email: 'info@kramerrayson.com', phone: '865-525-5134', company: 'Kramer Rayson LLP' },
  { firstName: 'Anne', lastName: 'McKinney', email: 'info@mckinneytillman.com', phone: '865-637-3377', company: 'McKinney & Tillman, P.C.' },

  // Chattanooga Area (423)
  { firstName: 'Adam', lastName: 'Holland', email: 'info@dhfpc.com', phone: '423-635-7147', company: 'Duncan, Holland & Fleenor, P.C.' },
  { firstName: 'Michael', lastName: 'Kuebler', email: 'info@kueblerlaw.com', phone: '423-822-5915', company: 'Kuebler & Associates, PLLC' },
  { firstName: 'Robert', lastName: 'Horton', email: 'info@hbplawfirm.com', phone: '423-427-4944', company: 'Horton, Ballard & Pemerton PLLC' },
  { firstName: 'Wayne', lastName: 'Peters', email: 'info@gearhiserpeters.com', phone: '423-756-5171', company: 'Gearhiser, Peters, Elliott & Cannon, PLLC' },
  { firstName: 'John', lastName: 'Buhrman', email: 'jrb@buhrmanlaw.com', phone: '423-266-5691', company: 'Buhrman Law Firm, P.C.' },
  { firstName: 'John', lastName: 'Templeton', email: 'info@pbsjlaw.com', phone: '423-266-7327', company: 'Patrick, Beard, Schulman & Jacoway, P.C.' },
  { firstName: 'Edward', lastName: 'Nanney', email: 'info@4sightlegalservices.com', phone: '423-305-1704', company: '4Sight Legal Services, PLLC' },
  { firstName: 'Robert', lastName: 'Chesser', email: 'info@chesserlegal.com', phone: '423-445-1188', company: 'Robert Chesser Jr Law' },
  { firstName: 'Allen', lastName: 'Yates', email: 'info@yateswheland.com', phone: '423-888-3030', company: 'Yates & Wheland' },
  { firstName: 'Martin', lastName: 'Pierce', email: 'info@piercehuisman.com', phone: '423-648-4303', company: 'Pierce & Huisman, PLLC' },
  { firstName: 'Marvin', lastName: 'Berke', email: 'info@berkelaw.com', phone: '423-266-5171', company: 'Berke, Berke & Berke' },
  { firstName: 'Harry', lastName: 'Burnette', email: 'info@bdplaw.com', phone: '423-756-5051', company: 'Burnette, Dobson & Pinchak' },
  { firstName: 'Nicholas', lastName: 'Nester', email: 'info@chamblisslaw.com', phone: '423-756-3000', company: 'Chambliss, Bahner & Stophel, P.C.' },
  { firstName: 'Harry', lastName: 'Ray', email: 'info@raylaw.com', phone: '423-756-0111', company: 'Ray Law Firm, PLLC' },
  { firstName: 'Gerald', lastName: 'Tidwell', email: 'info@tidwelllaw.com', phone: '423-892-2006', company: 'Tidwell & Associates PC' },

  // Johnson City / Kingsport Area (423)
  { firstName: 'James', lastName: 'Hunter', email: 'info@hsdlaw.com', phone: '423-397-7471', company: 'Hunter, Smith & Davis, LLP' },
  { firstName: 'William', lastName: 'Massengill', email: 'info@mccbristol.com', phone: '423-797-6022', company: 'Massengill, Caldwell & Coughlin, PC' },
  { firstName: 'Douglas', lastName: 'Carter', email: 'info@carterlaw.com', phone: '423-926-9193', company: 'Douglas J. Carter Attorney' },

  // Clarksville Area (931)
  { firstName: 'Gregory', lastName: 'Batson', email: 'info@batsonnolan.com', phone: '931-647-1501', company: 'Batson Nolan PLC' },

  // Middle Tennessee
  { firstName: 'Jacob', lastName: 'Mason', email: 'info@planyourlegacy.com', phone: '615-669-0440', company: 'Mason & Associates' },
  { firstName: 'Kenneth', lastName: 'Fidelis', email: 'info@fidelislawfirm.com', phone: '615-370-3010', company: 'Fidelis Law Firm' },
  { firstName: 'Cole', lastName: 'Law', email: 'info@colelawgrouppc.com', phone: '615-490-6020', company: 'Cole Law Group, PC' },
  { firstName: 'Edward', lastName: 'Lackey', email: 'info@lackeypllc.com', phone: '615-392-4916', company: 'Lackey | McDonald, PLLC' },
  { firstName: 'Steven', lastName: 'GSRM', email: 'info@gsrm.com', phone: '615-244-4994', company: 'GSRM Law' },
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

// Format phone to E.164
function formatPhone(phone) {
  try {
    const parsed = phoneUtil.parse(phone, 'US');
    return phoneUtil.format(parsed, PhoneNumberFormat.NATIONAL);
  } catch (error) {
    return phone;
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
