# 📱 How to Run TrackNGo on Mobile

This guide allows you to access the TrackNGo application from your mobile phone or tablet connected to the same Wi-Fi network.

---

## 🛑 Prerequisites

1.  **Same Network**: Your PC (running the server) and your Mobile device must be connected to the **same Wi-Fi network**.
2.  **Firewall**: Ensure your PC's firewall allows incoming connections on ports `8080` (Backend) and `5173` (Frontend).

---

## 1️⃣ Find Your PC's Local IP Address

You need to know the IP address of your computer on the local network.

### Windows
1.  Open **Command Prompt** (cmd) or PowerShell.
2.  Type `ipconfig` and press Enter.
3.  Look for **IPv4 Address** under your active adapter (Wi-Fi or Ethernet).
    *   Example: `192.168.1.5` or `10.70.87.24`

### Mac / Linux
1.  Open Terminal.
2.  Type `ifconfig` or `ip a`.
3.  Look for the `inet` address (usually `192.168...` or `10.0...`).

---

## 2️⃣ Configure the Frontend

You must tell the frontend web app to talk to your PC's IP address instead of `localhost`.

1.  Open the file `.env` in the root **TrackNGo** folder.
2.  Update the `VITE_WS_URL` and `VITE_API_URL` with your **PC's IP Address**.

**Example (using your IP: 10.70.87.24):**

```env
# Change localhost to your IP address
VITE_WS_URL=ws://10.70.87.24:8080/ws/live
VITE_API_URL=http://10.70.87.24:8080
```

> **Note**: Do NOT use `localhost` here, because `localhost` on your phone refers to the phone itself, not your PC.

3.  Save the file.

---

## 3️⃣ Start the Application

Open your 3 separate terminals as usual:

### Terminal 1: Backend
```bash
cd backend
npm start
```
*Verification: Ensure it says "Server running on port 8080".*

### Terminal 2: Simulator
```bash
cd gps-simulator
npm start
```
*Verification: Ensure it is sending data ("✅ Sent...").*

### Terminal 3: Frontend (with Host flag)
Run this command to explicitly expose the server to the network:
```bash
npm run dev -- --host
```
*Verification: You should see "Network: http://10.70.87.24:5173/" in the output.*

---

## 4️⃣ Access on Mobile

1.  Open Chrome, Safari, or any browser on your mobile device.
2.  Type the Network URL shown in Terminal 3.
    *   **http://10.70.87.24:5173**
3.  The app should load, and you should see the live bus tracking!

---

## ⚠️ Troubleshooting

**"Site can't be reached" / "Connection Refused"**
*   **Check IP**: Did your PC's IP address change? Run `ipconfig` again.
*   **Firewall**: Windows Defender Firewall might be blocking Node.js.
    *   Try temporarily disabling the firewall to test.
    *   Or allow "Node.js JavaScript Runtime" through the firewall for Private networks.
*   **Same Network**: strict check that phone is not on 4G/5G data, but on Wi-Fi.

**Map Loads but No Buses**
*   **WebSocket Error**: If the map loads but buses don't appear, the WebSocket connection failed.
    *   Check if you updated `.env` correctly with the proper IP.
    *   Restart the frontend terminal (`npm run dev`) after changing `.env`.

**"Camera Access Denied" / "Location Denied"**
*   **Safety Feature**: Modern browsers (Chrome, Safari) **BLOCK** Camera and GPS access on insecure websites (`http://` addresses that are not `localhost`).
*   **Workaround for Testing (Android Chrome)**:
    1.  On your phone, open Chrome and type: `chrome://flags`
    2.  Search for: **Insecure origins treated as secure**
    3.  Enable it.
    4.  In the text box, enter your specific URL: `http://10.70.87.24:5173`
    5.  Click **Relaunch**.
    6.  Now the Camera and Location will work!
