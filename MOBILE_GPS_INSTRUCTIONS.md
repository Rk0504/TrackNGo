# 🛰️ How to Use Mobile GPS as a Bus Tracker

This guide explains how to turn your mobile phone into a "Live Bus" that appears on the main map.

---

## 📱 Step 1: Open Driver Mode on Mobile

1.  Ensure your mobile is connected to the same Wi-Fi as your PC.
2.  Open Chrome on your mobile.
3.  Navigate to:
    **`http://10.70.87.24:5173/driver`**

    *(Replace the IP with your PC's IP if it changed)*

---

## 📍 Step 2: Grant Permissions

1.  Click **"Start GPS Tracking"**.
2.  Your browser will ask for **Location Permission**.
3.  Click **Allow**.

> **Note**: If you see "Permission Denied", you MUST use the **chrome://flags** workaround mentioned in the previous guide (Insecure origins).

---

## 🚌 Step 3: Track Yourself

1.  The screen will show your **Latitude**, **Longitude**, and **Speed**.
2.  Status will change to: **"✅ update sent!"**
3.  The bus ID will default to something like `MOBILE-42`. You can change this text box to whatever you want (e.g., `MY-CAR-01`).

---

## 🗺️ Step 4: See Yourself on the Map

1.  Go to your **PC**.
2.  Open the main tracking page: `http://localhost:5173/track`
3.  Look for a new bus marker with your ID (`MOBILE-42`).
4.  Move around with your phone (walk outside or drive), and the marker on the PC will move!

---

## ⚠️ Important Notes

*   **Speed**: GPS speed is only calculated when you are actually moving.
*   **Route**: By default, this driver mode assigns you to "Route 12" (R12) for visualization purposes. You will appear near the R12 path logic, but your physical location will always be accurate.
*   **Battery**: GPS tracking consumes battery. Click "Stop Tracking" when done.
