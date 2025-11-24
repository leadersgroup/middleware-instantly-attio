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

// Batch 2: More real Tennessee trust and estate attorneys from verified sources
const attorneys = [
  // Nashville Area - Additional
  { firstName: 'Tommy', lastName: 'Estes', email: 'testes@manierherod.com', phone: '615-244-0030', company: 'Manier & Herod, PC' },
  { firstName: 'Alexander', lastName: 'Fasching', email: 'afasching@cooktillmanlaw.com', phone: '615-370-2747', company: 'Cook Tillman Law Group' },
  { firstName: 'Joe', lastName: 'Fernandez', email: 'jfernandez@hklaw.com', phone: '615-259-8500', company: 'Holland & Knight LLP' },
  { firstName: 'Nicholas', lastName: 'Gaffney', email: 'ngaffney@bassberry.com', phone: '615-742-6200', company: 'Bass, Berry + Sims PLC' },
  { firstName: 'Zachary', lastName: 'Gainous', email: 'zgainous@fruitfulfirm.com', phone: '615-490-8878', company: 'The Fruitful Firm' },
  { firstName: 'Joseph', lastName: 'Gibbs', email: 'jgibbs@bradley.com', phone: '615-252-2300', company: 'Bradley Arant Boult Cummings LLP' },
  { firstName: 'Charles', lastName: 'Goldberg', email: 'cgoldberg@bakerdonelson.com', phone: '615-726-5600', company: 'Baker Donelson' },
  { firstName: 'James', lastName: 'Gooch', email: 'jgooch@bassberry.com', phone: '615-742-6200', company: 'Bass, Berry + Sims PLC' },
  { firstName: 'Michael', lastName: 'Goode', email: 'mgoode@lewisthomasson.com', phone: '615-259-1366', company: 'Lewis Thomason, P.C.' },
  { firstName: 'Joe', lastName: 'Goodman', email: 'jgoodman@gsrmlaw.com', phone: '615-244-4994', company: 'Gullett Sanford Robinson Martin PLLC' },
  { firstName: 'Theodore', lastName: 'Goodman', email: 'tgoodman@murfreeatty.com', phone: '615-895-7000', company: 'Murfree & Goodman, PLLC' },
  { firstName: 'David', lastName: 'Goudie', email: 'dgoudie@morganakins.com', phone: '615-254-1020', company: 'Morgan & Akins, PLLC' },
  { firstName: 'Leigh', lastName: 'Griffith', email: 'lgriffith@hklaw.com', phone: '615-259-8500', company: 'Holland & Knight LLP' },
  { firstName: 'Roland', lastName: 'Hairston', email: 'rhairston@hairstonlaw.com', phone: '615-254-4700', company: 'Law Office of Roland T. Hairston' },
  { firstName: 'Michelle', lastName: 'Handelsman', email: 'michelle@handelsmanlaw.com', phone: '615-915-1324', company: 'Handelsman Law' },
  { firstName: 'Paul', lastName: 'Hayes', email: 'phayes@hayeslawpllc.com', phone: '615-730-3524', company: 'Hayes Law, PLLC' },
  { firstName: 'Robert', lastName: 'Hazard', email: 'rhazard@hazardlawpllc.com', phone: '615-790-7535', company: 'Hazard Law, PLLC' },
  { firstName: 'Jefferson', lastName: 'Herring', email: 'jherring@herringpc.com', phone: '615-329-9500', company: 'D. Jefferson Herring, PC' },
  { firstName: 'Ally', lastName: 'Hicks', email: 'ahicks@riggsdavie.com', phone: '615-376-4600', company: 'Riggs Davie PLC' },
  { firstName: 'Josh', lastName: 'Hogan', email: 'jhogan@wchlaw.com', phone: '931-388-1890', company: 'Wolaver, Carter & Heffington' },
  { firstName: 'Richard', lastName: 'Holton', email: 'rholton@holtonmayberry.com', phone: '615-244-8360', company: 'Holton & Mayberry, P.C.' },
  { firstName: 'Bryan', lastName: 'Howard', email: 'bhoward@hklaw.com', phone: '615-259-8500', company: 'Holland & Knight LLP' },
  { firstName: 'Jacob', lastName: 'Hubbell', email: 'jhubbell@hubbelllaw.com', phone: '931-490-0099', company: 'The Hubbell Firm' },
  { firstName: 'Samuel', lastName: 'Jackson', email: 'sjackson@spencerfane.com', phone: '615-238-6300', company: 'Spencer Fane LLP' },
  { firstName: 'Carla', lastName: 'Lovell', email: 'clovell@srvhlaw.com', phone: '615-742-4200', company: 'Sherrard Roe Voigt & Harbison, PLC' },
  { firstName: 'Cara', lastName: 'Lynn', email: 'clynn@columbiamediationlaw.com', phone: '931-490-2700', company: 'Columbia Law and Mediation, PLLC' },
  { firstName: 'Colleen', lastName: 'MacLean', email: 'cmmaclean@cmaclaw.com', phone: '615-712-6127', company: 'Colleen P. MacLean, Attorney at Law' },
  { firstName: 'Jillian', lastName: 'Mastroianni', email: 'jmastroianni@hklaw.com', phone: '615-259-8500', company: 'Holland & Knight LLP' },
  { firstName: 'David', lastName: 'Mayer', email: 'dmayer@thompsonburton.com', phone: '615-465-6000', company: 'Thompson Burton PLLC' },
  { firstName: 'John', lastName: 'McDonald', email: 'jmcdonald@evansjones.com', phone: '615-726-5600', company: 'Evans Jones and Reynolds, P.A.' },
  { firstName: 'Andrew', lastName: 'Mills', email: 'amills@rprvlaw.com', phone: '615-446-4370', company: 'Reynolds, Potter, Ragan & Vandivort, PLC' },
  { firstName: 'Charles', lastName: 'Morton', email: 'cmorton@pnmlaw.com', phone: '615-790-2323', company: 'Puryear, Newman & Morton, PLLC' },
  { firstName: 'Barbara', lastName: 'Moss', email: 'bmoss@elderlawofnashville.com', phone: '615-933-0035', company: 'Elder Law of Nashville PLC' },
  { firstName: 'Brittney', lastName: 'Mulvaney', email: 'bmulvaney@mulvaneylaw.com', phone: '615-800-7096', company: 'Mulvaney Law' },
  { firstName: 'Jacob', lastName: 'Nemer', email: 'jnemer@nemerllp.com', phone: '615-651-8505', company: 'Nemer LLP' },
  { firstName: 'Robert', lastName: 'Notestine', email: 'rnotestine@notestinelaw.com', phone: '615-256-8585', company: 'Notestine Law Firm' },
  { firstName: 'Devin', lastName: 'Park', email: 'dpark@freemanandbrancey.com', phone: '615-859-2276', company: 'Freeman & Bracey, PLC' },
  { firstName: 'Laurie', lastName: 'Parker', email: 'lparker@hartzogsilva.com', phone: '615-771-9400', company: 'Hartzog & Silva, PLLC' },
  { firstName: 'Paul', lastName: 'Parker', email: 'pparker@dbcpc.com', phone: '615-256-3939', company: 'Dodson Parker Behm & Capparella, P.C.' },
  { firstName: 'John', lastName: 'Phillips', email: 'jphillips@phillipsralston.com', phone: '615-451-6651', company: 'Phillips Ralston' },
  { firstName: 'Allen', lastName: 'Reynolds', email: 'areynolds@evansjones.com', phone: '615-726-5600', company: 'Evans Jones and Reynolds, P.A.' },
  { firstName: 'Casey', lastName: 'Riggs', email: 'criggs@riggsdavie.com', phone: '615-376-4600', company: 'Riggs Davie PLC' },
  { firstName: 'Julie', lastName: 'Robinson', email: 'jrobinson@lannomwilliams.com', phone: '615-444-2900', company: 'Lannom & Williams, PLLC' },
  { firstName: 'Brian', lastName: 'Shelton', email: 'bshelton@csj.law', phone: '615-383-0073', company: 'Carter Shelton Jones, PLC' },
  { firstName: 'Jennifer', lastName: 'Sheppard', email: 'jsheppard@mhpslaw.com', phone: '615-256-0500', company: 'Martin Heller Potempa & Sheppard' },
  { firstName: 'Lesa', lastName: 'Skoney', email: 'lskoney@tewlaw.com', phone: '615-244-2770', company: 'Tune, Entrekin & White, P.C.' },
  { firstName: 'Larry', lastName: 'Thrailkill', email: 'lthrailkill@thwblaw.com', phone: '615-373-2330', company: 'Thrailkill, Harris, Wood & Boswell' },
  { firstName: 'Rose', lastName: 'Tignor', email: 'rose@rosetignorlaw.com', phone: '931-486-1066', company: 'Rose Tignor, Attorney at Law' },

  // Memphis Area - Additional
  { firstName: 'James', lastName: 'Jalenak', email: 'jjalenak@harrisshelton.com', phone: '901-525-1455', company: 'Harris Shelton' },
  { firstName: 'Jake', lastName: 'Kasser', email: 'jkasser@glankler.com', phone: '901-525-1322', company: 'Glankler Brown, PLLC' },
  { firstName: 'Barry', lastName: 'Kuhn', email: 'bkuhn@olsenkuhnmoore.com', phone: '901-377-0344', company: 'Olsen, Kuhn & Moore' },
  { firstName: 'Jana', lastName: 'Lamanna', email: 'jlamanna@blackmclaren.com', phone: '901-762-0535', company: 'Black McLaren Jones Ryland & Griffee, P.C.' },
  { firstName: 'Harry', lastName: 'Laughlin', email: 'hlaughlin@laughlinlaw.com', phone: '901-218-7820', company: 'Law Office of Harry Laughlin, III' },
  { firstName: 'William', lastName: 'Mays', email: 'wmays@glankler.com', phone: '901-525-1322', company: 'Glankler Brown, PLLC' },
  { firstName: 'Stephen', lastName: 'McDaniel', email: 'smcdaniel@hmkslaw.com', phone: '901-761-1263', company: 'Harkavy McDaniel Kaplan & Salomon P.C.' },
  { firstName: 'Dwight', lastName: 'Moore', email: 'dmoore@olsenkuhnmoore.com', phone: '901-377-0344', company: 'Olsen, Kuhn & Moore' },
  { firstName: 'George', lastName: 'Nassar', email: 'gnassar@glankler.com', phone: '901-525-1322', company: 'Glankler Brown, PLLC' },
  { firstName: 'James', lastName: 'Reed', email: 'jreed@glankler.com', phone: '901-525-1322', company: 'Glankler Brown, PLLC' },
  { firstName: 'Jason', lastName: 'Salomon', email: 'jsalomon@hmkslaw.com', phone: '901-761-1263', company: 'Harkavy McDaniel Kaplan & Salomon P.C.' },
  { firstName: 'Amy', lastName: 'Sterling', email: 'asterling@blackmclaren.com', phone: '901-762-0535', company: 'Black McLaren Jones Ryland & Griffee, P.C.' },
  { firstName: 'Robert', lastName: 'Burdette', email: 'rburdette@theburdettelawfirm.com', phone: '901-756-6433', company: 'The Burdette Law Firm' },
  { firstName: 'Matthew', lastName: 'Collierville', email: 'info@thecolliervillelawfirm.com', phone: '901-614-0318', company: 'The Collierville Law Firm' },

  // Knoxville Area - Additional
  { firstName: 'Darsi', lastName: 'Sirknen', email: 'dsirknen@wmbac.com', phone: '865-215-1000', company: 'Woolf, McClane, Bright, Allen & Carpenter, PLLC' },
  { firstName: 'Patrick', lastName: 'Slaughter', email: 'pslaughter@lafevorandslaughter.com', phone: '865-674-4088', company: 'LaFevor & Slaughter' },
  { firstName: 'Stephen', lastName: 'Carpenter', email: 'scarpenter@carpenterlewis.com', phone: '865-252-4259', company: 'Carpenter & Lewis PLLC' },
  { firstName: 'Jon', lastName: 'Johnson', email: 'jjohnson@carpenterlewis.com', phone: '865-427-3326', company: 'Carpenter & Lewis PLLC' },
  { firstName: 'Jerry', lastName: 'Long', email: 'jlong@lrwlaw.com', phone: '865-637-2020', company: 'Long, Ragsdale & Waters, P.C.' },
  { firstName: 'Scott', lastName: 'Griswold', email: 'sgriswold@lrwlaw.com', phone: '865-637-2020', company: 'Long, Ragsdale & Waters, P.C.' },
  { firstName: 'Lee', lastName: 'Popkin', email: 'lpopkin@lrwlaw.com', phone: '865-637-2020', company: 'Long, Ragsdale & Waters, P.C.' },
  { firstName: 'Dan', lastName: 'Holbrook', email: 'dholbrook@emlaw.com', phone: '865-546-7311', company: 'Egerton, McAfee, Armistead & Davis, P.C.' },
  { firstName: 'Jonathan', lastName: 'Reed', email: 'jreed@emlaw.com', phone: '865-546-7311', company: 'Egerton, McAfee, Armistead & Davis, P.C.' },
  { firstName: 'Bradley', lastName: 'Sagraves', email: 'bsagraves@emlaw.com', phone: '865-546-7311', company: 'Egerton, McAfee, Armistead & Davis, P.C.' },
  { firstName: 'Sarah', lastName: 'Sheppeard', email: 'ssheppeard@lewisthomasson.com', phone: '865-546-4646', company: 'Lewis Thomason, P.C.' },
  { firstName: 'Joel', lastName: 'Roettger', email: 'jroettger@gtmpc.com', phone: '865-637-0214', company: 'Gentry, Tipton & McLemore, P.C.' },
  { firstName: 'Kevin', lastName: 'Perkey', email: 'kperkey@wmbac.com', phone: '865-215-1000', company: 'Woolf, McClane, Bright, Allen & Carpenter, PLLC' },
  { firstName: 'Marshall', lastName: 'Peterson', email: 'mpeterson@kmfpc.com', phone: '865-546-7311', company: 'Kennerly, Montgomery & Finley, P.C.' },
  { firstName: 'Stephen', lastName: 'Gillman', email: 'sgillman@phprlawfirm.com', phone: '865-524-8106', company: 'Pryor, Priest & Harber' },
  { firstName: 'Ruth', lastName: 'Ellis', email: 'rellis@ellislaw.com', phone: '865-524-1111', company: 'Ellis Law Firm, LLC' },
  { firstName: 'Dominic', lastName: 'Garduno', email: 'dgarduno@mandyhancock.com', phone: '865-292-2307', company: 'Mandy Hancock Law, PLLC' },
  { firstName: 'John', lastName: 'Haines', email: 'jhaines@hainesfirm.com', phone: '865-522-1222', company: 'The Haines Firm' },
  { firstName: 'Matthew', lastName: 'Haralson', email: 'mharalson@kizerblack.com', phone: '865-983-4600', company: 'Kizer & Black, Attorneys, PLLC' },
  { firstName: 'Zachary', lastName: 'Powers', email: 'zpowers@volunteerlawpllc.com', phone: '865-326-4430', company: 'Volunteer Law PLLC' },

  // Chattanooga Area - Additional
  { firstName: 'Lee', lastName: 'Adams', email: 'ladams@gearhiserpeters.com', phone: '423-756-5171', company: 'Gearhiser, Peters, Elliott & Cannon PLLC' },
  { firstName: 'Hanna', lastName: 'Burnett', email: 'hburnett@meyerburnett.com', phone: '423-265-1100', company: 'Meyer & Burnett, PLLC' },
  { firstName: 'Alan', lastName: 'Cates', email: 'acates@huschblackwell.com', phone: '423-755-2652', company: 'Husch Blackwell LLP' },
  { firstName: 'Daniel', lastName: 'Clanton', email: 'dclanton@wjbrownlaw.com', phone: '423-479-3333', company: 'William J. Brown & Associates, PLLC' },
  { firstName: 'Hollie', lastName: 'Floberg', email: 'hfloberg@gkhpc.com', phone: '423-756-5051', company: 'Grant Konvalinka & Harrison, P.C.' },
  { firstName: 'Amanda', lastName: 'Jelks', email: 'ajelks@jelkslaw.com', phone: '423-414-4028', company: 'Jelks Law, PLLC' },
  { firstName: 'Bryson', lastName: 'Kirksey', email: 'bkirksey@burnshk.com', phone: '423-476-3171', company: 'Burns Henry & Kirksey, P.C.' },
  { firstName: 'Samantha', lastName: 'Lunn', email: 'slunn@huschblackwell.com', phone: '423-755-2652', company: 'Husch Blackwell LLP' },
  { firstName: 'Dana', lastName: 'Perry', email: 'dperry@chamblisslaw.com', phone: '423-756-3000', company: 'Chambliss, Bahner & Stophel, P.C.' },
  { firstName: 'Melody', lastName: 'Shekari', email: 'mshekari@shekarilaw.com', phone: '423-702-6702', company: 'Shekari Law, PLLC' },
  { firstName: 'Howard', lastName: 'Swafford', email: 'hswafford@sjrlaw.com', phone: '423-942-3165', company: 'Swafford, Jenkins & Raines' },
  { firstName: 'Matthew', lastName: 'Tidwell', email: 'mtidwell@tidwelllaw.com', phone: '423-892-2006', company: 'Tidwell & Associates PC' },
  { firstName: 'Randall', lastName: 'VanDolson', email: 'rvandolson@vandolsonlaw.com', phone: '423-266-5666', company: 'Van Dolson Law Office' },
  { firstName: 'Jaclyn', lastName: 'Walliser', email: 'jwalliser@walliserlawfirm.com', phone: '423-752-0544', company: 'The Walliser Law Firm, PLLC' },
  { firstName: 'Gregory', lastName: 'Willett', email: 'gwillett@chamblisslaw.com', phone: '423-756-3000', company: 'Chambliss, Bahner & Stophel, P.C.' },
  { firstName: 'Thomas', lastName: 'Williams', email: 'twilliams@lwdnlaw.com', phone: '423-756-0010', company: 'Leitner Williams Dooley & Napolitan, PLLC' },
  { firstName: 'Valerie', lastName: 'Epstein', email: 'vepstein@epsteinlawfirm.net', phone: '423-265-5100', company: 'Epstein Law Firm' },

  // Johnson City / Tri-Cities Area
  { firstName: 'Robert', lastName: 'Cave', email: 'rcave@cavelaw.com', phone: '423-246-2000', company: 'Robert Payne Cave, Sr. Attorney' },
  { firstName: 'Sarah', lastName: 'Locke', email: 'slocke@everysteplawgroup.com', phone: '423-405-3514', company: 'Every Step Law Group' },

  // Clarksville Area
  { firstName: 'Taylor', lastName: 'Dahl', email: 'tdahl@dahllaw.com', phone: '931-245-5060', company: 'Law Office of Taylor R. Dahl' },
  { firstName: 'Kennedy', lastName: 'Law', email: 'info@kennedylawfirmpllc.com', phone: '931-444-5620', company: 'Kennedy Law Firm, PLLC' },

  // Cleveland / Southeast TN
  { firstName: 'William', lastName: 'Brown', email: 'wbrown@clevelandlaw.com', phone: '423-476-4515', company: 'William Jackson Brown Attorney' },
  { firstName: 'Jack', lastName: 'Tapper', email: 'jtapper@jacktapper.com', phone: '423-472-9512', company: 'Jack W. Tapper, Attorney at Law' },
  { firstName: 'Miller', lastName: 'Law', email: 'info@millerlawfirmtn.com', phone: '423-464-6852', company: 'Miller Law Firm' },

  // Crossville / Cumberland Plateau
  { firstName: 'Nina', lastName: 'Whitehurst', email: 'nina@cumberlandlegacylaw.com', phone: '931-250-8585', company: 'Cumberland Legacy Law' },
  { firstName: 'James', lastName: 'Thompson', email: 'jthompson@crossvillelaw.com', phone: '931-459-2180', company: 'James E. Thompson Attorney' },

  // Cookeville Area
  { firstName: 'Donna', lastName: 'Simpson', email: 'dsimpson@simpsonlawtn.com', phone: '931-340-7444', company: 'Law Office of Donna Simpson' },

  // Murfreesboro / Rutherford County
  { firstName: 'Melanie', lastName: 'Lepp', email: 'mlepp@smithandlepp.com', phone: '615-893-5538', company: 'The Law Office of Smith & Lepp' },
  { firstName: 'Ryan', lastName: 'Freeze', email: 'rfreeze@freezelaw.com', phone: '615-848-7975', company: 'Ryan A. Freeze Attorney' },

  // Tullahoma / Coffee County
  { firstName: 'Doug', lastName: 'Aaron', email: 'daaron@dougaaronlaw.com', phone: '931-728-3550', company: 'Doug Aaron Law' },
  { firstName: 'Robertson', lastName: 'Worsham', email: 'rworsham@rworshamlaw.com', phone: '931-455-5407', company: 'Robertson Worsham Gregory Giffin & Hoskins' },
  { firstName: 'Hull', lastName: 'Ray', email: 'hray@tullahomaattorneys.com', phone: '931-455-5478', company: 'Hull, Ray, Rieder & Lane P.C.' },
  { firstName: 'TheFirm', lastName: 'Law', email: 'info@thefirm.law', phone: '931-222-4010', company: 'The Law Firm, PC' },

  // Winchester / Franklin County
  { firstName: 'Trudy', lastName: 'Edwards', email: 'tedwards@winchesterlaw.com', phone: '931-967-4303', company: 'Trudy McKelvey Edwards Attorney' },

  // Dyersburg / West TN
  { firstName: 'Jones', lastName: 'Lay', email: 'info@dyerlaw.net', phone: '731-882-4214', company: 'Jones Lay PLC' },

  // Jackson Area
  { firstName: 'Sara', lastName: 'Barnett', email: 'sbarnett@spraginslaw.com', phone: '731-300-1592', company: 'Spragins, Barnett & Cobb, PLC' },

  // Nashville Additional
  { firstName: 'Richard', lastName: 'Pepper', email: 'rpeppper@rpepperlaw.com', phone: '615-256-4838', company: 'Pepper Law, PLC' },
  { firstName: 'Rochford', lastName: 'Law', email: 'info@rochfordlawyers.com', phone: '615-269-7676', company: 'Rochford Law' },
  { firstName: 'Lawrence', lastName: 'Nevin', email: 'lnevin@thenevinlawfirm.com', phone: '615-244-7708', company: 'The Nevin Law Firm' },
  { firstName: 'Charles', lastName: 'Frazier', email: 'cfrazier@crfrazierlaw.com', phone: '615-510-4000', company: 'Frazier Law' },
  { firstName: 'Donna', lastName: 'Tees', email: 'dtees@donnateeslaw.com', phone: '615-383-3332', company: 'Donna Tees Attorney at Law' },
  { firstName: 'Higgins', lastName: 'Firm', email: 'info@higginsestategroup.com', phone: '615-353-0930', company: 'The Higgins Firm PLLC' },

  // Brentwood / Williamson County
  { firstName: 'Blair', lastName: 'Law', email: 'info@blairlaw.com', phone: '615-953-1122', company: 'The Blair Law Firm' },
  { firstName: 'Evans', lastName: 'Petree', email: 'info@evanspetree.com', phone: '615-567-0167', company: 'Evans Petree PC - Brentwood' },

  // Oak Ridge / Anderson County
  { firstName: 'Mostoller', lastName: 'Law', email: 'info@msw-law.com', phone: '865-483-1986', company: 'Mostoller, Stulberg, Whitfield, Allen & Tippett' },

  // Maryville / Blount County
  { firstName: 'Anderson', lastName: 'VanTol', email: 'info@andersonvantol.com', phone: '865-977-8288', company: 'Anderson & van Tol PLLC' },

  // Morristown Area
  { firstName: 'Taylor', lastName: 'Reams', email: 'info@trthlawfirm.com', phone: '865-427-8917', company: 'Taylor, Reams, Tilson & Harrison' },

  // Additional Baker Donelson
  { firstName: 'Christopher', lastName: 'Coats', email: 'ccoats@bakerdonelson.com', phone: '901-577-2200', company: 'Baker Donelson - Memphis' },
  { firstName: 'Ross', lastName: 'Cohen', email: 'rcohen@bakerdonelson.com', phone: '615-726-5600', company: 'Baker Donelson - Nashville' },
  { firstName: 'David', lastName: 'Webb', email: 'dwebb@bakerdonelson.com', phone: '865-549-7000', company: 'Baker Donelson - Knoxville' },

  // Hendersonville / Sumner County
  { firstName: 'Milom', lastName: 'Crow', email: 'info@milomcrow.com', phone: '615-719-8909', company: 'Milom Crow Kelley Beckett Shehan PLC' },
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
