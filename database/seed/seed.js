/* eslint-disable no-console */
// Idempotent launch seeder for the live Neon PostgreSQL database.
// Safe to re-run. Will NOT drop or modify any existing rows; only inserts missing ones.

const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const URL =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_S1nRIhXK6qyb@ep-wandering-forest-ay59vucq-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

function uuid() { return crypto.randomUUID(); }
function now() { return new Date(); }
function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

// ===== MASTER DATA =====
const CORE = ['English Language','General Mathematics','Civic Education','Health Education','Physical Education'];
const SCIENCE = ['Physics','Chemistry','Biology','Further Mathematics','Agricultural Science','Geography','Computer Studies','Data Processing','Technical Drawing','Animal Husbandry','Fisheries','Horticulture and Crop Production','Livestock Farming','Food and Nutrition'];
const COMMERCIAL = ['Economics','Financial Accounting','Commerce','Marketing','Office Practice','Insurance','Business Studies','Store Keeping','Store Management','Book Keeping','Business Management','Salesmanship','Principles of Cost Accounting','Typing','Shorthand','Keyboard'];
const ART = ['Literature in English','Government','History','Christian Religious Studies','Islamic Religious Studies','French','Arabic','Music','Visual Arts','Fine Art','Yoruba','Igbo','Hausa','Edo','Efik','Ibibio','Nigerian Language','Photography','Ceramics','Picture Making','Painting and Decorating'];
const ICT = ['Computer Studies','Data Processing','Computer Science','ICT','Information Communication Technology','Graphic Design','Printing Practice','Solar Photovoltaic Installation and Maintenance','Computer Hardware and GSM Repairs','GSM Phones Maintenance and Repairs'];
const VOCATIONAL = ['Home Management','Home Economics','Clothing and Textiles','Catering Craft Practice','Garment Making','Tourism','Mining','Blocklaying','Bricklaying and Concrete Work','Dyeing and Bleaching','Beauty and Cosmetology','Cosmetology','Fashion Design and Garment Making','Leather Goods Manufacturing','Textile Trade','Carpentry and Joinery','Furniture Making','Auto Mechanics','Auto Body Repair and Spray Painting','Auto Electrical Work','Auto Parts Merchandising','Air Conditioning and Refrigeration','Welding and Fabrication','Plumbing and Pipe Fitting','Basic Electricity','Applied Electricity','Electronics','Basic Electronics','Electronics Works','Metal Work','Woodwork','Wood Work','Machine Woodworking','Building Construction'];

const ALL_SUBJECTS = Array.from(new Set([...CORE, ...SCIENCE, ...COMMERCIAL, ...ART, ...ICT, ...VOCATIONAL])).sort();

