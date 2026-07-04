'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import styles from './IntroSplash.module.css';

interface IntroSplashProps {
  children: React.ReactNode;
}

type FlowState = 'intro' | 'transitioning' | 'main';

export default function IntroSplash({ children }: IntroSplashProps) {
  const [flow, setFlow] = useState<FlowState>('intro');
  const [canvasFadeOut, setCanvasFadeOut] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  const uniformsRef = useRef<any>(null);
  const progressRef = useRef<number>(0);
  const animatingRef = useRef<boolean>(false);
  const animStartTimeRef = useRef<number>(0);

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

  useEffect(() => {
    if (!isMounted || flow === 'main') return;
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Create Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0d0d0f, 1);
    container.appendChild(renderer.domElement);

    // Shaders
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform sampler2D uTexture;
      uniform float uProgress;
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uTextureResolution;
      uniform float uIntensity;
      uniform float uFrequency;
      varying vec2 vUv;

      void main() {
        float textureAspect = uTextureResolution.x / uTextureResolution.y;
        float quadAspect = uResolution.x / uResolution.y;
        vec2 coverUv = vUv;
        if (quadAspect < textureAspect) {
          float scaleX = quadAspect / textureAspect;
          coverUv.x = (vUv.x - 0.5) * scaleX + 0.5;
        } else {
          float scaleY = textureAspect / quadAspect;
          coverUv.y = (vUv.y - 0.5) * scaleY + 0.5;
        }

        vec2 center = vec2(0.5);
        float dist = distance(coverUv, center);
        float envelope = sin(uProgress * 3.14159265);
        float wave = sin(dist * uFrequency - uProgress * 25.0) * uIntensity * envelope;
        
        vec2 dir = normalize(coverUv - center);
        if (dist == 0.0) dir = vec2(0.0);
        
        vec2 distortedUv = coverUv + dir * wave;
        gl_FragColor = texture2D(uTexture, distortedUv);
      }
    `;

    // Load Texture
    const textureLoader = new THREE.TextureLoader();
    const textureResolution = new THREE.Vector2(1920, 1080); // Default fallback
    
    const texture = textureLoader.load('/unseen-bg.png', (tex) => {
      if (tex.image) {
        textureResolution.set(tex.image.width, tex.image.height);
      }
      renderer.render(scene, camera);
    });

    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.LinearFilter;

    // Uniforms
    const uniforms = {
      uTexture: { value: texture },
      uProgress: { value: 0.0 },
      uTime: { value: 0.0 },
      uResolution: { value: new THREE.Vector2(width, height) },
      uTextureResolution: { value: textureResolution },
      uIntensity: { value: 0.08 },
      uFrequency: { value: 30.0 }
    };

    uniformsRef.current = uniforms;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      depthWrite: false,
      depthTest: false
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Easing helper
    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    // Animation Loop
    let time = 0;
    const animate = (timestamp: number) => {
      time += 0.01;
      uniforms.uTime.value = time;

      if (animatingRef.current) {
        const elapsed = timestamp - animStartTimeRef.current;
        const p = Math.min(elapsed / 1600, 1.0);
        progressRef.current = p;
        uniforms.uProgress.value = easeInOutCubic(p);

        if (p >= 1.0) {
          animatingRef.current = false;
        }
      }

      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    // Resize Handler
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      uniforms.uResolution.value.set(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      
      // Dispose resources
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
      
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isMounted, flow]);

  const handleStartTransition = () => {
    if (flow !== 'intro') return;
    setFlow('transitioning');
    
    // Start WebGL progress animation
    animStartTimeRef.current = performance.now();
    animatingRef.current = true;

    // Trigger canvas fade out at 1.0 seconds (gives 0.6 seconds for fade out to complete by 1.6s)
    setTimeout(() => {
      setCanvasFadeOut(true);
    }, 1000);

    // Complete the flow at 1.6 seconds
    setTimeout(() => {
      setFlow('main');
      sessionStorage.setItem('hasSeenIntro', 'true');
    }, 1600);
  };

  // If the flow is resolved to main, render only the site children
  if (flow === 'main') {
    return <div className={styles.fadeIn}>{children}</div>;
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
        {/* Background WebGL Canvas Container */}
        <div 
          ref={containerRef} 
          className={`${styles.canvasContainer} ${canvasFadeOut ? styles.fadeOut : ''}`}
        />

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
      </div>
    </>
  );
}
