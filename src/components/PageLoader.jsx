import React from 'react'

export default function PageLoader({ visible = false }) {
  if (!visible) return null
  return (
    <div className="page-loader-overlay" role="status" aria-live="polite">
      <div className="page-loader-box">
        <div className="loader-spinner" />
      </div>
    </div>
  )
}
