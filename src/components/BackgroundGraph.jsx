import React, { useEffect, useRef } from 'react'

export default function BackgroundGraph({ density = 28, color = 'rgba(127,90,240,0.12)' }) {
  const ref = useRef()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let running = true

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', resize)
    resize()

    const nodes = Array.from({ length: Math.max(12, Math.floor((canvas.width * canvas.height) / 80000)) }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: 1 + Math.random() * 2
    }))

    function step() {
      if (!running) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 160) {
            ctx.strokeStyle = `rgba(127,90,240,${(1 - d / 160) * 0.08})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      for (const n of nodes) {
        n.x += n.vx
        n.y += n.vy
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fill()
      }
      requestAnimationFrame(step)
    }

    step()
    return () => { running = false; window.removeEventListener('resize', resize) }
  }, [density, color])

  return (
    <canvas ref={ref} className="bg-canvas" aria-hidden />
  )
}
