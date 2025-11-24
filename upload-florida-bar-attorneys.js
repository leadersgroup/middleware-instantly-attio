const axios = require('axios');

const config = require('./config');
const HUBSPOT_TOKEN = config.hubspot.apiKey;
const OWNER_ID = '160932693'; // Matt (sales1@50deeds.com)

const client = axios.create({
  baseURL: 'https://api.hubapi.com',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${HUBSPOT_TOKEN}`
  },
  timeout: 15000,
});

// Florida Bar Board Certified Wills, Trusts & Estates Attorneys
// Source: https://www.floridabar.org/about/cert/cert-ep-mbrs/
const attorneys = [
  // Page 1 - Wills, Trusts & Estates Certified
  { firstName: 'Bruce', lastName: 'Abernethy', email: 'bruce@floridatrust.net', phone: '772-489-4901', company: 'Bruce R Abernethy Jr PA', city: 'Fort Pierce', barNumber: '357251' },
  { firstName: 'Jolyon', lastName: 'Acosta', email: 'jacosta@bushross.com', phone: '813-224-9255', company: 'Bush Ross PA', city: 'Tampa', barNumber: '31500' },
  { firstName: 'Frank', lastName: 'Adams', email: 'fadams@dwlpa.com', phone: '305-529-1500', company: 'Dunwody White & Landon PA', city: 'Miami', barNumber: '279218' },
  { firstName: 'Matthew', lastName: 'Ahearn', email: 'mahearn@deanmead.com', phone: '407-841-1200', company: 'Dean Mead', city: 'Orlando', barNumber: '121754' },
  { firstName: 'Marve Ann', lastName: 'Alaimo', email: 'malaimo@porterwright.com', phone: '239-593-2964', company: 'Porter Wright Morris & Arthur LLP', city: 'Naples', barNumber: '117749' },
  { firstName: 'Kent', lastName: 'Anderson', email: 'kanderson@bjblawyers.com', phone: '941-906-1231', company: 'Bach Jacobs & Bryne PA', city: 'Sarasota', barNumber: '252638' },
  { firstName: 'Laura', lastName: 'Anderson', email: 'landerson@fwahlaw.com', phone: '321-984-3300', company: 'Frese Whitehead Anderson Anderson & Heus', city: 'Melbourne', barNumber: '874620' },
  { firstName: 'Dana', lastName: 'Apfelbaum', email: 'dapfelbaum@deanmead.com', phone: '772-464-7700', company: 'Dean Mead Minton & Zwemer', city: 'Fort Pierce', barNumber: '73947' },
  { firstName: 'Allison', lastName: 'Archbold', email: 'allison@archboldlawfirm.com', phone: '941-960-8825', company: 'Archbold Law Firm PA', city: 'Sarasota', barNumber: '115088' },
  { firstName: 'Steven', lastName: 'Asarch', email: 'sasarch@asarchlaw.com', phone: '561-995-9991', company: 'Steven J Asarch PA', city: 'Boca Raton', barNumber: '223522' },
  { firstName: 'Paul', lastName: 'Baldovin', email: 'pbaldovin@hodgsonruss.com', phone: '561-656-8013', company: 'Hodgson Russ LLP', city: 'Palm Beach', barNumber: '376787' },
  { firstName: 'Gregory', lastName: 'Band', email: 'gband@bandlawgroup.com', phone: '941-917-0505', company: 'Band Law Group PL', city: 'Sarasota', barNumber: '869902' },
  { firstName: 'Marvin', lastName: 'Bankier', email: 'mbankier@bszalaw.com', phone: '561-278-3110', company: 'Bankier Snelling Zakin & Arlen PLLC', city: 'Delray Beach', barNumber: '564737' },
  { firstName: 'Alan', lastName: 'Banspach', email: 'abanspach@ablawfl.com', phone: '239-482-1774', company: 'Alan Welling Banspach Solo Practice', city: 'Fort Myers', barNumber: '658200' },
  { firstName: 'Scott', lastName: 'Barloga', email: 'sbarloga@barlogalaw.com', phone: '850-805-6101', company: 'Barloga Law PLLC', city: 'Panama City', barNumber: '48143' },
  { firstName: 'Rachel', lastName: 'Barlow', email: 'rbarlow@diamondlaw.com', phone: '727-823-1400', company: 'The Diamond Law Firm PA', city: 'St Petersburg', barNumber: '101624' },
  { firstName: 'Jeffrey', lastName: 'Baskies', email: 'jbaskies@kbwpllc.com', phone: '561-910-5700', company: 'Katz Baskies & Wolf PLLC', city: 'Boca Raton', barNumber: '897884' },
  { firstName: 'Forrest', lastName: 'Bass', email: 'fbass@farrlawfirm.com', phone: '941-639-1158', company: 'Farr Law Firm PA', city: 'Punta Gorda', barNumber: '68197' },
  { firstName: 'Susan', lastName: 'Batson', email: 'sbatson@kimmelbatson.com', phone: '850-438-7501', company: 'Law Offices of Kimmel & Batson', city: 'Pensacola', barNumber: '500186' },
  { firstName: 'Veronica', lastName: 'Bauer', email: 'vbauer@bnmtrust.com', phone: '561-701-8700', company: 'Bauer Newman Mathura PLLC', city: 'Palm Beach', barNumber: '131806' },
  { firstName: 'Rebecca', lastName: 'Bell', email: 'rbell@dcbpa.com', phone: '727-848-3404', company: 'Delzer Coulter & Bell PA', city: 'Port Richey', barNumber: '223440' },
  { firstName: 'Amy', lastName: 'Beller', email: 'abeller@bellersmith.com', phone: '561-994-4316', company: 'Beller Smith PL', city: 'Boca Raton', barNumber: '141763' },
  { firstName: 'Juan', lastName: 'Bendeck', email: 'jbendeck@dentons.com', phone: '239-444-1821', company: 'Dentons Cohen & Grigsby', city: 'Naples', barNumber: '78298' },
  { firstName: 'Norman', lastName: 'Benford', email: 'nbenford@gtlaw.com', phone: '305-579-0660', company: 'Greenberg Traurig', city: 'Miami', barNumber: '186464' },
  { firstName: 'Laurence', lastName: 'Blair', email: 'lblair@gmlaw.com', phone: '561-994-2212', company: 'Greenspoon Marder PA', city: 'Boca Raton', barNumber: '999430' },
  { firstName: 'Jerri', lastName: 'Blaney', email: 'jblaney@blaneylaw.com', phone: '561-624-0291', company: 'Jerri M Blaney PA', city: 'Palm Beach Gardens', barNumber: '358967' },
  { firstName: 'Gregory', lastName: 'Bloshinsky', email: 'gbloshinsky@cozen.com', phone: '561-750-3850', company: 'Cozen OConnor', city: 'Boca Raton', barNumber: '66540' },
  { firstName: 'Debra', lastName: 'Boje', email: 'dboje@gunster.com', phone: '813-222-6614', company: 'Gunster Yoakley & Stewart PA', city: 'Tampa', barNumber: '949604' },
  { firstName: 'John', lastName: 'Bovay', email: 'jbovay@cypressrowadvisors.com', phone: '407-480-5005', company: 'Cypress Row Advisors', city: 'Orlando', barNumber: '349895' },
  { firstName: 'William', lastName: 'Boyes', email: 'wboyes@boyesfarina.com', phone: '561-694-7979', company: 'Boyes Farina & Matwiczyk PA', city: 'Palm Beach Gardens', barNumber: '140562' },
  { firstName: 'Todd', lastName: 'Bradley', email: 'tbradley@cl-law.com', phone: '239-649-3196', company: 'Cummings & Lockwood LLC', city: 'Naples', barNumber: '898007' },
  { firstName: 'Keith', lastName: 'Braun', email: 'kbraun@comitersinger.com', phone: '561-626-2101', company: 'Comiter Singer Baseman & Braun LLP', city: 'Palm Beach Gardens', barNumber: '979724' },
  { firstName: 'Mark', lastName: 'Brown', email: 'mbrown@comitersinger.com', phone: '561-626-2101', company: 'Comiter Singer Baseman & Braun LLP', city: 'Palm Beach Gardens', barNumber: '994995' },
  { firstName: 'David', lastName: 'Browne', email: 'dbrowne@brownelawpa.com', phone: '239-498-1191', company: 'David P Browne PA', city: 'Bonita Springs', barNumber: '650072' },
  { firstName: 'Randy', lastName: 'Bryan', email: 'rbryan@hoytbryan.com', phone: '407-977-8080', company: 'The Law Offices Of Hoyt & Bryan LLC', city: 'Oviedo', barNumber: '990957' },
  { firstName: 'Elaine', lastName: 'Bucher', email: 'ebucher@gunster.com', phone: '561-961-8126', company: 'Gunster', city: 'Boca Raton', barNumber: '162434' },
  { firstName: 'Robert', lastName: 'Buckel', email: 'rbuckel@wilsonjohnson.com', phone: '239-436-1500', company: 'Wilson & Johnson', city: 'Naples', barNumber: '306770' },
  { firstName: 'Charla', lastName: 'Burchett', email: 'cburchett@shutts.com', phone: '941-552-3500', company: 'Shutts & Bowen LLP', city: 'Sarasota', barNumber: '813230' },
  { firstName: 'William', lastName: 'Burke', email: 'wburke@cabornelaw.com', phone: '239-435-3535', company: 'Coleman Yovanovich & Koester PA', city: 'Naples', barNumber: '967394' },
  { firstName: 'Charles', lastName: 'Callahan', email: 'ccallahan@bradley.com', phone: '813-559-5586', company: 'Bradley Arant Boult Cummings LLP', city: 'Tampa', barNumber: '148776' },
  { firstName: 'Robert', lastName: 'Carroll', email: 'rcarroll@galbraithweatherbie.com', phone: '239-325-2300', company: 'Galbraith Weatherbie Law', city: 'Naples', barNumber: '115107' },
  { firstName: 'William', lastName: 'Carroll', email: 'wcarroll@mrmlaw.com', phone: '561-833-9631', company: 'Mettler Randolph Massey', city: 'Palm Beach', barNumber: '957471' },
  { firstName: 'Curtis', lastName: 'Cassner', email: 'ccassner@cassnerlaw.com', phone: '239-325-1825', company: 'Cassner Law PA', city: 'Naples', barNumber: '411868' },
  { firstName: 'Denise', lastName: 'Cazobon', email: 'dcazobon@dwlpa.com', phone: '239-263-5885', company: 'Dunwody White & Landon PA', city: 'Naples', barNumber: '71616' },
  { firstName: 'Brian', lastName: 'Cheslack', email: 'bcheslack@gunster.com', phone: '561-257-1820', company: 'Gunster', city: 'Boca Raton', barNumber: '365350' },
  { firstName: 'Neil', lastName: 'Chrystal', email: 'nchrsytal@dwlpa.com', phone: '305-529-1500', company: 'Dunwody White & Landon PA', city: 'Coral Gables', barNumber: '578185' },
  { firstName: 'DArcy', lastName: 'Clarie', email: 'dclarie@clarielawoffice.com', phone: '727-345-0041', company: 'Clarie Law Office', city: 'Saint Petersburg', barNumber: '122704' },
  { firstName: 'Alan', lastName: 'Cohn', email: 'acohn@gmlaw.com', phone: '954-491-1120', company: 'Greenspoon Marder LLP', city: 'Fort Lauderdale', barNumber: '434698' },
  { firstName: 'Jean', lastName: 'Coker', email: 'jcoker@jeancokerlaw.com', phone: '904-296-1100', company: 'Jean C Coker PA', city: 'Jacksonville', barNumber: '126623' },

  // Page 2 - More Wills, Trusts & Estates Certified
  { firstName: 'Kelley', lastName: 'Corbridge', email: 'corbridge@horlickcorbridge.com', phone: '941-484-5656', company: 'Horlick & Corbridge PA', city: 'Venice', barNumber: '325066' },
  { firstName: 'Elizabeth', lastName: 'Cottom', email: 'ecottom@williamsparker.com', phone: '941-329-6631', company: 'Williams Parker', city: 'Sarasota', barNumber: '92847' },
  { firstName: 'Wayne', lastName: 'Coulter', email: 'wcoulter@dcbpa.com', phone: '727-848-3404', company: 'Delzer Coulter & Bell PA', city: 'Port Richey', barNumber: '114585' },
  { firstName: 'Cayley', lastName: 'Crane', email: 'ccrane@gunster.com', phone: '561-961-8010', company: 'Gunster', city: 'Boca Raton', barNumber: '1011298' },
  { firstName: 'Mary Beth', lastName: 'Crawford', email: 'mcrawford@cl-law.com', phone: '239-947-8811', company: 'Cummings & Lockwood LLC', city: 'Bonita Springs', barNumber: '115754' },
  { firstName: 'Steven', lastName: 'Cutler', email: 'scutler@cutlerlaw.com', phone: '305-428-5070', company: 'Cutler Law', city: 'Coral Gables', barNumber: '353418' },
  { firstName: 'Adam', lastName: 'Czaya', email: 'aczaya@keithtaylorlaw.com', phone: '352-795-0404', company: 'Keith Taylor Law Group PA', city: 'Lecanto', barNumber: '90989' },
  { firstName: 'Jamil', lastName: 'Daoud', email: 'jdaoud@foley.com', phone: '813-225-4188', company: 'Foley & Lardner LLP', city: 'Tampa', barNumber: '25862' },
  { firstName: 'Terrence', lastName: 'Dariotis', email: 'tdariotis@dariotislaw.com', phone: '850-523-9300', company: 'Dariotis Law', city: 'Tallahassee', barNumber: '190057' },
  { firstName: 'Robert', lastName: 'Dawkins', email: 'rdawkins@ftlb.com', phone: '904-356-2600', company: 'Fisher Tousey Leas & Ball', city: 'Ponte Vedra Beach', barNumber: '307122' },
  { firstName: 'Kathleen', lastName: 'DeMaria', email: 'kdemaria@demariadekozan.com', phone: '850-434-2761', company: 'DeMaria de Kozan & White PLLC', city: 'Pensacola', barNumber: '503789' },
  { firstName: 'Christopher', lastName: 'Denicolo', email: 'cdenicolo@gassmandkt.com', phone: '727-442-1200', company: 'Gassman Denicolo & Ketron PA', city: 'Clearwater', barNumber: '43684' },
  { firstName: 'Lauren', lastName: 'Detzel', email: 'ldetzel@deanmead.com', phone: '407-428-5114', company: 'Dean Mead', city: 'Orlando', barNumber: '253294' },
  { firstName: 'Frederick', lastName: 'Devitt', email: 'fdevitt@macmillanstanley.com', phone: '561-276-6363', company: 'MacMillan & Stanley PLLC', city: 'Delray Beach', barNumber: '767670' },
  { firstName: 'Sandra', lastName: 'Diamond', email: 'sdiamond@diamondlaw.com', phone: '727-823-1400', company: 'The Diamond Law Firm PA', city: 'St Petersburg', barNumber: '275093' },
  { firstName: 'Kimberley', lastName: 'Dillon', email: 'kdillon@quarles.com', phone: '239-434-4945', company: 'Quarles & Brady LLP', city: 'Naples', barNumber: '14160' },
  { firstName: 'Hamilton', lastName: 'Doane', email: 'hdoane@doanedoane.com', phone: '561-656-0200', company: 'Doane & Doane PA', city: 'Palm Beach Gardens', barNumber: '1024685' },
  { firstName: 'Randell', lastName: 'Doane', email: 'rdoane@doanedoane.com', phone: '561-656-0200', company: 'Doane & Doane PA', city: 'Palm Beach Gardens', barNumber: '315321' },
  { firstName: 'Rebecca', lastName: 'Doane', email: 'rgdoane@doanedoane.com', phone: '561-656-0200', company: 'Doane and Doane PA', city: 'Palm Beach Gardens', barNumber: '621633' },
  { firstName: 'Samuel', lastName: 'Dolcimascolo', email: 'sdolcimascolo@bushross.com', phone: '813-224-9255', company: 'Bush Ross PA', city: 'Tampa', barNumber: '173047' },
  { firstName: 'Alison', lastName: 'Douglas', email: 'adouglas@cl-law.com', phone: '239-649-3180', company: 'Cummings & Lockwood LLC', city: 'Naples', barNumber: '899003' },
  { firstName: 'Edward', lastName: 'Downey', email: 'edowney@downeylaw.com', phone: '561-691-2043', company: 'Downey McElroy PA', city: 'Palm Beach Gardens', barNumber: '441074' },
  { firstName: 'Michael', lastName: 'Dribin', email: 'mdribin@harperlawyer.com', phone: '305-577-5415', company: 'Harper Meyer Perez Hagen', city: 'Miami', barNumber: '205656' },
  { firstName: 'Stephen', lastName: 'Dunegan', email: 'sddunegan@dunegantax.com', phone: '407-654-9455', company: 'Law Office of Stephen D Dunegan', city: 'Winter Garden', barNumber: '326933' },
  { firstName: 'Robert', lastName: 'Eardley', email: 'reardley@eardleylaw.com', phone: '239-591-6776', company: 'Law Office of Robert H Eardley PA', city: 'Naples', barNumber: '500631' },
  { firstName: 'Guy', lastName: 'Emerich', email: 'gemerch@farrlaw.com', phone: '941-286-4505', company: 'Farr Farr Emerich Hackett & Carr PA', city: 'Punta Gorda', barNumber: '126991' },
  { firstName: 'Alex', lastName: 'Espenkotter', email: 'aespenkotter@hellerespenkotter.com', phone: '305-777-3765', company: 'Heller Espenkotter PLLC', city: 'Coconut Grove', barNumber: '127388' },
  { firstName: 'Amy', lastName: 'Fanzlaw', email: 'afanzlaw@osbornelaw.com', phone: '561-395-1000', company: 'Osborne & Osborne PA', city: 'Boca Raton', barNumber: '54860' },
  { firstName: 'John', lastName: 'Farina', email: 'jfarina@boyesfarina.com', phone: '561-694-7979', company: 'Boyes Farina & Matwiczyk PA', city: 'Palm Beach Gardens', barNumber: '612146' },
  { firstName: 'Andrew', lastName: 'Fein', email: 'afein@minerleyfein.com', phone: '561-362-6699', company: 'Minerley Fein PA', city: 'Boca Raton', barNumber: '956430' },
  { firstName: 'John', lastName: 'Feldman', email: 'jfeldman@bowenschroth.com', phone: '352-589-1414', company: 'Bowen & Schroth PA', city: 'Leesburg', barNumber: '382965' },
  { firstName: 'James', lastName: 'Flick', email: 'jflick@flicklaw.com', phone: '407-273-1045', company: 'Flick Law Group PL', city: 'Orlando', barNumber: '366803' },
  { firstName: 'Rose-Anne', lastName: 'Frano', email: 'rfrano@williamsparker.com', phone: '941-536-2033', company: 'Williams Parker', city: 'Sarasota', barNumber: '592218' },
  { firstName: 'Nancy', lastName: 'Freeman', email: 'nfreeman@nsfpa.com', phone: '407-542-0963', company: 'Nancy S Freeman PA', city: 'Oviedo', barNumber: '968293' },
  { firstName: 'Julia', lastName: 'Frey', email: 'jfrey@lowndesdrosdick.com', phone: '407-418-6243', company: 'Lowndes Drosdick Doster Kantor & Reed', city: 'Orlando', barNumber: '350486' },
  { firstName: 'Beverly', lastName: 'Furtick', email: 'bfurtick@ftlb.com', phone: '904-356-2600', company: 'Fisher Tousey Leas & Ball', city: 'Ponte Vedra Beach', barNumber: '510440' },
  { firstName: 'Brad', lastName: 'Galbraith', email: 'bgalbraith@galbraithweatherbie.com', phone: '239-325-2300', company: 'Galbraith Weatherbie Law PLLC', city: 'Naples', barNumber: '494291' },
  { firstName: 'Richard', lastName: 'Gans', email: 'rgans@ganslaw.com', phone: '941-957-1900', company: 'Gans Law', city: 'Sarasota', barNumber: '40878' },
  { firstName: 'Alan', lastName: 'Gassman', email: 'agassman@gassmandkt.com', phone: '727-442-1200', company: 'Gassman Denicolo & Ketron PA', city: 'Clearwater', barNumber: '371750' },
  { firstName: 'Fernando', lastName: 'Giachino', email: 'fgiachino@giachinolaw.com', phone: '772-266-4184', company: 'Fernando M Giachino PA', city: 'Stuart', barNumber: '180660' },
  { firstName: 'Nancy', lastName: 'Gibbs', email: 'ngibbs@skrivangibbslaw.com', phone: '239-597-4500', company: 'Skrivan & Gibbs PLLC', city: 'Naples', barNumber: '15547' },
  { firstName: 'Gene', lastName: 'Glasser', email: 'gglasser@greensponmarder.com', phone: '954-491-1120', company: 'Greenspoon Marder LLP', city: 'Fort Lauderdale', barNumber: '150354' },
  { firstName: 'Jeffrey', lastName: 'Goethe', email: 'jgoethe@barneswalker.com', phone: '941-741-8224', company: 'Barnes Walker Goethe Perron Shea', city: 'Bradenton', barNumber: '861420' },
  { firstName: 'Stuart', lastName: 'Goldberg', email: 'segoldberg@stuartgoldberg.com', phone: '850-222-4000', company: 'Law Offices of Stuart E Goldberg PL', city: 'Tallahassee', barNumber: '365971' },
  { firstName: 'Joshua', lastName: 'Goldglantz', email: 'jgoldglantz@gunster.com', phone: '561-257-1813', company: 'Gunster Yoakley & Stewart', city: 'Boca Raton', barNumber: '44012' },
  { firstName: 'Kenneth', lastName: 'Goodman', email: 'kgoodman@goodmanbreen.com', phone: '239-403-3000', company: 'Goodman Breen', city: 'Naples', barNumber: '775710' },
  { firstName: 'Kirk', lastName: 'Grantham', email: 'kgrantham@granthamlaw.com', phone: '561-966-3000', company: 'The Grantham Law Firm', city: 'West Palm Beach', barNumber: '133803' },
  { firstName: 'Monique', lastName: 'Greenberg', email: 'mgreenberg@lavenderlaw.com', phone: '786-832-4694', company: 'Lavender Greenberg PLLC', city: 'Coral Gables', barNumber: '83834' },
  { firstName: 'Ric', lastName: 'Gregoria', email: 'rgregoria@williamsparker.com', phone: '941-536-2031', company: 'Williams Parker', city: 'Sarasota', barNumber: '908551' },

  // Page 3 - More Wills, Trusts & Estates Certified
  { firstName: 'Linda', lastName: 'Griffin', email: 'lgriffin@olderlundy.com', phone: '813-254-8998', company: 'Older Lundy Koch & Martino', city: 'Clearwater', barNumber: '371971' },
  { firstName: 'Michael', lastName: 'Gross', email: 'mgross@mwe.com', phone: '561-717-9229', company: 'McDermott Will and Schulte', city: 'Boca Raton', barNumber: '67660' },
  { firstName: 'Anthony', lastName: 'Guettler', email: 'aguettler@gcf-law.com', phone: '772-231-1100', company: 'Gould Cooksey Fennell PA', city: 'Vero Beach', barNumber: '17689' },
  { firstName: 'James', lastName: 'Gulecas', email: 'jgulecas@gulecaslaw.com', phone: '727-736-5300', company: 'James F Gulecas PA', city: 'Dunedin', barNumber: '65994' },
  { firstName: 'Michelle', lastName: 'Gumula', email: 'mgumula@hoytbryan.com', phone: '407-977-8080', company: 'The Law Offices of Hoyt & Bryan', city: 'Oviedo', barNumber: '110015' },
  { firstName: 'Troy', lastName: 'Hafner', email: 'thafner@gcf-law.com', phone: '772-231-1100', company: 'Gould Cooksey Fennell', city: 'Vero Beach', barNumber: '892955' },
  { firstName: 'Daniel', lastName: 'Hanley', email: 'dhanley@gunster.com', phone: '561-650-0531', company: 'Gunster Yoakley & Stewart PA', city: 'West Palm Beach', barNumber: '162483' },
  { firstName: 'Shelly', lastName: 'Harris', email: 'sharris@shutts.com', phone: '561-650-8524', company: 'Shutts & Bowen LLP', city: 'West Palm Beach', barNumber: '145823' },
  { firstName: 'Craig', lastName: 'Harrison', email: 'charrison@lyonsbeaudry.com', phone: '941-366-3282', company: 'Lyons Beaudry & Harrison PA', city: 'Sarasota', barNumber: '466530' },
  { firstName: 'Linda', lastName: 'Hartley', email: 'lhartley@hwhlaw.com', phone: '813-221-3900', company: 'Hill Ward Henderson', city: 'Tampa', barNumber: '951950' },
  { firstName: 'Ernest', lastName: 'Hatch', email: 'ehatch@henlaw.com', phone: '239-344-1190', company: 'Henderson Franklin Starnes & Holt PA', city: 'Fort Myers', barNumber: '97091' },
  { firstName: 'Jason', lastName: 'Havens', email: 'jhavens@hklaw.com', phone: '904-353-2000', company: 'Holland & Knight LLP', city: 'Jacksonville', barNumber: '304440' },
  { firstName: 'Gregg', lastName: 'Heckley', email: 'gheckley@heckleylaw.com', phone: '813-936-1632', company: 'Gregg G Heckley Attorney at Law', city: 'Tampa', barNumber: '441414' },
  { firstName: 'Danny', lastName: 'Heller', email: 'dheller@hellerespenkotter.com', phone: '305-777-3765', company: 'Heller Espenkotter PLLC', city: 'Miami', barNumber: '472220' },
  { firstName: 'Kevin', lastName: 'Hendrickson', email: 'khendrickson@khlaw.com', phone: '772-461-0558', company: 'Kevin Hendrickson', city: 'Fort Pierce', barNumber: '618454' },
  { firstName: 'Jonathan', lastName: 'Hermes', email: 'jhermes@ginnpatrou.com', phone: '904-461-3000', company: 'Ginn & Patrou PLLC', city: 'St Augustine', barNumber: '1011335' },
  { firstName: 'Craig', lastName: 'Hersch', email: 'chersch@sheppardlawfirm.com', phone: '239-334-1141', company: 'Sheppard Law Firm', city: 'Fort Myers', barNumber: '817820' },
  { firstName: 'Stephen', lastName: 'Heuston', email: 'sheuston@heustonlegal.com', phone: '321-428-2820', company: 'Heuston Legal PLLC', city: 'Melbourne', barNumber: '978302' },
  { firstName: 'Robert', lastName: 'Highsmith', email: 'rhighsmith@highsmithlaw.com', phone: '305-296-8851', company: 'Highsmith and Van Loon PA', city: 'Key West', barNumber: '30333' },
  { firstName: 'Alan', lastName: 'Hilfiker', email: 'ahilfiker@dentons.com', phone: '239-390-1900', company: 'Dentons', city: 'Naples', barNumber: '206040' },
  { firstName: 'Michael', lastName: 'Hill', email: 'mhill@sheppardlawfirm.com', phone: '239-334-1141', company: 'Sheppard Law Firm', city: 'Fort Myers', barNumber: '547824' },
  { firstName: 'Elliot', lastName: 'Hochman', email: 'ehochman@bhpjlaw.com', phone: '561-624-2110', company: 'Brookmyer Hochman Probst & Jonas PA', city: 'Palm Beach Gardens', barNumber: '340901' },
  { firstName: 'Jeffrey', lastName: 'Hoffman', email: 'jhoffman@wilsonjohnson.com', phone: '239-436-1503', company: 'Wilson & Johnson PA', city: 'Naples', barNumber: '837946' },
  { firstName: 'Margaret', lastName: 'Hoyt', email: 'mhoyt@hoytbryan.com', phone: '407-977-8080', company: 'The Law Offices of Hoyt & Bryan LLC', city: 'Oviedo', barNumber: '998680' },
  { firstName: 'Howard', lastName: 'Hujsa', email: 'hhujsa@cl-law.com', phone: '239-390-8068', company: 'Cummings & Lockwood', city: 'Bonita Springs', barNumber: '979480' },
  { firstName: 'Jordan', lastName: 'Hurlburt', email: 'jhurlburt@cypressrowadvisors.com', phone: '407-480-5005', company: 'Cypress Row Advisors', city: 'Orlando', barNumber: '60832' },
  { firstName: 'Gary', lastName: 'Huston', email: 'ghuston@hustonlaw.com', phone: '850-378-8442', company: 'Gary W Huston PLLC', city: 'Pensacola', barNumber: '44520' },
  { firstName: 'David', lastName: 'Johnson', email: 'djohnson@johnsonestatelaw.com', phone: '941-365-0118', company: 'David P Johnson Esq', city: 'Sarasota', barNumber: '525499' },
  { firstName: 'Kathleen', lastName: 'Kadyszewski', email: 'kkadyszewski@murphyreid.com', phone: '561-355-8800', company: 'Murphy Reid LLP', city: 'Palm Beach Gardens', barNumber: '682322' },
  { firstName: 'Steven', lastName: 'Kane', email: 'skane@kanekoltun.com', phone: '407-661-1177', company: 'Kane and Koltun Attorneys at Law', city: 'Maitland', barNumber: '298158' },
  { firstName: 'George', lastName: 'Karibjanian', email: 'gkaribjanian@fkllaw.com', phone: '561-208-1272', company: 'Franklin Karibjanian & Law PLLC', city: 'Boca Raton', barNumber: '775975' },
  { firstName: 'Joshua', lastName: 'Keleske', email: 'jkeleske@keleskeleaw.com', phone: '813-254-0044', company: 'Joshua T Keleske PL', city: 'Tampa', barNumber: '548472' },
  { firstName: 'Rohan', lastName: 'Kelley', email: 'rkelley@kelleylawfirm.com', phone: '954-563-1540', company: 'The Kelley Law Firm PL', city: 'Fort Lauderdale', barNumber: '42060' },
  { firstName: 'Shane', lastName: 'Kelley', email: 'skelley@kelleykelley.com', phone: '904-819-9706', company: 'Kelley & Kelley PL', city: 'St Augustine', barNumber: '80470' },
  { firstName: 'Charles', lastName: 'Kelly', email: 'ckelly@kellylawnaples.com', phone: '239-261-3453', company: 'Kelly Passidomo & Kelly LLP', city: 'Naples', barNumber: '364495' },
  { firstName: 'Peter', lastName: 'Kelly', email: 'pkelly@bushross.com', phone: '813-204-6414', company: 'Bush Ross PA', city: 'Tampa', barNumber: '328618' },

  // Page 4 - More attorneys
  { firstName: 'Justin', lastName: 'Larson', email: 'jlarson@gcf-law.com', phone: '772-231-1100', company: 'Gould Cooksey Fennell', city: 'Vero Beach', barNumber: '114425' },
  { firstName: 'Edward', lastName: 'Lauer', email: 'elauer@lauerlaw.com', phone: '772-234-4200', company: 'Lauer Law PA', city: 'Vero Beach', barNumber: '232076' },
  { firstName: 'Lester', lastName: 'Law', email: 'llaw@fkllaw.com', phone: '229-202-0416', company: 'Franklin Karibjanian & Law PLLC', city: 'Naples', barNumber: '993300' },
  { firstName: 'Jordan', lastName: 'Lee', email: 'jlee@shutts.com', phone: '813-227-8183', company: 'Shutts & Bowen LLP', city: 'Tampa', barNumber: '10209' },
  { firstName: 'Jody', lastName: 'Leslie', email: 'jleslie@lesliemclaughlin.com', phone: '954-779-1772', company: 'Leslie & McLaughlin LLP', city: 'Fort Lauderdale', barNumber: '773174' },
  { firstName: 'Gary', lastName: 'Leuchtman', email: 'gleuctman@leuchtmanlaw.com', phone: '850-316-8179', company: 'Law Office Of Gary B Leuchtman PLLC', city: 'Pensacola', barNumber: '342262' },
  { firstName: 'Laird', lastName: 'Lile', email: 'llile@lairdlile.com', phone: '239-649-7778', company: 'Laird A Lile PLLC', city: 'Naples', barNumber: '443141' },
  { firstName: 'Matthew', lastName: 'Linde', email: 'mlinde@lindegould.com', phone: '239-939-7100', company: 'Linde Gould and Associates', city: 'Naples', barNumber: '528791' },
  { firstName: 'Jack', lastName: 'Loving', email: 'jloving@lovingscully.com', phone: '954-323-8144', company: 'Loving Scully Law Group PLLC', city: 'Fort Lauderdale', barNumber: '238821' },
  { firstName: 'Rachel', lastName: 'Lunsford', email: 'rlunsford@gunster.com', phone: '813-228-9080', company: 'Gunster', city: 'Tampa', barNumber: '268320' },
  { firstName: 'Brian', lastName: 'Malec', email: 'bmalec@deanmead.com', phone: '407-428-5177', company: 'Dean Mead PA', city: 'Orlando', barNumber: '41498' },
  { firstName: 'Mark', lastName: 'Manceri', email: 'mmanceri@mancerilaw.com', phone: '954-491-7099', company: 'Mark R Manceri PA', city: 'Pompano Beach', barNumber: '444560' },
  { firstName: 'John', lastName: 'Mangan', email: 'jmangan@beaconlegacylaw.com', phone: '772-324-9050', company: 'Beacon Legacy Law', city: 'Palm City', barNumber: '10020' },
  { firstName: 'Seth', lastName: 'Marmor', email: 'smarmor@hymlaw.com', phone: '561-995-1800', company: 'Hark Yon Marmor PLLC', city: 'Boca Raton', barNumber: '337099' },
  { firstName: 'Renee', lastName: 'Marquis-Abrams', email: 'rmarquis@nmohlaw.com', phone: '772-464-8200', company: 'Neill Marquis Osking & Hale PLLC', city: 'Fort Pierce', barNumber: '984220' },
  { firstName: 'Elizabeth', lastName: 'Marshall', email: 'emarshall@williamsparker.com', phone: '941-329-6614', company: 'Williams Parker', city: 'Sarasota', barNumber: '440884' },
  { firstName: 'Lee', lastName: 'Massey', email: 'lmassey@lewismassey.com', phone: '407-892-5138', company: 'Lewis and Massey PA', city: 'Saint Cloud', barNumber: '36207' },
  { firstName: 'Peter', lastName: 'Matwiczyk', email: 'pmatwiczyk@boyesfarina.com', phone: '561-694-7979', company: 'Boyes Farina & Matwiczyk PA', city: 'Palm Beach Gardens', barNumber: '251100' },
  { firstName: 'Brian', lastName: 'McAvoy', email: 'bmcavoy@ralaw.com', phone: '239-649-2722', company: 'Roetzel & Andress', city: 'Naples', barNumber: '47473' },
  { firstName: 'Paul', lastName: 'McCawley', email: 'pmccawley@gtlaw.com', phone: '954-768-8269', company: 'Greenberg Traurig PA', city: 'Fort Lauderdale', barNumber: '46469' },
  { firstName: 'Gant', lastName: 'McCloud', email: 'gmccloud@mccloudlaw.com', phone: '941-957-9330', company: 'F Gant McCloud PA', city: 'Sarasota', barNumber: '72163' },
  { firstName: 'Marshall', lastName: 'McDonald', email: 'mmcdonald@mcdonaldlawfirm.com', phone: '561-748-2233', company: 'McDonald Law Firm', city: 'Tequesta', barNumber: '289851' },
  { firstName: 'William', lastName: 'McQueen', email: 'wmcqueen@lpllp.com', phone: '727-471-5868', company: 'Legacy Protection Lawyers LLP', city: 'Saint Petersburg', barNumber: '745715' },
  { firstName: 'Daniel', lastName: 'Medina', email: 'dmedina@medinalawgroup.com', phone: '863-682-9730', company: 'Medina Law Group PA', city: 'Lakeland', barNumber: '27553' },
  { firstName: 'Gregory', lastName: 'Melnick', email: 'gmelnick@melnicklaw.com', phone: '407-673-8033', company: 'Law Office of Gregory E Melnick Jr', city: 'Winter Park', barNumber: '921386' },

  // Elder Law Certified Attorneys
  { firstName: 'Jennifer', lastName: 'Akin', email: 'jennifer@jakinlaw.com', phone: '904-320-0011', company: 'J Akin Law', city: 'St Augustine', barNumber: '113117' },
  { firstName: 'Kevin', lastName: 'Albaum', email: 'kalbaum@cclw.com', phone: '863-647-5337', company: 'Clark Campbell Lancaster Workman PA', city: 'Lakeland', barNumber: '112346' },
  { firstName: 'Sarah', lastName: 'AuMiller', email: 'saumiller@hoytbryan.com', phone: '407-977-8080', company: 'The Law Offices of Hoyt & Bryan LLC', city: 'Oviedo', barNumber: '72833' },
  { firstName: 'Pamela', lastName: 'Baker', email: 'pbaker@safeharborlawfirm.com', phone: '239-317-3116', company: 'Safe Harbor Law Firm', city: 'Naples', barNumber: '127503' },
  { firstName: 'Genny', lastName: 'Bernstein', email: 'gbernstein@jonesfoster.com', phone: '561-659-3000', company: 'Jones Foster', city: 'West Palm Beach', barNumber: '295050' },
  { firstName: 'Vicki', lastName: 'Bowers', email: 'vbowers@bowersfoster.com', phone: '904-998-0724', company: 'Bowers & Foster Elder Law PA', city: 'Jacksonville', barNumber: '120952' },
  { firstName: 'Andrew', lastName: 'Boyer', email: 'aboyer@boyerboyer.com', phone: '941-365-2304', company: 'Boyer & Boyer PA', city: 'Sarasota', barNumber: '35409' },
  { firstName: 'Edwin', lastName: 'Boyer', email: 'eboyer@boyerboyer.com', phone: '941-365-2304', company: 'Boyer & Boyer PA', city: 'Sarasota', barNumber: '252719' },
  { firstName: 'Sherri', lastName: 'Brenner', email: 'sbrenner@floridaelderlaw.com', phone: '561-245-4620', company: 'Florida Elder Law Concepts PA', city: 'Boca Raton', barNumber: '101532' },
  { firstName: 'Norma', lastName: 'Brill', email: 'nbrill@hamptonlaw.com', phone: '239-997-6464', company: 'Hampton Law', city: 'Fort Myers', barNumber: '648035' },
  { firstName: 'Heidi', lastName: 'Brown', email: 'hbrown@osterhoutmckinney.com', phone: '239-939-4888', company: 'Osterhout & McKinney PA', city: 'Fort Myers', barNumber: '48692' },
  { firstName: 'Robert', lastName: 'Bryant', email: 'rbryant@bbelderlaw.com', phone: '904-398-6100', company: 'Berg Bryant Elder Law Group PLLC', city: 'Jacksonville', barNumber: '43421' },
  { firstName: 'Jill', lastName: 'Burzynski', email: 'jburzynski@burzynskielderlaw.com', phone: '239-434-8557', company: 'Burzynski Elder Law', city: 'Naples', barNumber: '744931' },
  { firstName: 'Mary', lastName: 'Byrski', email: 'mbyrski@byrskilaw.com', phone: '941-833-9262', company: 'Byrski Estate & Elder Law', city: 'Punta Gorda', barNumber: '166413' },
  { firstName: 'Sara', lastName: 'Caldwell', email: 'scaldwell@caldwellelderlaw.com', phone: '386-258-1950', company: 'Sara Caldwell Elder Law', city: 'Daytona Beach', barNumber: '318353' },
  { firstName: 'Marilyn', lastName: 'Belo', email: 'mbelo@belolaw.com', phone: '352-448-4500', company: 'Law Office of Marilyn C Belo', city: 'Gainesville', barNumber: '22390' },
  { firstName: 'Linda', lastName: 'Chamberlain', email: 'lchamberlain@specialneedslawyers.com', phone: '727-443-7898', company: 'Special Needs Lawyers PA', city: 'Clearwater', barNumber: '886970' },
  { firstName: 'John', lastName: 'Clardy', email: 'jclardy@clardylaw.com', phone: '352-795-2946', company: 'Clardy Law Firm PA', city: 'Crystal River', barNumber: '123129' },
  { firstName: 'Marie', lastName: 'Conforti', email: 'mconforti@conforthihennig.com', phone: '772-257-0421', company: 'Conforti & Hennig', city: 'Vero Beach', barNumber: '22436' },
  { firstName: 'Michael', lastName: 'Connors', email: 'mconnors@mwcpa.com', phone: '561-494-0500', company: 'Michael W Connors PA', city: 'Gainesville', barNumber: '658227' },
];

async function createContact(attorney) {
  const properties = {
    email: attorney.email,
    firstname: attorney.firstName,
    lastname: attorney.lastName,
    phone: attorney.phone,
    company: attorney.company,
    city: attorney.city,
    state: 'Florida',
    hubspot_owner_id: OWNER_ID,
    hs_lead_status: 'NEW'
  };

  const response = await client.post('/crm/v3/objects/contacts', { properties });
  return response.data;
}

async function uploadAttorneys() {
  console.log(`\n========================================`);
  console.log(`Florida Bar Certified Attorneys Upload`);
  console.log(`========================================`);
  console.log(`Total attorneys to upload: ${attorneys.length}`);
  console.log(`Owner: Matt (ID: ${OWNER_ID})`);
  console.log(`State: Florida`);
  console.log(`========================================\n`);

  let success = 0;
  let failed = 0;
  let duplicates = 0;
  const errors = [];

  for (let i = 0; i < attorneys.length; i++) {
    const attorney = attorneys[i];
    const progress = `[${i + 1}/${attorneys.length}]`;

    try {
      process.stdout.write(`${progress} ${attorney.firstName} ${attorney.lastName} (${attorney.company})... `);
      await createContact(attorney);
      success++;
      console.log('OK');

      // Rate limiting - small delay between requests
      await new Promise(r => setTimeout(r, 150));
    } catch (error) {
      const msg = error.response?.data?.message || error.message;

      if (msg.includes('already exists') || msg.includes('Contact already exists')) {
        duplicates++;
        console.log('DUPLICATE');
      } else {
        failed++;
        console.log(`FAILED: ${msg}`);
        errors.push({ attorney: `${attorney.firstName} ${attorney.lastName}`, error: msg });
      }
    }
  }

  console.log(`\n========================================`);
  console.log(`UPLOAD COMPLETE`);
  console.log(`========================================`);
  console.log(`Successfully uploaded: ${success}`);
  console.log(`Duplicates (skipped): ${duplicates}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total processed: ${attorneys.length}`);
  console.log(`========================================\n`);

  if (errors.length > 0) {
    console.log('Errors encountered:');
    errors.forEach(e => console.log(`  - ${e.attorney}: ${e.error}`));
  }
}

uploadAttorneys().catch(console.error);