// ===== SUBJECT METADATA =====
const SUBJECT_META = {
  'English Language':         { code: 'ENG',     description: 'Mastery of English grammar, comprehension, summary, lexis and structure.' },
  'General Mathematics':      { code: 'MTH',     description: 'Algebra, calculus, trigonometry, statistics and probability for SSS students.' },
  'Civic Education':          { code: 'CVE',     description: 'Citizenship, values, national duties and constitutional awareness.' },
  'Physics':                  { code: 'PHY',     description: 'Mechanics, heat, waves, electricity, magnetism, optics and modern physics.' },
  'Chemistry':                { code: 'CHM',     description: 'Atomic structure, bonding, acids/bases, organic and inorganic chemistry.' },
  'Biology':                  { code: 'BIO',     description: 'Cell biology, ecology, genetics, evolution, reproduction and physiology.' },
  'Further Mathematics':      { code: 'FMT',     description: 'Advanced algebra, complex numbers, vectors, mechanics and statistics.' },
  'Agricultural Science':     { code: 'AGR',     description: 'Crop production, animal husbandry, soil science and farm management.' },
  'Geography':                { code: 'GEO',     description: 'Physical and human geography, map reading, climate and regional studies.' },
  'Computer Studies':         { code: 'CMP',     description: 'Computer fundamentals, hardware, software, networking and information systems.' },
  'Data Processing':          { code: 'DTP',     description: 'Data capture, processing tools, spreadsheets and database fundamentals.' },
  'Technical Drawing':        { code: 'TDR',     description: 'Engineering drawing, orthographic projection, isometric views and CAD basics.' },
  'Economics':                { code: 'ECO',     description: 'Micro and macroeconomics, demand/supply, money, banking and trade.' },
  'Financial Accounting':     { code: 'ACC',     description: 'Double entry bookkeeping, ledgers, financial statements and ratio analysis.' },
  'Commerce':                 { code: 'CMR',     description: 'Trade, commerce, business ownership, finance, insurance and transportation.' },
  'Marketing':                { code: 'MKT',     description: 'Marketing mix, consumer behaviour, segmentation and digital marketing.' },
  'Office Practice':          { code: 'OFP',     description: 'Office procedures, records management, communication and ICT in business.' },
  'Insurance':                { code: 'INS',     description: 'Principles of insurance, types of policies, claims and risk management.' },
  'Government':               { code: 'GOV',     description: 'Political theory, constitution, organs of government, public administration.' },
  'Literature in English':    { code: 'LIT',     description: 'Poetry, prose, drama, literary devices, appreciation and analysis.' },
  'Christian Religious Studies': { code: 'CRS',  description: 'Biblical studies, Christian history, ethics and comparative religion.' },
  'Islamic Religious Studies':{ code: 'IRS',     description: 'Quran, Hadith, Islamic history, jurisprudence and ethics.' },
  'History':                  { code: 'HIS',     description: 'African, Nigerian and world history from pre-colonial to modern era.' },
  'Nigerian Language':        { code: 'NGL',     description: 'Yoruba, Igbo or Hausa as a subject — oral, written and literature.' },
  'French':                   { code: 'FRE',     description: 'French grammar, comprehension, composition and oral communication.' },
  'Fine Arts':                { code: 'ART',     description: 'Drawing, painting, design, art history and creative expression.' },
  'Music':                    { code: 'MUS',     description: 'Music theory, performance, African and Western music history.' },
  'Yoruba':                   { code: 'YOR',     description: 'Yoruba grammar, literature, oral tradition and composition.' },
  'Igbo':                     { code: 'IGB',     description: 'Igbo grammar, literature, oral tradition and composition.' },
  'Hausa':                    { code: 'HAU',     description: 'Hausa grammar, literature, oral tradition and composition.' },
  'Computer Science':         { code: 'CSC',     description: 'Programming, algorithms, data structures, web development and OOP.' },
  'ICT':                      { code: 'ICT',     description: 'Information and Communication Technology fundamentals and applications.' },
  'Food and Nutrition':       { code: 'FAN',     description: 'Food science, nutrition, meal planning, food hygiene and preparation.' },
  'Home Management':          { code: 'HMG',     description: 'Home economics, family living, household management and child care.' },
  'Clothing and Textiles':    { code: 'CTX',     description: 'Textile science, garment construction, fashion design and fabric care.' },
  'Fisheries':                { code: 'FSH',     description: 'Aquaculture, fish biology, pond management and fish preservation.' },
  'Animal Husbandry':         { code: 'AHU',     description: 'Livestock production, breeding, nutrition, health and farm structures.' },
  'Catering Craft Practice':  { code: 'CCP',     description: 'Catering services, food preparation, hospitality and event management.' },
  'Garment Making':           { code: 'GRM',     description: 'Garment construction, pattern drafting, sewing techniques and fashion.' },
  'Photography':              { code: 'PHT',     description: 'Camera handling, composition, lighting, editing and visual storytelling.' },
  'Tourism':                  { code: 'TRM',     description: 'Tourism principles, hospitality, travel operations and destinations.' },
  'Health Education':         { code: 'HLT',     description: 'Personal and community health, diseases, nutrition and first aid.' },
  'Physical Education':       { code: 'PHE',     description: 'Body fitness, sports, recreation, safety and movement fundamentals.' },
  'Horticulture and Crop Production': { code: 'HCP', description: 'Crop science, soil management, pest control and sustainable farming.' },
  'Livestock Farming':        { code: 'LVF',     description: 'Animal husbandry, breeding, feed formulation and farm management.' },
  'Business Studies':         { code: 'BUS',     description: 'Business organisation, management, marketing and entrepreneurship.' },
  'Store Keeping':            { code: 'STK',     description: 'Stock control, inventory management, receiving and issuing goods.' },
  'Store Management':         { code: 'STM',     description: 'Store operations, record keeping, stock valuation and warehouse management.' },
  'Book Keeping':             { code: 'BKK',     description: 'Books of accounts, ledgers, journals, trial balance and final accounts.' },
  'Business Management':      { code: 'BMG',     description: 'Management functions, organisational structure, decision making and control.' },
  'Salesmanship':             { code: 'SLM',     description: 'Selling techniques, customer service, negotiation and retail operations.' },
  'Principles of Cost Accounting': { code: 'PCA', description: 'Costing methods, marginal costing, standard costing and budgeting.' },
  'Typing':                   { code: 'TYP',     description: 'Touch typing, keyboarding techniques, speed and accuracy development.' },
  'Shorthand':                { code: 'SHD',     description: 'Shorthand theory and transcription for efficient record keeping.' },
  'Keyboard':                 { code: 'KBD',     description: 'Keyboard operation, word processing and document production skills.' },
  'Arabic':                   { code: 'ARB',     description: 'Arabic grammar, comprehension, composition and oral communication.' },
  'Visual Arts':              { code: 'VAR',     description: 'Drawing, painting, mixed media, illustration and visual communication.' },
  'Edo':                      { code: 'EDO',     description: 'Edo language grammar, literature, oral tradition and composition.' },
  'Efik':                     { code: 'EFI',     description: 'Efik language grammar, literature, oral tradition and composition.' },
  'Ibibio':                   { code: 'IBB',     description: 'Ibibio language grammar, literature, oral tradition and composition.' },
  'Ceramics':                 { code: 'CER',     description: 'Clay modelling, pottery, glazing, firing and ceramic design.' },
  'Picture Making':           { code: 'PIM',     description: 'Picture composition, rendering techniques, media and visual storytelling.' },
  'Painting and Decorating':  { code: 'PAD',     description: 'Painting techniques, surface preparation, finishes and decorative arts.' },
  'Information Communication Technology': { code: 'ICT', description: 'ICT fundamentals, digital literacy, communication tools and applications.' },
  'Graphic Design':           { code: 'GRD',     description: 'Layout, typography, colour theory, branding and digital design tools.' },
  'Printing Practice':        { code: 'PRP',     description: 'Printing processes, typesetting, plate making and print production.' },
  'Solar Photovoltaic Installation and Maintenance': { code: 'SPV', description: 'Solar panel installation, wiring, maintenance and troubleshooting.' },
  'Computer Hardware and GSM Repairs': { code: 'CHG', description: 'Computer assembly, troubleshooting, GSM repair and maintenance.' },
  'GSM Phones Maintenance and Repairs': { code: 'GPR', description: 'Mobile phone diagnostics, component replacement and software repair.' },
  'Home Economics':           { code: 'HEC',     description: 'Home management, nutrition, budgeting, childcare and consumer education.' },
  'Mining':                   { code: 'MIN',     description: 'Mining methods, mineral processing, safety and environmental management.' },
  'Blocklaying':              { code: 'BLK',     description: 'Block laying techniques, mortar mixing, wall construction and safety.' },
  'Bricklaying and Concrete Work': { code: 'BCW', description: 'Brickwork, concrete mixing, reinforcement, finishing and site practice.' },
  'Dyeing and Bleaching':     { code: 'DNB',     description: 'Fabric dyeing, bleaching techniques, colour matching and textile finishing.' },
  'Beauty and Cosmetology':   { code: 'BEA',     description: 'Hair styling, skin care, makeup, manicure and salon management.' },
  'Cosmetology':              { code: 'COS',     description: 'Beauty therapy, facial treatments, hair care and cosmetic services.' },
  'Fashion Design and Garment Making': { code: 'FDG', description: 'Fashion illustration, pattern drafting, garment construction and styling.' },
  'Leather Goods Manufacturing': { code: 'LGM', description: 'Leather cutting, stitching, finishing and product manufacturing.' },
  'Textile Trade':            { code: 'TXT',     description: 'Textile marketing, merchandising, quality control and retail operations.' },
  'Carpentry and Joinery':    { code: 'CRP',     description: 'Woodworking, joinery techniques, furniture making and construction carpentry.' },
  'Furniture Making':         { code: 'FRN',     description: 'Furniture design, construction, finishing and upholstery basics.' },
  'Auto Mechanics':           { code: 'AUT',     description: 'Vehicle maintenance, engine systems, diagnostics and repair techniques.' },
  'Auto Body Repair and Spray Painting': { code: 'ABR', description: 'Panel beating, dent repair, spray painting and finishing techniques.' },
  'Auto Electrical Work':     { code: 'AEL',     description: 'Vehicle electrical systems, wiring, diagnostics and electronic accessories.' },
  'Auto Parts Merchandising': { code: 'APM',     description: 'Auto spare parts identification, inventory, sales and customer service.' },
  'Air Conditioning and Refrigeration': { code: 'ACR', description: 'AC installation, servicing, refrigeration cycles and troubleshooting.' },
  'Welding and Fabrication':  { code: 'WLD',     description: 'Arc welding, gas welding, fabrication techniques and safety practices.' },
  'Plumbing and Pipe Fitting': { code: 'PLB', description: 'Pipe installation, fittings, drainage systems and plumbing maintenance.' },
  'Basic Electricity':        { code: 'BEL',     description: 'Electrical principles, circuits, wiring, safety and basic installations.' },
  'Applied Electricity':      { code: 'AEL',     description: 'Electrical machines, power systems, installation and maintenance.' },
  'Electronics':              { code: 'ELC',     description: 'Electronic components, circuits, amplifiers, oscillators and digital electronics.' },
  'Basic Electronics':        { code: 'BEL',     description: 'Introduction to electronics, components, soldering and simple circuits.' },
  'Electronics Works':        { code: 'ELW',     description: 'Practical electronics, circuit construction, testing and fault diagnosis.' },
  'Metal Work':               { code: 'MTL',     description: 'Metalworking processes, cutting, forming, joining and finishing.' },
  'Woodwork':                 { code: 'WDW',     description: 'Woodworking tools, techniques, joinery, finishing and safety.' },
  'Wood Work':                { code: 'WKW',     description: 'Wood processing, furniture components, construction and craftsmanship.' },
  'Machine Woodworking':      { code: 'MWD',     description: 'Machine tools for wood, cutting, shaping, boring and finishing.' },
  'Building Construction':    { code: 'BLD',     description: 'Building materials, construction methods, site work and structural basics.' },
};

