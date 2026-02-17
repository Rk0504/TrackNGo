import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBusTracking } from '../context/BusTrackingContext'
import ConnectionStatus from './ConnectionStatus'
import ComplaintModal from './ComplaintModal'

function Sidebar() {
  const { buses, selectedBus, selectBus, connectionStatus, connect, disconnect } = useBusTracking()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false)
  const [expandedBusId, setExpandedBusId] = useState(null)

  const busArray = Array.from(buses.values()).sort((a, b) => a.bus_id.localeCompare(b.bus_id))

  const handleBusClick = (busId) => {
    selectBus(busId === selectedBus ? null : busId)
  }

  const toggleSchedule = (e, busId) => {
    e.stopPropagation()
    setExpandedBusId(expandedBusId === busId ? null : busId)
  }

  const handleConnectionToggle = () => {
    if (connectionStatus === 'connected' || connectionStatus === 'connecting') {
      disconnect()
    } else {
      connect()
    }
  }

  const formatLastUpdate = (timestamp) => {
    if (!timestamp) return 'Unknown'
    const now = new Date()
    const update = new Date(timestamp)
    const diffInSeconds = Math.floor((now - update) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    return update.toLocaleTimeString()
  }

  const formatStopTime = (minutesFromStart) => {
    return `+${Math.round(minutesFromStart)}m`
  }

  return (
    <>
      <div className={`h-full z-10 flex flex-col transition-all duration-300 border border-gray-200/50 backdrop-blur-xl bg-white/90 shadow-2xl rounded-3xl ${isCollapsed ? 'w-20' : 'w-80'}`}>
        {/* Branding & Header */}
        <div className="p-4 border-b border-gray-200/50 flex flex-col space-y-4">

          {/* Logo Area */}
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isCollapsed && (
              <Link to="/" className="flex items-center space-x-2 group">
                <div className="w-8 h-8 bg-gradient-to-tr from-primary-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-primary-500/30 transition-all">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 group-hover:from-primary-600 group-hover:to-purple-600 transition-all">
                    TrackNGo
                  </h1>
                </div>
              </Link>
            )}

            {/* Collapse Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100/50 rounded-lg transition-all"
            >
              <svg
                className={`w-5 h-5 transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Controls Area (Active Count) */}
          <div className={`flex items-center ${isCollapsed ? 'flex-col space-y-4' : 'justify-between'}`}>
            {!isCollapsed && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">Live Status</h2>
                <p className="text-sm font-semibold text-gray-700">{busArray.length} buses online</p>
              </div>
            )}
          </div>
        </div>

        {!isCollapsed && (
          <>
            {/* Connection Status */}
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-semibold text-gray-700 tracking-wide">
                    {connectionStatus === 'connected' ? 'Live Feed Active' : 'Offline'}
                  </span>
                </div>
                {/* <ConnectionStatus status={connectionStatus} />  -- using custom simpler status above */}
              </div>
              <button
                onClick={handleConnectionToggle}
                className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm ${connectionStatus === 'connected' || connectionStatus === 'connecting'
                  ? 'bg-white border border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-200'
                  : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-500/30 shadow-lg'
                  }`}
              >
                {connectionStatus === 'connected' ? 'Disconnect' :
                  connectionStatus === 'connecting' ? 'Connecting...' : 'Connect to Live Feed'}
              </button>
            </div>

            {/* Bus List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
              {busArray.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-60">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <h3 className="text-gray-900 font-semibold mb-1">No Active Buses</h3>
                  <p className="text-sm text-gray-500 max-w-[200px]">
                    {connectionStatus === 'connected'
                      ? 'Waiting for GPS signals...'
                      : 'Connect to see buses on map'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {busArray.map((bus) => (
                    <div
                      key={bus.bus_id}
                      onClick={() => handleBusClick(bus.bus_id)}
                      className={`group rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden ${selectedBus === bus.bus_id
                        ? 'border-primary-500 bg-primary-50 shadow-md transform scale-[1.02]'
                        : 'border-transparent bg-white hover:border-gray-200 hover:shadow-sm'
                        }`}
                    >
                      <div className="p-3.5">
                        {/* Bus Header */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${selectedBus === bus.bus_id ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'}`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                              </svg>
                            </div>
                            <div>
                              <span className="block font-bold text-gray-900 text-sm">{bus.bus_id}</span>
                              <span className="block text-xs text-gray-500">{bus.route_name || 'Route 12'}</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-medium text-gray-400 bg-gray-50 border border-gray-100 px-2 py-1 rounded-full">
                            {formatLastUpdate(bus.lastUpdate)}
                          </span>
                        </div>

                        {/* Bus Details */}
                        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                          {/* Next Stop Row */}
                          {bus.next_stop && (
                            <div
                              onClick={(e) => toggleSchedule(e, bus.bus_id)}
                              className="flex items-center justify-between hover:bg-black/5 p-1 -mx-1 rounded-lg cursor-pointer transition-colors"
                            >
                              <div className="flex items-center space-x-1.5 overflow-hidden">
                                <svg className={`w-3.5 h-3.5 text-primary-500 flex-shrink-0 transition-transform ${expandedBusId === bus.bus_id ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                <span className="text-xs font-semibold text-gray-700 truncate" title="Click to view full schedule">
                                  Next: {bus.next_stop}
                                </span>
                              </div>
                              {bus.eta && (
                                <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                                  {bus.eta}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center space-x-1.5">
                              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              <span className="text-xs font-medium text-gray-600">{Math.round(bus.speed || 0)} km/h</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <div className={`w-1.5 h-1.5 rounded-full ${(bus.safety_score ?? 100) >= 90 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                              <span className="text-xs font-medium text-gray-600">Safety: {bus.safety_score ?? 100}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Schedule View */}
                      {expandedBusId === bus.bus_id && bus.stops && (
                        <div className="bg-gray-50 border-t border-gray-100 p-3 mx-1 mb-2 rounded-b-2xl -mt-2 shadow-inner">
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
                                    {formatStopTime(stop.time)}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-white border-t border-gray-100 rounded-b-3xl space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/"
                  className="flex items-center justify-center space-x-2 bg-gray-50 text-gray-700 text-sm font-semibold py-3 px-4 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Home</span>
                </Link>

                <button
                  onClick={() => window.location.href = '/settings'}
                  className="flex items-center justify-center space-x-2 bg-gray-50 text-gray-700 text-sm font-semibold py-3 px-4 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Settings</span>
                </button>
              </div>

              <button
                onClick={() => setIsComplaintModalOpen(true)}
                className="w-full flex items-center justify-center space-x-2 bg-red-50 text-red-600 text-sm font-semibold py-3 px-4 rounded-xl hover:bg-red-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Report Issue</span>
              </button>

              <div className="text-xs text-gray-500 text-center pt-2">
                <div className="mb-1">TrackNGo - Thanjavur Region</div>
                <div>Click on a bus to track it on the map</div>
              </div>
            </div>
          </>
        )}

        {/* Collapsed State Content */}
        {isCollapsed && (
          <div className="flex-1 flex flex-col items-center py-4 space-y-4">
            <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} title={connectionStatus}></div>

            <button
              onClick={() => setIsComplaintModalOpen(true)}
              className="bg-red-50 text-red-600 p-2 rounded-xl hover:bg-red-100"
              title="Raise Complaint"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </button>
            <div className="flex-1"></div>
            <div className="text-sm font-bold text-gray-500">
              {busArray.length}
            </div>
          </div>
        )}
      </div>

      <ComplaintModal
        isOpen={isComplaintModalOpen}
        onClose={() => setIsComplaintModalOpen(false)}
      />
    </>
  )
}

export default Sidebar