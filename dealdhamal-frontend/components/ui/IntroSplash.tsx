'use client';

import React, { useState, useEffect } from 'react';
import styles from './IntroSplash.module.css';

interface IntroSplashProps {
  children: React.ReactNode;
}

type FlowState = 'intro' | 'transition-closing' | 'transition-opening' | 'main';

export default function IntroSplash({ children }: IntroSplashProps) {
  const [flow, setFlow] = useState<FlowState>('intro');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Check if the user has already seen the intro during this browser session
    const seen = sessionStorage.getItem('hasSeenIntro');
    if (seen === 'true') {
      setFlow('main');
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Lock scrolling on the body while the intro or transition is active
    if (isMounted && flow !== 'main') {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
    } else {
      document.body.style.overflow = '';
      document.body.style.height = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, [flow, isMounted]);

  const handleStartTransition = () => {
    setFlow('transition-closing');
    
    // Once shutters close completely (approx 1.3 seconds for staggered timings)
    setTimeout(() => {
      setFlow('transition-opening');
      sessionStorage.setItem('hasSeenIntro', 'true');
    }, 1300);

    // Once shutters open completely (approx 2.5 seconds total)
    setTimeout(() => {
      setFlow('main');
    }, 2500);
  };

  // If the flow is resolved to main, render only the site children
  if (flow === 'main') {
    return <>{children}</>;
  }

  return (
    <>
      {/* Underlying content remains in the DOM for SEO, but is hidden/inert when splash is active */}
      <div 
        aria-hidden={true} 
        className="invisible h-0 overflow-hidden"
      >
        {children}
      </div>

      {/* Splash Screen Overlay */}
      <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#0d0d0f] text-white z-[99999]">
        {/* Background Ambient Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div 
            className="absolute inset-0 bg-cover bg-center scale-102 transition-all duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ 
              backgroundImage: 'url("/unseen-bg.png")',
              transform: flow === 'transition-closing' ? 'scale(1.1) blur(10px)' : 'scale(1.02)'
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(13,13,15,0.2)_0%,rgba(13,13,15,0.8)_100%)]" />
        </div>

        {/* Hero Landing Content */}
        <div 
          className={`absolute inset-0 flex flex-col justify-between p-8 md:p-14 z-10 transition-opacity duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            flow === 'intro' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          <header className="flex justify-between items-center">
            <div className="text-xl font-medium tracking-tight font-sans">dealdhamal<span className="text-xs align-super ml-0.5 opacity-70">®</span></div>
            <div className="flex flex-col gap-1.5 cursor-pointer p-2">
              <span className="w-6 h-[2px] bg-white" />
              <span className="w-6 h-[2px] bg-white" />
            </div>
          </header>

          <div className="self-center text-center max-w-[800px] -mt-12 select-none">
            <p className="text-xs font-semibold tracking-[0.3em] text-[#e5c9b7] mb-6 font-sans">SMART SHOPPING, UNEXPECTED SAVINGS</p>
            <h1 className="font-light text-5xl md:text-8xl leading-none tracking-tight mb-14 font-sans">
              Discover the <br />
              <span className="font-serif italic font-normal bg-gradient-to-r from-white to-[#e5c9b7] bg-clip-text text-transparent">
                unexpected
              </span>
            </h1>
            <button 
              onClick={handleStartTransition}
              className="group bg-transparent border border-white/25 hover:border-white/50 text-white pl-7 pr-2.5 py-2.5 rounded-full inline-flex items-center gap-6 cursor-pointer backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-white/10"
            >
              <span className="text-sm font-medium font-sans">View our work</span>
              <span className="bg-white text-[#0d0d0f] w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-45 group-hover:bg-[#e5c9b7]">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                </svg>
              </span>
            </button>
          </div>

          <footer className="flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 bg-[#22c55e] rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              <span className="text-xs text-white/60 tracking-wider font-sans">Platform Active</span>
            </div>
            <div className="text-xs text-white/60 font-sans">©2026</div>
          </footer>
        </div>

        {/* 3D Shutters Transition Overlay */}
        {(flow === 'transition-closing' || flow === 'transition-opening') && (
          <div className={styles.shutterContainer}>
            {[...Array(10)].map((_, i) => (
              <div 
                key={i} 
                className={`${styles.shutterBar} ${flow === 'transition-closing' ? styles.closing : styles.opening}`}
                style={{ '--delay': `${i * 0.05}s` } as React.CSSProperties}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
