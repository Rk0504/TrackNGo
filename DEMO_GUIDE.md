# TrackNGo Demo Guide 🚀📱

Use this guide to demonstrate the key features of the TrackNGo app effectively.

## 1. Prerequisites (Already Running!)

Ensure all 3 components are running:
1.  **Backend Server** (`npm start` in `backend/`) ✅
2.  **Frontend App** (`npm run dev` in `src/`) ✅
3.  **GPS Simulator** (`node simulator.js` in `gps-simulator/`) ✅

---

## 2. Demo Walkthrough Steps

### Scene 1: User Registration
1.  Open the app in your browser: `http://localhost:5173`
2.  Click **"Register"**.
3.  Enter details:
    *   **Name:** `Demo User`
    *   **DOB:** `2000-01-01`
    *   **Mobile:** `9876543210`
4.  Click **"Sign Up"**.
    *   *Result:* You are logged in immediately.

### Scene 2: Live Bus Tracking (The Core Feature)
1.  Click **"Track Buses"** in the navigation bar.
2.  The map loads showing your current location (blue dot).
3.  **Wait 5-10 seconds**.
4.  You will see **3 buses moving in real-time**:
    *   `TN-THJ-23` (Route R12)
    *   `TN-THJ-45` (Route R08)
    *   `TN-THJ-77` (Route R15)
5.  **Click on any bus icon**.
    *   See details: Bus Number, Speed (km/h), Last Updated time.

### Scene 3: Reporting an Issue (Complaint System)
1.  Click the **"Report Issue"** floating button (bottom-right).
2.  **Select Issue Type:** e.g., "Rash Driving" or "Overcrowding".
3.  **Bus Number:** Select one from the dropdown (e.g., `TN-THJ-23`).
4.  **Description:** "Bus was driving very fast near the market."
5.  **Media Evidence:**
    *   Click **"Upload Photo/Video"**.
    *   Select a sample image or short video from your device.
    *   *Note on Mobile:* This opens the Camera directly! 📸
6.  Click **"Submit Complaint"**.
    *   *Result:* "Complaint Submitted Successfully!" popup with Reference ID.

### Scene 4: Checking "My Complaints"
1.  Click **"My Complaints"** in the navigation bar.
2.  You see your newly submitted complaint in the list.
3.  **Click the Reference ID** (e.g., `TN-XYZ-123`).
4.  View full details:
    *   **Status:** Pending (default)
    *   **Evidence:** The photo/video you uploaded is displayed.
    *   **Location:** The map location where you submitted the report.

---

## 3. Testing on Mobile (Real Device) 📲

To demo as a real mobile app:

1.  Connect your phone to the same WiFi as your PC.
2.  Open Chrome on your phone.
3.  Navigate to: `http://10.70.87.24:5173`
4.  Experience the **App-like interface**!
    *   Responsive design.
    *   Touch-friendly buttons.
    *   Real GPS location from your phone.

---

## 4. Resetting Data (Optional)

If you want to clear complaints for a fresh demo:
1.  Stop the backend (`Ctrl+C`).
2.  Delete `backend/trackngo.db`.
3.  Restart backend (`npm start`).
    *   The database is recreated automatically.
