import React, { useEffect, useRef } from 'react'

function BusMarker({ bus, map, isSelected, onSelect }) {
  const markerRef = useRef(null)
  const infoWindowRef = useRef(null)

  useEffect(() => {
    if (!map || !google) return

    // Create marker if it doesn't exist
    if (!markerRef.current) {
      markerRef.current = new google.maps.Marker({
        position: { lat: bus.lat, lng: bus.lng },
        map: map,
        title: `${bus.bus_id} - ${bus.route_name}`,
        icon: createBusIcon(bus, isSelected)
      })

      // Create info window
      infoWindowRef.current = new google.maps.InfoWindow({
        content: createInfoWindowContent(bus)
      })

      // Add click listener
      markerRef.current.addListener('click', () => {
        infoWindowRef.current.open(map, markerRef.current)
        onSelect(bus.bus_id)
      })
    } else {
      // Update existing marker
      markerRef.current.setPosition({ lat: bus.lat, lng: bus.lng })
      markerRef.current.setIcon(createBusIcon(bus, isSelected))
      
      // Update info window content
      if (infoWindowRef.current) {
        infoWindowRef.current.setContent(createInfoWindowContent(bus))
      }
    }

    // Cleanup function
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null)
      }
      if (infoWindowRef.current) {
        infoWindowRef.current.close()
      }
    }
  }, [bus, map, isSelected, onSelect])

  const createBusIcon = (busData, selected) => {
    const color = selected ? '#dc2626' : '#2563eb'
    const scale = selected ? 8 : 6
    
    return {
      path: google.maps.SymbolPath.CIRCLE,
      scale: scale,
      fillColor: color,
      fillOpacity: 0.9,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      strokeOpacity: 1,
    }
  }

  const createInfoWindowContent = (busData) => {
    return `
      <div class="p-3 min-w-48">
        <div class="font-semibold text-lg text-gray-900 mb-1">${busData.bus_id}</div>
        <div class="text-sm text-gray-600 mb-3">${busData.route_name || 'Route information unavailable'}</div>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="font-medium text-gray-700">Speed:</span>
            <span class="text-gray-900">${busData.speed || 0} km/h</span>
          </div>
          <div class="flex justify-between">
            <span class="font-medium text-gray-700">ETA:</span>
            <span class="text-gray-900">${busData.eta || 'Calculating...'}</span>
          </div>
          <div class="pt-2 border-t border-gray-200">
            <div class="text-xs text-gray-500">
              Last updated: ${busData.lastUpdate ? new Date(busData.lastUpdate).toLocaleTimeString() : 'Unknown'}
            </div>
          </div>
        </div>
      </div>
    `
  }

  return null // This is a non-visual component that manages Google Maps markers
}

export default BusMarker