import React, { useEffect, useRef } from 'react'

export default function InlineNetwork({ density = 18, color = 'rgba(127,90,240,0.04)' }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let width = canvas.clientWidth
    let height = canvas.clientHeight
    canvas.width = width
    canvas.height = height

    const nodes = Array.from({ length: Math.max(6, Math.floor(density)) }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: 1 + Math.random() * 2
    }))

    let running = true

    function resize() {
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = width
      canvas.height = height
    }

    function step() {
      if (!running) return
      ctx.clearRect(0, 0, width, height)
      
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 120) {
            ctx.strokeStyle = `rgba(127,90,240,${(1 - d / 120) * 0.03})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      nodes.forEach(n => {
        n.x += n.vx
        n.y += n.vy
        if (n.x < 0 || n.x > width) n.vx *= -1
        if (n.y < 0 || n.y > height) n.vy *= -1
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fill()
      })

      requestAnimationFrame(step)
    }

    const onResize = () => {
      resize()
    }

    window.addEventListener('resize', onResize)
    step()
    return () => { running = false; window.removeEventListener('resize', onResize) }
  }, [density, color])

  return <canvas ref={ref} className="inline-bg-canvas" aria-hidden />
}