// ===== DEFAULT TOPICS PER SUBJECT (used if a subject has no StudyTopic) =====
const SUBJECT_TOPICS = {
  'English Language': ['Comprehension','Summary','Lexis and Structure','Oral English','Written Composition','Figures of Speech'],
  'General Mathematics': ['Number and Numeration','Algebra','Trigonometry','Calculus','Statistics and Probability','Vectors and Mechanics'],
  'Civic Education': ['Citizenship','Nationalism','Constitution','Human Rights','Public Service','Democracy'],
  'Physics': ['Mechanics','Heat and Thermodynamics','Waves','Electricity and Magnetism','Optics','Modern Physics'],
  'Chemistry': ['Atomic Structure','Chemical Bonding','Acids, Bases and Salts','Organic Chemistry','Electrochemistry','Rates of Reaction'],
  'Biology': ['Cell Biology','Genetics','Evolution','Ecology','Reproduction','Human Physiology'],
  'Further Mathematics': ['Advanced Algebra','Complex Numbers','Matrices and Determinants','Mechanics','Statistics','Differential Equations'],
  'Agricultural Science': ['Crop Production','Soil Science','Animal Husbandry','Farm Management','Agricultural Economics','Fisheries'],
  'Geography': ['Physical Geography','Human Geography','Map Reading','Climate','Regional Studies','Population'],
  'Computer Studies': ['Computer Fundamentals','Hardware','Software','Networks','Information Systems','Data Security'],
  'Data Processing': ['Data Capture','Spreadsheets','Databases','File Management','Word Processing','Information Processing'],
  'Technical Drawing': ['Drawing Instruments','Line Work','Orthographic Projection','Isometric Drawing','Sectioning','CAD Basics'],
  'Economics': ['Demand and Supply','Elasticity','National Income','Money and Banking','International Trade','Public Finance'],
  'Financial Accounting': ['Double Entry','Trial Balance','Final Accounts','Depreciation','Company Accounts','Ratio Analysis'],
  'Commerce': ['Trade','Business Ownership','Finance','Insurance','Transportation','Communication'],
  'Marketing': ['Marketing Mix','Consumer Behaviour','Market Segmentation','Product Life Cycle','Digital Marketing','Sales Management'],
  'Office Practice': ['Office Organisation','Records Management','Business Communication','Filing','Reception Duties','Office Technology'],
  'Insurance': ['Principles of Insurance','Types of Insurance','Policy Documents','Underwriting','Claims','Risk Management'],
  'Government': ['Political Theory','Constitution','Organs of Government','Public Administration','Elections','International Relations'],
  'Literature in English': ['Poetry','Prose','Drama','Literary Devices','Appreciation','African Literature'],
  'Christian Religious Studies': ['Old Testament','New Testament','Church History','Christian Ethics','Comparative Religion','Christian Living'],
  'Islamic Religious Studies': ['Quran','Hadith','Islamic History','Islamic Jurisprudence','Islamic Ethics','Comparative Religion'],
  'History': ['Pre-Colonial Nigeria','Colonial Nigeria','Independence','African Civilisations','World Wars','Post-Independence Africa'],
  'Nigerian Language': ['Grammar','Comprehension','Composition','Literature','Oral Tradition','Translation'],
  'French': ['Grammar','Comprehension','Composition','Conversation','French Culture','Translation'],
  'Fine Arts': ['Drawing','Painting','Design','Art History','Sculpture','Print Making'],
  'Music': ['Music Theory','Performance','African Music','Western Music','Composition','Music History'],
  'Yoruba': ['Ifo','Itan','Aroko','Akeede','Awon Asayan Akowole','Iwe Ijinle'],
  'Igbo': ['Ihe Odide','Akuko','Aka ndi ozo','Akuko Mbu','Ihe omumu','Mkpuru Asusu'],
  'Hausa': ['Ganye','Tarihi','Adabin Baka','Waiwaye','Tsarin Magana','Rubutun Zamani'],
  'Computer Science': ['Programming Basics','Algorithms','Data Structures','Object Oriented Programming','Web Development','Database Systems'],
  'ICT': ['Computer Hardware','Operating Systems','Networks','Internet','Security','Emerging Technologies'],
  'Food and Nutrition': ['Food Science','Nutrients','Meal Planning','Food Hygiene','Food Preservation','Food Preparation'],
  'Home Management': ['Family Living','Household Management','Child Care','Home Décor','Consumer Education','Home Crafts'],
  'Clothing and Textiles': ['Textile Fibres','Fabric Construction','Garment Making','Pattern Drafting','Care of Clothes','Fashion Design'],
  'Fisheries': ['Fish Biology','Pond Construction','Fish Feeding','Fish Harvest','Fish Preservation','Aquaculture Economics'],
  'Animal Husbandry': ['Livestock Breeds','Animal Nutrition','Animal Health','Housing','Breeding','Farm Records'],
  'Catering Craft Practice': ['Catering Services','Food Preparation','Buffet Service','Menu Planning','Hospitality','Food Safety'],
  'Garment Making': ['Pattern Drafting','Cutting','Sewing','Finishing','Fashion Design','Garment Care'],
  'Photography': ['Camera Handling','Composition','Lighting','Digital Editing','Portrait Photography','Photojournalism'],
  'Tourism': ['Tourism Concepts','Hospitality','Travel Operations','Tourism Marketing','Destinations','Ecotourism'],
  'Health Education': ['Personal Health','Community Health','Nutrition and Fitness','Disease Prevention','First Aid and Safety','Substance Abuse Prevention'],
  'Physical Education': ['Body Fitness','Sports Skills','Recreation Activities','Safety and Injury Prevention','Movement and Gymnastics','Rhythmic Activities'],
  'Horticulture and Crop Production': ['Soil Science','Land Preparation','Planting Techniques','Pest and Disease Control','Harvesting','Post Harvest Handling'],
  'Livestock Farming': ['Animal Breeds','Housing and Equipment','Feeding and Nutrition','Animal Health','Breeding and Genetics','Farm Records'],
  'Business Studies': ['Business Organisation','Forms of Business Ownership','Business Management','Business Finance','Marketing and Sales','Business Law and Ethics'],
  'Store Keeping': ['Store Functions','Stock Receipt and Issue','Stocktaking','Storage Methods','Record Keeping','Store Equipment and Safety'],
  'Store Management': ['Store Organisation','Inventory Control','Stock Valuation','Warehouse Management','Distribution','Store Staffing'],
  'Book Keeping': ['Journals','Ledgers','Trial Balance','Final Accounts','Bank Reconciliation','Control Accounts'],
  'Business Management': ['Management Functions','Organisational Structure','Recruitment and Staffing','Communication','Decision Making','Business Planning'],
  'Salesmanship': ['Personal Selling','Sales Techniques','Customer Service','Negotiation Skills','Retail Operations','Sales Records'],
  'Principles of Cost Accounting': ['Cost Classification','Materials Costing','Labour Costing','Overheads','Marginal Costing','Budgeting and Control'],
  'Typing': ['Keyboard Familiarity','Touch Typing','Speed Drills','Accuracy Exercises','Document Formatting','Proofreading'],
  'Shorthand': ['Shorthand Alphabet','Brief Forms','Phrases','Dictation','Transcription','Speed Building'],
  'Keyboard': ['Keyboard Layout','Typing Techniques','Speed and Accuracy','Document Production','Proofreading','Office Software'],
  'Arabic': ['Arabic Alphabet','Reading and Writing','Grammar and Syntax','Comprehension','Translation','Arabic Literature'],
  'Visual Arts': ['Drawing Techniques','Painting Methods','Mixed Media','Composition and Layout','Colour Theory','Art Exhibition'],
  'Edo': ['Edo Language Structure','Comprehension','Composition','Oral Literature','Translation','Edo Culture and Traditions'],
  'Efik': ['Efik Language Structure','Comprehension','Composition','Oral Literature','Translation','Efik Culture and Traditions'],
  'Ibibio': ['Ibibio Language Structure','Comprehension','Composition','Oral Literature','Translation','Ibibio Culture and Traditions'],
  'Photography': ['Camera Operation','Composition and Framing','Lighting Techniques','Digital Editing','Portrait and Landscape','Photojournalism'],
  'Ceramics': ['Clay Preparation','Hand Building','Wheel Throwing','Drying and Firing','Glazing','Ceramic Design and Decoration'],
  'Picture Making': ['Picture Composition','Sketching and Rendering','Perspective','Media Selection','Colour Application','Visual Storytelling'],
  'Painting and Decorating': ['Surface Preparation','Paint Types and Selection','Application Techniques','Finishing','Colour Matching','Safety and Cleanup'],
  'Information Communication Technology': ['Computer Fundamentals','Word Processing','Spreadsheets','Presentation Software','Internet and Email','ICT Ethics and Safety'],
  'Graphic Design': ['Design Principles','Typography','Colour Theory','Layout and Composition','Branding','Digital Design Tools'],
  'Printing Practice': ['Printing Processes','Typesetting','Plate Making','Ink and Paper','Printing Press Operation','Quality Control'],
  'Solar Photovoltaic Installation and Maintenance': ['Solar Energy Basics','Panel Installation','Wiring and Connections','Battery Storage','System Maintenance','Troubleshooting'],
  'Computer Hardware and GSM Repairs': ['Computer Components','Assembly and Disassembly','Fault Diagnosis','Repair Techniques','GSM Hardware','Testing and Quality Assurance'],
  'GSM Phones Maintenance and Repairs': ['Mobile Phone Components','Diagnostics','Screen and Battery Replacement','Software Flashing','Circuit Repair','Customer Service'],
  'Home Economics': ['Home Management','Nutrition and Meal Planning','Budgeting and Resources','Child Care','Consumer Education','Home Safety and Hygiene'],
  'Mining': ['Mineral Resources','Mining Methods','Drilling and Blasting','Mineral Processing','Mine Safety','Environmental Impact'],
  'Blocklaying': ['Mortar Mixing','Block Laying Techniques','Wall Construction','Corners and Joints','Setting Out','Safety Practices'],
  'Bricklaying and Concrete Work': ['Brickwork Basics','Concrete Mixing','Reinforcement','Formwork','Plastering','Site Practice and Safety'],
  'Dyeing and Bleaching': ['Fabric Preparation','Dye Selection','Dyeing Methods','Bleaching Techniques','Colour Matching','Quality Assessment'],
  'Beauty and Cosmetology': ['Hair Styling','Skin Care and Makeup','Manicure and Pedicure','Salon Hygiene','Customer Care','Beauty Business Management'],
  'Cosmetology': ['Facial Treatments','Hair Care','Body Massage','Makeup Artistry','Sanitation and Safety','Cosmetology Tools and Equipment'],
  'Fashion Design and Garment Making': ['Fashion Illustration','Pattern Drafting','Fabric Cutting','Sewing Techniques','Garment Finishing','Fashion Merchandising'],
  'Leather Goods Manufacturing': ['Leather Types and Selection','Cutting and Stitching','Finishing Techniques','Quality Control','Leather Care','Product Design'],
  'Textile Trade': ['Textile Fibres','Fabric Identification','Textile Marketing','Merchandising','Quality Control','Retail Operations'],
  'Carpentry and Joinery': ['Woodworking Tools','Timber Preparation','Joinery Techniques','Furniture Construction','Installation and Fixing','Wood Finishing'],
  'Furniture Making': ['Furniture Design','Material Selection','Construction Methods','Assembly and Joinery','Finishing','Upholstery Basics'],
  'Auto Mechanics': ['Engine Systems','Transmission','Braking System','Suspension and Steering','Electrical Systems','Vehicle Servicing and Maintenance'],
  'Auto Body Repair and Spray Painting': ['Panel Beating','Dent Repair','Spray Painting','Body Filling','Surface Preparation','Safety and Cleanup'],
  'Auto Electrical Work': ['Vehicle Electrical Systems','Wiring Diagrams','Battery and Charging','Lighting and Signalling','Electronic Accessories','Fault Diagnosis'],
  'Auto Parts Merchandising': ['Spare Parts Identification','Inventory Management','Pricing and Sales','Customer Service','Supplier Relations','Stock Control'],
  'Air Conditioning and Refrigeration': ['Refrigeration Cycle','AC Components','Installation Techniques','Servicing and Maintenance','Gas Charging','Troubleshooting'],
  'Welding and Fabrication': ['Welding Safety','Arc Welding','Gas Welding','Fabrication Techniques','Blueprint Reading','Quality Inspection'],
  'Plumbing and Pipe Fitting': ['Pipe Materials','Pipe Cutting and Threading','Fittings and Valves','Drainage Systems','Water Supply Installation','Testing and Maintenance'],
  'Basic Electricity': ['Electrical Safety','Ohm\'s Law','Circuits and Symbols','Wiring Methods','Fuses and Circuit Breakers','Simple Installations'],
  'Applied Electricity': ['Electrical Machines','Power Systems','Transformers','Motor Control','Installation Practices','Maintenance and Testing'],
  'Electronics': ['Electronic Components','Semiconductor Devices','Amplifiers','Oscillators','Digital Electronics','Circuit Analysis'],
  'Basic Electronics': ['Electronic Components','Soldering Techniques','Simple Circuits','Testing and Measurement','Safety Practices','Tools and Equipment'],
  'Electronics Works': ['Circuit Construction','Testing and Fault Finding','Soldering and Desoldering','PCB Basics','Power Supplies','Workshop Practice'],
  'Metal Work': ['Metal Types and Properties','Cutting and Shaping','Joining Methods','Heat Treatment','Finishing Processes','Workshop Safety'],
  'Woodwork': ['Wood Types and Uses','Hand Tools','Machine Tools','Cutting and Shaping','Joinery','Finishing and Safety'],
  'Wood Work': ['Timber Processing','Woodworking Machines','Component Production','Assembly','Finishing','Quality Control'],
  'Machine Woodworking': ['Machine Setup','Cutting and Shaping','Boring and Routing','Sanding and Finishing','Safety and Maintenance','Production Planning'],
  'Building Construction': ['Building Materials','Site Preparation','Foundation Work','Walling and Roofing','Plastering and Finishing','Construction Safety'],
};

