import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useBusTracking } from '../context/BusTrackingContext'
import MapView from '../components/MapView'
import Sidebar from '../components/Sidebar'
import ConnectionStatus from '../components/ConnectionStatus'
import WebSocketService from '../services/WebSocketService'
import ComplaintModal from '../components/ComplaintModal'

function TrackingPage() {
  const { connectionStatus, connect, error, buses, selectedBus, selectBus } = useBusTracking()
  const [showDemoMode, setShowDemoMode] = useState(false)

  // Mobile UI States
  const [isMobileListOpen, setIsMobileListOpen] = useState(false)
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false)
  const [expandedBusId, setExpandedBusId] = useState(null) // For mobile schedule expansion

  const busArray = Array.from(buses.values()).sort((a, b) => a.bus_id.localeCompare(b.bus_id))

  useEffect(() => {
    connect()
    const timer = setTimeout(() => {
      if (connectionStatus === 'disconnected' || connectionStatus === 'error') {
        setShowDemoMode(true)
      }
    }, 5000)
    return () => clearTimeout(timer)
  }, [connect, connectionStatus])

  const handleStartDemo = () => {
    const wsService = WebSocketService.getInstance()
    wsService.startMockData()
    setShowDemoMode(false)
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden relative">

      {/* --- MOBILE HEADER (Floating transparent) --- */}
      <div className="md:hidden absolute top-0 left-0 right-0 z-20 p-4 pointer-events-none">
        <div className="flex items-center justify-between pointer-events-auto">
          <div className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg border border-gray-100 flex items-center space-x-2 pr-4">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm">
              TG
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-800 leading-tight">TrackNGo</h1>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                  {connectionStatus === 'connected' ? 'LIVE' : 'OFFLINE'}
                </span>
              </div>
            </div>
          </div>

          <Link to="/" className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg border border-gray-100 text-gray-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative h-full w-full">
        {/* Desktop Sidebar (Floating) */}
        <div className="hidden md:block absolute top-4 left-4 bottom-4 z-10 w-fit">
          <Sidebar />
        </div>

        {/* Map */}
        <div className="h-full w-full">
          <MapView />

          {/* Mobile FAB - Report Issue */}
          <div className="md:hidden absolute bottom-24 right-4 z-20">
            <button
              onClick={() => setIsComplaintModalOpen(true)}
              className="bg-red-600 text-white p-4 rounded-full shadow-xl hover:bg-red-700 active:scale-95 transition-transform flex items-center justify-center border-2 border-white"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </button>
          </div>

          {/* Mobile Bottom Sheet (Bus List) */}
          <div className={`md:hidden absolute bottom-0 left-0 right-0 z-20 transition-transform duration-300 ease-in-out transform ${isMobileListOpen ? 'translate-y-0' : 'translate-y-[85%]'}`}>
            <div
              className="bg-white rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.1)] h-[80vh] flex flex-col"
            >
              {/* Drag Handle & Header */}
              <div
                className="p-4 border-b border-gray-100 flex-shrink-0 cursor-pointer bg-white rounded-t-3xl"
                onClick={() => setIsMobileListOpen(!isMobileListOpen)}
              >
                <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-800">
                    Active Buses <span className="text-primary-600">({busArray.length})</span>
                  </h2>
                  <button className="text-sm font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                    {isMobileListOpen ? 'Close List' : 'View All'}
                  </button>
                </div>
              </div>

              {/* Scrollable List */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 pb-24">
                {busArray.map(bus => (
                  <div
                    key={bus.bus_id}
                    onClick={() => {
                      // If already selected, maybe toggle expand? 
                      // For now, keep behavior: select and close list to show map
                      // But user wants "Previous Travels" (Schedule) which is inside the list usually.
                      // I will make the CLICK select the bus, but I need a separate "View Map" button maybe?
                      selectBus(bus.bus_id)
                      // setIsMobileListOpen(false) // Don't close immediately if we want to show details
                    }}
                    className={`bg-white p-4 rounded-xl shadow-sm border mb-3 flex flex-col ${selectedBus === bus.bus_id ? 'border-primary-500 ring-1 ring-primary-500' : 'border-gray-100'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">{bus.bus_id}</h3>
                          <p className="text-xs text-gray-500">{bus.route_name || 'Route 12 - Thanjavur'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-800">{Math.round(bus.speed || 0)} <span className="text-xs font-normal text-gray-500">km/h</span></div>
                        {/* Safety Score for Mobile */}
                        <div className="flex items-center justify-end space-x-1 mt-1">
                          <div className={`w-2 h-2 rounded-full ${(bus.safety_score ?? 100) >= 90 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-xs font-bold text-gray-600">{bus.safety_score ?? 100}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Next Stop & ETA */}
                    {bus.next_stop && (
                      <div className="bg-gray-50 rounded-lg p-2 mb-2 flex justify-between items-center text-xs">
                        <span className="text-gray-500">Next: <span className="font-bold text-gray-800">{bus.next_stop}</span></span>
                        {bus.eta && <span className="bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded">{bus.eta}</span>}
                      </div>
                    )}

                    {/* View Map & Schedule Buttons */}
                    <div className="mt-2 flex space-x-2">
                      {selectedBus === bus.bus_id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsMobileListOpen(false);
                          }}
                          className="flex-1 bg-primary-50 text-primary-600 font-bold py-2 rounded-lg text-sm"
                        >
                          View Map
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedBusId(expandedBusId === bus.bus_id ? null : bus.bus_id);
                        }}
                        className="flex-1 bg-gray-100 text-gray-600 font-bold py-2 rounded-lg text-sm flex items-center justify-center space-x-1"
                      >
                        <span>{expandedBusId === bus.bus_id ? 'Hide Stops' : 'View Stops'}</span>
                        <svg className={`w-4 h-4 transform transition-transform ${expandedBusId === bus.bus_id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    {/* Timeline / Schedule (Previous Travels) */}
                    {expandedBusId === bus.bus_id && bus.stops && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Route Schedule</h4>
                        <div className="space-y-0 relative pl-2">
                          {/* Line Connector */}
                          <div className="absolute left-[13.5px] top-1 bottom-1 w-[1px] bg-gray-200"></div>

                          {bus.stops.map((stop, index) => {
                            const isPast = index < (bus.currentStopIndex || 0);
                            const isCurrent = index === (bus.currentStopIndex || 0);
                            return (
                              <div key={index} className="relative flex items-center space-x-3 py-1.5 group/stop">
                                <div className={`w-3 h-3 rounded-full border-2 z-10 flex-shrink-0 ${isCurrent
                                  ? 'bg-primary-500 border-primary-200 ring-2 ring-primary-100'
                                  : isPast
                                    ? 'bg-gray-300 border-gray-100'
                                    : 'bg-white border-gray-300'
                                  }`}></div>
                                <div className="flex-1 min-w-0">
                                  <div className={`text-xs truncate ${isCurrent ? 'font-bold text-gray-900' : isPast ? 'text-gray-400 line-through' : 'text-gray-600'}`}>
                                    {stop.name}
                                  </div>
                                </div>
                                <div className="text-[10px] text-gray-400 font-mono">
                                  {`+${Math.round(stop.time)}m`}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {busArray.length === 0 && (
                  <div className="text-center py-10 text-gray-400">
                    <p>No buses currently online</p>
                    {showDemoMode && (
                      <button onClick={handleStartDemo} className="mt-4 text-primary-600 font-bold underline">Start Demo</button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Complaint Modal (Shared) */}
      <ComplaintModal
        isOpen={isComplaintModalOpen}
        onClose={() => setIsComplaintModalOpen(false)}
      />
    </div>
  )
}

export default TrackingPage