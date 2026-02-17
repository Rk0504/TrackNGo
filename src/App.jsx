import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { BusTrackingProvider } from './context/BusTrackingContext'
import LandingPage from './pages/LandingPage'
import TrackingPage from './pages/TrackingPage'

import { AuthProvider } from './context/AuthContext'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import MyComplaintsPage from './pages/MyComplaintsPage'
import ComplaintDetailsPage from './pages/ComplaintDetailsPage'
import DriverMode from './pages/DriverMode'
import SettingsPage from './pages/SettingsPage'

function App() {
  return (
    <AuthProvider>
      <BusTrackingProvider>
        <div className="min-h-screen bg-gray-50 transition-colors duration-200">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/track" element={<TrackingPage />} />
            <Route path="/my-complaints" element={<MyComplaintsPage />} />
            <Route path="/complaint/:complaintId" element={<ComplaintDetailsPage />} />
            <Route path="/driver" element={<DriverMode />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </BusTrackingProvider>
    </AuthProvider>
  )
}

export default App