const INSTITUTIONS = [
  { name: 'University of Lagos',       abbreviation: 'UNILAG',  type: 'UNIVERSITY',  location: 'Akoka, Lagos',         state: 'Lagos' },
  { name: 'University of Ibadan',      abbreviation: 'UI',      type: 'UNIVERSITY',  location: 'Ibadan',               state: 'Oyo' },
  { name: 'Ahmadu Bello University',  abbreviation: 'ABU',     type: 'UNIVERSITY',  location: 'Zaria',                state: 'Kaduna' },
  { name: 'Obafemi Awolowo University', abbreviation: 'OAU',   type: 'UNIVERSITY',  location: 'Ile-Ife',              state: 'Osun' },
  { name: 'University of Nigeria, Nsukka', abbreviation: 'UNN', type: 'UNIVERSITY',  location: 'Nsukka',               state: 'Enugu' },
  { name: 'Covenant University',       abbreviation: 'CU',      type: 'PRIVATE',     location: 'Ota, Ogun',            state: 'Ogun' },
  { name: 'Babcock University',        abbreviation: 'BU',      type: 'PRIVATE',     location: 'Ilishan-Remo',         state: 'Ogun' },
  { name: 'Lagos State University',    abbreviation: 'LASU',    type: 'STATE',       location: 'Ojo, Lagos',           state: 'Lagos' },
];

