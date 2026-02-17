class WebSocketService {
  static instance = null

  constructor() {
    this.ws = null
    this.url = import.meta.env.VITE_WS_URL || 'ws://10.70.87.24:8080/ws/live'
    this.reconnectInterval = 5000
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 10
    this.connectionChangeCallbacks = []
    this.busUpdateCallbacks = []
    this.errorCallbacks = []
    this.isConnecting = false
    this.simulationInterval = null
  }

  static getInstance() {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService()
    }
    return WebSocketService.instance
  }

  connect() {
    // Use frontend simulation for now
    console.log('Starting frontend simulation with all 4 buses...')
    this.startRealisticSimulation()

    // Also connect to real backend for Mobile GPS updates
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return
    }

    this.isConnecting = true
    // Don't notify 'connecting' here to avoid flickering if sim is running

    try {
      this.ws = new WebSocket(this.url)
      this.setupEventListeners()
    } catch (error) {
      console.error('WebSocket connection failed:', error)
      this.isConnecting = false
      this.attemptReconnect()
    }
  }

  setupEventListeners() {
    if (!this.ws) return

    this.ws.onopen = () => {
      this.isConnecting = false
      this.reconnectAttempts = 0
      this.notifyConnectionChange('connected')
      console.log('WebSocket connected to bus tracking service')
    }

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        this.handleMessage(data)
      } catch (error) {
        this.handleError(new Error('Invalid message format received'))
      }
    }

    this.ws.onclose = () => {
      this.isConnecting = false
      this.notifyConnectionChange('disconnected')
      console.log('WebSocket disconnected')
      this.attemptReconnect()
    }

    this.ws.onerror = (error) => {
      this.isConnecting = false
      this.handleError(new Error('WebSocket connection error'))
    }
  }

  handleMessage(data) {
    if (data.type === 'BUS_UPDATE' && data.data) {
      this.notifyBusUpdate(data.data)
    } else if (data.type === 'CURRENT_BUS_DATA' && data.data && Array.isArray(data.data.buses)) {
      data.data.buses.forEach(bus => {
        this.notifyBusUpdate(bus)
      })
    } else if (data.type === 'error') {
      this.handleError(new Error(data.data?.message || 'Unknown server error'))
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.handleError(new Error('Maximum reconnection attempts reached'))
      return
    }

    this.reconnectAttempts++
    this.notifyConnectionChange('reconnecting')

    setTimeout(() => {
      if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
        this.connect()
      }
    }, this.reconnectInterval)
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.isConnecting = false
    this.reconnectAttempts = 0
  }

  onConnectionChange(callback) {
    this.connectionChangeCallbacks.push(callback)
    return () => {
      const index = this.connectionChangeCallbacks.indexOf(callback)
      if (index > -1) this.connectionChangeCallbacks.splice(index, 1)
    }
  }

  onBusUpdate(callback) {
    this.busUpdateCallbacks.push(callback)
    return () => {
      const index = this.busUpdateCallbacks.indexOf(callback)
      if (index > -1) this.busUpdateCallbacks.splice(index, 1)
    }
  }

  onError(callback) {
    this.errorCallbacks.push(callback)
    return () => {
      const index = this.errorCallbacks.indexOf(callback)
      if (index > -1) this.errorCallbacks.splice(index, 1)
    }
  }

  notifyConnectionChange(status) {
    this.connectionChangeCallbacks.forEach(callback => callback(status))
  }

  notifyBusUpdate(busData) {
    this.busUpdateCallbacks.forEach(callback => callback(busData))
  }

  handleError(error) {
    this.errorCallbacks.forEach(callback => callback(error))
  }

  // --- Realistic Simulation Logic ---
  startRealisticSimulation() {
    if (this.simulationInterval) return

    this.notifyConnectionChange('connected')

    // Simulation Data from User's Excel Sheet
    const ROUTE_DATA = {
      'N1631': { // New Bus Stand -> Old Bus Stand (20 mins)
        id: 'N1631',
        name: 'NBS to OBS',
        stops: [
          { name: 'NBS', lat: 10.750134, lng: 79.112540, time: 0 },
          { name: 'RR Nagar', lat: 10.749071, lng: 79.116831, time: 2 },
          { name: 'Co Optex', lat: 10.750876, lng: 79.118649, time: 3 },
          { name: 'Cauvery nagar', lat: 10.754762, lng: 79.121973, time: 4 },
          { name: 'Kulantha yesu kovil', lat: 10.758042, lng: 79.125073, time: 6 },
          { name: 'Old housing unit', lat: 10.762182, lng: 79.127622, time: 7 },
          { name: 'MR hospital', lat: 10.768861, lng: 79.130743, time: 9 },
          { name: 'Rohini hospital', lat: 10.772606, lng: 79.132798, time: 10 },
          { name: 'Ramanathan (or) Manimandabam', lat: 10.773855, lng: 79.135697, time: 11 },
          { name: 'Philomena mall', lat: 10.775170, lng: 79.138649, time: 12 },
          { name: 'Sacrad heart school', lat: 10.778559, lng: 79.140279, time: 14 },
          { name: 'Junction front Side', lat: 10.786097, lng: 79.137165, time: 18 },
          { name: 'OBS', lat: 10.786710, lng: 79.137204, time: 20 }
        ]
      },
      'N1600': { // Old Bus Stand -> New Bus Stand (20 mins)
        id: 'N1600',
        name: 'OBS to NBS',
        stops: [
          { name: 'OBS', lat: 10.787069, lng: 79.138296, time: 0 },
          { name: 'Municipal cooperation', lat: 10.782027, lng: 79.139417, time: 3 },
          { name: 'Junction front Side', lat: 10.778700, lng: 79.140033, time: 4 },
          { name: 'Vasanth and co', lat: 10.775788, lng: 79.140343, time: 8 },
          { name: 'Sacrad heart school', lat: 10.775284, lng: 79.138983, time: 8.5 },
          { name: 'Philomena mall', lat: 10.773967, lng: 79.136012, time: 10 },
          { name: 'Ramanathan (or) Manimandabam', lat: 10.772036, lng: 79.132249, time: 11 },
          { name: 'Rohini hospital', lat: 10.769091, lng: 79.130906, time: 12 },
          { name: 'Old housing unit', lat: 10.762322, lng: 79.127786, time: 14 },
          { name: 'Kulantha yesu kovil', lat: 10.758390, lng: 79.125537, time: 15 },
          { name: 'Cauvery nagar', lat: 10.754532, lng: 79.121857, time: 16 },
          { name: 'Co Optex', lat: 10.750962, lng: 79.118756, time: 16.5 },
          { name: 'RR Nagar', lat: 10.748987, lng: 79.116859, time: 17 },
          { name: 'NBS', lat: 10.749642, lng: 79.113141, time: 20 }
        ]
      },
      'N1602': { // Old Bus Stand -> Medical 4th gate (18 mins)
        id: 'N1602',
        name: 'OBS to Medical College',
        stops: [
          { name: 'OBS', lat: 10.787084, lng: 79.138255, time: 0 },
          { name: 'Rajali birds park', lat: 10.781550, lng: 79.133692, time: 3 },
          { name: 'Membalam', lat: 10.777714, lng: 79.129890, time: 5 },
          { name: 'Sathya stadium', lat: 10.776450, lng: 79.127916, time: 6 },
          { name: 'Rajappa nagar (or) SB hospital', lat: 10.775525, lng: 79.124811, time: 7 },
          { name: 'jaya shakthi snacks (or) Balaji nagar', lat: 10.774592, lng: 79.122603, time: 8 },
          { name: 'Lakshmi seeval', lat: 10.772976, lng: 79.118959, time: 9 },
          { name: 'ifb point (or) Sundaram nagar', lat: 10.770455, lng: 79.114492, time: 10 },
          { name: 'Municipal colony (or) nav barath school', lat: 10.768262, lng: 79.111407, time: 12 },
          { name: 'Eswari nagar (or) Trends', lat: 10.766387, lng: 79.109129, time: 13 },
          { name: 'Medical 1st gate', lat: 10.763167, lng: 79.106637, time: 14 },
          { name: 'Medical 2nd gate', lat: 10.761365, lng: 79.104906, time: 15 },
          { name: 'Medical 3rd gate', lat: 10.760519, lng: 79.103878, time: 16 },
          { name: 'Medical 4th gate', lat: 10.759973, lng: 79.103198, time: 17 }
        ]
      },
      'N0760': { // Medical 4th gate -> Old Bus Stand (17 mins)
        id: 'N0760',
        name: 'Medical College to OBS',
        stops: [
          { name: 'Medical 4th gate', lat: 10.759963, lng: 79.102987, time: 0 },
          { name: 'Medical 3rd gate', lat: 10.760429, lng: 79.103657, time: 1 },
          { name: 'Medical 2nd gate', lat: 10.761365, lng: 79.104686, time: 1.5 },
          { name: 'Medical 1st gate', lat: 10.763158, lng: 79.106500, time: 2 },
          { name: 'Eswari nagar', lat: 10.766959, lng: 79.109608, time: 4 },
          { name: 'Municipal colony', lat: 10.768351, lng: 79.111474, time: 5 },
          { name: 'ifb point (or) Sundaram nagar', lat: 10.770485, lng: 79.114453, time: 6 },
          { name: 'Lakshmi seeval', lat: 10.772878, lng: 79.118467, time: 7 },
          { name: 'jaya shakthi snacks (or) Balaji nagar', lat: 10.774571, lng: 79.122314, time: 9 },
          { name: 'Sathya stadium', lat: 10.776347, lng: 79.127504, time: 11 },
          { name: 'Membalam', lat: 10.778323, lng: 79.129987, time: 12 },
          { name: 'Rajali birds park', lat: 10.781828, lng: 79.133871, time: 13 },
          { name: 'Central library', lat: 10.785430, lng: 79.133732, time: 15 },
          { name: 'OBS', lat: 10.786708, lng: 79.137452, time: 17 }
        ]
      }
    }

    // Initialize with start position
    Object.values(ROUTE_DATA).forEach(route => {
      this.notifyBusUpdate(this.calculateBusState(route, 0))
    })

    const loopDuration = 20 * 60 * 1000 // 20 minutes in milliseconds
    // Start simulation loop
    this.simulationInterval = setInterval(() => {
      const now = Date.now()
      const timeInLoop = now % loopDuration // Loop every 20 mins based on system time

      Object.values(ROUTE_DATA).forEach(route => {
        const busState = this.calculateBusState(route, timeInLoop)
        this.notifyBusUpdate(busState)
      })
    }, 1000) // Update every second
  }

  stopRealisticSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval)
      this.simulationInterval = null
    }
  }

  calculateBusState(route, timeInLoopMs) {
    const timeInMinutes = timeInLoopMs / 60000
    const stops = route.stops

    // Find current segment
    let currentStopIndex = 0
    for (let i = 0; i < stops.length - 1; i++) {
      if (timeInMinutes >= stops[i].time && timeInMinutes < stops[i + 1].time) {
        currentStopIndex = i
        break
      }
    }

    // Handle end of route (loop back or stay at end? assuming loop for demo)
    if (timeInMinutes >= stops[stops.length - 1].time) {
      if (timeInMinutes > stops[stops.length - 1].time) {
        currentStopIndex = stops.length - 1
      }
    }

    const currentStop = stops[currentStopIndex]
    const nextStop = stops[currentStopIndex + 1] || stops[0] // Loop to start if at end

    let lat = currentStop.lat
    let lng = currentStop.lng
    let heading = 0
    let speed = 0

    if (nextStop && currentStop !== nextStop) {
      const timeDiff = nextStop.time - currentStop.time
      const progress = (timeInMinutes - currentStop.time) / timeDiff

      // Linear interpolation
      lat = currentStop.lat + (nextStop.lat - currentStop.lat) * progress
      lng = currentStop.lng + (nextStop.lng - currentStop.lng) * progress

      // Calculate Heading
      const dy = nextStop.lat - currentStop.lat
      const dx = Math.cos(Math.PI / 180 * currentStop.lat) * (nextStop.lng - currentStop.lng)
      heading = Math.atan2(dy, dx) * 180 / Math.PI

      // Calculate Speed (approx km/h) based on distance/time
      speed = 30 + Math.random() * 10 // Randomize slightly between 30-40 km/h
    }

    // Determine Status
    let status = 'moving'
    if (speed < 5) status = 'stopped'

    return {
      bus_id: route.id,
      route_name: route.name,
      lat: lat,
      lng: lng,
      speed: speed,
      heading: heading,
      next_stop: nextStop.name,
      eta: `${Math.max(0, Math.ceil(nextStop.time - timeInMinutes))} mins`,
      safety_score: 98,
      lastUpdate: new Date().toISOString(),
      status: status,
      stops: route.stops,
      currentStopIndex: currentStopIndex
    }
  }
}

export default WebSocketService