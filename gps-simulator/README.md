# TrackNGo GPS Simulator

A standalone Node.js script that simulates GPS updates from buses for the TrackNGo system. It runs independently of the frontend and backend, sending standard JSON payloads to the backend API via HTTP.

## 🚀 Features

*   **Standalone**: Depends only on `axios`.
*   **Multi-Bus Support**: Simulates multiple buses on different routes (Thanjavur - Kumbakonam, Trichy, Mayiladuthurai).
*   **Route-Based**: Buses follow predefined coordinate paths (lat/lng arrays).
*   **Robust**: Auto-retries on backend failure (does not crash).
*   **Configurable**: Easy to add routes or change update intervals.

## 📋 Prerequisites

*   Node.js installed (v16+ recommended).
*   TrackNGo Backend running on `localhost:8080`.

## 🛠️ Installation

1.  Navigate to this directory:
    ```bash
    cd gps-simulator
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

## ▶️ Usage

Start the simulator:

```bash
npm start
```

Or run directly with Node:

```bash
node simulator.js
```

### Expected Output

```
------------------------------------------------
🚀 TrackNGo GPS Simulator Started
📡 Backend Endpoint: http://localhost:8080/api/gps/update
⏱️  Update Interval: 4000ms
🚌 Active Buses: 3
------------------------------------------------
[12:30:01 PM] ✅ Sent TN-THJ-23 @ [10.7869, 79.1378]
[12:30:01 PM] ✅ Sent TN-THJ-45 @ [10.7869, 79.1378]
[12:30:01 PM] ✅ Sent TN-THJ-77 @ [10.7869, 79.1378]
...
```

To stop the simulator, press `Ctrl + C`.

## ⚙️ Configuration

### Buses & Routes
Edit `simulator.js` to modify the `BUSES` array:

```javascript
const BUSES = [
  { bus_id: 'TN-THJ-23', route_id: 'R12', speed_base: 35 },
  // Add more buses here
];
```

Edit `routes.js` to add or modify route coordinates.

### Backend URL
Change the `API_URL` constant in `simulator.js` or set the `API_URL` environment variable.

## 🔌 Integration Info

This simulator sends POST requests to the backend with the following payload:

```json
{
  "bus_id": "TN-THJ-23",
  "lat": 10.7869,
  "lng": 79.1378,
  "speed": 36.2,
  "route_id": "R12",
  "timestamp": 1704700000
}
```

This format mimics the real hardware GPS modules expected in production.