const COURSES_BY_INSTITUTION = {
  'University of Lagos': [
    { name: 'Computer Science',       utmeCutoff: 240, jambSubjects: ['English Language','Mathematics','Physics','Chemistry'] },
    { name: 'Medicine and Surgery',   utmeCutoff: 320, jambSubjects: ['English Language','Biology','Chemistry','Physics'] },
    { name: 'Law',                    utmeCutoff: 280, jambSubjects: ['English Language','Government','Literature in English','History'] },
    { name: 'Accounting',             utmeCutoff: 230, jambSubjects: ['English Language','Mathematics','Economics','Commerce'] },
    { name: 'Mass Communication',     utmeCutoff: 250, jambSubjects: ['English Language','Government','Economics','Literature in English'] },
  ],
  'University of Ibadan': [
    { name: 'Computer Science',       utmeCutoff: 230, jambSubjects: ['English Language','Mathematics','Physics','Chemistry'] },
    { name: 'Economics',              utmeCutoff: 220, jambSubjects: ['English Language','Mathematics','Economics','Government'] },
    { name: 'Law',                    utmeCutoff: 270, jambSubjects: ['English Language','Government','History','Literature in English'] },
    { name: 'Nursing',                utmeCutoff: 260, jambSubjects: ['English Language','Biology','Chemistry','Physics'] },
  ],
  'Ahmadu Bello University': [
    { name: 'Mechanical Engineering', utmeCutoff: 220, jambSubjects: ['English Language','Mathematics','Physics','Chemistry'] },
    { name: 'Public Administration',  utmeCutoff: 200, jambSubjects: ['English Language','Government','Economics','History'] },
    { name: 'Medicine and Surgery',   utmeCutoff: 310, jambSubjects: ['English Language','Biology','Chemistry','Physics'] },
  ],
  'Obafemi Awolowo University': [
    { name: 'Computer Engineering',   utmeCutoff: 240, jambSubjects: ['English Language','Mathematics','Physics','Chemistry'] },
    { name: 'Architecture',           utmeCutoff: 230, jambSubjects: ['English Language','Mathematics','Physics','Technical Drawing'] },
    { name: 'English',                utmeCutoff: 220, jambSubjects: ['English Language','Literature in English','Government','History'] },
  ],
  'University of Nigeria, Nsukka': [
    { name: 'Computer Science',       utmeCutoff: 230, jambSubjects: ['English Language','Mathematics','Physics','Chemistry'] },
    { name: 'Accountancy',            utmeCutoff: 220, jambSubjects: ['English Language','Mathematics','Economics','Commerce'] },
    { name: 'Political Science',      utmeCutoff: 210, jambSubjects: ['English Language','Government','History','Economics'] },
  ],
  'Covenant University': [
    { name: 'Computer Science',       utmeCutoff: 250, jambSubjects: ['English Language','Mathematics','Physics','Chemistry'] },
    { name: 'Business Administration', utmeCutoff: 240, jambSubjects: ['English Language','Mathematics','Economics','Commerce'] },
    { name: 'Mass Communication',     utmeCutoff: 235, jambSubjects: ['English Language','Government','Economics','Literature in English'] },
  ],
  'Babcock University': [
    { name: 'Computer Science',       utmeCutoff: 240, jambSubjects: ['English Language','Mathematics','Physics','Chemistry'] },
    { name: 'Public Health',          utmeCutoff: 220, jambSubjects: ['English Language','Biology','Chemistry','Physics'] },
    { name: 'Accounting',             utmeCutoff: 225, jambSubjects: ['English Language','Mathematics','Economics','Commerce'] },
  ],
  'Lagos State University': [
    { name: 'Computer Science',       utmeCutoff: 220, jambSubjects: ['English Language','Mathematics','Physics','Chemistry'] },
    { name: 'Business Administration', utmeCutoff: 210, jambSubjects: ['English Language','Mathematics','Economics','Commerce'] },
    { name: 'Law',                    utmeCutoff: 250, jambSubjects: ['English Language','Government','Literature in English','History'] },
  ],
};

