import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { CheckCircle2, Sparkles } from 'lucide-react'
import logoImg from '../assets/logo.jpeg'

const AuthShell = ({
  badge = 'Skilloriya Platform',
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
        { opacity: 1, duration: 0.4, ease: 'power2.out' }
      )

      if (heroRef.current) {
        gsap.fromTo(
          heroRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }
        )
      }

      if (cardRef.current) {
        gsap.fromTo(
          cardRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: 0.1 }
        )
      }

      gsap.fromTo(
        '.auth-highlight',
        { y: 14, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
          delay: 0.2,
        }
      )
    }, shellRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={shellRef}
      className="relative min-h-screen overflow-hidden px-3 pt-20 pb-8 sm:px-6 sm:pt-28 sm:pb-12 text-slate-900 lg:px-8"
    >
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute left-[-10%] top-0 h-96 w-96 rounded-full bg-blue-300/18 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-[-10%] h-80 w-80 rounded-full bg-amber-200/18 blur-[120px]" />

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-6rem)] w-full max-w-7xl items-center gap-6 sm:gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        
        {/* Left Hero Card - visible on lg screens */}
        <div
          ref={heroRef}
          className="hidden overflow-hidden rounded-[2rem] border border-slate-800 bg-[linear-gradient(135deg,_#0f172a,_#173d95,_#0e7490)] text-white shadow-[0_28px_70px_rgba(15,23,42,0.25)] lg:block"
        >
          <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="flex flex-col justify-between px-8 py-10 xl:px-10 xl:py-12">
              <div>
                <Link to="/" className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 backdrop-blur-md transition hover:bg-white/15">
                  <img src={logoImg} alt="Skilloriya Logo" className="h-5 w-5 rounded-md object-cover" />
                  <span className="text-xs font-bold tracking-wide text-white">{badge}</span>
                </Link>

                <h1 className="display-font mt-6 max-w-md text-3xl font-extrabold leading-tight tracking-tight xl:text-4xl">
                  {title}
                </h1>

                <p className="mt-4 max-w-md text-sm font-medium leading-relaxed text-blue-100/80">
                  {description}
                </p>

                <div className="mt-8 space-y-2.5">
                  {highlights.map((item) => (
                    <div
                      key={item}
                      className="auth-highlight flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/8 px-4 py-3"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                      <p className="text-xs font-medium leading-5 text-blue-50/90">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex items-center gap-2 text-xs text-blue-200/70">
                <Sparkles size={14} className="text-amber-300" />
                <span>Verified skills, instant applications, smarter careers</span>
              </div>
            </div>

            <div className="relative min-h-[400px]">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200"
                alt="Skilloriya community"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(15,23,42,0.15),_rgba(15,23,42,0.65))]" />
              <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/10 bg-slate-950/60 p-4 backdrop-blur-md">
                <p className="text-xs font-medium leading-relaxed text-white/90">{sideDescription}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Card - clean, responsive for mobile & desktop */}
        <div
          ref={cardRef}
          className="glass-panel relative mx-auto w-full max-w-xl overflow-hidden rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 xl:p-10 shadow-xl"
        >
          {/* Brand header on mobile & desktop */}
          <div className="mb-6 flex items-center justify-between">
            <Link to="/" className="group inline-flex items-center gap-2.5">
              <img
                src={logoImg}
                alt="Skilloriya Logo"
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl object-cover border border-slate-200/80 shadow-sm transition-transform group-hover:scale-105"
              />
              <div>
                <span className="block text-lg sm:text-xl font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                  Skilloriya
                </span>
                <span className="hidden sm:block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Career Portal
                </span>
              </div>
            </Link>

            {badge ? (
              <span className="rounded-full bg-blue-50 border border-blue-100/80 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                {badge}
              </span>
            ) : null}
          </div>

          {sideTitle ? (
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              {sideTitle}
            </h2>
          ) : null}

          {sideDescription ? (
            <p className="mt-1 mb-6 text-xs sm:text-sm font-medium text-slate-600">
              {sideDescription}
            </p>
          ) : <div className="mb-4" />}

          {children}

          {footer ? (
            <div className="mt-6 border-t border-slate-100 pt-5">{footer}</div>
          ) : null}
        </div>

      </div>
    </section>
  )
}

export default AuthShell

