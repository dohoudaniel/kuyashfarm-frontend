/**
 * Service page content. Pure marketing copy with no business records in it.
 */

import {
  Leaf,
  TrendingUp,
  Users,
  Award,
  Droplets,
  Sun,
  Sprout,
  Package,
  BarChart3,
  Cpu,
  Cloud,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ServiceProcess {
  phase: string;
  title: string;
  description: string;
  icon: LucideIcon;
  duration: string;
}

export interface ServiceTechnology {
  title: string;
  description: string;
  icon: LucideIcon;
  metrics?: string;
}

export interface ServiceFeature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface ServiceContent {
  heroImage: string;
  heroVideo?: string;
  shopHref: string;
  overview: string;
  stats: Array<{ value: string; label: string; description?: string }>;
  farmingProcess: ServiceProcess[];
  technology: ServiceTechnology[];
  features: ServiceFeature[];
  benefits: string[];
  gallery: string[];
  beforeAfter?: {
    before: string;
    after: string;
    title: string;
    description: string;
  };
}

export const SERVICE_CONTENT: Record<string, ServiceContent> = {
  "crop-vegetable-production": {
    heroImage: "/images/stock/maize-seedlings.webp",
    heroVideo: "/videos/farm-hero.mp4",
    shopHref: "/shop/vegetables",
    overview:
      "At Kuyash Farms, we combine traditional agricultural wisdom with cutting-edge technology to grow premium-quality crops and fresh vegetables. Our commitment to sustainable innovation ensures superior produce while protecting the environment for future generations.",
    stats: [
      { value: "500+", label: "Hectares Under Cultivation", description: "Across 3 climate-controlled zones" },
      { value: "50+", label: "Premium Crop Varieties", description: "Seasonally rotated selection" },
      { value: "100%", label: "Organic Certified", description: "International standards compliance" },
      { value: "60%", label: "Water Savings", description: "Through smart irrigation" },
    ],
    farmingProcess: [
      {
        phase: "01",
        title: "Soil Preparation & Analysis",
        description: "Advanced soil testing and organic enrichment to create the optimal growing environment. Our lab analyzes nutrient levels, pH balance, and microbial health.",
        icon: Sprout,
        duration: "2–3 weeks",
      },
      {
        phase: "02",
        title: "Smart Seeding",
        description: "Precision planting using GPS-guided systems and carefully selected organic seeds. Each crop is positioned for maximum sunlight exposure and growth potential.",
        icon: Sun,
        duration: "1 week",
      },
      {
        phase: "03",
        title: "Intelligent Irrigation",
        description: "IoT-enabled drip irrigation systems monitor soil moisture in real-time, delivering precise water amounts only when needed, reducing water usage by 60%.",
        icon: Droplets,
        duration: "Ongoing",
      },
      {
        phase: "04",
        title: "Growth Monitoring",
        description: "Daily monitoring using drone technology and AI-powered analytics to detect early signs of stress, disease, or nutrient deficiency.",
        icon: BarChart3,
        duration: "8–12 weeks",
      },
      {
        phase: "05",
        title: "Harvest & Quality Control",
        description: "Peak-ripeness harvesting with immediate quality checks. Every batch is tested for freshness, nutrition content, and organic certification compliance.",
        icon: Package,
        duration: "1–2 weeks",
      },
    ],
    technology: [
      { title: "Precision Agriculture", description: "GPS-guided tractors and automated systems ensure consistent planting depth, spacing, and seed placement for optimal crop uniformity.", icon: Cpu, metrics: "99.8% planting accuracy" },
      { title: "Climate Control Systems", description: "Real-time weather monitoring and predictive analytics help us make data-driven decisions about irrigation, harvesting, and crop protection.", icon: Cloud, metrics: "30% yield increase" },
      { title: "Smart Sensors Network", description: "Over 500 IoT sensors across our farms continuously monitor soil moisture, temperature, humidity, and nutrient levels.", icon: Zap, metrics: "60% water savings" },
      { title: "Drone Surveillance", description: "Weekly aerial imaging using multispectral cameras to detect crop health issues invisible to the human eye before they become problems.", icon: BarChart3, metrics: "Early detection 95%" },
    ],
    features: [
      { icon: Leaf, title: "100% Organic Certified", description: "Internationally certified organic farming practices with zero synthetic pesticides or chemical fertilizers." },
      { icon: TrendingUp, title: "Data-Driven Farming", description: "AI-powered analytics optimize every aspect of crop production from seed selection to harvest timing." },
      { icon: Droplets, title: "Water Conservation", description: "Advanced irrigation technology reduces water consumption by 60% while improving crop yield and quality." },
      { icon: Award, title: "Quality Assurance", description: "Multi-stage quality control process ensures only premium-grade produce reaches your table." },
    ],
    benefits: [
      "Certified organic produce free from harmful chemicals",
      "Maximum nutritional value through optimal harvest timing",
      "Consistent quality through advanced monitoring systems",
      "Sustainable practices that regenerate soil health",
      "Complete traceability from seed to harvest",
      "Year-round supply with seasonal variety rotation",
      "Premium freshness with farm-to-table in 24 hours",
      "Support for innovation in sustainable agriculture",
    ],
    beforeAfter: {
      before: "/images/stock/wheat-field-sunset.webp",
      after: "/images/stock/maize-seedlings.webp",
      title: "Sustainable Transformation",
      description: "See how our innovative farming practices transformed conventional farmland into a thriving organic ecosystem in just 18 months.",
    },
    gallery: [
      "/images/stock/maize-seedlings.webp",
      "/images/stock/field-aerial.webp",
      "/images/stock/mixed-vegetables.webp",
      "/images/stock/seedling-trays.webp",
      "/images/stock/soil-preparation.webp",
      "/images/stock/harvest-workers.webp",
    ],
  },

  "livestock-poultry-farming": {
    heroImage: "/images/stock/free-range-hens.webp",
    shopHref: "/shop/poultry",
    overview:
      "At Kuyash Farms, we raise healthy, high-quality livestock and poultry using modern animal husbandry practices. From free-range chickens to well-fed cattle and sheep, every animal is cared for in a clean, humane, and stress-free environment — ensuring premium quality meat, eggs, and dairy for our customers.",
    stats: [
      { value: "5,000+", label: "Poultry Birds Raised", description: "Free-range chickens and layers" },
      { value: "200+", label: "Livestock Units", description: "Cattle, sheep, and goats" },
      { value: "100%", label: "Antibiotic-Free", description: "Natural rearing practices" },
      { value: "40%", label: "Lower Mortality Rate", description: "Through smart monitoring" },
    ],
    farmingProcess: [
      { phase: "01", title: "Animal Selection & Breeding", description: "We source only the best breeds suited for our climate and production goals. Selective breeding programs ensure healthy genetics, disease resistance, and high yield performance.", icon: Users, duration: "Ongoing" },
      { phase: "02", title: "Housing & Environment Setup", description: "Modern, ventilated pens and coops provide comfort and reduce stress. Proper spacing, bedding, and sanitation systems maintain a clean and safe living environment for all animals.", icon: Sprout, duration: "Permanent" },
      { phase: "03", title: "Nutrition & Feed Management", description: "Balanced, nutrient-rich feed rations are formulated by our animal nutrition experts. We incorporate locally sourced grains, supplements, and forage to support optimal growth and health.", icon: Leaf, duration: "Daily" },
      { phase: "04", title: "Veterinary Care & Monitoring", description: "Regular health checks, vaccinations, and disease monitoring by licensed veterinarians. We use IoT-based ear tags and sensors to track animal vitals, weight, and movement in real time.", icon: BarChart3, duration: "Weekly" },
      { phase: "05", title: "Harvest & Processing", description: "Humane slaughter practices following international standards. Our in-house processing facility ensures rapid, hygienic handling to preserve freshness and quality from farm to table.", icon: Package, duration: "As needed" },
    ],
    technology: [
      { title: "Smart Livestock Tracking", description: "IoT-enabled ear tags and RFID systems monitor each animal's location, health status, and weight gain in real time, enabling early detection of illness and optimized feeding schedules.", icon: Cpu, metrics: "98% health detection accuracy" },
      { title: "Automated Feeding Systems", description: "Computer-controlled feeders dispense precise rations at scheduled intervals, reducing waste and ensuring every animal receives optimal nutrition throughout the day.", icon: Zap, metrics: "25% feed cost reduction" },
      { title: "Climate-Controlled Housing", description: "Automated ventilation and temperature control systems maintain ideal living conditions for poultry and livestock, reducing mortality rates and improving production output.", icon: Cloud, metrics: "40% mortality rate reduction" },
      { title: "Data-Driven Herd Management", description: "AI-powered analytics process health and growth data across the herd to identify trends, predict yield, and guide management decisions for maximum efficiency.", icon: BarChart3, metrics: "30% productivity increase" },
    ],
    features: [
      { icon: Leaf, title: "Free-Range & Humane", description: "All animals are raised with ample space, natural light, and freedom of movement — meeting the highest standards of animal welfare." },
      { icon: Award, title: "Certified Quality", description: "Our meat and poultry products meet national food safety and quality certification standards, from farm to your plate." },
      { icon: TrendingUp, title: "High-Yield Breeds", description: "We select and breed animals for superior growth rates and production performance, ensuring consistent output and profitability." },
      { icon: Users, title: "Expert Animal Care", description: "A dedicated team of veterinarians and animal husbandry specialists ensures every animal receives the best possible care." },
    ],
    benefits: [
      "Premium quality, antibiotic-free meat, eggs, and dairy",
      "Humanely raised animals with free-range access",
      "Consistent supply of fresh poultry and livestock products",
      "Full traceability from farm to processing to table",
      "Certified veterinary oversight and health records",
      "Nutritious feed formulations for superior animal health",
      "Sustainable waste management and manure composting",
      "Support for local farming communities and livelihoods",
    ],
    beforeAfter: {
      before: "/images/stock/wheat-field-sunset.webp",
      after: "/images/stock/free-range-hens.webp",
      title: "Modern Animal Husbandry",
      description: "See how our technology-driven approach transformed traditional livestock rearing into a clean, efficient, and high-yield farming operation.",
    },
    gallery: [
      "/images/stock/free-range-hens.webp",
      "/images/stock/whole-chicken.webp",
      "/images/stock/brown-eggs.webp",
      "/images/stock/piglet-in-straw.webp",
      "/images/stock/mixed-vegetables.webp",
      "/images/stock/crop-rows.webp",
    ],
  },

  "fish-farming": {
    heroImage: "/images/stock/clownfish.webp",
    shopHref: "/shop/fishery",
    overview:
      "Kuyash Farms operates a sustainable aquaculture system that produces fresh, high-quality fish year-round. Using recirculating aquaculture systems (RAS) and natural pond farming, we raise tilapia, catfish, and other species in a clean, controlled environment — ensuring premium freshness and flavour for every customer.",
    stats: [
      { value: "10,000+", label: "Fish Produced Per Cycle", description: "Tilapia, catfish, and more" },
      { value: "95%", label: "Water Recycled", description: "Via closed-loop RAS systems" },
      { value: "100%", label: "Antibiotic-Free", description: "Natural, chemical-free rearing" },
      { value: "30%", label: "Less Feed Waste", description: "Through automated feeding" },
    ],
    farmingProcess: [
      { phase: "01", title: "Pond & Tank Preparation", description: "Ponds are cleaned, limed, and filled with well-aerated water before each cycle. Our RAS tanks are sterilised and fitted with biological filters to maintain pristine water quality from day one.", icon: Droplets, duration: "1–2 weeks" },
      { phase: "02", title: "Fingerling Stocking", description: "Healthy fingerlings sourced from certified hatcheries are acclimatised and stocked at optimal densities. Each batch is inspected for disease and parasite-free status before introduction.", icon: Sprout, duration: "1 week" },
      { phase: "03", title: "Feeding & Nutrition", description: "Scientifically formulated feeds are administered multiple times daily using automated feeders. Feed conversion ratios are monitored closely to minimise waste and maximise growth rates.", icon: Leaf, duration: "Daily" },
      { phase: "04", title: "Water Quality Monitoring", description: "IoT sensors continuously track dissolved oxygen, pH, ammonia, and temperature. Automated alerts and real-time dashboards allow instant corrective action to prevent fish stress or mortality.", icon: BarChart3, duration: "Continuous" },
      { phase: "05", title: "Harvest & Processing", description: "Fish are harvested at peak market weight, immediately chilled, and processed under hygienic conditions. Our cold-chain logistics ensure freshness is preserved from pond to delivery.", icon: Package, duration: "Per cycle" },
    ],
    technology: [
      { title: "Recirculating Aquaculture Systems", description: "Closed-loop RAS technology recycles up to 95% of water, dramatically reducing consumption while maintaining ideal water parameters for rapid, healthy fish growth.", icon: Droplets, metrics: "95% water recycled" },
      { title: "IoT Water Quality Sensors", description: "A network of real-time sensors monitors dissolved oxygen, pH, temperature, and ammonia levels 24/7, triggering automated alerts before conditions become critical.", icon: Cpu, metrics: "99% uptime monitoring" },
      { title: "Automated Feeding Systems", description: "Demand-driven automatic feeders dispense precise portions based on fish activity, reducing feed waste by up to 30% and improving feed conversion efficiency.", icon: Zap, metrics: "30% feed waste reduction" },
      { title: "Data Analytics & Yield Forecasting", description: "AI-powered growth models analyse historical and real-time data to forecast harvest dates, predict yield, and optimise stocking density for each production cycle.", icon: BarChart3, metrics: "20% yield improvement" },
    ],
    features: [
      { icon: Droplets, title: "Sustainable Water Use", description: "Our RAS technology recycles up to 95% of water, making our fish farming one of the most water-efficient operations in the region." },
      { icon: Award, title: "Certified Fresh Quality", description: "Every batch is inspected and certified for freshness, safety, and quality before leaving our farm — guaranteed farm-to-table excellence." },
      { icon: TrendingUp, title: "Year-Round Production", description: "Controlled indoor systems allow us to produce fresh fish 365 days a year, regardless of season or weather conditions." },
      { icon: Leaf, title: "Chemical-Free Rearing", description: "No antibiotics or growth hormones are used. Our fish are raised naturally in clean water with balanced nutrition for safe, healthy consumption." },
    ],
    benefits: [
      "Fresh, antibiotic-free fish available year-round",
      "Sustainably farmed with minimal environmental impact",
      "Traceable from hatchery to harvest to your table",
      "Superior taste and texture from stress-free rearing",
      "Consistent supply secured through RAS production cycles",
      "Multiple species available — tilapia, catfish, and more",
      "Cold-chain delivery preserving maximum freshness",
      "Support for sustainable aquaculture and food security",
    ],
    beforeAfter: {
      before: "/images/stock/wheat-field-sunset.webp",
      after: "/images/stock/clownfish.webp",
      title: "From Traditional Ponds to Smart Aquaculture",
      description: "See how we transformed conventional open-pond fish farming into a high-yield, technology-driven aquaculture operation with superior water efficiency and output.",
    },
    gallery: [
      "/images/stock/clownfish.webp",
      "/images/stock/betta-fish.webp",
      "/images/stock/still-water-horizon.webp",
      "/images/stock/mountains-above-cloud.webp",
      "/images/stock/mixed-vegetables.webp",
      "/images/stock/red-apples.webp",
    ],
  },

  "palm-oil-production": {
    heroImage: "/images/stock/potatoes.webp",
    shopHref: "/shop",
    overview:
      "Kuyash Farms cultivates oil palm plantations using responsible, high-yield agronomic practices. We produce premium-grade crude palm oil (CPO) and palm kernel oil (PKO) through modern milling and extraction processes — balancing productivity with environmental stewardship and community development.",
    stats: [
      { value: "1,000+", label: "Hectares Under Cultivation", description: "Mature and developing plantations" },
      { value: "92%", label: "Oil Extraction Rate", description: "Industry-leading mill efficiency" },
      { value: "25+", label: "Years Palm Lifespan", description: "Elite tenera hybrid varieties" },
      { value: "40%", label: "Water Savings", description: "Through smart irrigation" },
    ],
    farmingProcess: [
      { phase: "01", title: "Land Preparation & Nursery", description: "Selected land is cleared responsibly, with soil analysis guiding fertilisation plans. High-yielding, disease-resistant seedlings are germinated in our nursery and nurtured for 12–18 months before field transplanting.", icon: Sprout, duration: "12–18 months" },
      { phase: "02", title: "Planting & Establishment", description: "Seedlings are transplanted at optimal spacing to allow full canopy development and mechanised access. Cover crops are planted between rows to prevent erosion and fix nitrogen in the soil.", icon: Sun, duration: "3–4 months" },
      { phase: "03", title: "Plantation Management", description: "Regular pruning, controlled fertilisation, and integrated pest management keep the palms healthy and productive. Soil moisture sensors guide irrigation scheduling to conserve water during dry seasons.", icon: Droplets, duration: "Ongoing" },
      { phase: "04", title: "Harvest & Fresh Fruit Bunch Collection", description: "Trained harvesters cut fresh fruit bunches (FFB) at peak ripeness using long-handled chisels. FFBs are transported to our mill within 24 hours to preserve oil quality and minimise free fatty acid buildup.", icon: Package, duration: "Year-round" },
      { phase: "05", title: "Milling & Oil Extraction", description: "FFBs are sterilised, stripped, and pressed in our on-site mill. Crude palm oil is clarified, dried, and stored in temperature-controlled tanks. Palm kernels are processed separately for PKO and palm kernel cake.", icon: BarChart3, duration: "48–72 hrs per batch" },
    ],
    technology: [
      { title: "Precision Fertilisation", description: "GPS-guided variable-rate fertiliser applicators deliver the exact nutrient blend each palm requires based on leaf tissue analysis and soil health data, cutting input costs significantly.", icon: Cpu, metrics: "25% fertiliser savings" },
      { title: "Drone Canopy Monitoring", description: "Multispectral drone imaging detects early signs of nutrient deficiency, pest infestation, and disease across thousands of hectares — enabling targeted, timely intervention.", icon: Cloud, metrics: "Early detection 90%+" },
      { title: "Smart Irrigation Systems", description: "Soil moisture sensors and automated drip irrigation deliver water precisely where and when needed, improving palm health during dry periods while conserving resources.", icon: Droplets, metrics: "40% water savings" },
      { title: "Mill Process Automation", description: "Our milling facility uses automated sterilisation, pressing, and clarification controls to maximise oil extraction rates and maintain consistent crude palm oil quality.", icon: Zap, metrics: "92% oil extraction rate" },
    ],
    features: [
      { icon: Leaf, title: "Sustainable Cultivation", description: "We follow RSPO-aligned practices — no deforestation of high conservation value land, responsible pesticide use, and active soil health management." },
      { icon: Award, title: "Premium Grade Output", description: "Our milling process consistently produces low free fatty acid CPO, meeting the highest commercial and food-grade quality standards." },
      { icon: TrendingUp, title: "High-Yield Varieties", description: "We plant elite, disease-resistant tenera hybrid varieties selected for superior oil extraction rates and long productive lifespans of 25+ years." },
      { icon: Users, title: "Community Inclusion", description: "Smallholder outgrower programmes connect local farmers to our supply chain, providing technical support, fair pricing, and shared prosperity." },
    ],
    benefits: [
      "Premium-grade crude palm oil with low free fatty acid content",
      "Sustainably produced following responsible land-use practices",
      "Year-round production from mature, high-yield palm plantations",
      "Full traceability from plantation to mill to customer",
      "Palm kernel oil and cake as valuable co-products",
      "Competitive bulk pricing for industrial and commercial buyers",
      "RSPO-aligned practices protecting biodiversity and communities",
      "Outgrower support empowering local smallholder farmers",
    ],
    beforeAfter: {
      before: "/images/stock/wheat-field-sunset.webp",
      after: "/images/stock/potatoes.webp",
      title: "Responsible Palm Oil Farming",
      description: "See how our precision agronomy and responsible land management transformed underutilised land into a thriving, high-yield palm oil plantation.",
    },
    gallery: [
      "/images/stock/potatoes.webp",
      "/images/stock/mixed-vegetables.webp",
      "/images/stock/seedling-trays.webp",
      "/images/stock/maize-seedlings.webp",
      "/images/stock/soil-preparation.webp",
      "/images/stock/red-apples.webp",
    ],
  },
};