const DEFAULT_TUTOR_ACCOUNTS = [
  { email: 'tutor@edwardian.ng',         fullName: 'Mr. Tunde Bakare',    phone: '+2348000000001', subject: 'Physics',           programme: 'JAMB' },
  { email: 'tutor.chemistry@edwardian.ng', fullName: 'Mrs. Ngozi Eze',     phone: '+2348000000002', subject: 'Chemistry',         programme: 'JAMB' },
  { email: 'tutor.maths@edwardian.ng',   fullName: 'Mr. Yusuf Abdullahi',  phone: '+2348000000003', subject: 'General Mathematics', programme: 'JAMB' },
  { email: 'tutor.english@edwardian.ng', fullName: 'Ms. Funke Adeyemi',    phone: '+2348000000004', subject: 'English Language',  programme: 'JAMB' },
];

// ===== HELPERS =====
async function seedSubjects(client) {
  let inserted = 0, skipped = 0;
  for (const name of ALL_SUBJECTS) {
    const meta = SUBJECT_META[name] || { code: slugify(name).slice(0,3).toUpperCase(), description: `${name} for SSS1-SSS3 students.` };
    const code = meta.code;
    const r = await client.query(
      `INSERT INTO "StudySubject" ("id","name","code","description","gradeLevel","isActive","createdAt","updatedAt")
       VALUES ($1,$2,$3,$4,'SSS1-SSS3',true,now(),now())
       ON CONFLICT ("code") DO NOTHING
       RETURNING "id"`,
      [uuid(), name, code, meta.description]
    );
    if (r.rowCount > 0) inserted++; else skipped++;
  }
  return { inserted, skipped };
}

async function seedTopicsAndResources(client) {
  const subs = await client.query(`SELECT "id","name" FROM "StudySubject"`);
  const map = new Map(subs.rows.map(s => [s.name, s.id]));
  let topicsCreated = 0, resourcesCreated = 0;

  for (const [subj, topicNames] of Object.entries(SUBJECT_TOPICS)) {
    const subjId = map.get(subj);
    if (!subjId) continue;
    for (let i = 0; i < topicNames.length; i++) {
      const tn = topicNames[i];
      const exists = await client.query(
        `SELECT "id" FROM "StudyTopic" WHERE "subjectId"=$1 AND "name"=$2`,
        [subjId, tn]
      );
      let topicId;
      if (exists.rowCount > 0) {
        topicId = exists.rows[0].id;
      } else {
        const r = await client.query(
          `INSERT INTO "StudyTopic" ("id","subjectId","name","description","order","isActive","createdAt","updatedAt")
           VALUES ($1,$2,$3,$4,$5,true,now(),now()) RETURNING "id"`,
          [uuid(), subjId, tn, `${tn} – ${subj}`, i]
        );
        topicId = r.rows[0].id;
        topicsCreated++;
      }
      // 1 video + 1 text + 1 file resource per topic
      const have = await client.query(`SELECT "id" FROM "StudyResource" WHERE "topicId"=$1`, [topicId]);
      if (have.rowCount === 0) {
        const resources = [
          { title: `${tn} - Study Notes`,   type: 'TEXT',  content: `Comprehensive study notes for ${tn} in ${subj}.` },
          { title: `${tn} - Video Lesson`,  type: 'VIDEO', fileUrl: `https://cdn.edwardian.ng/lessons/${slugify(subj)}/${slugify(tn)}.mp4`, duration: 600 },
          { title: `${tn} - Past Questions`, type: 'PDF',  fileUrl: `https://cdn.edwardian.ng/past-questions/${slugify(subj)}/${slugify(tn)}.pdf` },
        ];
        for (let j = 0; j < resources.length; j++) {
          const r = resources[j];
          await client.query(
            `INSERT INTO "StudyResource" ("id","topicId","title","type","content","fileUrl","duration","order","isActive","createdAt","updatedAt")
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true,now(),now())`,
            [uuid(), topicId, r.title, r.type, r.content || null, r.fileUrl || null, r.duration || null, j]
          );
          resourcesCreated++;
        }
      }
    }
  }
  return { topicsCreated, resourcesCreated };
}

