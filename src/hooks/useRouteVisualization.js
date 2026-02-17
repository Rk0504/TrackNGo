import { useEffect, useRef } from 'react'
import { getBusRoute, getBusStops } from '../data/mockRoutes'

export function useRouteVisualization(map, buses, selectedBus) {
  const routePolylinesRef = useRef(new Map())
  const busStopMarkersRef = useRef(new Map())
  const isInitializedRef = useRef(false)

  // Initialize bus stops on map
  useEffect(() => {
    if (!map || isInitializedRef.current) return

    const busStops = getBusStops()

    // Create markers
    busStops.forEach(stop => {
      // Calculate initial state
      const initialZoom = map.getZoom();
      const labelVisible = initialZoom >= 13;
      const fontSize = Math.max(10, Math.min(14, initialZoom - 3)) + 'px';

      const marker = new google.maps.Marker({
        position: { lat: stop.lat, lng: stop.lng },
        map: map,
        title: stop.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: '#FF0000',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
          labelOrigin: new google.maps.Point(0, -5) // Position text closer to dot
        },
        label: labelVisible ? {
          text: stop.name,
          color: '#2d3748',
          fontWeight: 'bold',
          fontSize: fontSize,
        } : null,
        zIndex: 10
      })

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <div class="font-bold text-gray-900 text-sm">${stop.name}</div>
            <div class="text-xs text-gray-600">Bus Stop</div>
          </div>
        `
      })

      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });

      busStopMarkersRef.current.set(stop.id, marker)
    })

    isInitializedRef.current = true

    // Add Zoom Listener for Dynamic Labels
    const zoomListener = map.addListener('zoom_changed', () => {
      const zoom = map.getZoom();

      busStopMarkersRef.current.forEach((marker, id) => {
        const stop = busStops.find(s => s.id === id);
        let name = stop ? stop.name : marker.getTitle();

        // Format name to be shorter
        name = name.replace(/ \(or\) /g, '/'); // Replace " (or) " with "/"

        if (zoom < 13) {
          // Hide labels if zoomed out
          marker.setLabel(null);
        } else {
          // Scale font size
          const size = Math.max(10, Math.min(13, zoom - 3));

          // Truncate for mid-zoom levels if too long
          if (zoom < 16 && name.length > 20) {
            name = name.split('/')[0]; // Show only first part for long names at mid-zoom
          }

          marker.setLabel({
            text: name,
            color: '#2d3748',
            fontWeight: '600',
            fontSize: `${size}px`,
          });
        }
      });
    });

    return () => {
      google.maps.event.removeListener(zoomListener);
      busStopMarkersRef.current.forEach(marker => {
        marker.setMap(null)
      })
      busStopMarkersRef.current.clear()
      isInitializedRef.current = false
    }
  }, [map])

  // Handle route visualization based on selected bus
  useEffect(() => {
    if (!map) return

    // Clear existing route polylines
    routePolylinesRef.current.forEach(polyline => {
      polyline.setMap(null)
    })
    routePolylinesRef.current.clear()

    // If no bus is selected, show all routes lightly
    if (!selectedBus || !buses.has(selectedBus)) {
      // Show all routes with reduced opacity
      buses.forEach(bus => {
        if (bus.route_id) {
          const route = getBusRoute(bus.route_id)
          if (route) {
            drawRoute(route, false, bus)
          }
        }
      })
      return
    }

    // Show selected bus route prominently
    const selectedBusData = buses.get(selectedBus)
    if (selectedBusData && selectedBusData.route_id) {
      const selectedRoute = getBusRoute(selectedBusData.route_id)
      if (selectedRoute) {
        drawRoute(selectedRoute, true, selectedBusData)

        // Show other routes with reduced opacity
        buses.forEach((bus, busId) => {
          if (busId !== selectedBus && bus.route_id && bus.route_id !== selectedBusData.route_id) {
            const route = getBusRoute(bus.route_id)
            if (route) {
              drawRoute(route, false, bus)
            }
          }
        })
      }
    }
  }, [map, buses, selectedBus])

  const drawRoute = (route, isHighlighted, busData) => {
    if (!route || !route.coordinates) return

    const polylineOptions = {
      path: route.coordinates,
      map: map,
      strokeColor: route.color,
      strokeOpacity: isHighlighted ? 0.9 : 0.3,
      strokeWeight: isHighlighted ? 6 : 3,
      zIndex: isHighlighted ? 100 : 50
    }

    // Create completed and upcoming path segments if bus data is available
    if (isHighlighted && busData) {
      drawProgressRoute(route, busData, polylineOptions)
    } else {
      // Draw simple route polyline
      const polyline = new google.maps.Polyline(polylineOptions)
      routePolylinesRef.current.set(`${route.id}_main`, polyline)
    }
  }

  const drawProgressRoute = (route, busData, baseOptions) => {
    const busPosition = { lat: busData.lat, lng: busData.lng }
    const routeCoordinates = route.coordinates

    // Find the closest point on the route to the bus
    let closestIndex = 0
    let minDistance = Number.MAX_VALUE

    routeCoordinates.forEach((coord, index) => {
      const distance = getDistance(busPosition, coord)
      if (distance < minDistance) {
        minDistance = distance
        closestIndex = index
      }
    })

    // Draw completed path (lighter color)
    if (closestIndex > 0) {
      const completedPath = routeCoordinates.slice(0, closestIndex + 1)
      if (busPosition) {
        completedPath.push(busPosition)
      }

      const completedPolyline = new google.maps.Polyline({
        ...baseOptions,
        path: completedPath,
        strokeOpacity: 0.6,
        strokeWeight: 4,
        strokeColor: '#9ca3af', // Gray color for completed path
        zIndex: 90
      })
      routePolylinesRef.current.set(`${route.id}_completed`, completedPolyline)
    }

    // Draw upcoming path (bold color)
    if (closestIndex < routeCoordinates.length - 1) {
      const upcomingPath = [busPosition, ...routeCoordinates.slice(closestIndex + 1)]

      const upcomingPolyline = new google.maps.Polyline({
        ...baseOptions,
        path: upcomingPath,
        strokeOpacity: 1.0,
        strokeWeight: 6,
        zIndex: 100
      })
      routePolylinesRef.current.set(`${route.id}_upcoming`, upcomingPolyline)
    }
  }

  const getDistance = (pos1, pos2) => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = toRadians(pos2.lat - pos1.lat)
    const dLng = toRadians(pos2.lng - pos1.lng)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(pos1.lat)) * Math.cos(toRadians(pos2.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const toRadians = (degrees) => {
    return degrees * (Math.PI / 180)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      routePolylinesRef.current.forEach(polyline => {
        polyline.setMap(null)
      })
      busStopMarkersRef.current.forEach(marker => {
        marker.setMap(null)
      })
    }
  }, [])

  return {
    routePolylines: routePolylinesRef.current,
    busStopMarkers: busStopMarkersRef.current
  }
}