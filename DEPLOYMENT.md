# 🚀 How to Deploy TrackNGo to the Internet (Free)

This guide will help you publish your app so **anyone can access it from anywhere** (without needing to be on the same Wi-Fi).

---

## ✅ Prerequisites

1.  **GitHub Account**: [github.com](https://github.com)
2.  **Render Account** (for Backend): [render.com](https://render.com)
3.  **Vercel Account** (for Frontend): [vercel.com](https://vercel.com)
4.  **Git Installed**: You need Git installed on your computer.

---

## 🛠️ Step 1: Push Code to GitHub

1.  **Create a New Repository** on GitHub:
    *   Name: `TrackNGo`
    *   Keep it **Public** (easier) or **Private**.
    *   Do NOT initialize with README/license (keep it empty).

2.  **Initialize Git** in your project folder (`d:\TrackNGo`):
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```

3.  **Push to GitHub**:
    *   Find the command shown on your empty GitHub repo page (looks like this):
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/TrackNGo.git
    git branch -M main
    git push -u origin main
    ```
    *   Run these commands in your VS Code terminal.

---

## ⚙️ Step 2: Deploy Backend (Render)

This hosts your server and WebSocket connection.

1.  **Log in to Render**.
2.  Click **"New +"** -> **"Web Service"**.
3.  **Connect GitHub**: Select your `TrackNGo` repository.
4.  **Configure Settings**:
    *   **Name**: `trackngo-backend`
    *   **Region**: Closest to you (e.g., Singapore/US).
    *   **Branch**: `main`
    *   **Root Directory**: `backend` (⚠️ Very Important!)
    *   **Build Command**: `npm install`
    *   **Start Command**: `node src/server.js`
    *   **Instance Type**: Free (Bottom option).
5.  Click **"Create Web Service"**.
6.  **Wait**: It takes a few minutes to build.
7.  **Success**: When deployed, copy the URL at the top-left (e.g., `https://trackngo-backend.onrender.com`).
    *   **Save this URL!** You need it for Step 3.

---

## 🌐 Step 3: Deploy Frontend (Vercel)

This hosts your React website (Passenger & Driver App).

1.  **Log in to Vercel**.
2.  Click **"Add New..."** -> **"Project"**.
3.  **Import Git Repository**: Select your `TrackNGo` repository.
4.  **Configure Project**:
    *   **Framework Preset**: Vite (should auto-detect).
    *   **Root Directory**: `./` (Leave default).
5.  **Environment Variables** (Critical!):
    *   Click to expand **"Environment Variables"**.
    *   Add these two variables using your **Render Backend URL**:

    | Name | Value (Example - Use YOUR Render URL) |
    | :--- | :--- |
    | `VITE_WS_URL` | `wss://trackngo-backend.onrender.com/ws/live` |
    | `VITE_API_URL` | `https://trackngo-backend.onrender.com` |

    > **Note:** For `VITE_WS_URL`, use `wss://` (secure WebSocket) instead of `http://` or `ws://`.

6.  Click **"Deploy"**.
7.  **Wait**: Vercel will build and deploy your site in ~1 minute.
8.  **Success**: Click **"Continue to Dashboard"**. You will see your domains (e.g., `https://trackngo-passenger.vercel.app`).

---

## 🎉 Final Step: Get Your Links!

You now have two permanent, public links:

1.  **Passenger App Link**:
    *   Share this with everyone!
    *   URL: The Vercel URL (e.g., `https://trackngo.vercel.app`)

2.  **Driver App Link**:
    *   Give this to bus drivers.
    *   URL: Add `/driver` to the end.
    *   Example: `https://trackngo.vercel.app/driver`

---

## ⚠️ Important Troubleshooting

*   **"WebSocket Connection Failed"**:
    *   Check your Vercel Environment Variables. Did you specificy `wss://` correctly?
    *   Did you redeploy Vercel after changing variables? (You must redeploy for env vars to take effect).
*   **"Backend Sleeping"**:
    *   Render's Free Tier spins down after 15 minutes of inactivity. The first time you load the app, wait ~1 minute for the backend to wake up.
*   **Mixed Content Error**:
    *   Since Vercel uses HTTPS, your backend MUST use WSS (Secure WebSocket). Render provides SSL automatically, so `wss://...` works out of the box.

---

**Congratulations! Your Traffic Monitoring System is LIVE!** 🌍🚌