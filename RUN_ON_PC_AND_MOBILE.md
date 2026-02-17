# 🌐 How to Run TrackNGo on PC and Mobile Simultaneously

This guide provides step-by-step instructions to run the application on your PC (host) and access it from your Mobile device on the same Wi-Fi network.

---

## ✅ Prerequisites

1.  **Same Wi-Fi Network**: Ensure both your PC and Mobile are connected to the same Wi-Fi.
2.  **Firewall**: You must allow incoming connections on ports `8080` (Backend) and `5173` (Frontend).

---

## 🛠️ Step 1: Find Your PC's Local IP Address

1.  Open **Command Prompt** (cmd) or PowerShell.
2.  Type `ipconfig` and press Enter.
3.  Look for **IPv4 Address** under your active Wi-Fi adapter.
    *   Example: `10.70.87.24`

---

## ⚙️ Step 2: Configure the App

1.  Open the file `.env` in the root **TrackNGo** folder.
2.  Update `VITE_WS_URL` and `VITE_API_URL` with your **PC's Local IP**.

**Example (using your IP: 10.70.87.24):**

```env
# Change localhost to your IP address
VITE_WS_URL=ws://10.70.87.24:8080/ws/live
VITE_API_URL=http://10.70.87.24:8080
```

> **Important**: Do NOT use `localhost`. Use the actual IP address (e.g., `10.70.87.24`).

3.  Save the file.

---

## ▶️ Step 3: Start the Application

Open **3 separate terminal windows** (Command Prompt or PowerShell) inside the `TrackNGo` folder.

### Terminal 1: Backend (Server)
```bash
cd backend
npm start
```
*Wait until you see: `Server running on port 8080`*

### Terminal 2: GPS Simulator (Data)
```bash
cd gps-simulator
npm start
```
*Wait until you see logs like: `✅ Sent TN-THJ-23...`*

### Terminal 3: Frontend (Website)
**Run this specific command to expose the server to the network:**

```bash
npm run dev -- --host
```
*Wait until you see: `Network: http://10.70.87.24:5173/`*

---

## 📱 Step 4: Access on Mobile

1.  Open Chrome or Safari on your mobile device.
2.  Type the Network URL shown in Terminal 3.
    *   **http://10.70.87.24:5173**
3.  The app should load and show live buses!

---

## 💻 Step 5: Access on PC

1.  Open Chrome on your PC.
2.  You can use either:
    *   **http://localhost:5173**
    *   **http://10.70.87.24:5173**

Both will work simultaneously with your mobile device.

---

## ⚠️ Troubleshooting: "Site Can't Be Reached"

If your mobile device cannot connect, it is almost always a **Firewall Issue**.

### Quick Fix (Windows):
1.  Open **Windows Defender Firewall with Advanced Security**.
2.  Click **Inbound Rules** -> **New Rule**.
3.  Select **Port** -> Next.
4.  Select **TCP** and enter specific local ports: `8080, 5173`.
5.  Select **Allow the connection** -> Next.
6.  Select all profiles (Domain, Private, Public) -> Next.
7.  Name it `TrackNGo Access` -> Finish.

Now try accessing the site on your mobile again.
