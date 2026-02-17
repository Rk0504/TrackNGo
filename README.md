# TrackNGo - Secure Bus Tracking System

**Secure Real-Time Bus Tracking – Thanjavur Region**

TrackNGo is a district-level secure bus tracking system designed specifically for the Thanjavur region. This frontend application provides real-time bus location tracking with a clean, responsive interface optimized for both desktop and mobile devices.

## 🚀 Features

- **Real-Time Tracking**: Live bus location updates via WebSocket connection
- **Interactive Map**: Google Maps integration with Thanjavur-focused view
- **Route Visualization**: Dynamic route rendering with completed/upcoming path indication
- **Bus Stop Markers**: Visual representation of all bus stops in the region
- **Responsive Design**: Mobile-first design that works on all screen sizes
- **Security-First**: Privacy-focused implementation with no raw GPS data exposure
- **Demo Mode**: Mock data functionality for development and demonstration

## 🛠 Tech Stack

- **React.js** with Vite for fast development and building
- **Google Maps JavaScript SDK** for map rendering and geolocation services
- **WebSocket** for real-time data communication
- **Tailwind CSS** for responsive styling and design system
- **React Router** for navigation between pages
- **Context API** for state management (no Redux dependency)

## 📁 Project Structure

```
TrackNGo/
├── public/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── MapView.jsx        # Main map component
│   │   ├── Sidebar.jsx        # Bus list and controls
│   │   ├── BusMarker.jsx      # Individual bus marker logic
│   │   ├── LoadingSpinner.jsx # Loading state component
│   │   └── ConnectionStatus.jsx # Connection status indicator
│   ├── pages/              # Application pages
│   │   ├── LandingPage.jsx    # Welcome/home page
│   │   └── TrackingPage.jsx   # Main tracking interface
│   ├── hooks/              # Custom React hooks
│   │   ├── useGoogleMaps.js   # Google Maps integration
│   │   └── useRouteVisualization.js # Route drawing logic
│   ├── services/           # External service integrations
│   │   └── WebSocketService.js # WebSocket connection management
│   ├── context/            # React Context providers
│   │   └── BusTrackingContext.jsx # Global state management
│   ├── data/               # Mock data and constants
│   │   └── mockRoutes.js      # Sample route and bus stop data
│   └── App.jsx             # Main application component
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## ⚙️ Setup and Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Google Maps API key

### Installation Steps

1. **Clone or download the project**
   ```bash
   cd TrackNGo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file and add your configuration:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   VITE_WS_URL=ws://your-backend-url:port/ws
   VITE_APP_NAME=TrackNGo
   VITE_APP_REGION=Thanjavur
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:3000`

### Production Build

```bash
npm run build
npm run preview
```

## 🗺️ Google Maps Setup

1. **Get API Key**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google Maps JavaScript API
   - Create credentials (API Key)
   - Restrict the API key to your domain for security

2. **Required APIs**
   - Maps JavaScript API
   - Places API (for location search)
   - Geometry Library (for distance calculations)

3. **API Key Restrictions** (Recommended)
   - HTTP referrers: `your-domain.com/*`
   - API restrictions: Maps JavaScript API only

## 📡 Backend Integration

### WebSocket Data Format

The frontend expects WebSocket messages in this format:

```javascript
{
  "type": "bus_update",
  "payload": {
    "bus_id": "TN-THJ-23",
    "lat": 10.7869,
    "lng": 79.1378,
    "speed": 34,
    "eta": "5 mins",
    "route_id": "R12",
    "route_name": "Thanjavur - Kumbakonam",
    "next_stop": "Medical College",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### Security Requirements

- **No Raw GPS Streams**: Data should be pre-processed server-side
- **Encrypted WebSocket**: Use WSS in production
- **Anonymized IDs**: Bus IDs should not reveal sensitive information
- **Rate Limiting**: Implement connection rate limits server-side

## 🎨 UI/UX Features

### Landing Page
- Clean, professional design with TrackNGo branding
- Feature highlights and benefit explanations
- Clear call-to-action to access live tracking
- Responsive design for all device sizes

### Tracking Page
- **Interactive Map**: 
  - Centered on Thanjavur district
  - Restricted zoom levels to prevent excessive zoom-out
  - Custom markers for buses and bus stops
  - Route polylines with progress indication
  
- **Sidebar Panel**:
  - List of all active buses
  - Real-time connection status
  - Bus selection and tracking
  - Collapsible for smaller screens
  
- **Real-time Features**:
  - Live position updates
  - Smooth marker animations
  - Connection status indicators
  - Error handling and retry mechanisms

## 🔧 Development Features

### Mock Data Mode
When backend is unavailable, the app automatically offers demo mode with:
- 3 sample buses on different routes
- Realistic movement simulation
- All UI features working with fake data

### Error Handling
- Connection loss detection and retry
- API key validation
- Graceful degradation for missing features
- User-friendly error messages

### Performance Optimizations
- Map marker pooling and reuse
- Debounced position updates
- Lazy loading of components
- Optimized re-rendering with React hooks

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari (iOS 12+)
- Edge
- Mobile browsers (Android Chrome, iOS Safari)

## 🔒 Security Considerations

### Data Privacy
- No passenger or driver personal information
- Anonymized bus identifiers only
- No location history storage client-side
- Secure WebSocket connections in production

### API Security
- Google Maps API key restrictions
- Environment variable protection
- No sensitive data in frontend code
- CORS configuration for WebSocket endpoints

## 🚀 Deployment

### Environment Setup
```bash
# Production build
npm run build

# Preview production build locally
npm run preview
```

### Static Hosting (Recommended)
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

### Environment Variables for Production
```env
VITE_GOOGLE_MAPS_API_KEY=prod_api_key
VITE_WS_URL=wss://your-secure-backend.com/ws
VITE_APP_NAME=TrackNGo
VITE_APP_REGION=Thanjavur
```

## 🎓 Academic Context

This project is designed for academic presentation and evaluation with:

- **Scalable Architecture**: Easily extensible to other districts
- **Clean Code Practices**: Well-documented and maintainable code
- **Security Best Practices**: Privacy-first implementation
- **Modern Tech Stack**: Industry-standard technologies
- **Responsive Design**: Professional UI/UX design

## 🔧 Customization

### Adding New Routes
Edit `src/data/mockRoutes.js` to add new bus routes:

```javascript
'R99': {
  id: 'R99',
  name: 'New Route Name',
  color: '#yourcolor',
  coordinates: [
    { lat: 10.xxxx, lng: 79.xxxx },
    // ... more coordinates
  ],
  stops: [
    { name: 'Stop Name', lat: 10.xxxx, lng: 79.xxxx },
    // ... more stops
  ]
}
```

### Styling Customization
Modify `tailwind.config.js` to change colors, fonts, and design tokens.

### Map Customization
Edit `src/hooks/useGoogleMaps.js` to adjust:
- Default center point
- Zoom levels
- Map restrictions
- Custom styling

## 📋 TODO / Future Enhancements

- [ ] Offline mode with cached data
- [ ] Push notifications for bus arrivals
- [ ] Multi-language support (Tamil, English)
- [ ] Advanced filtering and search
- [ ] Route planning and optimization
- [ ] Analytics dashboard for administrators
- [ ] Integration with payment systems
- [ ] Passenger count estimation

## 📄 License

This project is developed for academic purposes. Please ensure compliance with Google Maps API terms of service and local regulations when deploying.

## 🤝 Contributing

This is an academic project. For suggestions or improvements:
1. Document the enhancement
2. Ensure it aligns with security requirements
3. Test thoroughly before implementation
4. Update documentation accordingly

---

**TrackNGo** - Secure, Real-time, Reliable Bus Tracking for Thanjavur Region