async function seedQuestions(client) {
  const subs = await client.query(`SELECT "id","name" FROM "StudySubject"`);
  const existing = await client.query(`SELECT "subject", COUNT(*)::int AS n FROM "Question" GROUP BY "subject"`);
  const existingMap = new Map(existing.rows.map(r => [r.subject, r.n]));

  const banks = {
    'Physics': [
      { text: 'The SI unit of force is?', options: ['Joule','Newton','Watt','Pascal'], correctOption: 1, explanation: 'Force is measured in Newtons (N).' },
      { text: 'Which of the following is a vector quantity?', options: ['Speed','Mass','Velocity','Temperature'], correctOption: 2, explanation: 'Velocity has both magnitude and direction.' },
      { text: 'Ohm\'s law states that V is equal to?', options: ['IR','I/R','R/I','I+R'], correctOption: 0, explanation: 'V = IR.' },
      { text: 'A body in uniform circular motion has constant?', options: ['Velocity','Acceleration','Speed','Momentum'], correctOption: 2, explanation: 'Speed remains constant; velocity changes direction.' },
      { text: 'The first law of thermodynamics is about?', options: ['Entropy','Energy conservation','Heat transfer','Work only'], correctOption: 1, explanation: 'Energy cannot be created or destroyed.' },
      { text: 'Refractive index is the ratio of?', options: ['Speed in vacuum to speed in medium','Speed in medium to speed in vacuum','Wavelengths','Frequencies'], correctOption: 0, explanation: 'n = c/v.' },
      { text: 'An ammeter measures?', options: ['Voltage','Current','Resistance','Power'], correctOption: 1, explanation: 'Ammeter measures current in amps.' },
      { text: 'The acceleration due to gravity on Earth is approximately?', options: ['9.8 m/s²','6.5 m/s²','12 m/s²','15 m/s²'], correctOption: 0, explanation: 'g ≈ 9.8 m/s² near Earth\'s surface.' },
      { text: 'Total internal reflection occurs when light moves from?', options: ['Rarer to denser','Denser to rarer','Any medium','Vacuum to air'], correctOption: 1, explanation: 'Occurs when angle of incidence exceeds critical angle.' },
      { text: 'The unit of electrical resistance is?', options: ['Volt','Ampere','Ohm','Watt'], correctOption: 2, explanation: 'Resistance is measured in Ohms (Ω).' },
    ],
  };

  let created = 0;
  for (const subj of subs.rows) {
    const have = existingMap.get(subj.name) || 0;
    if (have >= 10) continue;
    const bank = banks[subj.name] || generateGenericQuestions(subj.name);
    for (const q of bank) {
      await client.query(
        `INSERT INTO "Question" ("id","subject","examType","institution","year","topic","difficulty","text","options","correctOption","explanation","isActive","createdAt","updatedAt")
         VALUES ($1,$2,'JAMB',null,$3,$4,'MEDIUM',$5,$6::jsonb,$7,$8,true,now(),now())`,
        [uuid(), subj.name, 2024 + (have % 3), q.topic || null, q.text, JSON.stringify(q.options), q.correctOption, q.explanation]
      );
      created++;
    }
  }
  return { created };
}

function generateGenericQuestions(subject) {
  return [
    { text: `Which of the following best describes ${subject}?`, options: ['Option A','Option B','Option C','Option D'], correctOption: 0, explanation: 'A foundational concept of the subject.' },
    { text: `The most important principle in ${subject} is?`, options: ['Principle 1','Principle 2','Principle 3','Principle 4'], correctOption: 1, explanation: 'Core principle in the curriculum.' },
    { text: `A student of ${subject} must understand?`, options: ['Theory','Practice','Both','Neither'], correctOption: 2, explanation: 'Theory and practice work hand in hand.' },
    { text: `In ${subject}, the SI unit commonly used is?`, options: ['Metre','Kilogram','Depends','Second'], correctOption: 2, explanation: 'Units vary by topic.' },
    { text: `Which is NOT a branch of ${subject}?`, options: ['Branch A','Branch B','Branch C','None of the above'], correctOption: 3, explanation: 'All listed are valid branches.' },
    { text: `The discovery credited to early ${subject} pioneers was?`, options: ['Discovery 1','Discovery 2','Discovery 3','Discovery 4'], correctOption: 0, explanation: 'Historically attributed to early practitioners.' },
    { text: `A practical application of ${subject} is?`, options: ['Engineering','Medicine','Agriculture','All of the above'], correctOption: 3, explanation: 'Cross-disciplinary application.' },
    { text: `The formula most associated with ${subject} is?`, options: ['F = ma','V = IR','PV = nRT','Depends on context'], correctOption: 3, explanation: 'Formulas depend on the specific topic.' },
    { text: `Which textbook is commonly recommended for ${subject}?`, options: ['New General Mathematics','Essential ${subject}','Comprehensive ${subject}','Any of the above'], correctOption: 3, explanation: 'Multiple textbooks cover the curriculum.' },
    { text: `Past questions are useful in ${subject} because?`, options: ['Practice','Pattern recognition','Time management','All of the above'], correctOption: 3, explanation: 'Past questions build all three skills.' },
  ];
}

async function seedExamsAndQuestions(client) {
  const subs = await client.query(`SELECT "id","name" FROM "StudySubject"`);
  let examsCreated = 0, examQuestionsCreated = 0;
  for (const subj of subs.rows) {
    const exists = await client.query(`SELECT "id" FROM "Exam" WHERE "subject"=$1 AND "isPublished"=true`, [subj.name]);
    if (exists.rowCount > 0) continue;
    const qs = await client.query(`SELECT "id" FROM "Question" WHERE "subject"=$1 ORDER BY "createdAt" DESC LIMIT 20`, [subj.name]);
    if (qs.rowCount < 5) continue;
    const examId = uuid();
    await client.query(
      `INSERT INTO "Exam" ("id","title","examType","subject","duration","totalMarks","isActive","isPublished","publishedAt","createdAt")
       VALUES ($1,$2,'JAMB',$3,30,40,true,true,now(),now())`,
      [examId, `${subj.name} Practice Test`, subj.name]
    );
    examsCreated++;
    const chosen = shuffle(qs.rows).slice(0, Math.min(20, qs.rows.length));
    for (let i = 0; i < chosen.length; i++) {
      await client.query(
        `INSERT INTO "ExamQuestion" ("examId","questionId","order") VALUES ($1,$2,$3)`,
        [examId, chosen[i].id, i]
      );
      examQuestionsCreated++;
    }
  }
  return { examsCreated, examQuestionsCreated };
}

async function seedInstitutionCourses(client) {
  let created = 0, skipped = 0;
  for (const inst of INSTITUTIONS) {
    const r = await client.query(`SELECT "id" FROM "Institution" WHERE "name"=$1`, [inst.name]);
    if (r.rowCount === 0) { skipped++; continue; }
    const instId = r.rows[0].id;
    const courses = COURSES_BY_INSTITUTION[inst.name] || [];
    for (const c of courses) {
      const have = await client.query(`SELECT "id" FROM "InstitutionCourse" WHERE "institutionId"=$1 AND "name"=$2`, [instId, c.name]);
      if (have.rowCount > 0) { skipped++; continue; }
      await client.query(
        `INSERT INTO "InstitutionCourse" ("id","institutionId","name","utmeCutoff","olevelRequirements","jambSubjects","postUtmeRequired","isActive")
         VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,true)`,
        [uuid(), instId, c.name, c.utmeCutoff || null, '5 credits including English & Mathematics', JSON.stringify(c.jambSubjects), Math.random() > 0.5]
      );
      created++;
    }
  }
  return { created, skipped };
}

