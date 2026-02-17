// Mock route data for Thanjavur region
// These coordinates represent typical bus routes in and around Thanjavur

export const MOCK_ROUTES = {
  'R12': {
    id: 'R12',
    name: 'Central Bus Stand - Medical College',
    color: '#2563eb',
    coordinates: [
      { lat: 10.749, lng: 79.113 }, // New Bus Stand
      { lat: 10.749, lng: 79.116874 }, // RR Nagar
      { lat: 10.750864, lng: 79.118709 }, // Co Optex
      { lat: 10.75472, lng: 79.121948 }, // Cauvery Nagar
      { lat: 10.758015, lng: 79.125106 }, // Kulantha Yesu Kovil
      { lat: 10.762155, lng: 79.127597 }, // Old Housing Unit
      { lat: 10.764705, lng: 79.128891 }, // MR Hospital
      { lat: 10.768802, lng: 79.130701 }, // Rohini Hospital
      { lat: 10.772577, lng: 79.132863 }, // Ramanathan
      { lat: 10.773806, lng: 79.135661 }, // Philomena Mall
      { lat: 10.775154, lng: 79.138808 }, // Junction Back Side

      { lat: 10.77857, lng: 79.140159 }, // Junction Front Side
      { lat: 10.782027, lng: 79.139417 }, // Municipal Corporation
      { lat: 10.786, lng: 79.136 }, // Old Bus Stand
      { lat: 10.785226, lng: 79.133984 }, // Central library
      { lat: 10.781507, lng: 79.133674 }, // Rajali birds park
      { lat: 10.777673, lng: 79.129896 }, // Membalam
      { lat: 10.776376, lng: 79.127964 }, // Sathya stadium
      { lat: 10.775473, lng: 79.124841 }, // Rajappa nagar (or) SB hospital
      { lat: 10.774499, lng: 79.122650 }, // Balaji nagar (or) Jaya shakthi snacks
      { lat: 10.772855, lng: 79.118902 }, // Lakshmi seeval
      { lat: 10.770326, lng: 79.114574 }, // Sundaram nagar (or) IFB point
      { lat: 10.768177, lng: 79.111405 }, // Municipal colony (or) Nav barath school
      { lat: 10.766306, lng: 79.109130 }, // Eswari nagar (or) Trends
      { lat: 10.763144, lng: 79.106758 }, // Medical college 1st gate
      { lat: 10.761381, lng: 79.105026 }, // Medical college 2nd gate
      { lat: 10.760379, lng: 79.103774 }, // Medical college 3rd gate
      { lat: 10.759902, lng: 79.103191 }  // Medical college 4th gate
    ],
    stops: [
      { name: 'New Bus Stand', lat: 10.749, lng: 79.113 },
      { name: 'RR Nagar', lat: 10.749, lng: 79.116874 },
      { name: 'Co Optex', lat: 10.750864, lng: 79.118709 },
      { name: 'Cauvery Nagar', lat: 10.75472, lng: 79.121948 },
      { name: 'Kulantha Yesu Kovil', lat: 10.758015, lng: 79.125106 },
      { name: 'Old Housing Unit', lat: 10.762155, lng: 79.127597 },
      { name: 'MR Hospital', lat: 10.764705, lng: 79.128891 },
      { name: 'Rohini Hospital', lat: 10.768802, lng: 79.130701 },
      { name: 'Ramanathan (or) Manimandabam', lat: 10.772577, lng: 79.132863 },
      { name: 'Philomena Mall', lat: 10.773806, lng: 79.135661 },
      { name: 'Junction Back Side (or) Sacrad Heart School', lat: 10.775154, lng: 79.138808 },

      { name: 'Junction Front Side', lat: 10.77857, lng: 79.140159 },
      { name: 'Municipal Corporation', lat: 10.782027, lng: 79.139417 },
      { name: 'Old Bus Stand', lat: 10.786, lng: 79.136 },
      { name: 'Central library', lat: 10.785226, lng: 79.133984 },
      { name: 'Rajali birds park', lat: 10.781507, lng: 79.133674 },
      { name: 'Membalam', lat: 10.777673, lng: 79.129896 },
      { name: 'Sathya stadium', lat: 10.776376, lng: 79.127964 },
      { name: 'Rajappa nagar (or) SB hospital', lat: 10.775473, lng: 79.124841 },
      { name: 'Balaji nagar (or) Jaya shakthi snacks', lat: 10.774499, lng: 79.122650 },
      { name: 'Lakshmi seeval', lat: 10.772855, lng: 79.118902 },
      { name: 'Sundaram nagar (or) IFB point', lat: 10.770326, lng: 79.114574 },
      { name: 'Municipal colony (or) Nav barath school', lat: 10.768177, lng: 79.111405 },
      { name: 'Eswari nagar (or) Trends', lat: 10.766306, lng: 79.109130 },
      { name: 'Medical college 1st gate', lat: 10.763144, lng: 79.106758 },
      { name: 'Medical college 2nd gate', lat: 10.761381, lng: 79.105026 },
      { name: 'Medical college 3rd gate', lat: 10.760379, lng: 79.103774 },
      { name: 'Medical college 4th gate', lat: 10.759902, lng: 79.103191 }
    ]
  },

  'R15': {
    id: 'R15',
    name: 'Thanjavur - Trichy',
    color: '#dc2626',
    coordinates: [
      { lat: 10.7869, lng: 79.1378 }, // Thanjavur Bus Stand
      { lat: 10.7880, lng: 79.1360 },
      { lat: 10.7900, lng: 79.1340 },
      { lat: 10.7920, lng: 79.1320 },
      { lat: 10.7950, lng: 79.1300 },
      { lat: 10.8000, lng: 79.1250 },
      { lat: 10.8100, lng: 79.1200 },
      { lat: 10.8200, lng: 79.1150 },
      { lat: 10.8300, lng: 79.1100 },
      { lat: 10.8400, lng: 79.1050 },
      { lat: 10.8500, lng: 79.1000 },
      { lat: 10.7905, lng: 78.7047 }  // Trichy
    ],
    stops: [
      { name: 'Thanjavur Bus Stand', lat: 10.7869, lng: 79.1378 },
      { name: 'Thanjavur Junction', lat: 10.7880, lng: 79.1360 },
      { name: 'Orathanadu', lat: 10.8000, lng: 79.1250 },
      { name: 'Pattukottai', lat: 10.8300, lng: 79.1100 },
      { name: 'Trichy', lat: 10.7905, lng: 78.7047 }
    ]
  },

  'R08': {
    id: 'R08',
    name: 'Thanjavur - Mayiladuthurai',
    color: '#059669',
    coordinates: [
      { lat: 10.7869, lng: 79.1378 }, // Thanjavur Bus Stand
      { lat: 10.7890, lng: 79.1400 },
      { lat: 10.7920, lng: 79.1450 },
      { lat: 10.7950, lng: 79.1500 },
      { lat: 10.8000, lng: 79.1600 },
      { lat: 10.8100, lng: 79.1800 },
      { lat: 10.8200, lng: 79.2000 },
      { lat: 10.8300, lng: 79.2200 },
      { lat: 10.8400, lng: 79.2400 },
      { lat: 10.8500, lng: 79.2600 },
      { lat: 11.1085, lng: 79.8275 }  // Mayiladuthurai
    ],
    stops: [
      { name: 'Thanjavur Bus Stand', lat: 10.7869, lng: 79.1378 },
      { name: 'Thiruvaiyaru', lat: 10.7950, lng: 79.1500 },
      { name: 'Needamangalam', lat: 10.8200, lng: 79.2000 },
      { name: 'Thiruvidaimarudur', lat: 10.8400, lng: 79.2400 },
      { name: 'Mayiladuthurai', lat: 11.1085, lng: 79.8275 }
    ]
  }
}

