// Programmatic city data generator for 500+ US cities
// This will connect to your MongoDB to get real provider counts and services

export interface CityData {
  slug: string
  name: string
  state: string
  stateAbbr: string
  population: string
  coords: [number, number]
  metro?: string
  providerCount?: number
  freeClinicCount?: number
  avgSavings?: string
  topServices?: string[]
  neighborhoods?: string[]
}

// Cities where we have actual provider and service data
export const US_CITIES: CityData[] = [
  // Washington DC Metro Area
  { slug: 'washington-dc', name: 'Washington', state: 'DC', stateAbbr: 'DC', population: '690K', coords: [-77.0369, 38.9072], metro: 'Washington Metro Area', neighborhoods: ['Georgetown', 'Capitol Hill', 'Dupont Circle', 'Adams Morgan', 'Columbia Heights', 'Shaw'] },
  
  // Maryland Cities
  { slug: 'baltimore', name: 'Baltimore', state: 'Maryland', stateAbbr: 'MD', population: '586K', coords: [-76.6122, 39.2904], metro: 'Baltimore Metro', neighborhoods: ['Inner Harbor', 'Canton', 'Fells Point', 'Federal Hill', 'Mount Vernon'] },
  { slug: 'rockville', name: 'Rockville', state: 'Maryland', stateAbbr: 'MD', population: '68K', coords: [-77.1528, 39.0840], metro: 'Washington Metro Area' },
  { slug: 'silver-spring', name: 'Silver Spring', state: 'Maryland', stateAbbr: 'MD', population: '82K', coords: [-77.0261, 38.9907], metro: 'Washington Metro Area' },
  { slug: 'bethesda', name: 'Bethesda', state: 'Maryland', stateAbbr: 'MD', population: '63K', coords: [-77.0947, 38.9807], metro: 'Washington Metro Area' },
  { slug: 'gaithersburg', name: 'Gaithersburg', state: 'Maryland', stateAbbr: 'MD', population: '69K', coords: [-77.2014, 39.1434], metro: 'Washington Metro Area' },
  { slug: 'annapolis', name: 'Annapolis', state: 'Maryland', stateAbbr: 'MD', population: '39K', coords: [-76.4922, 38.9784] },
  
  // Virginia Cities  
  { slug: 'alexandria', name: 'Alexandria', state: 'Virginia', stateAbbr: 'VA', population: '159K', coords: [-77.0469, 38.8048], metro: 'Washington Metro Area', neighborhoods: ['Old Town', 'Del Ray', 'West End'] },
  { slug: 'arlington', name: 'Arlington', state: 'Virginia', stateAbbr: 'VA', population: '238K', coords: [-77.1067, 38.8816], metro: 'Washington Metro Area', neighborhoods: ['Rosslyn', 'Ballston', 'Clarendon', 'Crystal City'] },
  { slug: 'fairfax', name: 'Fairfax', state: 'Virginia', stateAbbr: 'VA', population: '24K', coords: [-77.3064, 38.8462], metro: 'Washington Metro Area' },
  { slug: 'richmond', name: 'Richmond', state: 'Virginia', stateAbbr: 'VA', population: '230K', coords: [-77.4360, 37.5407], metro: 'Greater Richmond', neighborhoods: ['Fan District', 'Carytown', 'Church Hill', 'Scott\'s Addition'] },
  { slug: 'virginia-beach', name: 'Virginia Beach', state: 'Virginia', stateAbbr: 'VA', population: '459K', coords: [-75.9780, 36.8529] },
  { slug: 'norfolk', name: 'Norfolk', state: 'Virginia', stateAbbr: 'VA', population: '245K', coords: [-76.2859, 36.8508] },
  
  // Minnesota Cities
  { slug: 'minneapolis', name: 'Minneapolis', state: 'Minnesota', stateAbbr: 'MN', population: '429K', coords: [-93.2650, 44.9778], metro: 'Twin Cities', neighborhoods: ['Downtown', 'North Loop', 'Northeast', 'Uptown', 'South Minneapolis'] },
  { slug: 'st-paul', name: 'St. Paul', state: 'Minnesota', stateAbbr: 'MN', population: '308K', coords: [-93.0900, 44.9537], metro: 'Twin Cities' },
  { slug: 'bloomington', name: 'Bloomington', state: 'Minnesota', stateAbbr: 'MN', population: '87K', coords: [-93.2983, 44.8408], metro: 'Twin Cities' },
  { slug: 'duluth', name: 'Duluth', state: 'Minnesota', stateAbbr: 'MN', population: '86K', coords: [-92.1005, 46.7867] },
  { slug: 'rochester', name: 'Rochester', state: 'Minnesota', stateAbbr: 'MN', population: '122K', coords: [-92.4802, 44.0121] },
  
  // California Bay Area Cities
  { slug: 'san-francisco', name: 'San Francisco', state: 'California', stateAbbr: 'CA', population: '874K', coords: [-122.4194, 37.7749], metro: 'Bay Area', neighborhoods: ['Mission District', 'SOMA', 'Castro', 'Richmond District', 'Sunset District', 'Marina', 'Pacific Heights'] },
  { slug: 'oakland', name: 'Oakland', state: 'California', stateAbbr: 'CA', population: '440K', coords: [-122.2712, 37.8044], metro: 'Bay Area', neighborhoods: ['Downtown', 'Uptown', 'Jack London Square', 'Temescal'] },
  { slug: 'san-jose', name: 'San Jose', state: 'California', stateAbbr: 'CA', population: '1.0M', coords: [-121.8863, 37.3382], metro: 'Bay Area' },
  { slug: 'berkeley', name: 'Berkeley', state: 'California', stateAbbr: 'CA', population: '124K', coords: [-122.2728, 37.8716], metro: 'Bay Area' },
  { slug: 'san-mateo', name: 'San Mateo', state: 'California', stateAbbr: 'CA', population: '106K', coords: [-122.3255, 37.5630], metro: 'Bay Area' },
  { slug: 'palo-alto', name: 'Palo Alto', state: 'California', stateAbbr: 'CA', population: '67K', coords: [-122.1430, 37.4419], metro: 'Bay Area' },
  { slug: 'fremont', name: 'Fremont', state: 'California', stateAbbr: 'CA', population: '240K', coords: [-121.9886, 37.5485], metro: 'Bay Area' }
]

