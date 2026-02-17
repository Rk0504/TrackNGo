import React, { createContext, useContext, useReducer, useEffect } from 'react'
import WebSocketService from '../services/WebSocketService'

const BusTrackingContext = createContext()

const initialState = {
  buses: new Map(),
  selectedBus: null,
  connectionStatus: 'disconnected',
  error: null,
  routes: new Map()
}

function busTrackingReducer(state, action) {
  switch (action.type) {
    case 'SET_CONNECTION_STATUS':
      return { ...state, connectionStatus: action.payload, error: null }

    case 'SET_ERROR':
      return { ...state, error: action.payload, connectionStatus: 'error' }

    case 'UPDATE_BUS':
      const newBuses = new Map(state.buses)
      newBuses.set(action.payload.bus_id, {
        ...newBuses.get(action.payload.bus_id),
        ...action.payload,
        lastUpdate: new Date()
      })
      return { ...state, buses: newBuses, error: null }

    case 'SET_SELECTED_BUS':
      return { ...state, selectedBus: action.payload }

    case 'SET_ROUTES':
      return { ...state, routes: action.payload }

    case 'CLEAR_BUSES':
      return { ...state, buses: new Map() }

    default:
      return state
  }
}

export function BusTrackingProvider({ children }) {
  const [state, dispatch] = useReducer(busTrackingReducer, initialState)

  useEffect(() => {
    const wsService = WebSocketService.getInstance()

    wsService.onConnectionChange((status) => {
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: status })
    })

    wsService.onBusUpdate((busData) => {
      dispatch({ type: 'UPDATE_BUS', payload: busData })
    })

    wsService.onError((error) => {
      dispatch({ type: 'SET_ERROR', payload: error.message })
    })

    return () => {
      wsService.disconnect()
    }
  }, [])

  const value = {
    ...state,
    selectBus: (busId) => dispatch({ type: 'SET_SELECTED_BUS', payload: busId }),
    connect: () => WebSocketService.getInstance().connect(),
    disconnect: () => WebSocketService.getInstance().disconnect()
  }

  return (
    <BusTrackingContext.Provider value={value}>
      {children}
    </BusTrackingContext.Provider>
  )
}

export function useBusTracking() {
  const context = useContext(BusTrackingContext)
  if (!context) {
    throw new Error('useBusTracking must be used within a BusTrackingProvider')
  }
  return context
}