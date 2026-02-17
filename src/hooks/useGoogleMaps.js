import { useState, useEffect, useRef } from 'react'
import { Loader } from '@googlemaps/js-api-loader'

const THANJAVUR_CENTER = { lat: 10.749, lng: 79.113 } // Center on New Bus Stand
const THANJAVUR_BOUNDS = {
  north: 11.5,
  south: 10.0,
  east: 80.0,
  west: 78.0
}

export function useGoogleMaps(mapElementRef, options = {}) {
  const [map, setMap] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(null)
  const markersRef = useRef(new Map())
  const polylinesRef = useRef(new Map())

  useEffect(() => {
    let mounted = true

    const initializeMap = async () => {
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
        if (!apiKey) {
          throw new Error('Google Maps API key not found. Please check your .env file.')
        }

        const loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ['geometry', 'places']
        })

        await loader.load()

        if (!mounted || !mapElementRef.current) return

        const mapInstance = new google.maps.Map(mapElementRef.current, {
          center: THANJAVUR_CENTER,
          zoom: 11,
          minZoom: 9,
          maxZoom: 18,
          restriction: {
            latLngBounds: THANJAVUR_BOUNDS,
            strictBounds: false
          },
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER
          },
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
            {
              featureType: "poi.business",
              stylers: [{ visibility: "off" }],
            },
            {
              featureType: "road",
              elementType: "labels.icon",
              stylers: [{ visibility: "off" }],
            },
            {
              featureType: "transit",
              elementType: "labels.icon",
              stylers: [{ visibility: "off" }],
            }
          ],
          ...options
        })

        if (mounted) {
          setMap(mapInstance)
          setIsLoaded(true)
        }

      } catch (err) {
        if (mounted) {
          setError(err.message)
          console.error('Failed to initialize Google Maps:', err)
        }
      }
    }

    initializeMap()

    return () => {
      mounted = false
    }
  }, [])

  const addMarker = (id, position, options = {}) => {
    if (!map) return null

    const marker = new google.maps.Marker({
      position,
      map,
      ...options
    })

    markersRef.current.set(id, marker)
    return marker
  }

  const updateMarker = (id, newPosition, options = {}) => {
    const marker = markersRef.current.get(id)
    if (!marker) return null

    marker.setPosition(newPosition)

    if (options.icon) marker.setIcon(options.icon)
    if (options.title) marker.setTitle(options.title)

    return marker
  }

  const removeMarker = (id) => {
    const marker = markersRef.current.get(id)
    if (marker) {
      marker.setMap(null)
      markersRef.current.delete(id)
    }
  }

  const addPolyline = (id, path, options = {}) => {
    if (!map) return null

    const polyline = new google.maps.Polyline({
      path,
      map,
      strokeColor: '#2563eb',
      strokeOpacity: 0.8,
      strokeWeight: 4,
      ...options
    })

    polylinesRef.current.set(id, polyline)
    return polyline
  }

  const updatePolyline = (id, newPath, options = {}) => {
    const polyline = polylinesRef.current.get(id)
    if (!polyline) return null

    polyline.setPath(newPath)

    if (options.strokeColor) polyline.setOptions({ strokeColor: options.strokeColor })
    if (options.strokeWeight) polyline.setOptions({ strokeWeight: options.strokeWeight })

    return polyline
  }

  const removePolyline = (id) => {
    const polyline = polylinesRef.current.get(id)
    if (polyline) {
      polyline.setMap(null)
      polylinesRef.current.delete(id)
    }
  }

  const panTo = (position, zoom) => {
    if (!map) return

    map.panTo(position)
    if (zoom) map.setZoom(zoom)
  }

  const fitBounds = (bounds) => {
    if (!map) return
    map.fitBounds(bounds)
  }

  return {
    map,
    isLoaded,
    error,
    addMarker,
    updateMarker,
    removeMarker,
    addPolyline,
    updatePolyline,
    removePolyline,
    panTo,
    fitBounds,
    THANJAVUR_CENTER
  }
}