// Function to get provider data for a city from database
export async function getCityProviderData(_slug?: string, _coords?: [number, number]) {
  void _slug
  void _coords
  // In production, this would query MongoDB for providers near these coordinates
  // Using the location field with MongoDB geospatial queries
  
  // Sample query structure:
  // const providers = await db.providers.find({
  //   location: {
  //     $near: {
  //       $geometry: { type: "Point", coordinates: coords },
  //       $maxDistance: 50000 // 50km radius
  //     }
  //   }
  // })
  
  // For now, return mock data
  return {
    providerCount: Math.floor(Math.random() * 300) + 100,
    freeClinicCount: Math.floor(Math.random() * 50) + 10,
    avgSavings: `$${Math.floor(Math.random() * 2000) + 1500}`,
    topCategories: ['Primary Care', 'Dental', 'Mental Health', 'Urgent Care'],
    avgPrices: {
      primaryCare: '$20-75',
      dental: '$30-100',
      mentalHealth: '$40-120',
      urgentCare: '$50-150'
    }
  }
}

// Function to get service pricing data
export async function getCityServicePricing(_slug?: string) {
  void _slug
  // In production, query prices-only collection for city-specific pricing
  // const pricing = await db['prices-only'].find({ city: cityName })
  
  return {
    cleaningExam: { our: '$89', market: '$200-300' },
    primaryVisit: { our: '$20-50', market: '$150-400' },
    therapy: { our: '$40-80', market: '$150-350' },
    urgentCare: { our: '$50-100', market: '$200-500' }
  }
}

// SEO content generator for each city
export function generateCitySEOContent(city: CityData) {
  return {
    title: `Affordable Healthcare in ${city.name}, ${city.stateAbbr} | Free Clinics & Low-Cost Care`,
    metaDescription: `Find affordable healthcare in ${city.name}. Compare prices at verified providers. Free clinics, sliding scale fees, no insurance needed. Save up to 80% on medical costs.`,
    h1: `Affordable Healthcare in ${city.name}, ${city.state}`,
    intro: `Access quality healthcare in ${city.name} without breaking the bank. Our AI-powered platform connects you with affordable providers, free clinics, and transparent pricing options throughout the ${city.metro || city.name} area.`,
    keywords: [
      `${city.name} free clinics`,
      `${city.name} affordable healthcare`,
      `${city.name} low cost medical care`,
      `${city.name} cheap dentist`,
      `${city.name} sliding scale therapy`,
      `${city.name} uninsured medical help`,
      `free healthcare ${city.name}`,
      `medicaid doctors ${city.name}`,
      `${city.name} community health centers`,
      `${city.name} FQHC`
    ]
  }
}
