const axios = require('axios');

const config = require('./config');
const HUBSPOT_TOKEN = config.hubspot.apiKey;
const OWNER_ID = '160932693';

const client = axios.create({
  baseURL: 'https://api.hubapi.com',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${HUBSPOT_TOKEN}` },
  timeout: 10000,
});

// Generate unique attorneys for batch 2
const firstNames = ['Aaron','Adam','Adrian','Alan','Albert','Alex','Alexander','Alfred','Allen','Amanda','Amber','Amy','Andrea','Andrew','Angela','Ann','Anna','Anne','Anthony','Arthur','Ashley','Barbara','Barry','Benjamin','Bernard','Beth','Betty','Beverly','Bill','Billy','Blake','Bobby','Bradley','Brandon','Brenda','Brett','Brian','Bruce','Bryan','Carl','Carlos','Carol','Caroline','Carolyn','Catherine','Chad','Charles','Charlotte','Cheryl','Chris','Christian','Christina','Christine','Christopher','Cindy','Claire','Clara','Clarence','Clark','Claude','Clayton','Clifford','Clinton','Clyde','Cody','Colin','Colleen','Connie','Connor','Corey','Craig','Crystal','Curtis','Cynthia','Dale','Dana','Daniel','Danielle','Danny','Darrell','Darren','David','Dawn','Dean','Debbie','Deborah','Debra','Dennis','Derek','Diana','Diane','Donald','Donna','Doris','Dorothy','Douglas','Drew','Dustin','Dylan','Earl','Ed','Eddie','Edgar','Edith','Edmund','Edward','Edwin','Eileen','Elaine','Eleanor','Elizabeth','Ellen','Emily','Emma','Eric','Erik','Ernest','Esther','Ethan','Eugene','Eva','Evelyn','Florence','Floyd','Frances','Francis','Frank','Franklin','Fred','Frederick','Gabriel','Gail','Gary','Gene','George','Gerald','Gilbert','Gladys','Glen','Glenn','Gloria','Gordon','Grace','Gregory','Guy','Hannah','Harold','Harriet','Harry','Harvey','Hazel','Heather','Helen','Henry','Herbert','Herman','Holly','Howard','Hugh','Ian','Irene','Isaac','Jack','Jackie','Jacob','Jacqueline','James','Jamie','Jane','Janet','Janice','Jared','Jason','Jay','Jean','Jeanette','Jeff','Jeffrey','Jennifer','Jeremy','Jerome','Jerry','Jesse','Jessica','Jill','Jim','Jimmy','Joan','Joann','Joanne','Joe','Joel','John','Johnny','Jon','Jonathan','Jordan','Jose','Joseph','Josephine','Josh','Joshua','Joy','Joyce','Juan','Judith','Judy','Julia','Julian','Julie','June','Justin','Karen','Karl','Kate','Katherine','Kathleen','Kathryn','Kathy','Katie','Kay','Keith','Kelly','Ken','Kenneth','Kent','Kevin','Kim','Kimberly','Kirk','Kristen','Kristin','Kyle','Lance','Larry','Laura','Lauren','Laurence','Laurie','Lawrence','Lee','Leo','Leon','Leonard','Leroy','Leslie','Lester','Lewis','Lillian','Linda','Lindsay','Lisa','Lloyd','Lois','Loretta','Lori','Lorraine','Louis','Louise','Lucas','Lucille','Luis','Luke','Lynn','Mabel','Madeleine','Madison','Malcolm','Manuel','Marc','Marcia','Marcus','Margaret','Maria','Marian','Marianne','Marie','Marilyn','Marion','Marjorie','Mark','Marlene','Marshall','Martha','Martin','Marvin','Mary','Mason','Mathew','Matthew','Maureen','Maurice','Max','Maxine','Megan','Melanie','Melissa','Melvin','Michael','Michele','Michelle','Miguel','Mildred','Milton','Miriam','Mitchell','Molly','Monica','Morgan','Morris','Myra','Nancy','Natalie','Nathan','Nathaniel','Neal','Neil','Nelson','Nicholas','Nicole','Nina','Noah','Nora','Norman','Oliver','Olivia','Oscar','Owen','Pamela','Patricia','Patrick','Paul','Paula','Pauline','Pedro','Peggy','Penny','Perry','Peter','Philip','Phillip','Phyllis','Rachel','Ralph','Ramon','Randall','Randy','Ray','Raymond','Rebecca','Regina','Reginald','Renee','Ricardo','Richard','Rick','Ricky','Rita','Robert','Roberta','Robin','Rodney','Roger','Roland','Ron','Ronald','Rosa','Rose','Rosemary','Roy','Ruby','Russell','Ruth','Ryan','Sally','Sam','Samantha','Samuel','Sandra','Sandy','Sara','Sarah','Scott','Sean','Seth','Shane','Shannon','Sharon','Shawn','Sheila','Sherry','Shirley','Sidney','Simon','Sophia','Stacy','Stanley','Stephanie','Stephen','Steve','Steven','Stuart','Sue','Susan','Suzanne','Sylvia','Tamara','Tammy','Tanya','Taylor','Ted','Teresa','Terrance','Terri','Terry','Thelma','Theodore','Theresa','Thomas','Tiffany','Tim','Timothy','Tina','Todd','Tom','Tommy','Tony','Tracy','Travis','Trevor','Troy','Tyler','Valerie','Vanessa','Vernon','Veronica','Vicki','Victor','Victoria','Vincent','Viola','Virginia','Vivian','Wade','Wallace','Walter','Wanda','Warren','Wayne','Wendy','Wesley','Whitney','Wilbur','William','Willie','Wilma','Winston','Wyatt','Zachary'];
const lastNames = ['Abbott','Adams','Adkins','Aguilar','Alexander','Allen','Allison','Alvarez','Anderson','Andrews','Armstrong','Arnold','Atkins','Austin','Bailey','Baker','Baldwin','Ball','Banks','Barber','Barker','Barnes','Barnett','Barrett','Barton','Bass','Bates','Beck','Becker','Bell','Bennett','Benson','Berry','Bishop','Black','Blackwell','Blair','Blake','Blanchard','Blankenship','Blevins','Bolton','Bond','Booker','Boone','Booth','Bowen','Bowers','Bowman','Boyd','Boyer','Boyle','Bradford','Bradley','Brady','Branch','Brewer','Bridges','Briggs','Bright','Brock','Brooks','Brown','Browning','Bruce','Bryan','Bryant','Buchanan','Buck','Buckley','Burgess','Burke','Burnett','Burns','Burton','Bush','Butler','Byrd','Cabrera','Cain','Caldwell','Calhoun','Callahan','Camacho','Cameron','Campbell','Campos','Cannon','Cardenas','Carey','Carlson','Carpenter','Carr','Carrillo','Carroll','Carson','Carter','Case','Casey','Cash','Castaneda','Castillo','Castro','Cervantes','Chambers','Chan','Chandler','Chaney','Chang','Chapman','Charles','Chase','Chavez','Chen','Cherry','Christensen','Christian','Church','Clark','Clarke','Clay','Clayton','Clements','Cline','Cobb','Cochran','Coffey','Cohen','Cole','Coleman','Collier','Collins','Colon','Combs','Compton','Conley','Conner','Conrad','Contreras','Conway','Cook','Cooke','Cooley','Cooper','Copeland','Cortez','Costa','Costello','Cotton','Cox','Craft','Craig','Crane','Crawford','Cross','Cruz','Cummings','Cunningham','Curry','Curtis','Dale','Dalton','Daniel','Daniels','Daugherty','Davenport','David','Davidson','Davis','Dawson','Day','Dean','Delacruz','Delaney','Deleon','Delgado','Dennis','Diaz','Dickerson','Dickinson','Dillard','Dixon','Dodson','Dominguez','Donaldson','Donovan','Dorsey','Dougherty','Douglas','Doyle','Drake','Dudley','Duffy','Duke','Duncan','Dunlap','Dunn','Duran','Durham','Dyer','Eaton','Edwards','Elliott','Ellis','Ellison','Emerson','England','English','Erickson','Espinoza','Estes','Estrada','Evans','Everett','Ewing','Farmer','Farrell','Faulkner','Ferguson','Fernandez','Fields','Figueroa','Finch','Finley','Fischer','Fisher','Fitzgerald','Fitzpatrick','Fleming','Fletcher','Flores','Flowers','Floyd','Flynn','Foley','Forbes','Ford','Foreman','Foster','Fowler','Fox','Francis','Franco','Frank','Franklin','Franks','Frazier','Frederick','Freeman','French','Frost','Fry','Frye','Fuentes','Fuller','Fulton','Gaines','Gallagher','Gallegos','Galloway','Gamble','Garcia','Gardner','Garner','Garrett','Garrison','Gates','Gay','Gentry','George','Gibbs','Gibson','Gilbert','Giles','Gill','Gillespie','Gilliam','Gilmore','Glass','Glenn','Glover','Goff','Golden','Gomez','Gonzales','Gonzalez','Good','Goodman','Goodwin','Gordon','Gould','Graham','Grant','Graves','Gray','Green','Greene','Greer','Gregory','Griffin','Griffith','Grimes','Gross','Guerra','Guerrero','Guthrie','Gutierrez','Guy','Guzman','Hahn','Hale','Haley','Hall','Hamilton','Hammond','Hampton','Hancock','Haney','Hansen','Hanson','Hardin','Harding','Hardy','Harmon','Harper','Harrell','Harrington','Harris','Harrison','Hart','Hartman','Harvey','Hatfield','Hawkins','Hayden','Hayes','Haynes','Hays','Head','Heath','Hebert','Henderson','Hendricks','Hendrix','Henry','Hensley','Henson','Herman','Hernandez','Herrera','Herring','Hess','Hester','Hewitt','Hickman','Hicks','Higgins','Hill','Hines','Hinton','Ho','Hobbs','Hodge','Hodges','Hoffman','Hogan','Holcomb','Holden','Holder','Holland','Holloway','Holman','Holmes','Holt','Hood','Hooper','Hoover','Hopkins','Hopper','Horn','Horne','Horton','House','Houston','Howard','Howe','Howell','Hubbard','Huber','Hudson','Huff','Huffman','Hughes','Hull','Humphrey','Hunt','Hunter','Hurley','Hurst','Hutchinson','Hyde','Ingram','Irwin','Jackson','Jacobs','Jacobson','James','Jarvis','Jefferson','Jenkins','Jennings','Jensen','Jimenez','Johns','Johnson','Johnston','Jones','Jordan','Joseph','Joyce','Juarez','Justice','Kane','Kaufman','Keith','Keller','Kelley','Kelly','Kemp','Kennedy','Kent','Kerr','Key','Kidd','Kim','King','Kinney','Kirby','Kirk','Kirkland','Klein','Kline','Knapp','Knight','Knowles','Knox','Koch','Kramer','Lamb','Lambert','Lancaster','Landry','Lane','Lang','Langley','Lara','Larsen','Larson','Lawrence','Lawson','Le','Leach','Leblanc','Lee','Leon','Leonard','Lester','Levine','Levy','Lewis','Lindsay','Lindsey','Little','Livingston','Lloyd','Logan','Long','Lopez','Lott','Love','Lowe','Lowery','Lucas','Luna','Lynch','Lynn','Lyons','Macdonald','Mack','Madden','Maddox','Maldonado','Malone','Mann','Manning','Marks','Marquez','Marsh','Marshall','Martin','Martinez','Mason','Massey','Mathews','Mathis','Matthews','Maxwell','May','Mayer','Maynard','Mayo','Mays','Mcbride','Mccall','Mccarthy','Mccarty','Mcclain','Mcclanahan','Mcclure','Mcconnell','Mccormick','Mccoy','Mccray','Mcdaniel','Mcdonald','Mcdowell','Mcfadden','Mcfarland','Mcgee','Mcgowan','Mcguire','Mcintosh','Mcintyre','Mckay','Mckee','Mckenzie','Mckinney','Mcknight','Mclaughlin','Mclean','Mcleod','Mcmahon','Mcmillan','Mcneil','Mcpherson','Meadows','Medina','Mejia','Melendez','Melton','Mendez','Mendoza','Mercer','Merrill','Merritt','Meyer','Meyers','Michael','Middleton','Miles','Miller','Mills','Miranda','Mitchell','Molina','Monroe','Montgomery','Montoya','Moody','Moon','Mooney','Moore','Morales','Moran','Moreno','Morgan','Morin','Morris','Morrison','Morrow','Morse','Morton','Moses','Mosley','Moss','Mueller','Mullen','Mullins','Munoz','Murphy','Murray','Myers','Nash','Navarro','Neal','Nelson','Newman','Newton','Nguyen','Nichols','Nicholson','Nielsen','Nieves','Nixon','Noble','Noel','Nolan','Norman','Norris','Norton','Nunez','Obrien','Ochoa','Oconnor','Odom','Oliver','Olsen','Olson','Oneal','Oneill','Orr','Ortega','Ortiz','Osborne','Owen','Owens','Pace','Pacheco','Padilla','Page','Palmer','Park','Parker','Parks','Parrish','Parsons','Pate','Patel','Patrick','Patterson','Patton','Paul','Payne','Pearson','Peck','Pena','Pennington','Perez','Perkins','Perry','Peters','Petersen','Peterson','Pettit','Phelps','Phillips','Pickett','Pierce','Pittman','Pitts','Pollard','Poole','Pope','Porter','Potter','Potts','Powell','Powers','Pratt','Preston','Price','Prince','Pruitt','Puckett','Pugh','Quinn','Ramirez','Ramos','Ramsey','Randall','Randolph','Rasmussen','Ratliff','Ray','Raymond','Reed','Reese','Reeves','Reid','Reilly','Reyes','Reynolds','Rhodes','Rice','Rich','Richard','Richards','Richardson','Richmond','Riddle','Riggs','Riley','Rios','Rivas','Rivera','Roach','Robbins','Roberson','Roberts','Robertson','Robinson','Robles','Rocha','Rodgers','Rodriguez','Rogers','Rojas','Rollins','Roman','Romero','Rosa','Rosales','Rosario','Rose','Ross','Roth','Rowe','Rowland','Roy','Ruiz','Rush','Russell','Russo','Rutledge','Ryan','Salas','Salazar','Salinas','Sampson','Sanchez','Sanders','Sandoval','Sanford','Santana','Santiago','Santos','Sargent','Saunders','Savage','Sawyer','Schmidt','Schneider','Schroeder','Schultz','Schwartz','Scott','Sears','Sellers','Serrano','Sexton','Shaffer','Shannon','Sharp','Shaw','Shea','Shelton','Shepherd','Sheppard','Sherman','Shields','Short','Silva','Simmons','Simon','Simpson','Sims','Singleton','Skinner','Slater','Sloan','Small','Smith','Snider','Snow','Snyder','Solis','Solomon','Sosa','Soto','Sparks','Spears','Spence','Spencer','Stafford','Stanley','Stanton','Stark','Steele','Stein','Stephens','Stephenson','Stevens','Stevenson','Stewart','Stokes','Stone','Stout','Strickland','Strong','Stuart','Suarez','Sullivan','Summers','Sutton','Swanson','Sweeney','Sweet','Sykes','Talley','Tanner','Tate','Taylor','Terrell','Terry','Thomas','Thompson','Thornton','Tillman','Todd','Torres','Townsend','Tran','Travis','Trevino','Trujillo','Tucker','Turner','Tyler','Underwood','Valdez','Valencia','Valentine','Valenzuela','Vance','Vargas','Vasquez','Vaughan','Vaughn','Vazquez','Vega','Velasquez','Velazquez','Velez','Villarreal','Vincent','Vinson','Wade','Wagner','Walker','Wall','Wallace','Waller','Walls','Walsh','Walter','Walters','Walton','Ward','Ware','Warner','Warren','Washington','Waters','Watkins','Watson','Watts','Weaver','Webb','Weber','Webster','Weeks','Weiss','Welch','Wells','West','Wheeler','Whitaker','White','Whitehead','Whitfield','Whitley','Whitney','Wiggins','Wilcox','Wilder','Wiley','Wilkerson','Wilkins','Wilkinson','William','Williams','Williamson','Willis','Wilson','Winters','Wise','Witt','Wolf','Wolfe','Wong','Wood','Woodard','Woods','Woodward','Wooten','Workman','Wright','Wyatt','Yang','Yates','York','Young','Zamora','Zimmerman'];
const cities = [
  { area: '305', city: 'Miami' }, { area: '954', city: 'Fort Lauderdale' }, { area: '561', city: 'West Palm Beach' },
  { area: '407', city: 'Orlando' }, { area: '813', city: 'Tampa' }, { area: '727', city: 'St Petersburg' },
  { area: '904', city: 'Jacksonville' }, { area: '239', city: 'Fort Myers' }, { area: '386', city: 'Daytona Beach' },
  { area: '863', city: 'Lakeland' }, { area: '772', city: 'Port St Lucie' }, { area: '352', city: 'Gainesville' },
  { area: '850', city: 'Tallahassee' }, { area: '941', city: 'Sarasota' }, { area: '321', city: 'Melbourne' }
];

const attorneys = [];
const usedEmails = new Set();

for (let i = 0; i < 500; i++) {
  const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
  const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const suffix = Math.floor(Math.random() * 9000) + 1000;
  const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${suffix}@${ln.toLowerCase()}lawfl.com`;

  if (usedEmails.has(email)) {
    i--;
    continue;
  }
  usedEmails.add(email);

  attorneys.push({
    firstName: fn,
    lastName: ln,
    email: email,
    phone: `${city.area}-555-${String(suffix).padStart(4, '0')}`,
    company: `${fn} ${ln} Law - ${city.city}`
  });
}

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
  console.log(`Uploading ${attorneys.length} attorneys to HubSpot (Batch 2)...\n`);
  let success = 0, failed = 0, batch = 0;

  for (const attorney of attorneys) {
    try {
      process.stdout.write(`[${++batch}/${attorneys.length}] ${attorney.firstName} ${attorney.lastName}... `);
      await createContact(attorney);
      success++;
      console.log('✓');
      await new Promise(r => setTimeout(r, 120));
    } catch (error) {
      failed++;
      const msg = error.response?.data?.message || error.message;
      console.log(msg.includes('exists') ? '(exists)' : `✗`);
    }
  }
  console.log(`\n${'='.repeat(50)}\nDone! Success: ${success}, Failed/Exists: ${failed}`);
}

uploadAttorneys();
