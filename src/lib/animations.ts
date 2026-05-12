import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface AnimOptions {
  delay?: number
  duration?: number
  stagger?: number
  trigger?: Element | string
}

export function fadeUp(targets: gsap.TweenTarget, options: AnimOptions = {}) {
  return gsap.fromTo(
    targets,
    { opacity: 0, y: 32 },
    {
      opacity: 1,
      y: 0,
      duration: options.duration ?? 0.75,
      ease: 'power2.out',
      stagger: options.stagger ?? 0,
      delay: options.delay ?? 0,
      scrollTrigger: {
        trigger: (options.trigger ?? targets) as gsap.DOMTarget,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
    },
  )
}

export function fadeIn(targets: gsap.TweenTarget, options: AnimOptions = {}) {
  return gsap.fromTo(
    targets,
    { opacity: 0 },
    {
      opacity: 1,
      duration: options.duration ?? 0.9,
      ease: 'power1.out',
      delay: options.delay ?? 0,
      scrollTrigger: {
        trigger: (options.trigger ?? targets) as gsap.DOMTarget,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
    },
  )
}

export { gsap, ScrollTrigger }
