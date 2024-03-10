import { createEffect, createSignal, onCleanup } from 'solid-js'

export const Confetti = (props: { color: string }) => {
  let container: HTMLDivElement | undefined
  let canvas: HTMLCanvasElement | undefined

  createEffect(() => {
    if (!container) return
    const o = new ResizeObserver(ev => {
      if (!canvas) return
      canvas.width = ev[0].contentRect.width
      canvas.height = ev[0].contentRect.height
    })
    o.observe(container)
    onCleanup(() => o.disconnect())
  })

  createEffect(() => {
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    const particles: Particle[] = []

    let frame: number | undefined
    const callback = () => {
      canvas && draw(context, particles, props.color, canvas.width, canvas.height)
      frame = requestAnimationFrame(callback)
    }
    callback()

    onCleanup(() => frame && cancelAnimationFrame(frame))
  })

  return (
    <div ref={container} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <canvas ref={canvas} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}

function randomFromTo(from: number, to: number): number {
  return from + (to - from) * Math.random()
}

class Particle {
  private x: number
  private y: number
  private r: number
  private d: number
  private tilt: number
  private tiltVelocity: number
  private color: string

  constructor(color: string, w: number, h: number) {
    this.x = w * Math.random()
    this.y = -h * Math.random()
    this.r = randomFromTo(10, 20)
    this.d = Math.cos(2 * Math.PI * Math.random())
    this.tilt = 2 * Math.PI * Math.random()
    this.tiltVelocity = randomFromTo(0.05, 0.15)
    this.color = color
  }

  animate(w: number, h: number) {
    this.tilt += this.tiltVelocity / 2
    this.y += (this.d + 3 + this.r / 2) / 4

    // Bring confetti back to the top
    if (this.x > w + 30 || this.x < -30 || this.y > h) {
      this.x = Math.random() * w
      this.y = -30
    }
  }

  draw(context: CanvasRenderingContext2D) {
    let { x, y, r, tilt } = this
    x += Math.sin(tilt) * 20
    const t = Math.abs(Math.sin(1.25 * tilt)) + 0.2

    context.beginPath()
    context.lineWidth = this.r
    context.moveTo(x, y)
    context.strokeStyle = this.color
    context.lineTo(x + r * t * Math.cos(0.5 * tilt), y + r * t * Math.sin(0.5 * tilt))
    context.stroke()
    context.strokeStyle = t < 1 ? `rgba(255, 255, 255, ${0.75 * (1 - t)})` : `rgba(0, 0, 0, ${t - 1})`
    context.lineTo(x + r * t * Math.cos(0.5 * tilt), y + r * t * Math.sin(0.5 * tilt))
    context.stroke()
  }
}

function draw(context: CanvasRenderingContext2D, particles: Particle[], color: string, w: number, h: number) {
  context.save()
  context.globalCompositeOperation = 'destination-in'
  context.fillStyle = '#fff4'
  context.rect(0, 0, w, h)
  context.fill()
  context.restore()

  if (particles.length < 100) {
    particles.push(new Particle(color, w, h))
  }

  for (const particle of particles) {
    particle.animate(w, h)
    particle.draw(context)
  }
}
