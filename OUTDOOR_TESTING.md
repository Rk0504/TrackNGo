# 🏃‍♂️ How to Test GPS Outdoors (Long Distance)

You encountered a **Network Error** because your phone switched to **4G/Mobile Data**.

### ❌ The Problem
Your PC is running the server on a **Local Network** (Wi-Fi).
When you walk far away:
1.  Your phone disconnects from Wi-Fi.
2.  Your phone switches to **4G/5G**.
3.  **4G cannot see your PC**. Your PC has a private IP address (`10.237...`) that only exists inside your building.

---

## ✅ The Solution: Mobile Hotspot

To test outdoors, you must keep your PC and Phone on the **same network** anywhere you go.

### Step 1: Create the Network
1.  Turn **OFF** Wi-Fi on your phone.
2.  Turn **ON Mobile Hotspot** (Internet Sharing) on your phone.
3.  Connect your **PC** to your **Phone's Hotspot**.

### Step 2: Get New IP
Now your PC has a new IP address provided by your phone.

1.  Open Terminal on PC.
2.  Run `ipconfig`.
3.  Copy the new **IPv4 Address**. (e.g., `192.168.43.158`)

### Step 3: Update Config
1.  Update `.env` file with this new IP.
2.  **Restart** Backend and Simulator (`Ctrl+C` -> `npm start`).
3.  **Restart** Frontend (`npm run dev -- --host`).

### Step 4: Test
1.  On your phone, open the new URL: `http://<NEW_IP>:5173/driver`.
2.  Now you can drive/walk anywhere! Since your PC is connected to your phone, the connection will never break.

---
**Note**: This consumes your mobile data plan.
