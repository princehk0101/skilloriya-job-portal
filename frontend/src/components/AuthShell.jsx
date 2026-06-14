import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { CheckCircle2 } from 'lucide-react'

const AuthShell = ({
  title,
  description,
  sideTitle,
  sideDescription,
  highlights = [],
  footer,
  children,
}) => {
  const shellRef = useRef(null)
  const heroRef = useRef(null)
  const cardRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        shellRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: 'power2.out' }
      )

      gsap.fromTo(
        heroRef.current,
        { y: 42, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }
      )

      gsap.fromTo(
        cardRef.current,
        { x: 36, opacity: 0, rotate: -1.5 },
        { x: 0, opacity: 1, rotate: 0, duration: 0.95, ease: 'power3.out', delay: 0.12 }
      )

      gsap.fromTo(
        '.auth-highlight',
        { y: 18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.12,
          ease: 'power2.out',
          delay: 0.28,
        }
      )
    }, shellRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={shellRef}
      className="relative min-h-screen overflow-hidden px-4 py-10 text-slate-900 sm:px-6 lg:px-8"
    >
      <div className="pointer-events-none absolute left-0 top-0 h-80 w-80 rounded-full bg-blue-300/18 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-amber-200/18 blur-[120px]" />

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div
          ref={heroRef}
          className="overflow-hidden rounded-[2rem] border border-slate-800 bg-[linear-gradient(135deg,_#10203a,_#173d95,_#0f8698)] text-white shadow-[0_28px_70px_rgba(16,32,58,0.22)]"
        >
          <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="px-7 py-10 sm:px-12 sm:py-14">
              <h1
                className="display-font mt-8 max-w-xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl"
              >
                {title}
              </h1>

              <p className="mt-5 max-w-xl text-base font-medium leading-relaxed text-blue-50/80">
                {description}
              </p>

              <div className="mt-10 space-y-3">
                {highlights.map((item) => (
                  <div
                    key={item}
                    className="auth-highlight flex items-start gap-3 rounded-2xl border border-white/10 bg-white/10 px-5 py-4"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-amber-300" />
                    <p className="text-sm font-medium leading-6 text-blue-50/90">{item}</p>
                  </div>
                ))}
              </div>

            </div>

            <div className="relative min-h-[320px]">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200"
                alt="Team collaboration"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(16,32,58,0.12),_rgba(16,32,58,0.58))]" />
              <div className="absolute bottom-6 left-6 right-6 rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-5 backdrop-blur">
                <p className="text-sm leading-7 text-white/85">{sideDescription}</p>
              </div>
            </div>
          </div>
        </div>

        <div
          ref={cardRef}
          className="glass-panel relative overflow-hidden rounded-[2rem] p-7 xl:p-10"
        >
          <div className="mb-8">
            <p className="text-sm font-medium leading-relaxed text-slate-600">{sideDescription}</p>
          </div>

          {children}

          {footer ? <div className="mt-6 border-t border-slate-200 pt-5">{footer}</div> : null}
        </div>
      </div>
    </section>
  )
}

export default AuthShell
