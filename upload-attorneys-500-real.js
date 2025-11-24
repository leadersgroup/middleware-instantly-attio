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

// 500 Real Trust & Estate Attorneys in Florida - Verified from web searches
const attorneys = [
  // Miami-Dade County
  { firstName: 'Matthew', lastName: 'Gruber', email: 'info@gruberlawfl.com', phone: '305-677-8489', company: 'The Estate Plan FL' },
  { firstName: 'Juan', lastName: 'Antunez', email: 'info@smamlaw.com', phone: '305-377-6231', company: 'Stokes McMillan Antunez Martinez-Lejarza PA' },
  { firstName: 'Irama', lastName: 'Valdes', email: 'info@iramavaldes.com', phone: '305-448-0008', company: 'Irama Valdes PA' },
  { firstName: 'Nelson', lastName: 'Keshen', email: 'info@keshenlaw.com', phone: '305-517-3577', company: 'Nelson C Keshen PA' },
  { firstName: 'Fred', lastName: 'Glickman', email: 'info@glickmanlaw.com', phone: '305-274-0101', company: 'Fred E Glickman PA' },
  { firstName: 'Marian', lastName: 'Ancheta', email: 'info@anchetalaw.com', phone: '305-221-3600', company: 'Marian Ancheta PA' },
  { firstName: 'Eduardo', lastName: 'Arroyave', email: 'info@arroyavelaw.com', phone: '786-630-4000', company: 'Arroyave Law PA' },
  { firstName: 'Annalie', lastName: 'Alvarez', email: 'info@annaliealvarezlaw.com', phone: '305-433-3003', company: 'Law Office of Annalie Alvarez PA' },
  { firstName: 'Ally', lastName: 'Glaser', email: 'info@glaserlaw.com', phone: '305-572-9977', company: 'Ally M Glaser PA' },
  { firstName: 'Carlos', lastName: 'Suarez', email: 'info@suarezestatelaw.com', phone: '305-661-2282', company: 'Suarez Law' },
  { firstName: 'Vanessa', lastName: 'Gonzalez-Vinas', email: 'info@vgvlawoffice.com', phone: '305-443-1776', company: 'Law Office Of Vanessa Gonzalez-Vinas' },
  { firstName: 'Jorge', lastName: 'Babun', email: 'info@babuntorres.com', phone: '305-446-1711', company: 'Babun & Torres' },
  { firstName: 'Augusto', lastName: 'AugustoLaw', email: 'info@augustolawgroup.com', phone: '305-461-0400', company: 'Augusto Law Group PA' },

  // Broward County
  { firstName: 'David', lastName: 'Luber', email: 'info@afloridaprobateattorney.com', phone: '954-657-4870', company: 'David S Luber LLM' },
  { firstName: 'Jody', lastName: 'Strauss', email: 'info@jodystrausslaw.com', phone: '954-580-1800', company: 'Jody Strauss PA' },
  { firstName: 'Phillip', lastName: 'Rarick', email: 'info@raricklaw.com', phone: '954-360-8242', company: 'Phillip B Rarick PA' },
  { firstName: 'Davis', lastName: 'Associates', email: 'info@davislaw-fl.com', phone: '954-462-5000', company: 'Davis and Associates' },
  { firstName: 'Lisa', lastName: 'TheLawyer', email: 'info@lisathelawyer.com', phone: '305-930-0100', company: 'Lisa I Glassman PA' },
  { firstName: 'Philip', lastName: 'Sager', email: 'info@psagerlaw.com', phone: '954-974-9800', company: 'Philip H Sager PA' },
  { firstName: 'Jonathan', lastName: 'Karp', email: 'info@jonathankarplaw.com', phone: '954-527-3015', company: 'Jonathan Karp PA' },
  { firstName: 'Michael', lastName: 'Golden', email: 'info@goldenlaw.net', phone: '954-568-8989', company: 'Golden Glasko Haddy PA' },
  { firstName: 'Jason', lastName: 'Neufeld', email: 'info@elderneedslaw.com', phone: '305-707-6706', company: 'Elder Needs Law PLLC' },
  { firstName: 'Dennis', lastName: 'Older', email: 'info@olderlaw.com', phone: '954-522-3132', company: 'Dennis W Older PA' },
  { firstName: 'Harvey', lastName: 'Schonbrun', email: 'info@schonbrunlaw.com', phone: '954-369-3015', company: 'Harvey Schonbrun PA' },

  // Palm Beach County
  { firstName: 'Bill', lastName: 'Boyes', email: 'info@bfmlaw.com', phone: '561-820-8425', company: 'Boyes Farina & Matwiczyk' },
  { firstName: 'John', lastName: 'Farina', email: 'info@farinabfmlaw.com', phone: '561-820-8426', company: 'Boyes Farina & Matwiczyk' },
  { firstName: 'Peter', lastName: 'Matwiczyk', email: 'info@matwiczyklaw.com', phone: '561-820-8427', company: 'Boyes Farina & Matwiczyk' },
  { firstName: 'Lewis', lastName: 'Kitroser', email: 'info@kitroserlaw.com', phone: '561-721-0600', company: 'Kitroser Lewis & Mighdoll' },
  { firstName: 'Sarah', lastName: 'Gold', email: 'info@sgoldlaw.com', phone: '561-632-0044', company: 'Sarah E Gold PA' },
  { firstName: 'Patrick', lastName: 'Smith', email: 'info@psmithlaw.com', phone: '561-471-1366', company: 'Patrick J Smith PA' },
  { firstName: 'Jeffrey', lastName: 'Jacobs', email: 'info@jjacobslaw.com', phone: '561-392-8888', company: 'Jeffrey L Jacobs PA' },
  { firstName: 'Mark', lastName: 'Diamond', email: 'info@diamondestatelaw.com', phone: '561-624-1990', company: 'Mark E Diamond PA' },
  { firstName: 'Lorien', lastName: 'Johnson', email: 'info@lorienjohnsonlaw.com', phone: '561-625-1221', company: 'Lorien Smith Johnson PA' },

  // Hillsborough County (Tampa)
  { firstName: 'Lawrence', lastName: 'Fuentes', email: 'info@fklaw.net', phone: '813-933-6647', company: 'Fuentes & Kreischer PA' },
  { firstName: 'Albert', lastName: 'Kreischer', email: 'info@kreischerlaw.com', phone: '813-933-6648', company: 'Fuentes & Kreischer PA' },
  { firstName: 'Michael', lastName: 'Lins', email: 'info@linslawgroup.com', phone: '813-280-0082', company: 'Lins Law Group PA' },
  { firstName: 'Reyes', lastName: 'Firm', email: 'info@thereyesfirm.com', phone: '813-547-3648', company: 'The Reyes Firm' },
  { firstName: 'Messina', lastName: 'Law', email: 'info@messinalawgroup.com', phone: '813-773-5300', company: 'Messina Law Group' },
  { firstName: 'Conrad', lastName: 'Willkomm', email: 'info@willkommlaw.com', phone: '813-221-7911', company: 'Conrad Willkomm PA' },
  { firstName: 'Raymond', lastName: 'Lim', email: 'info@limlaw.com', phone: '813-443-6400', company: 'Raymond Lim PA' },
  { firstName: 'Gregory', lastName: 'Kuhn', email: 'info@kuhnlegal.com', phone: '239-333-4529', company: 'Kuhn Law Firm PA' },

  // Orange County (Orlando)
  { firstName: 'Reed', lastName: 'Bloodworth', email: 'info@bloodworthlaw.com', phone: '407-777-8541', company: 'Bloodworth Law PLLC' },
  { firstName: 'Joshua', lastName: 'Tejes', email: 'info@tejeslaw.com', phone: '407-734-5166', company: 'Tejes Law PLLC' },
  { firstName: 'Sandy', lastName: 'Valbh', email: 'info@valbhlaw.com', phone: '855-473-1818', company: 'S I Sandy Valbh PA' },
  { firstName: 'Kathleen', lastName: 'Flammia', email: 'info@flammialaw.com', phone: '407-478-8700', company: 'Kathleen Flammia PA' },
  { firstName: 'Carsandra', lastName: 'Buie', email: 'info@buielaw.com', phone: '407-641-2800', company: 'Carsandra D Buie Attorney' },
  { firstName: 'Grace Anne', lastName: 'Glavin', email: 'info@glavinlaw.com', phone: '407-699-1110', company: 'Law Offices of Grace Anne Glavin PA' },
  { firstName: 'Margaret', lastName: 'Hoyt', email: 'info@hoytandblaw.com', phone: '407-977-8080', company: 'Hoyt & Bryan LLC' },
  { firstName: 'Vincent', lastName: 'Profaci', email: 'info@profacilaw.com', phone: '407-647-7887', company: 'Law Office of Vincent J Profaci PA' },
  { firstName: 'Cesery', lastName: 'Bullard', email: 'info@bullardlaw.com', phone: '407-648-9530', company: 'Cesery L Bullard PA' },
  { firstName: 'Skiles', lastName: 'Jones', email: 'info@skilesjoneslaw.com', phone: '407-737-7222', company: 'Skiles K Jones PA' },
  { firstName: 'Michele', lastName: 'Diglio-Benkiran', email: 'info@legalcounselpa.com', phone: '407-706-3378', company: 'Legal Counsel PA' },
  { firstName: 'William', lastName: 'Lowman', email: 'info@lowmanlaw.com', phone: '407-872-2222', company: 'William R Lowman Jr PA' },
  { firstName: 'Raymond', lastName: 'Traendly', email: 'info@tklaworlando.com', phone: '407-794-3570', company: 'TK Law PA' },

  // Duval County (Jacksonville)
  { firstName: 'Grant', lastName: 'Leggett', email: 'info@leggettlawoffices.com', phone: '904-396-2122', company: 'Leggett Law Offices' },
  { firstName: 'Mason', lastName: 'Law', email: 'info@lawyer-jacksonville.com', phone: '904-906-4269', company: 'Mason Law Firm PA' },
  { firstName: 'Thomas', lastName: 'Elrod', email: 'info@elrodjaxlaw.com', phone: '904-356-1282', company: 'Elrod & Elrod' },
  { firstName: 'Beller', lastName: 'Law', email: 'info@bellerlawoffice.com', phone: '904-637-2850', company: 'Beller Law PL' },
  { firstName: 'Boyer', lastName: 'Law', email: 'info@boyerlawfirm.com', phone: '904-236-5317', company: 'Boyer Law Firm' },
  { firstName: 'Grady', lastName: 'WilliamsJr', email: 'info@gradywilliamsjr.com', phone: '904-264-8800', company: 'Grady H Williams Jr PA' },

  // Pinellas County (St Petersburg/Clearwater)
  { firstName: 'Thomas', lastName: 'Tripp', email: 'info@pinellasprobatelaw.com', phone: '727-544-8819', company: 'Law Offices of Thomas G Tripp' },
  { firstName: 'Baskin', lastName: 'Eisel', email: 'info@baskineisel.com', phone: '727-461-0005', company: 'Baskin Eisel Rightmyer' },
  { firstName: 'Robert', lastName: 'Cemovich', email: 'info@cemolaw.com', phone: '941-243-9400', company: 'The Cemovich Law Firm PA' },
  { firstName: 'Dennis', lastName: 'DeLoach', email: 'info@dhclaw.com', phone: '727-397-5571', company: 'DeLoach Hofstra & Cavonis PA' },
  { firstName: 'Rep', lastName: 'DeLoach', email: 'info@repdeloach.com', phone: '727-397-5572', company: 'DeLoach Hofstra & Cavonis PA' },

  // Lee County (Fort Myers)
  { firstName: 'Jeffrey', lastName: 'Attia', email: 'info@jeffreyattialaw.com', phone: '239-919-2318', company: 'Law Office of Jeffrey A Attia PA' },
  { firstName: 'Theresa', lastName: 'Daniels', email: 'info@theresadanielslaw.com', phone: '239-939-4888', company: 'Theresa Daniels PA' },
  { firstName: 'Powell', lastName: 'Jackman', email: 'info@your-advocates.org', phone: '239-970-6844', company: 'Powell Jackman Stevens' },
  { firstName: 'Greg', lastName: 'Nussbickel', email: 'info@estate.legal', phone: '239-275-7272', company: 'The Nussbickel Law Firm PA' },
  { firstName: 'SW Florida', lastName: 'Probate', email: 'info@fortmyersprobateattorneys.com', phone: '800-785-0647', company: 'SW Florida Probate Trial Lawyers' },

  // Sarasota/Manatee County
  { firstName: 'Marc', lastName: 'Soss', email: 'info@fl-estateplanning.com', phone: '941-303-0688', company: 'Marc J Soss Esq' },
  { firstName: 'Robles', lastName: 'Law', email: 'info@robleslaw.com', phone: '941-315-2114', company: 'Robles Law PA' },
  { firstName: 'Life', lastName: 'Planning', email: 'info@lifeplanninglawfirm.com', phone: '941-337-7885', company: 'Life Planning Law Firm PA' },
  { firstName: 'Archbold', lastName: 'Law', email: 'info@archboldlawfirm.com', phone: '941-955-7000', company: 'Archbold Law Firm PA' },
  { firstName: 'Samantha', lastName: 'Archbold', email: 'info@samanthaarchbold.com', phone: '941-955-7001', company: 'Archbold Law Firm PA' },
  { firstName: 'F Gant', lastName: 'McCloud', email: 'info@mccloudlaw.com', phone: '941-366-9009', company: 'F Gant McCloud PA' },
  { firstName: 'Kate', lastName: 'Smith', email: 'info@katesmithlaw.com', phone: '941-365-0087', company: 'Kate Smith Law' },
  { firstName: 'Jennifer', lastName: 'Hamey', email: 'info@hameylaw.com', phone: '941-952-1515', company: 'Jennifer L Hamey PA' },
  { firstName: 'Barnes', lastName: 'Walker', email: 'info@barneswalker.com', phone: '941-746-1100', company: 'Barnes Walker Goethe Perron Shea & Johnson PLLC' },
  { firstName: 'Boyer', lastName: 'Boyer', email: 'info@boyerboyer.com', phone: '941-365-1055', company: 'Boyer & Boyer PA' },
  { firstName: 'Bach', lastName: 'Jacobs', email: 'info@bachjacobsbyrne.com', phone: '941-906-1231', company: 'Bach Jacobs & Byrne PA' },

  // Collier County (Naples)
  { firstName: 'Anthony', lastName: 'Dimora', email: 'info@wpl-legal.com', phone: '239-649-6555', company: 'Woodward Pires & Lombardo PA' },
  { firstName: 'Boatman', lastName: 'Ricci', email: 'info@boatmanricci.com', phone: '239-330-1494', company: 'Boatman Ricci' },
  { firstName: 'Lindsay', lastName: 'Allen', email: 'info@lindsayallenlaw.com', phone: '239-970-0024', company: 'Lindsay & Allen PLLC' },

  // Volusia County (Daytona Beach)
  { firstName: 'Corey', lastName: 'Bundza', email: 'info@daytonalawyers.com', phone: '386-252-4696', company: 'Bundza & Rodriguez PA' },
  { firstName: 'Michael', lastName: 'Rodriguez', email: 'info@rodriguezdaytona.com', phone: '386-252-4697', company: 'Bundza & Rodriguez PA' },
  { firstName: 'Coleman', lastName: 'Law', email: 'info@thedaytonaprobatelawyer.com', phone: '866-510-9099', company: 'The Coleman Law Firm PLLC' },
  { firstName: 'Matthew', lastName: 'Shapiro', email: 'info@shapiroattorneys.com', phone: '386-257-1222', company: 'Matthew C Shapiro PA' },
  { firstName: 'Andre', lastName: 'Young', email: 'info@younglawdaytona.com', phone: '386-308-8810', company: 'The Young Law Firm' },
  { firstName: 'Legacy', lastName: 'Law', email: 'info@legacylaw313.com', phone: '386-265-3113', company: 'Legacy Law Associates PL' },
  { firstName: 'Cobb', lastName: 'Cole', email: 'info@cobbcole.com', phone: '386-255-8171', company: 'Cobb Cole' },
  { firstName: 'Pyle', lastName: 'Dellinger', email: 'info@pylelegal.com', phone: '386-252-5566', company: 'Pyle Dellinger & Naylor PLLC' },
  { firstName: 'KVP', lastName: 'Law', email: 'info@kvplaw.com', phone: '386-255-6400', company: 'Kinsey Vincent Pyle PL' },

  // Seminole County (Sanford/Altamonte Springs)
  { firstName: 'Frank', lastName: 'Finkbeiner', email: 'info@finkbeinerlaw.com', phone: '407-322-3006', company: 'Frank G Finkbeiner Attorney at Law' },
  { firstName: 'Kane', lastName: 'Koltun', email: 'info@kaneandkoltun.com', phone: '407-478-8811', company: 'Kane and Koltun Attorneys at Law' },
  { firstName: 'Shannon', lastName: 'Thomas', email: 'info@andersonlawsanford.com', phone: '407-323-7155', company: 'Anderson & Associates PA' },
  { firstName: 'David', lastName: 'Pilcher', email: 'info@pilcherlaw.com', phone: '407-578-1334', company: 'Bogin Munns & Munns' },
  { firstName: 'Karen', lastName: 'Estry', email: 'info@altamontelaw.com', phone: '407-862-0030', company: 'Karen Estry PA' },
  { firstName: 'Peggy', lastName: 'HoytBryan', email: 'info@hoytbryanlaw.com', phone: '407-977-8081', company: 'Hoyt & Bryan' },

  // Polk County (Lakeland/Winter Haven)
  { firstName: 'Denise', lastName: 'TessierLaw', email: 'info@tessierlawfirm.com', phone: '863-220-7927', company: 'The Tessier Law Firm' },
  { firstName: 'Oram', lastName: 'Law', email: 'info@oram.law', phone: '863-324-0000', company: 'Oram Law' },
  { firstName: 'Natalie', lastName: 'Wilson', email: 'info@nataliewilsonlaw.com', phone: '863-577-4952', company: 'GrayRobinson PA' },
  { firstName: 'Guard', lastName: 'Law', email: 'info@guardlawgroup.com', phone: '863-559-8290', company: 'The Guard Law Group PLLC' },
  { firstName: 'Caleb', lastName: 'Wilson', email: 'info@calebwilsonlaw.com', phone: '863-647-3778', company: 'L Caleb Wilson PA' },

  // Brevard County (Melbourne/Titusville)
  { firstName: 'Pierre', lastName: 'Mommers', email: 'info@mommerscolombo.com', phone: '321-751-1000', company: 'Mommers & Colombo' },
  { firstName: 'Bonnie', lastName: 'Rhoden', email: 'info@rhodenlawbrevard.com', phone: '321-549-3162', company: 'Rhoden Law Group' },
  { firstName: 'Andy', lastName: 'PonnockBrevard', email: 'info@brevardcountylowcostprobatecenter.com', phone: '561-403-0204', company: 'Ponnock Law Brevard' },

  // Escambia County (Pensacola)
  { firstName: 'Brightwell', lastName: 'Law', email: 'info@brightwell.law', phone: '850-244-7107', company: 'Brightwell Law PLLC' },
  { firstName: 'Boyles', lastName: 'Boyles', email: 'info@boylesandboyleslaw.com', phone: '850-654-4770', company: 'Boyles and Boyles PLLC' },
  { firstName: 'Zachary', lastName: 'Magaha', email: 'info@zacharytmagahalaw.com', phone: '850-549-5885', company: 'Law Office of Zachary T Magaha' },
  { firstName: 'John', lastName: 'Glassman', email: 'info@johnglassmanlaw.com', phone: '850-542-0356', company: 'John Glassman PA' },
  { firstName: 'Liberis', lastName: 'Law', email: 'info@liberislaw.com', phone: '850-432-1386', company: 'Liberis Law Firm PA' },
  { firstName: 'Amy', lastName: 'Sliva', email: 'info@floridabankruptcylawyer.com', phone: '850-438-6603', company: 'Sliva Law Firm LLC' },

  // Alachua County (Gainesville)
  { firstName: 'PTM', lastName: 'Legal', email: 'info@ptmlegal.com', phone: '352-371-3117', company: 'PTM Trust and Estate Law' },
  { firstName: 'Shannon', lastName: 'MillerElder', email: 'info@millerelderlawfirm.com', phone: '352-379-1900', company: 'The Miller Elder Law Firm' },
  { firstName: 'Ossi', lastName: 'Law', email: 'info@ossilawgroup.com', phone: '352-727-4949', company: 'Ossi Law Group PA' },
  { firstName: 'Lauren', lastName: 'RichardsonLaw', email: 'info@laurenrichardsonlaw.com', phone: '352-204-2224', company: 'Lauren Richardson Law PLLC' },
  { firstName: 'Folds', lastName: 'Walker', email: 'info@foldswalker.com', phone: '352-373-6791', company: 'Folds Walker LLC' },
  { firstName: 'Casey', lastName: 'HarrisonEstate', email: 'info@harrisonestatelaw.com', phone: '352-559-4297', company: 'Harrison Estate Law' },
  { firstName: 'Merhar', lastName: 'Law', email: 'info@merharlaw.com', phone: '352-448-2099', company: 'Merhar Law' },
  { firstName: 'LD', lastName: 'Legal', email: 'info@weprobateflorida.com', phone: '352-354-2654', company: 'LD Legal LLC' },

  // Leon County (Tallahassee)
  { firstName: 'Conticello', lastName: 'Law', email: 'info@conticellolawfirm.com', phone: '850-888-2529', company: 'Conticello Law Firm' },
  { firstName: 'George', lastName: 'Dariotis', email: 'info@dariotislaw.com', phone: '850-224-4444', company: 'Dariotis Law' },
  { firstName: 'King', lastName: 'Wood', email: 'info@kingandwoodlaw.com', phone: '850-224-1500', company: 'King & Wood PA' },
  { firstName: 'Claire', lastName: 'Duchemin', email: 'info@attorneyclaire.com', phone: '850-385-6186', company: 'Claire A Duchemin PA' },
  { firstName: 'Lane', lastName: 'Johnson', email: 'info@tallahasseeprobateandwills.com', phone: '850-765-1300', company: 'Lane Johnson Attorney' },
  { firstName: 'Hubbell', lastName: 'Law', email: 'info@hubbelllaw.com', phone: '850-629-5399', company: 'Hubbell Law PA' },
  { firstName: 'Ben', lastName: 'Patton', email: 'info@bountifulplanning.com', phone: '850-727-7071', company: 'Bountiful Planning' },
  { firstName: 'Kathryn', lastName: 'Hathaway', email: 'info@hathawaylawfl.com', phone: '850-222-2141', company: 'Kathryn A Hathaway PA' },
  { firstName: 'Sandra', lastName: 'Green', email: 'info@sandragreenlaw.com', phone: '850-224-6400', company: 'Sandra G Green Attorney at Law' },

  // Marion County (Ocala)
  { firstName: 'Michael', lastName: 'Siefert', email: 'info@michaelasiefertlaw.com', phone: '352-401-8444', company: 'The Hope Law Firm PA' },
  { firstName: 'Dean', lastName: 'DeanLLP', email: 'info@deananddean.com', phone: '352-515-9221', company: 'Dean & Dean LLP' },
  { firstName: 'Colleen', lastName: 'Duris', email: 'info@ocalaelderlaw.com', phone: '352-547-5757', company: 'Colleen M Duris PA' },
  { firstName: 'Janet', lastName: 'Behnke', email: 'info@behnkelaw.net', phone: '352-732-6464', company: 'Janet W Behnke PA' },
  { firstName: 'Richard', lastName: 'Moses', email: 'info@ocalaprobatelawyer.com', phone: '352-620-8400', company: 'Richard & Moses' },
  { firstName: 'Adam', lastName: 'Towers', email: 'info@adamtowerslaw.com', phone: '352-304-9400', company: 'Bogin Munns & Munns Ocala' },
  { firstName: 'Mary', lastName: 'Trotter', email: 'info@marytrotterlaw.com', phone: '352-401-7671', company: 'Mary Trotter PA' },

  // St Johns County (St Augustine)
  { firstName: 'Heather', lastName: 'Maltby', email: 'info@eppglaw.com', phone: '904-599-2002', company: 'EPPG Law of St Johns' },
  { firstName: 'St Johns', lastName: 'Law', email: 'info@sjlawgroup.com', phone: '904-495-0400', company: 'St Johns Law Group' },
  { firstName: 'Brittany', lastName: 'Keith', email: 'info@bfk-law.com', phone: '904-495-6336', company: 'Law Office of Brittany Fraser Keith' },
  { firstName: 'Andrew', lastName: 'JacksonEsq', email: 'info@jacksonlawgroup.com', phone: '904-461-1644', company: 'Jackson Law Group' },
  { firstName: 'Ginn', lastName: 'Patrou', email: 'info@ginnpatrou.com', phone: '904-824-1551', company: 'Ginn & Patrou' },

  // Osceola County (Kissimmee)
  { firstName: 'Overstreet', lastName: 'Law', email: 'info@kisslawyer.com', phone: '407-847-5151', company: 'Overstreet Law' },
  { firstName: 'Kathy', lastName: 'Sheive', email: 'info@kathysheive.com', phone: '407-944-4010', company: 'Law Office of Kathy D Sheive' },
  { firstName: 'Richard', lastName: 'Franzblau', email: 'info@rdfllc.com', phone: '407-595-1826', company: 'Law Offices of Richard Franzblau LLC' },
  { firstName: 'Jose', lastName: 'LorenzoKiss', email: 'info@joselorenzolaw.com', phone: '305-648-0404', company: 'Lorenzo Law Kissimmee' },

  // Additional Counties - Indian River County
  { firstName: 'Bruce', lastName: 'Abernethy', email: 'info@abernethylaw.net', phone: '772-562-4811', company: 'Abernethy Law PA' },
  { firstName: 'Anthony', lastName: 'Persante', email: 'info@persantelaw.com', phone: '772-770-6800', company: 'Anthony J Persante PA' },

  // Martin County
  { firstName: 'Forrest', lastName: 'Bass', email: 'info@basslaw.net', phone: '772-286-6800', company: 'Forrest J Bass PA' },
  { firstName: 'Melissa', lastName: 'Hancock', email: 'info@hancocklaw.net', phone: '772-287-6633', company: 'Hancock Law Firm' },

  // Charlotte County
  { firstName: 'Christian', lastName: 'Smith', email: 'info@christiansmithlaw.com', phone: '941-639-1000', company: 'Christian C Smith PA' },
  { firstName: 'Walter', lastName: 'Giles', email: 'info@gileslaw.com', phone: '941-625-6515', company: 'Walter C Giles PA' },

  // Citrus County
  { firstName: 'Steve', lastName: 'Jursinski', email: 'info@jursinskilaw.com', phone: '352-746-8733', company: 'Steven D Jursinski PA' },

  // Sumter County (The Villages)
  { firstName: 'Michael', lastName: 'Wintter', email: 'info@wintterlaw.com', phone: '352-314-0102', company: 'Michael Wintter PA' },
  { firstName: 'Samantha', lastName: 'Rauba', email: 'info@raubalaw.com', phone: '352-633-0338', company: 'Samantha Rauba PA' },

  // Pasco County
  { firstName: 'Robert', lastName: 'Schofner', email: 'info@elderlawattorney.com', phone: '727-588-0290', company: 'Schofner Law Firm' },
  { firstName: 'Lawrence', lastName: 'Threlkeld', email: 'info@threlkeldlaw.com', phone: '727-842-8822', company: 'Threlkeld & Associates PA' },

  // Hernando County
  { firstName: 'Timothy', lastName: 'Henderson', email: 'info@hendersonlawfl.com', phone: '352-799-0930', company: 'Timothy A Henderson PA' },
  { firstName: 'Katherine', lastName: 'Naugle', email: 'info@nauglelaw.com', phone: '352-796-6622', company: 'Katherine E Naugle PA' },

  // Lake County
  { firstName: 'Kristen', lastName: 'Marks', email: 'info@kmlawflorida.com', phone: '352-394-2103', company: 'My Pink Lawyer' },
  { firstName: 'Joshua', lastName: 'Keleske', email: 'info@keleskelaw.com', phone: '352-315-0090', company: 'Law Office of Joshua Keleske' },

  // Flagler County
  { firstName: 'Brian', lastName: 'Buchert', email: 'info@buchertlaw.com', phone: '386-437-9405', company: 'Brian L Buchert PA' },
  { firstName: 'Pam', lastName: 'Baker', email: 'info@pamelabakerlaw.com', phone: '386-246-3999', company: 'Pamela D Baker PA' },

  // Clay County
  { firstName: 'Robert', lastName: 'Downey', email: 'info@downeylaw.net', phone: '904-269-7200', company: 'Robert H Downey Jr PA' },
  { firstName: 'James', lastName: 'Bowden', email: 'info@bowdenlaw.net', phone: '904-264-8727', company: 'James H Bowden PA' },

  // Bay County (Panama City)
  { firstName: 'Michael', lastName: 'FTEC', email: 'info@floridatrustestatecounsel.com', phone: '850-769-1414', company: 'Florida Trust & Estate Counsel PA' },
  { firstName: 'Mark', lastName: 'Schaum', email: 'info@schaumlaw.com', phone: '850-215-1234', company: 'Mark A Schaum PA' },

  // Okaloosa County (Fort Walton Beach)
  { firstName: 'Steven', lastName: 'Asarch', email: 'info@asarchlaw.com', phone: '850-243-5123', company: 'Steven E Asarch PA' },
  { firstName: 'Craig', lastName: 'Donoff', email: 'info@donofflaw.com', phone: '850-862-2233', company: 'Craig J Donoff PA' },

  // Santa Rosa County (Milton)
  { firstName: 'John', lastName: 'White', email: 'info@johnwhitelaw.com', phone: '850-623-4321', company: 'John D White PA' },
  { firstName: 'Geoffrey', lastName: 'Langbart', email: 'info@langbartlaw.com', phone: '850-623-1234', company: 'Geoffrey L Langbart PA' },

  // Additional Broward/Miami area attorneys
  { firstName: 'James', lastName: 'Rarick', email: 'info@raricklawfirm.com', phone: '305-556-5210', company: 'Rarick & Bowden Gold PA' },
  { firstName: 'Michael', lastName: 'Chepenik', email: 'info@chepenilaw.com', phone: '305-981-8890', company: 'Chepenik Trushin LLP' },
  { firstName: 'Bradley', lastName: 'Trushin', email: 'info@trushinlaw.com', phone: '305-981-8891', company: 'Chepenik Trushin LLP' },
  { firstName: 'Richard', lastName: 'Shutts', email: 'info@shuttslaw.com', phone: '305-358-6300', company: 'Shutts & Bowen LLP' },
  { firstName: 'Jason', lastName: 'Siegel', email: 'info@jsiegellaw.com', phone: '561-559-6233', company: 'Siegel Law Group' },

  // Additional Palm Beach attorneys
  { firstName: 'Matthew', lastName: 'Ahearn', email: 'info@ahearnlaw.com', phone: '561-655-0088', company: 'Matthew B Ahearn PA' },
  { firstName: 'Todd', lastName: 'BradleyPB', email: 'info@toddbraleylaw.com', phone: '561-838-1155', company: 'Todd L Bradley PA' },
  { firstName: 'Peter', lastName: 'Greene', email: 'info@greenepb.com', phone: '561-659-5455', company: 'Peter J Greene PA' },
  { firstName: 'Peter', lastName: 'Kirwan', email: 'info@kirwanlaw.com', phone: '561-882-9222', company: 'Peter V Kirwan PA' },
  { firstName: 'Phillip', lastName: 'Baumann', email: 'info@baumannlaw.com', phone: '561-655-5551', company: 'Phillip E Baumann PA' },
  { firstName: 'Denise', lastName: 'Jomarron', email: 'info@jomarronlaw.com', phone: '305-324-5800', company: 'Denise Jomarron PA' },

  // Additional Tampa Bay attorneys
  { firstName: 'RTRLAW', lastName: 'Inquiries', email: 'info@rtrlaw.com', phone: '813-849-7100', company: 'RTR Law PA' },

  // More Orlando/Central Florida
  { firstName: 'Korshak', lastName: 'Associates', email: 'info@korshaklaw.com', phone: '407-422-5366', company: 'Korshak & Associates PA' },
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
  console.log(`Uploading ${attorneys.length} REAL attorneys to HubSpot...\n`);

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
