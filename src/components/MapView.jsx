import React, { useRef, useEffect } from 'react'
import { useGoogleMaps } from '../hooks/useGoogleMaps'
import { useRouteVisualization } from '../hooks/useRouteVisualization'
import { useBusTracking } from '../context/BusTrackingContext'
import BusMarker from './BusMarker'
import LoadingSpinner from './LoadingSpinner'

function MapView() {
  const mapRef = useRef(null)
  const { buses, selectedBus, selectBus } = useBusTracking()
  const {
    map,
    isLoaded,
    error,
    addMarker,
    updateMarker,
    removeMarker,
    addPolyline,
    panTo
  } = useGoogleMaps(mapRef)

  // Map Styles (Default/Light only)
  const mapStyles = [
    { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
    { featureType: "poi.business", stylers: [{ visibility: "off" }] },
    { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { featureType: "transit", elementType: "labels.icon", stylers: [{ visibility: "off" }] }
  ]

  // Set map style on load
  useEffect(() => {
    if (map) {
      map.setOptions({ styles: mapStyles })
    }
  }, [map])

  const markersRef = useRef(new Map())
  const infoWindowsRef = useRef(new Map())

  // Use route visualization hook
  useRouteVisualization(map, buses, selectedBus)

  // Handle bus marker updates
  useEffect(() => {
    if (!map || !isLoaded) return

    buses.forEach((bus, busId) => {
      const position = { lat: bus.lat, lng: bus.lng }
      const isSelected = selectedBus === busId

      if (markersRef.current.has(busId)) {
        // Update existing marker
        const marker = markersRef.current.get(busId)

        // Smooth animation to new position
        if (marker && google.maps.geometry) {
          const currentPos = marker.getPosition()
          const newPos = new google.maps.LatLng(bus.lat, bus.lng)

          if (currentPos && !currentPos.equals(newPos)) {
            marker.setPosition(newPos)
          }
        }

        // Update InfoWindow content live
        const infoWindow = infoWindowsRef.current.get(busId)
        if (infoWindow) {
          infoWindow.setContent(createInfoWindowContent(bus))
        }

        updateMarker(busId, position, {
          icon: createBusIcon(bus, isSelected),
          title: `${bus.bus_id} - ${bus.route_name || 'Unknown Route'}`
        })
      } else {
        // Create new marker
        const marker = addMarker(busId, position, {
          icon: createBusIcon(bus, isSelected),
          title: `${bus.bus_id} - ${bus.route_name || 'Unknown Route'}`,
          zIndex: isSelected ? 1000 : 100
        })

        if (marker) {
          markersRef.current.set(busId, marker)

          // Add click listener
          marker.addListener('click', () => {
            selectBus(busId)
            panTo(position, 14)
          })

          // Add info window
          const infoWindow = new google.maps.InfoWindow({
            content: createInfoWindowContent(bus)
          })
          infoWindowsRef.current.set(busId, infoWindow)

          marker.addListener('click', () => {
            infoWindow.open(map, marker)
            selectBus(busId)
          })
        }
      }
    })

    // Remove markers for buses that no longer exist
    markersRef.current.forEach((marker, busId) => {
      if (!buses.has(busId)) {
        removeMarker(busId)

        // Remove info window
        if (infoWindowsRef.current.has(busId)) {
          infoWindowsRef.current.get(busId).close()
          infoWindowsRef.current.delete(busId)
        }

        markersRef.current.delete(busId)
      }
    })
  }, [map, isLoaded, buses, selectedBus, selectBus, addMarker, updateMarker, removeMarker, panTo])

  // Handle selected bus focus
  useEffect(() => {
    if (selectedBus && buses.has(selectedBus)) {
      const bus = buses.get(selectedBus)
      panTo({ lat: bus.lat, lng: bus.lng }, 15)
    }
  }, [selectedBus, buses, panTo])

  const createBusIcon = (bus, isSelected) => {
    // Determine icon based on selection
    // Active/Selected bus gets a slightly larger, different colored icon if possible
    // Google Maps standard icons:
    // Blue Bus: http://maps.google.com/mapfiles/kml/shapes/bus.png
    // We can filter this or use a different one. 

    // For now, let's use the standard bus icon. 
    // If selected, we can scale it up.

    return {
      url: "https://cdn-icons-png.flaticon.com/512/3448/3448339.png", // A nice flat bus icon
      scaledSize: new google.maps.Size(isSelected ? 40 : 30, isSelected ? 40 : 30),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(15, 15) // Center
    }
  }

  const createInfoWindowContent = (bus) => {
    return `
      <div class="p-2 min-w-48">
        <div class="font-semibold text-gray-900">${bus.bus_id}</div>
        <div class="text-sm text-gray-600 mb-2">${bus.route_name || 'Unknown Route'}</div>
        <div class="text-sm space-y-1">
          <div><span class="font-medium">Speed:</span> ${Math.round(bus.speed || 0)} km/h</div>
          <div><span class="font-medium">Safety Score:</span> ${bus.safety_score ?? 100}</div>
          <div><span class="font-medium">ETA:</span> ${bus.eta || 'Unknown'}</div>
          <div class="text-xs text-gray-500">
            Last update: ${bus.lastUpdate ? new Date(bus.lastUpdate).toLocaleTimeString() : 'Unknown'}
          </div>
        </div>
      </div>
    `
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-center p-6">
          <div className="text-red-600 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Map Loading Error</h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary text-sm"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full" />

      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-50">
          <LoadingSpinner size="lg" message="Loading map..." />
        </div>
      )}

      {/* Map controls overlay removed - moved to sidebar */}

      {/* Legend */}
      <div className="hidden md:block absolute top-4 right-4 z-10 opacity-90 hover:opacity-100 transition-opacity">
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 p-3 text-xs">
          <div className="font-bold text-gray-900 mb-2 uppercase tracking-wider text-[10px]">Tracker Legend</div>
          <div className="flex items-center space-x-2 mb-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></div>
            <span className="text-gray-600 font-medium">Active Bus</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50 animate-pulse"></div>
            <span className="text-gray-600 font-medium">Bus Stops</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MapView