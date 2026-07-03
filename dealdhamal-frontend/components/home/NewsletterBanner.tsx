'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { Mail } from 'lucide-react'
import { trackAlertSubscribe } from '@/lib/analytics'

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  size: number;
  density: number;
  color: string;
}

export function NewsletterBanner() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  const sectionRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const requestRef = useRef<number | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef<{ x: number | null; y: number | null; radius: number }>({
    x: null,
    y: null,
    radius: 130
  })
  const isVisibleRef = useRef(false)

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }
    setLoading(true)
    try {
      await api.subscribeNewsletter(email)
      setSubscribed(true)
      trackAlertSubscribe()
      toast.success('Subscribed! You\'ll get the best deals in your inbox ✓')
    } catch {
      toast.error('Failed to subscribe. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Particle Physics and Simulation Logic
  useEffect(() => {
    const canvas = canvasRef.current
    const section = sectionRef.current
    if (!canvas || !section) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = (canvas.width = section.clientWidth)
    let height = (canvas.height = section.clientHeight)

    // Handle mouse move relative to section bounds
    const handleMouseMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect()
      mouseRef.current.x = e.clientX - rect.left
      mouseRef.current.y = e.clientY - rect.top
    }

    const handleMouseLeave = () => {
      mouseRef.current.x = null
      mouseRef.current.y = null
    }

    section.addEventListener('mousemove', handleMouseMove)
    section.addEventListener('mouseleave', handleMouseLeave)

    // Initialize particles in a beautiful fluid grid
    const initParticles = () => {
      const pArr: Particle[] = []
      const spacing = 32
      const columns = Math.ceil(width / spacing) + 2
      const rows = Math.ceil(height / spacing) + 2

      for (let y = -1; y < rows; y++) {
        for (let x = -1; x < columns; x++) {
          let posX = x * spacing + (y % 2 === 0 ? spacing / 2 : 0)
          let posY = y * spacing

          posX += (Math.random() - 0.5) * 6
          posY += (Math.random() - 0.5) * 6

          const colorVal = Math.random()
          let color = 'rgba(255, 255, 255, ' + (Math.random() * 0.3 + 0.15) + ')'
          if (colorVal > 0.96) {
            color = 'rgba(239, 68, 68, 0.45)' // Brand Red
          } else if (colorVal > 0.90) {
            color = 'rgba(229, 201, 183, 0.5)' // Accent Gold/Peach
          }

          pArr.push({
            x: posX,
            y: posY,
            baseX: posX,
            baseY: posY,
            vx: 0,
            vy: 0,
            size: Math.random() * 1.5 + 0.8,
            density: Math.random() * 20 + 8,
            color
          })
        }
      }
      particlesRef.current = pArr
    }

    initParticles()

    // Animation Loop
    const animate = () => {
      if (!isVisibleRef.current) return

      ctx.fillStyle = 'rgba(11, 10, 18, 0.18)'
      ctx.fillRect(0, 0, width, height)

      const particles = particlesRef.current
      const mouse = mouseRef.current

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - p.x
          const dy = mouse.y - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius
            const directionX = dx / dist
            const directionY = dy / dist

            const pushX = directionX * force * p.density * 0.5
            const pushY = directionY * force * p.density * 0.5
            p.vx -= pushX
            p.vy -= pushY

            const swirlX = -directionY * force * 1.5
            const swirlY = directionX * force * 1.5
            p.vx += swirlX
            p.vy += swirlY
          }
        }

        const rx = p.baseX - p.x
        const ry = p.baseY - p.y
        p.vx += rx * 0.06
        p.vy += ry * 0.06

        p.vx *= 0.86
        p.vy *= 0.86

        p.x += p.vx
        p.y += p.vy

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.fill()
      }

      // Constellation Links
      const maxLineDist = 42
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x
          const dy = particles[a].y - particles[b].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < maxLineDist) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - dist / maxLineDist) * 0.045})`
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(particles[a].x, particles[a].y)
            ctx.lineTo(particles[b].x, particles[b].y)
            ctx.stroke()
          }
        }
      }

      requestRef.current = requestAnimationFrame(animate)
    }

    // Resize Handler
    const handleResize = () => {
      width = canvas.width = section.clientWidth
      height = canvas.height = section.clientHeight
      initParticles()
    }

    window.addEventListener('resize', handleResize)

    // IntersectionObserver to pause when off-screen
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting
        if (entry.isIntersecting) {
          animate()
        } else {
          if (requestRef.current !== null) {
            cancelAnimationFrame(requestRef.current)
            requestRef.current = null
          }
        }
      },
      { threshold: 0.05 }
    )

    observer.observe(section)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', handleResize)
      section.removeEventListener('mousemove', handleMouseMove)
      section.removeEventListener('mouseleave', handleMouseLeave)
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [])

  return (
    <section 
      ref={sectionRef}
      className="relative w-full rounded-2xl py-12 md:py-20 px-8 text-center overflow-hidden bg-[radial-gradient(circle_at_50%_50%,#151128_0%,#08070d_100%)] border border-white/5 shadow-2xl"
    >
      {/* Background Reactive Canvas */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Glassmorphic Newsletter Card */}
      <div className="relative z-10 max-w-xl mx-auto backdrop-blur-md bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 md:p-12 shadow-xl hover:border-white/[0.12] transition-all duration-500">
        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
          <Mail className="w-6 h-6 text-[#e5c9b7]" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">
          Get the best deals in your inbox
        </h2>
        <p className="text-white/60 mb-8 text-sm md:text-base leading-relaxed">
          Subscribe to our newsletter and never miss a verified deal or coupon again.
        </p>

        {subscribed ? (
          <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white font-semibold shadow-inner">
            🎉 You&apos;re subscribed! Check your inbox.
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto bg-white/[0.04] border border-white/[0.08] p-1.5 rounded-xl sm:rounded-full focus-within:border-red-500/50 focus-within:shadow-[0_0_20px_rgba(239,68,68,0.15)] transition-all duration-300">
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') void handleSubmit() }}
              className="flex-1 bg-transparent px-4 py-2 text-white placeholder-white/30 focus:outline-none text-sm font-medium"
            />
            <button
              onClick={() => void handleSubmit()}
              disabled={loading}
              className="bg-white text-gray-900 font-semibold px-6 py-2.5 rounded-lg sm:rounded-full hover:bg-[#e5c9b7] transition-all duration-300 disabled:opacity-70 whitespace-nowrap text-sm cursor-pointer shadow-md hover:shadow-lg"
            >
              {loading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