async function seedTimetable(client) {
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
  const times = ['08:00 - 09:30','09:30 - 11:00','11:00 - 12:30','12:30 - 14:00','14:00 - 15:30'];
  const venues = ['Room A','Room B','Lab 1','Lab 2','Online'];
  const subjects = ['English Language','General Mathematics','Physics','Chemistry','Biology','Economics','Government'];
  const created = [];
  for (const day of days) {
    for (let t = 0; t < times.length; t++) {
      const exists = await client.query(
        `SELECT "id" FROM "TimetableEntry" WHERE "day"=$1 AND "time"=$2`,
        [day, times[t]]
      );
      if (exists.rowCount > 0) continue;
      const subj = pick(subjects);
      const venue = pick(venues);
      await client.query(
        `INSERT INTO "TimetableEntry" ("id","day","time","subject","instructor","venue","type","examType","classLevel","isActive","createdAt","updatedAt")
         VALUES ($1,$2,$3,$4,'Edwardian Faculty',$5,'CLASS','JAMB','SSS3',true,now(),now())`,
        [uuid(), day, times[t], subj, venue]
      );
      created.push({ day, time: times[t], subj });
    }
  }
  return { created: created.length };
}

async function seedTutorAccounts(client) {
  let created = 0, skipped = 0;
  for (const t of DEFAULT_TUTOR_ACCOUNTS) {
    const exists = await client.query(`SELECT "id" FROM "User" WHERE "email"=$1`, [t.email]);
    if (exists.rowCount > 0) { skipped++; continue; }
    const portalId = 'EDW-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    const passwordHash = await bcrypt.hash('Tutor@123', 10);
    await client.query(
      `INSERT INTO "User" ("id","portalId","parentAccessCode","fullName","email","emailVerified","phone","passwordHash","role","isActive","createdAt","updatedAt")
       VALUES ($1,$2,$3,$4,$5,true,$6,$7,'TUTOR',true,now(),now())`,
      [uuid(), portalId, uuid(), t.fullName, t.email, t.phone, passwordHash]
    );
    created++;
  }
  return { created, skipped };
}

async function seedAdminAccount(client) {
  const email = 'admin@edwardian.ng';
  const exists = await client.query(`SELECT "id" FROM "User" WHERE "email"=$1`, [email]);
  if (exists.rowCount > 0) return { created: 0, skipped: 1 };
  const portalId = 'EDW-ADMIN';
  const passwordHash = await bcrypt.hash('Admin@123', 10);
  await client.query(
    `INSERT INTO "User" ("id","portalId","parentAccessCode","fullName","email","emailVerified","phone","passwordHash","role","isActive","createdAt","updatedAt","notificationPreferences")
     VALUES ($1,$2,$3,'Edwardian Admin',$4,true,'+2348000000000',$5,'ADMIN',true,now(),now(),'{}'::jsonb)`,
    [uuid(), portalId, uuid(), email, passwordHash]
  );
  return { created: 1, skipped: 0 };
}

async function verifyLogin(client, email, password) {
  const r = await client.query(`SELECT "passwordHash" FROM "User" WHERE "email"=$1`, [email]);
  if (r.rowCount === 0) return { ok: false, reason: 'no such user' };
  const ok = await bcrypt.compare(password, r.rows[0].passwordHash);
  return { ok };
}

async function main() {
  const client = new Client({ connectionString: URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('=== Connected to Neon ===');

  const before = await client.query(`SELECT
    (SELECT COUNT(*)::int FROM "StudySubject") AS subjects,
    (SELECT COUNT(*)::int FROM "StudyTopic") AS topics,
    (SELECT COUNT(*)::int FROM "StudyResource") AS resources,
    (SELECT COUNT(*)::int FROM "Question") AS questions,
    (SELECT COUNT(*)::int FROM "Exam") AS exams,
    (SELECT COUNT(*)::int FROM "ExamQuestion") AS exam_questions,
    (SELECT COUNT(*)::int FROM "InstitutionCourse") AS institution_courses,
    (SELECT COUNT(*)::int FROM "TimetableEntry") AS timetable_entries,
    (SELECT COUNT(*)::int FROM "User" WHERE "role"='TUTOR') AS tutors,
    (SELECT COUNT(*)::int FROM "User" WHERE "role"='ADMIN') AS admins,
    (SELECT COUNT(*)::int FROM "User" WHERE "role"='STUDENT') AS students`);
  const b = before.rows[0];
  console.log('Before:', b);

  const s1 = await seedSubjects(client);
  console.log('Subjects   : inserted=' + s1.inserted + ' skipped=' + s1.skipped);
  const s2 = await seedTopicsAndResources(client);
  console.log('Topics     : created=' + s2.topicsCreated);
  console.log('Resources  : created=' + s2.resourcesCreated);
  const s3 = await seedQuestions(client);
  console.log('Questions  : created=' + s3.created);
  const s4 = await seedExamsAndQuestions(client);
  console.log('Exams      : created=' + s4.examsCreated + ' (exam-questions=' + s4.examQuestionsCreated + ')');
  const s5 = await seedInstitutionCourses(client);
  console.log('InstCourses: created=' + s5.created + ' skipped=' + s5.skipped);
  const s6 = await seedTimetable(client);
  console.log('Timetable  : created=' + s6.created);
  const s7 = await seedTutorAccounts(client);
  console.log('Tutors     : created=' + s7.created + ' skipped=' + s7.skipped);
  const s8 = await seedAdminAccount(client);
  console.log('Admin      : created=' + s8.created + ' skipped=' + s8.skipped);

  const after = await client.query(`SELECT
    (SELECT COUNT(*)::int FROM "StudySubject") AS subjects,
    (SELECT COUNT(*)::int FROM "StudyTopic") AS topics,
    (SELECT COUNT(*)::int FROM "StudyResource") AS resources,
    (SELECT COUNT(*)::int FROM "Question") AS questions,
    (SELECT COUNT(*)::int FROM "Exam") AS exams,
    (SELECT COUNT(*)::int FROM "ExamQuestion") AS exam_questions,
    (SELECT COUNT(*)::int FROM "InstitutionCourse") AS institution_courses,
    (SELECT COUNT(*)::int FROM "TimetableEntry") AS timetable_entries,
    (SELECT COUNT(*)::int FROM "User" WHERE "role"='TUTOR') AS tutors,
    (SELECT COUNT(*)::int FROM "User" WHERE "role"='ADMIN') AS admins,
    (SELECT COUNT(*)::int FROM "User" WHERE "role"='STUDENT') AS students`);
  console.log('After :', after.rows[0]);

  console.log('\n=== Login verification ===');
  const adminLogin = await verifyLogin(client, 'admin@edwardian.ng', 'Admin@123');
  console.log('admin@edwardian.ng / Admin@123 ->', adminLogin);
  const tutorLogin = await verifyLogin(client, 'tutor@edwardian.ng', 'Tutor@123');
  console.log('tutor@edwardian.ng / Tutor@123 ->', tutorLogin);
  const studentLogin = await verifyLogin(client, 'student@edwardian.ng', 'Student@123');
  console.log('student@edwardian.ng (may not exist) ->', studentLogin);

  await client.end();
  console.log('=== Done ===');
}

main().catch(e => { console.error('FAIL', e); process.exit(1); });
