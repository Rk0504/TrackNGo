# 🚀 How to Run & Stop TrackNGo

This guide acts as a quick reference for starting and stopping the entire TrackNGo system (Backend, Frontend, and Simulator).

You will need **3 separate terminal windows** to run the full system.

---

## ▶️ Starting the Application

### Terminal 1: The Backend (Server)
This creates the API and WebSocket server. It must be running first.

1.  Open a terminal in the project root.
2.  Navigate to the backend folder and start the server:
    ```bash
    cd backend
    npm start
    ```
    > **Success**: Look for `Server running on port 8080` and `WebSocket server initialized`.

### Terminal 2: The Frontend (User Interface)
This launches the web application in your browser.

1.  Open a **new** terminal window.
2.  Start the frontend dev server:
    ```bash
    npm run dev
    ```
    > **Success**: Look for `Local: http://localhost:5173/`. Open this link in your browser.

### Terminal 3: The GPS Simulator (Mock Data)
This simulates buses moving around so you can see live updates.

1.  Open a **new** terminal window.
2.  Navigate to the simulator folder and start it:
    ```bash
    cd gps-simulator
    npm start
    ```
    > **Success**: Look for logs like `✅ Sent TN-THJ-23...`.

---

## ⏹️ Stopping the Application

To stop any component, go to its specific terminal window and press:

**`Ctrl + C`**

Repeat this for all 3 terminals to completely shut down the system.

### 🧹 Port Cleanup (If it won't restart)
If you try to restart and get an error like `EADDRINUSE` (Port already in use), it means a process didn't close properly.

**Windows PowerShell:**
To kill the process on port 8080 (Backend):
```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess -Force
```

To kill the process on port 5173 (Frontend):
```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess -Force
```
