import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useBusTracking } from '../context/BusTrackingContext'

import { useAuth } from '../context/AuthContext'

function LandingPage() {
  const { connect } = useBusTracking()
  const { user } = useAuth()

  useEffect(() => {
    // Pre-connect to WebSocket when landing page loads for better UX
    const timer = setTimeout(() => {
      connect()
    }, 1000)

    return () => clearTimeout(timer)
  }, [connect])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">TrackNGo</h1>
                <p className="text-sm text-gray-600">Secure Bus Tracking</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link to="/my-complaints" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                    My Complaints
                  </Link>
                  <Link to="/track" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                    Track Buses
                  </Link>
                  <span className="text-sm text-gray-500">Welcome, {user.name}</span>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900">Sign in</Link>
                  <Link to="/register" className="text-sm font-medium text-primary-600 hover:text-primary-500">Register</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 lg:py-24">
          <div className="text-center">
            {/* Main Heading */}
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              TrackNGo
            </h1>

            {/* Subtitle */}
            <p className="text-xl lg:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Secure Real-Time Bus Tracking – Thanjavur Region
            </p>

            {/* Description */}
            <div className="max-w-2xl mx-auto mb-12">
              <p className="text-lg text-gray-700 mb-6">
                Experience safe and reliable bus tracking with real-time location updates,
                route information, and estimated arrival times for all buses in the Thanjavur district.
              </p>

              {/* Features Grid */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Real-Time</h3>
                  <p className="text-sm text-gray-600">Live location updates every few seconds</p>
                </div>

                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Secure</h3>
                  <p className="text-sm text-gray-600">Privacy-first with encrypted data</p>
                </div>

                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Local Focus</h3>
                  <p className="text-sm text-gray-600">Dedicated to Thanjavur district</p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="space-y-4">
              <Link
                to="/track"
                className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                View Live Buses
              </Link>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 py-16">
          <div className="card p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Route Tracking</h3>
              <p className="text-gray-600">
                Follow buses in real-time along their designated routes with accurate positioning and smooth animations.
              </p>
            </div>
          </div>

          <div className="card p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Arrival Predictions</h3>
              <p className="text-gray-600">
                Get accurate ETA information for the next bus stop based on current traffic and route conditions.
              </p>
            </div>
          </div>

          <div className="card p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Mobile Responsive</h3>
              <p className="text-gray-600">
                Access TrackNGo from any device with a fully responsive design optimized for mobile and desktop.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 text-gray-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-gray-800">TrackNGo</span>
            </div>
            <p className="text-gray-500 mb-4">
              Secure Real-Time Bus Tracking for Thanjavur Region
            </p>
            <div className="text-sm text-gray-400">
              Built for academic purposes • District-level transportation management <Link to="/driver" className="text-gray-400 hover:text-primary-600 no-underline">•</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage