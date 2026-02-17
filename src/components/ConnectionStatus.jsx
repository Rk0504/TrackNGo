import React from 'react'

function ConnectionStatus({ status, className = '' }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'connected':
        return {
          label: 'Live',
          icon: '🟢',
          className: 'status-indicator status-live'
        }
      case 'connecting':
      case 'reconnecting':
        return {
          label: 'Reconnecting',
          icon: '🟡',
          className: 'status-indicator status-reconnecting'
        }
      case 'disconnected':
      case 'error':
      default:
        return {
          label: 'Offline',
          icon: '🔴',
          className: 'status-indicator status-offline'
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <div className={`${config.className} ${className}`}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </div>
  )
}

export default ConnectionStatus