// Mock bus stops data for Thanjavur region
export const MOCK_BUS_STOPS = [
  { id: 'CBS002', name: 'New Bus Stand', lat: 10.749, lng: 79.113 },
  { id: 'BS001', name: 'RR Nagar', lat: 10.749, lng: 79.116874 },
  { id: 'BS002', name: 'Co Optex', lat: 10.750864, lng: 79.118709 },
  { id: 'BS003', name: 'Cauvery Nagar', lat: 10.75472, lng: 79.121948 },
  { id: 'BS004', name: 'Kulantha Yesu Kovil', lat: 10.758015, lng: 79.125106 },
  { id: 'BS005', name: 'Old Housing Unit', lat: 10.762155, lng: 79.127597 },
  { id: 'BS014', name: 'MR Hospital', lat: 10.764705, lng: 79.128891 },
  { id: 'BS006', name: 'Rohini Hospital', lat: 10.768802, lng: 79.130701 },
  { id: 'BS007', name: 'Ramanathan (or) Manimandabam', lat: 10.772577, lng: 79.132863 },
  { id: 'BS008', name: 'Philomena Mall', lat: 10.773806, lng: 79.135661 },
  { id: 'BS009', name: 'Junction Back Side (or) Sacrad Heart School', lat: 10.775154, lng: 79.138808 },

  { id: 'BS010', name: 'Junction Front Side', lat: 10.77857, lng: 79.140159 },
  { id: 'BS013', name: 'Municipal Corporation', lat: 10.782027, lng: 79.139417 },
  { id: 'OBS002', name: 'Old Bus Stand', lat: 10.786, lng: 79.136 },
  { id: 'BS015', name: 'Central library', lat: 10.785226, lng: 79.133984 },
  { id: 'BS016', name: 'Rajali birds park', lat: 10.781507, lng: 79.133674 },
  { id: 'BS017', name: 'Membalam', lat: 10.777673, lng: 79.129896 },
  { id: 'BS018', name: 'Sathya stadium', lat: 10.776376, lng: 79.127964 },
  { id: 'BS019', name: 'Rajappa nagar (or) SB hospital', lat: 10.775473, lng: 79.124841 },
  { id: 'BS020', name: 'Balaji nagar (or) Jaya shakthi snacks', lat: 10.774499, lng: 79.122650 },
  { id: 'BS021', name: 'Lakshmi seeval', lat: 10.772855, lng: 79.118902 },
  { id: 'BS022', name: 'Sundaram nagar (or) IFB point', lat: 10.770326, lng: 79.114574 },
  { id: 'BS023', name: 'Municipal colony (or) Nav barath school', lat: 10.768177, lng: 79.111405 },
  { id: 'BS024', name: 'Eswari nagar (or) Trends', lat: 10.766306, lng: 79.109130 },
  { id: 'BS025', name: 'Medical college 1st gate', lat: 10.763144, lng: 79.106758 },
  { id: 'BS026', name: 'Medical college 2nd gate', lat: 10.761381, lng: 79.105026 },
  { id: 'BS027', name: 'Medical college 3rd gate', lat: 10.760379, lng: 79.103774 },
  { id: 'BS028', name: 'Medical college 4th gate', lat: 10.759902, lng: 79.103191 }
]

export const getBusRoute = (routeId) => {
  return MOCK_ROUTES[routeId] || null
}

export const getAllRoutes = () => {
  return Object.values(MOCK_ROUTES)
}

export const getBusStops = () => {
  return MOCK_BUS_STOPS
}