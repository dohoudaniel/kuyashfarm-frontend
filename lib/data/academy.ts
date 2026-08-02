/**
 * Static academy marketing copy — FAQ, testimonials, methodology.
 *
 * Classes, seats and prices are **not** here: those come from the API. This
 * file once held the whole schedule as hardcoded arrays, which is why a
 * class added in the admin never appeared and "8 seats left" never moved.
 */

export interface AcademyClass {
  id: number;
  title: string;
  description: string;
  fullDescription: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  address: string;
  price: number;
  seats: number;
  seatsLeft: number;
  image: string;
  topics: string[];
  level: "Beginner" | "Intermediate" | "All Levels";
  includes: string[];
  instructor: {
    name: string;
    role: string;
    experience: string;
  };
}

export interface AcademyProgram {
  id: string;
  classId?: number;
  title: string;
  description: string;
  duration: string;
  level: string;
  certification: string;
  outcomes: string[];
  icon: string;
  color: string;
  category: string;
}

export interface AcademyInstructor {
  id: number;
  name: string;
  role: string;
  specialty: string;
  experience: string;
  credentials: string[];
  initials: string;
  color: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export const LEVEL_COLORS: Record<AcademyClass["level"], string> = {
  Beginner: "bg-green-100 text-green-800",
  Intermediate: "bg-amber-100 text-amber-800",
  "All Levels": "bg-blue-100 text-blue-800",
};

export const ACADEMY_CLASSES: AcademyClass[] = [
  {
    id: 1,
    title: "Soil Health & Crop Production",
    description:
      "Master the fundamentals of soil science, composting, and growing high-yield vegetables using organic methods.",
    fullDescription:
      "This intensive one-day class takes you through everything you need to know about soil health and crop production. You will get your hands dirty — literally — as our expert instructors walk you through soil testing, composting techniques, crop rotation strategies, and integrated pest management. By the end of the day, you will be able to assess your own soil and create an action plan for your farm.",
    date: "April 19, 2026",
    time: "9:00 AM – 3:00 PM",
    duration: "1 Day",
    location: "Kuyash Farm, Lagos",
    address: "Kuyash Integrated Farm, Ikorodu Road, Lagos State",
    price: 25000,
    seats: 20,
    seatsLeft: 8,
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070",
    topics: ["Soil testing", "Composting", "Crop rotation", "Pest management"],
    level: "Beginner",
    includes: [
      "Practical farm session",
      "Training materials",
      "Certificate of completion",
      "Lunch & refreshments",
      "Q&A with instructors",
    ],
    instructor: {
      name: "Dr. Chukwuemeka Obi",
      role: "Soil Scientist & Agronomist",
      experience: "15 years",
    },
  },
  {
    id: 2,
    title: "Livestock & Poultry Management",
    description:
      "Learn animal husbandry practices, feeding schedules, disease prevention, and profitable poultry farming.",
    fullDescription:
      "From day-old chick to table, this class covers the complete lifecycle of poultry farming alongside cattle and sheep husbandry. You will visit our live poultry units, observe feeding routines, learn disease identification, and understand how to set up a housing system that maximises yield while keeping costs low.",
    date: "May 3, 2026",
    time: "8:00 AM – 4:00 PM",
    duration: "1 Day",
    location: "Kuyash Farm, Lagos",
    address: "Kuyash Integrated Farm, Ikorodu Road, Lagos State",
    price: 30000,
    seats: 15,
    seatsLeft: 5,
    image: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?q=80&w=2087",
    topics: ["Animal nutrition", "Disease prevention", "Housing design", "Profit planning"],
    level: "Intermediate",
    includes: [
      "Live farm tour",
      "Training materials",
      "Certificate of completion",
      "Lunch & refreshments",
      "Q&A with instructors",
    ],
    instructor: {
      name: "Alhaji Musa Garba",
      role: "Livestock & Poultry Specialist",
      experience: "20 years",
    },
  },
  {
    id: 3,
    title: "Fish Farming (Aquaculture)",
    description:
      "From pond setup to harvest — learn catfish and tilapia farming using modern aquaculture techniques.",
    fullDescription:
      "Nigeria's aquaculture sector is booming, and this class gives you a solid foundation to get started. You will tour our catfish and tilapia ponds, learn how to test water quality, understand feeding regimes, and plan your harvest and sales strategy. Suitable for complete beginners with no prior aquaculture experience.",
    date: "May 17, 2026",
    time: "9:00 AM – 3:00 PM",
    duration: "1 Day",
    location: "Kuyash Farm, Lagos",
    address: "Kuyash Integrated Farm, Ikorodu Road, Lagos State",
    price: 28000,
    seats: 18,
    seatsLeft: 12,
    image: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?q=80&w=2070",
    topics: ["Pond construction", "Water quality", "Fish nutrition", "Harvesting & sales"],
    level: "Beginner",
    includes: [
      "Pond tour & practical session",
      "Training materials",
      "Certificate of completion",
      "Lunch & refreshments",
      "Q&A with instructors",
    ],
    instructor: {
      name: "Mrs. Ngozi Eze",
      role: "Aquaculture & Fisheries Expert",
      experience: "12 years",
    },
  },
  {
    id: 4,
    title: "Agribusiness & Farm Finance",
    description:
      "Turn your farm into a profitable business. Learn bookkeeping, grant applications, market access, and pricing.",
    fullDescription:
      "Many farmers produce great food but struggle to turn a profit. This class bridges that gap. You will learn how to keep proper farm records, price your products correctly, access grants and loans available to Nigerian farmers, and find your ideal market channel — whether that's direct retail, wholesale, or processing.",
    date: "June 7, 2026",
    time: "10:00 AM – 2:00 PM",
    duration: "1 Day",
    location: "Kuyash Farm, Lagos",
    address: "Kuyash Integrated Farm, Ikorodu Road, Lagos State",
    price: 20000,
    seats: 25,
    seatsLeft: 18,
    image: "https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=2074",
    topics: ["Farm budgeting", "Record keeping", "Grant access", "Market strategies"],
    level: "All Levels",
    includes: [
      "Workshop materials & templates",
      "Certificate of completion",
      "Refreshments",
      "Resource contacts & directory",
      "Q&A with instructors",
    ],
    instructor: {
      name: "Mr. Tunde Adeyemi",
      role: "Agribusiness Consultant",
      experience: "10 years",
    },
  },
];

export const ACADEMY_PROGRAMS: AcademyProgram[] = [
  {
    id: "poultry",
    classId: 2,
    title: "Poultry Production",
    description: "Master broiler and layer systems, biosecurity, feed management, and profitable market integration.",
    duration: "3 months",
    level: "Beginner",
    certification: "NABTEB Certified",
    outcomes: ["Set up profitable poultry farm", "Disease management protocols", "Feed conversion optimisation"],
    icon: "Bird",
    color: "#f59e0b",
    category: "Livestock",
  },
  {
    id: "livestock",
    classId: 2,
    title: "Livestock Management",
    description: "Comprehensive cattle, sheep, and goat husbandry with modern veterinary and nutrition practices.",
    duration: "4 months",
    level: "Intermediate",
    certification: "NABTEB Certified",
    outcomes: ["Animal health management", "Breeding programmes", "Pasture management"],
    icon: "Beef",
    color: "#ef4444",
    category: "Livestock",
  },
  {
    id: "aquaculture",
    classId: 3,
    title: "Fisheries & Aquaculture",
    description: "Catfish and tilapia production with recirculating systems, water quality management, and value chain.",
    duration: "3 months",
    level: "Beginner",
    certification: "NABTEB Certified",
    outcomes: ["Pond construction & management", "Fish nutrition science", "Market integration"],
    icon: "Fish",
    color: "#3b82f6",
    category: "Aquaculture",
  },
  {
    id: "crop",
    classId: 1,
    title: "Crop Production",
    description: "Soil science, precision planting, integrated pest management, and harvest post-handling.",
    duration: "4 months",
    level: "Beginner",
    certification: "NABTEB Certified",
    outcomes: ["Soil fertility management", "Crop rotation systems", "Organic pest control"],
    icon: "Wheat",
    color: "#84cc16",
    category: "Crops",
  },
  {
    id: "agribusiness",
    classId: 4,
    title: "Agribusiness Management",
    description: "Business planning, financial modelling, grant access, market strategy, and entrepreneurship.",
    duration: "2 months",
    level: "All Levels",
    certification: "NABTEB Certified",
    outcomes: ["Business plan development", "Access to grants & loans", "Market channel strategy"],
    icon: "TrendingUp",
    color: "#8b5cf6",
    category: "Business",
  },
  {
    id: "greenhouse",
    title: "Greenhouse Farming",
    description: "Climate-controlled crop production, hydroponics, vertical farming, and high-value horticulture.",
    duration: "3 months",
    level: "Intermediate",
    certification: "NABTEB Certified",
    outcomes: ["Greenhouse setup & maintenance", "Hydroponic systems", "Year-round production"],
    icon: "Building2",
    color: "#10b981",
    category: "Technology",
  },
  {
    id: "precision",
    title: "Precision Agriculture",
    description: "Drone technology, GPS mapping, IoT sensors, data analytics, and AI-driven farm decision making.",
    duration: "3 months",
    level: "Intermediate",
    certification: "NABTEB Certified",
    outcomes: ["Drone operation & imagery", "IoT sensor deployment", "Data-driven farm management"],
    icon: "Cpu",
    color: "#06b6d4",
    category: "Technology",
  },
  {
    id: "mechanization",
    title: "Farm Mechanisation",
    description: "Tractor operation, mechanised planting systems, irrigation engineering, and equipment maintenance.",
    duration: "4 months",
    level: "Intermediate",
    certification: "NABTEB Certified",
    outcomes: ["Equipment operation & repair", "Irrigation system design", "Mechanised harvest"],
    icon: "Settings",
    color: "#f97316",
    category: "Technology",
  },
  {
    id: "food-processing",
    title: "Food Processing",
    description: "Post-harvest value addition, packaging, food safety standards, and product commercialisation.",
    duration: "3 months",
    level: "All Levels",
    certification: "NAFDAC Compliant",
    outcomes: ["Value-added product development", "Food safety & HACCP", "Packaging & branding"],
    icon: "Package",
    color: "#ec4899",
    category: "Processing",
  },
  {
    id: "agri-tech",
    title: "Agricultural Technology",
    description: "Agri-fintech, digital marketplaces, supply chain technology, and farm management software.",
    duration: "2 months",
    level: "Intermediate",
    certification: "Industry Certified",
    outcomes: ["Digital farm management", "Agri-fintech integration", "Supply chain optimisation"],
    icon: "Smartphone",
    color: "#6366f1",
    category: "Technology",
  },
  {
    id: "sustainable",
    title: "Sustainable Farming",
    description: "Regenerative agriculture, carbon sequestration, organic certification, and climate-smart practices.",
    duration: "3 months",
    level: "All Levels",
    certification: "Organic Certified",
    outcomes: ["Regenerative soil practices", "Carbon credit programmes", "Organic certification pathway"],
    icon: "Leaf",
    color: "#22c55e",
    category: "Sustainability",
  },
  {
    id: "entrepreneurship",
    title: "Farm Entrepreneurship",
    description: "Startup incubation, investor pitching, cooperative development, and scaling farm businesses.",
    duration: "2 months",
    level: "All Levels",
    certification: "Industry Certified",
    outcomes: ["Investor-ready business plan", "Cooperative structuring", "Funding access & pitching"],
    icon: "Rocket",
    color: "#f43f5e",
    category: "Business",
  },
];

export const ACADEMY_INSTRUCTORS: AcademyInstructor[] = [
  {
    id: 1,
    name: "Dr. Chukwuemeka Obi",
    role: "Head of Crop Science",
    specialty: "Soil Science & Agronomy",
    experience: "15 years",
    credentials: ["PhD Agronomy, University of Ibadan", "FAO Certified Agronomist", "IITA Research Fellow"],
    initials: "CO",
    color: "#2d5f3f",
  },
  {
    id: 2,
    name: "Alhaji Musa Garba",
    role: "Livestock Programme Lead",
    specialty: "Animal Husbandry & Veterinary Science",
    experience: "20 years",
    credentials: ["BVM&S, ABU Zaria", "MRCVS Registered", "National Livestock Development Board"],
    initials: "MG",
    color: "#4a7c59",
  },
  {
    id: 3,
    name: "Mrs. Ngozi Eze",
    role: "Aquaculture Programme Lead",
    specialty: "Fisheries & Aquaculture Systems",
    experience: "12 years",
    credentials: ["MSc Fisheries, UNIPORT", "FAO Aquaculture Specialist", "NIFR Research Associate"],
    initials: "NE",
    color: "#3b82f6",
  },
  {
    id: 4,
    name: "Mr. Tunde Adeyemi",
    role: "Agribusiness & Finance Lead",
    specialty: "Agricultural Economics & Business",
    experience: "10 years",
    credentials: ["MBA Agribusiness, LBS", "Certified Agribusiness Consultant", "CBN AgriFinance Expert"],
    initials: "TA",
    color: "#8b5cf6",
  },
];

export const ACADEMY_PARTNERS = [
  { name: "Federal Ministry of Agriculture", category: "Government" },
  { name: "NABTEB", category: "Certification" },
  { name: "IITA", category: "Research" },
  { name: "University of Ibadan", category: "Academia" },
  { name: "FAO Nigeria", category: "International" },
  { name: "Lagos State ADP", category: "Government" },
  { name: "Bank of Agriculture", category: "Finance" },
  { name: "Olam Agri", category: "Industry" },
];

export const ACADEMY_FAQS: FAQItem[] = [
  {
    question: "Who can enrol in Kuyash Farm Academy?",
    answer: "Anyone with a passion for agriculture can enrol. Our programs are designed for school leavers, university graduates, working professionals transitioning to farming, and existing farmers looking to upgrade their skills. No prior farming experience is required for beginner-level programs.",
  },
  {
    question: "Are your certifications recognised nationally?",
    answer: "Yes. Our core programs are certified under NABTEB (National Business and Technical Examinations Board), which is nationally recognised across Nigeria. Graduates receive certificates that are valid for employment, business registration, and further academic progression.",
  },
  {
    question: "Is accommodation available for out-of-state students?",
    answer: "Yes. We provide comfortable on-campus accommodation for students travelling from outside Lagos. Accommodation is available for both short courses and full programs. Contact our admissions office for availability and rates.",
  },
  {
    question: "Do you offer payment plans or scholarships?",
    answer: "We offer flexible instalment payment plans for full programs. We also run scholarship programmes in partnership with the Bank of Agriculture and Lagos State Government, targeted at young farmers aged 18–35. Check our admissions page for current openings.",
  },
  {
    question: "What happens after I complete the program?",
    answer: "Graduates receive a certificate of completion, access to our alumni network of 500+ farmers, job placement support through our industry partners, and priority access to our business incubation programme for graduates looking to start their own farm businesses.",
  },
  {
    question: "How practical are the training programs?",
    answer: "Extremely practical. A minimum of 60% of every program is hands-on field training conducted on our working farm. Students work directly with livestock, crops, fish ponds, and modern equipment. Theory is only taught in context — to explain what you are already doing.",
  },
];

export const ADMISSION_STEPS = [
  { step: "01", title: "Apply Online", description: "Fill out our application form with your details and preferred programme.", icon: "ClipboardList" },
  { step: "02", title: "Application Review", description: "Our admissions team reviews your application within 48 hours.", icon: "Search" },
  { step: "03", title: "Interview", description: "A short virtual or in-person interview to understand your goals.", icon: "MessageSquare" },
  { step: "04", title: "Admission & Payment", description: "Receive your admission letter and confirm your enrolment.", icon: "CheckCircle" },
  { step: "05", title: "Orientation", description: "A two-day orientation introducing campus, instructors, and peers.", icon: "Users" },
  { step: "06", title: "Practical Training", description: "Immersive hands-on learning on our 40-acre working farm.", icon: "Sprout" },
  { step: "07", title: "Assessment", description: "Practical assessments, projects, and industry evaluations.", icon: "BarChart2" },
  { step: "08", title: "Certification", description: "Graduate with a NABTEB-certified qualification and portfolio.", icon: "Award" },
];

export const WHY_JOIN = [
  { icon: "Sprout", title: "Hands-On Training", description: "All classes are conducted on our working farm. You learn by doing, not just listening." },
  { icon: "Users", title: "Expert Instructors", description: "Learn directly from experienced farmers and agricultural specialists with 10+ years in the field." },
  { icon: "Award", title: "Certificate of Completion", description: "Receive a recognised certificate after every class to boost your credibility and career." },
  { icon: "Handshake", title: "Farmer Network", description: "Connect with other farmers and entrepreneurs. Our alumni community is a lifelong resource." },
  { icon: "Lightbulb", title: "Practical Knowledge", description: "No fluff. Every session covers real-world challenges you will face on your farm." },
  { icon: "TrendingUp", title: "Business Focus", description: "We don't just teach farming — we teach profitable farming. Learn how to grow your income." },
];

export const TESTIMONIALS = [
  {
    name: "Adaeze Okonkwo",
    role: "Poultry Farmer, Ogun State",
    quote: "After attending the poultry class, I restructured my feeding system and cut costs by 30%. The instructors were incredibly practical.",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=200",
    stat: "30% cost reduction",
    program: "Poultry Production",
  },
  {
    name: "Emeka Nwachukwu",
    role: "Crop Farmer, Anambra",
    quote: "The soil health class changed how I see farming entirely. My tomato yield doubled in the next season.",
    image: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?q=80&w=200",
    stat: "2× yield increase",
    program: "Crop Production",
  },
  {
    name: "Fatima Bello",
    role: "Fish Farmer, Abuja",
    quote: "I came with zero aquaculture knowledge and left confident enough to start my own pond farm. Highly recommended.",
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=200",
    stat: "₦4.2M first harvest",
    program: "Aquaculture",
  },
];

export const CURRICULUM_ITEMS = [
  "Soil preparation & fertility",
  "Irrigation & water management",
  "Organic pest control",
  "Animal health & nutrition",
  "Post-harvest handling",
  "Farm record keeping",
  "Agro-processing basics",
  "Market access & pricing",
];

export const ACADEMY_STATS = [
  { value: 500, suffix: "+", label: "Graduates Trained" },
  { value: 12, suffix: "+", label: "Certified Programs" },
  { value: 98, suffix: "%", label: "Satisfaction Rate" },
  { value: 10, suffix: "+", label: "Expert Instructors" },
  { value: 40, suffix: " acres", label: "Working Farm Campus" },
  { value: 85, suffix: "%", label: "Employment Rate" },
];
