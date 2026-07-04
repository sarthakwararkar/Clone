'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// Configuration constants:
const SETTINGS = {
  density: 59,       // Spawn Distance: 59px
  scale: 1.2,        // Butterfly Size: 1.2x
  flap: 3,           // Flapping Speed: Medium (level 3)
  fade: 1.8,         // Lifespan: 1.8s
  backdrop: 8,       // Backdrop Butterflies: 8
  speed: 3           // Flight Speed: Normal (level 3)
}

const FLAP_MULT_MAP: Record<number, number> = { 1: 8, 2: 18, 3: 30, 4: 48, 5: 72 }
const SPEED_MULT_MAP: Record<number, number> = { 1: 0.3, 2: 0.6, 3: 1.0, 4: 1.6, 5: 2.5 }

interface ButterflyState {
  active: boolean
  isTrail: boolean
  x: number; y: number; z: number
  vx: number; vy: number; vz: number
  scaleMult: number
  age: number; maxAge: number
  time: number; flapSpeed: number; flapOffset: number
  opacity: number
}

export default function ButterflyOverlay() {
  const backdropContainerRef = useRef<HTMLDivElement>(null)
  const butterfliesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!backdropContainerRef.current || !butterfliesContainerRef.current) return
    const backdropContainer = backdropContainerRef.current
    const butterfliesContainer = butterfliesContainerRef.current

    // ── DUAL SCENES ──
    const backdropScene = new THREE.Scene()
    const butterfliesScene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(0, 0.5, 12)

    // ── BACKDROP RENDERER (behind everything, z-[-10]) ──
    const backdropRenderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
      precision: 'mediump'
    })
    backdropRenderer.setPixelRatio(1.0)
    backdropRenderer.setSize(window.innerWidth, window.innerHeight)
    backdropRenderer.domElement.style.position = 'absolute'
    backdropRenderer.domElement.style.inset = '0'
    backdropRenderer.domElement.style.width = '100%'
    backdropRenderer.domElement.style.height = '100%'
    backdropRenderer.domElement.style.pointerEvents = 'none'
    backdropRenderer.domElement.style.willChange = 'transform'
    backdropRenderer.domElement.style.transform = 'translate3d(0,0,0)'
    backdropRenderer.domElement.style.contain = 'strict'
    backdropContainer.appendChild(backdropRenderer.domElement)

    // ── BUTTERFLIES RENDERER (on top of everything, z-[50]) ──
    const butterfliesRenderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
      precision: 'mediump'
    })
    butterfliesRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    butterfliesRenderer.setSize(window.innerWidth, window.innerHeight)
    butterfliesRenderer.domElement.style.position = 'absolute'
    butterfliesRenderer.domElement.style.inset = '0'
    butterfliesRenderer.domElement.style.width = '100%'
    butterfliesRenderer.domElement.style.height = '100%'
    butterfliesRenderer.domElement.style.pointerEvents = 'none'
    butterfliesRenderer.domElement.style.willChange = 'transform'
    butterfliesRenderer.domElement.style.transform = 'translate3d(0,0,0)'
    butterfliesRenderer.domElement.style.contain = 'strict'
    butterfliesContainer.appendChild(butterfliesRenderer.domElement)

    // ── Lighting ──
    const addLights = (scene: THREE.Scene) => {
      scene.add(new THREE.AmbientLight(0xffffff, 0.7))
      const sun = new THREE.DirectionalLight(0xfff5e6, 1.7)
      sun.position.set(10, 15, 10)
      scene.add(sun)
      const sky = new THREE.DirectionalLight(0x8ecae6, 0.9)
      sky.position.set(-10, 10, -5)
      scene.add(sky)
    }
    addLights(backdropScene)
    addLights(butterfliesScene)
    backdropScene.fog = new THREE.FogExp2(0xbde0fe, 0.045)

    // ── Lightweight procedural butterfly geometry (~300 verts, NOT 60k from base.obj) ──
    const proceduralLeftWingGeo = new THREE.PlaneGeometry(2.0, 2.0, 8, 8)
    const pL = proceduralLeftWingGeo.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < pL.count; i++) {
      const x = pL.getX(i), y = pL.getY(i)
      pL.setZ(i, Math.sin((x+1)*Math.PI/2)*Math.sin((y+1)*Math.PI/2)*0.35)
    }
    proceduralLeftWingGeo.computeVertexNormals()
    proceduralLeftWingGeo.translate(-1.0, 0, 0)

    const proceduralRightWingGeo = new THREE.PlaneGeometry(2.0, 2.0, 8, 8)
    const pR = proceduralRightWingGeo.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < pR.count; i++) {
      const x = pR.getX(i), y = pR.getY(i)
      pR.setZ(i, Math.sin((x+1)*Math.PI/2)*Math.sin((y+1)*Math.PI/2)*0.35)
    }
    proceduralRightWingGeo.computeVertexNormals()
    proceduralRightWingGeo.scale(-1, 1, 1)
    proceduralRightWingGeo.translate(1.0, 0, 0)

    const proceduralBodyGeo = new THREE.CylinderGeometry(0.04, 0.03, 0.6, 6)
    proceduralBodyGeo.rotateX(Math.PI / 2)

    // ── TERRAIN (50x50 grid = 2,601 vertices) ──
    const terrainGeo = new THREE.PlaneGeometry(35, 35, 50, 50)
    terrainGeo.rotateX(-Math.PI / 2)
    const colors: number[] = []
    const terrainPos = terrainGeo.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < terrainPos.count; i++) {
      const x = terrainPos.getX(i), z = terrainPos.getZ(i)
      const meadowY = Math.sin(x*0.12)*Math.cos(z*0.12)*0.8 + Math.sin(x*0.3)*Math.cos(z*0.3)*0.2
      let finalY = meadowY, r = 0.18, g = 0.38, b = 0.15
      if (z < -2) {
        const t = (Math.abs(z)-2)/15.5
        let mn = Math.sin(x*0.4)*2.8 + Math.sin(x*1.2)*0.75 + Math.sin(x*3.5)*0.25 + Math.sin(x*8.0)*0.08
        finalY = meadowY*(1-t) + (2.5+mn)*t
        if (t > 0.35) {
          if (finalY > 2.1) { r=0.95; g=0.95; b=0.95 }
          else if (finalY > 1.0) { r=0.36; g=0.40; b=0.42 }
          else { r=0.22; g=0.33; b=0.20 }
        }
      }
      if (z >= -5) {
        const pc = Math.sin(z*0.22)*2.2, dp = Math.abs(x-pc)
        if (dp < 1.2) { const f=dp/1.2; finalY -= (1-f)*0.28; r=0.64-(1-f)*0.1; g=0.50-(1-f)*0.08; b=0.38-(1-f)*0.05 }
        else if (dp < 2.0) { const f=(dp-1.2)/0.8; r=0.54*(1-f)+0.18*f; g=0.44*(1-f)+0.38*f; b=0.34*(1-f)+0.15*f }
      }
      terrainPos.setY(i, finalY)
      colors.push(r, g, b)
    }
    terrainGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    terrainGeo.computeVertexNormals()
    const terrainMat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true })
    const terrain = new THREE.Mesh(terrainGeo, terrainMat)
    terrain.position.y = -3.2
    backdropScene.add(terrain)

    // ── Procedural textures ──
    function createTex(type: string) {
      const c = document.createElement('canvas'); c.width=128; c.height=256
      const ctx = c.getContext('2d'); if (!ctx) return new THREE.Texture()
      ctx.clearRect(0,0,128,256)
      if (type==='grass') {
        const gr=ctx.createLinearGradient(64,256,64,10); gr.addColorStop(0,'#132a13'); gr.addColorStop(0.3,'#3f5e3d'); gr.addColorStop(0.8,'#52b788'); gr.addColorStop(1,'#b7e4c7')
        ctx.fillStyle=gr; ctx.beginPath(); ctx.moveTo(56,256); ctx.quadraticCurveTo(50,120,72,10); ctx.quadraticCurveTo(74,120,72,256); ctx.fill()
      } else if (type==='red') {
        ctx.strokeStyle='#2d6a4f'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(64,256); ctx.quadraticCurveTo(58,150,64,60); ctx.stroke()
        ctx.fillStyle='#b7094c'; ctx.beginPath(); ctx.arc(64,60,18,0,Math.PI*2); ctx.fill()
        ctx.fillStyle='#ffb703'; ctx.beginPath(); ctx.arc(64,60,5,0,Math.PI*2); ctx.fill()
      } else if (type==='yellow') {
        ctx.strokeStyle='#2d6a4f'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(64,256); ctx.quadraticCurveTo(66,160,64,60); ctx.stroke()
        ctx.fillStyle='#ffb703'; ctx.beginPath(); ctx.arc(64,60,16,0,Math.PI*2); ctx.fill()
        ctx.fillStyle='#582f0e'; ctx.beginPath(); ctx.arc(64,60,6,0,Math.PI*2); ctx.fill()
      } else if (type==='purple') {
        ctx.strokeStyle='#3a5a40'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(64,256); ctx.lineTo(64,30); ctx.stroke()
        const bc=['#5e548e','#9f86c0','#be95c4']; for(let y=30;y<120;y+=8){ctx.fillStyle=bc[Math.floor(Math.random()*bc.length)]; ctx.beginPath(); ctx.arc(64,y,6,0,Math.PI*2); ctx.fill()}
      } else {
        ctx.strokeStyle='#2d6a4f'; ctx.lineWidth=3.5; ctx.beginPath(); ctx.moveTo(64,256); ctx.quadraticCurveTo(68,140,64,60); ctx.stroke()
        ctx.fillStyle='#0077b6'; ctx.beginPath(); ctx.arc(64,60,14,0,Math.PI*2); ctx.fill()
        ctx.fillStyle='#caf0f8'; ctx.beginPath(); ctx.arc(64,60,5,0,Math.PI*2); ctx.fill()
      }
      const t = new THREE.CanvasTexture(c); t.minFilter=THREE.LinearMipmapLinearFilter; return t
    }

    // ── GRASS (500 blades) ──
    const grassGeo = new THREE.PlaneGeometry(0.2, 0.7); grassGeo.translate(0, 0.35, 0)
    const totalGrass = 500
    const grassTex = createTex('grass')
    const grassMat = new THREE.MeshLambertMaterial({ map: grassTex, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide })
    grassMat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = { value: 0 }
      shader.vertexShader = 'uniform float uTime;\n' + shader.vertexShader
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>',
        `#include <begin_vertex>
        float swayFactor = position.y;
        float sway = sin(uTime * 1.5 + instanceMatrix[3].x * 0.2 + instanceMatrix[3].z * 0.2) * 0.15 * swayFactor;
        transformed.x += sway; transformed.z += sway * 0.4;`)
      grassMat.userData.shader = shader
    }
    const grassMesh = new THREE.InstancedMesh(grassGeo, grassMat, totalGrass)
    const gd = new THREE.Object3D()
    for (let i = 0; i < totalGrass; i++) {
      let rx=0,rz=0,dp=0
      do { rx=(Math.random()-0.5)*28; rz=(Math.random()-0.5)*28; if(rz<-6) continue; dp=Math.abs(rx-Math.sin(rz*0.22)*2.2) } while(dp<1.1||rz<-6)
      gd.position.set(rx, Math.sin(rx*0.15)*Math.cos(rz*0.15)*0.8+Math.sin(rx*0.4)*0.2-3.2, rz)
      gd.rotation.set((Math.random()-0.5)*0.2, Math.random()*Math.PI*2, 0)
      const s=0.7+Math.random()*0.8; gd.scale.set(s,s,s); gd.updateMatrix(); grassMesh.setMatrixAt(i, gd.matrix)
    }
    backdropScene.add(grassMesh)

    // ── WILDFLOWERS (30 per type × 4 types = 120 total) ──
    const flowerGeo = new THREE.PlaneGeometry(0.35, 0.7); flowerGeo.translate(0, 0.35, 0)
    const totalFlowersPerType = 30
    const flowerTypes = ['red', 'yellow', 'purple', 'blue']
    const flowerMeshes: { mesh: THREE.InstancedMesh }[] = []
    flowerTypes.forEach((type) => {
      const tex = createTex(type)
      const mat = new THREE.MeshLambertMaterial({ map: tex, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide })
      mat.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = { value: 0 }
        shader.vertexShader = 'uniform float uTime;\n' + shader.vertexShader
        shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>',
          `#include <begin_vertex>
          float swayFactor = position.y;
          float sway = sin(uTime * 1.5 + instanceMatrix[3].x * 0.2 + instanceMatrix[3].z * 0.2) * 0.10 * swayFactor;
          transformed.x += sway; transformed.z += sway * 0.3;`)
        mat.userData.shader = shader
      }
      const mesh = new THREE.InstancedMesh(flowerGeo, mat, totalFlowersPerType)
      const fd = new THREE.Object3D()
      for (let i = 0; i < totalFlowersPerType; i++) {
        let rx=0,rz=0,dp=0
        do { rx=(Math.random()-0.5)*28; rz=(Math.random()-0.5)*28; if(rz<-6) continue; dp=Math.abs(rx-Math.sin(rz*0.22)*2.2) } while(dp<1.15||rz<-6)
        fd.position.set(rx, Math.sin(rx*0.15)*Math.cos(rz*0.15)*0.8+Math.sin(rx*0.4)*0.2-3.2, rz)
        fd.rotation.set((Math.random()-0.5)*0.15, Math.random()*Math.PI*2, 0)
        const s=0.5+Math.random()*0.7; fd.scale.set(s,s,s); fd.updateMatrix(); mesh.setMatrixAt(i, fd.matrix)
      }
      backdropScene.add(mesh)
      flowerMeshes.push({ mesh })
    })

    function animateMeadow(time: number) {
      if (grassMat.userData.shader) grassMat.userData.shader.uniforms.uTime.value = time
      flowerMeshes.forEach(({ mesh }) => { const m = mesh.material as THREE.MeshLambertMaterial; if (m.userData.shader) m.userData.shader.uniforms.uTime.value = time })
    }

    // ── BUTTERFLY POOL (16: 8 backdrop + 8 trail) ──
    const MAX_TRAIL = 8, MAX_BACKDROP = SETTINGS.backdrop, TOTAL = MAX_TRAIL + MAX_BACKDROP
    const butterflies: ButterflyState[] = []
    for (let i = 0; i < TOTAL; i++) butterflies.push({ active:false, isTrail:false, x:0,y:0,z:0, vx:0,vy:0,vz:0, scaleMult:1, age:0,maxAge:0, time:Math.random()*100, flapSpeed:15+Math.random()*15, flapOffset:Math.random()*Math.PI*2, opacity:0 })

    const wingMat = new THREE.MeshLambertMaterial({ color:0xffffff, emissive:0x444444, transparent:true, opacity:0.85, side:THREE.DoubleSide, depthWrite:false })
    const bodyMat = new THREE.MeshLambertMaterial({ color:0x181c26, emissive:0x07090e, transparent:true, opacity:1.0 })
    const injectOpacity = (shader: any) => { shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>\n#ifdef USE_INSTANCING_COLOR\ndiffuseColor.a *= vInstanceColor.r;\n#endif`) }
    wingMat.onBeforeCompile = injectOpacity
    bodyMat.onBeforeCompile = injectOpacity

    // Use only lightweight procedural geometry (~300 verts total instead of 60,000 from base.obj)
    const bodyMesh = new THREE.InstancedMesh(proceduralBodyGeo as THREE.BufferGeometry, bodyMat, TOTAL)
    const leftWingMesh = new THREE.InstancedMesh(proceduralLeftWingGeo as THREE.BufferGeometry, wingMat, TOTAL)
    const rightWingMesh = new THREE.InstancedMesh(proceduralRightWingGeo as THREE.BufferGeometry, wingMat, TOTAL)
    ;[bodyMesh, leftWingMesh, rightWingMesh].forEach(m => { m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false })

    const ic = new THREE.Color(1,1,1)
    for (let i = 0; i < TOTAL; i++) { bodyMesh.setColorAt(i,ic); leftWingMesh.setColorAt(i,ic); rightWingMesh.setColorAt(i,ic) }
    if (bodyMesh.instanceColor) bodyMesh.instanceColor.setUsage(THREE.DynamicDrawUsage)
    if (leftWingMesh.instanceColor) leftWingMesh.instanceColor.setUsage(THREE.DynamicDrawUsage)
    if (rightWingMesh.instanceColor) rightWingMesh.instanceColor.setUsage(THREE.DynamicDrawUsage)

    butterfliesScene.add(bodyMesh)
    butterfliesScene.add(leftWingMesh)
    butterfliesScene.add(rightWingMesh)

    // ── Butterfly state controllers ──
    function initBackdrop() {
      for (let i = 0; i < MAX_BACKDROP; i++) {
        const b = butterflies[i]; b.active=true; b.isTrail=false
        const dz = -8+Math.random()*8; b.x=(Math.random()-0.5)*12; b.y=(Math.random()-0.5)*10; b.z=dz
        const dp=(dz+8)/8; b.scaleMult=0.1+dp*0.18
        const phi=Math.random()*Math.PI*2, theta=Math.acos(Math.random()*2-1), bs=0.015+Math.random()*0.02
        b.vx=Math.sin(theta)*Math.cos(phi)*bs; b.vy=Math.sin(theta)*Math.sin(phi)*bs+0.015; b.vz=Math.cos(theta)*bs*0.5
        b.opacity=0.35+dp*0.5; b.time=Math.random()*100; b.flapSpeed=15+Math.random()*15; b.flapOffset=Math.random()*Math.PI*2
      }
    }

    let nextTrail = MAX_BACKDROP
    function spawnTrail(x: number, y: number) {
      const idx = nextTrail; nextTrail = MAX_BACKDROP + ((nextTrail-MAX_BACKDROP+1) % MAX_TRAIL)
      const b = butterflies[idx]; b.active=true; b.isTrail=true
      b.x=x+(Math.random()-0.5)*0.2; b.y=y+(Math.random()-0.5)*0.2; b.z=0.5
      const phi=Math.random()*Math.PI*2, theta=Math.acos(Math.random()*2-1), bs=0.05+Math.random()*0.05
      b.vx=Math.sin(theta)*Math.cos(phi)*bs; b.vy=Math.sin(theta)*Math.sin(phi)*bs+0.01; b.vz=Math.cos(theta)*bs
      b.scaleMult=SETTINGS.scale*(0.8+Math.random()*0.4); b.flapOffset=Math.random()*Math.PI*2; b.age=0; b.maxAge=60*SETTINGS.fade
      b.time=Math.random()*100; b.flapSpeed=15+Math.random()*15; b.opacity=0
    }

    initBackdrop()

    // ── Mouse projection & spawning ──
    function projectTo3D(cx: number, cy: number) {
      const v = new THREE.Vector3((cx/window.innerWidth)*2-1, -(cy/window.innerHeight)*2+1, 0.5)
      v.unproject(camera); const d = v.sub(camera.position).normalize(); const dist = -camera.position.z / d.z
      return camera.position.clone().add(d.multiplyScalar(dist))
    }
    let lastX: number|null = null, lastY: number|null = null
    const onMouseMove = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) return
      if (lastX===null||lastY===null) { lastX=e.clientX; lastY=e.clientY; return }
      const dist = Math.hypot(e.clientX-lastX, e.clientY-lastY)
      if (dist >= SETTINGS.density) {
        const steps = Math.floor(dist/SETTINGS.density)
        for (let i=1;i<=steps;i++) {
          const pct=i/steps, cx=lastX!+(e.clientX-lastX!)*pct, cy=lastY!+(e.clientY-lastY!)*pct, p=projectTo3D(cx,cy)
          for (let c=0;c<3;c++) spawnTrail(p.x, p.y)
        }
        lastX=e.clientX; lastY=e.clientY
      }
    }
    const onMouseLeave = () => { lastX=null; lastY=null }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseleave', onMouseLeave)

    const onResize = () => {
      const w=window.innerWidth, h=window.innerHeight
      camera.aspect=w/h; camera.updateProjectionMatrix()
      backdropRenderer.setSize(w, h)
      butterfliesRenderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    // ── RENDER LOOP (backdrop throttled to ~20fps, butterflies at full 60fps) ──
    let animId: number, isVisible=true, animTime=0, frameCount=0
    const dummy = new THREE.Object3D()
    const wingRot = new THREE.Matrix4(), tmp = new THREE.Matrix4()
    const colBuf = new THREE.Color()

    const animate = () => {
      if (!isVisible) { animId = requestAnimationFrame(animate); return }
      animTime += 0.015
      frameCount++

      // ── Update butterfly states every frame ──
      for (let i = 0; i < TOTAL; i++) {
        const b = butterflies[i]
        if (!b.active) {
          dummy.position.set(0,0,-9999); dummy.scale.set(0,0,0); dummy.updateMatrix()
          bodyMesh.setMatrixAt(i, dummy.matrix); leftWingMesh.setMatrixAt(i, dummy.matrix); rightWingMesh.setMatrixAt(i, dummy.matrix)
          continue
        }
        let sc=0, flap=0, op=0
        if (b.isTrail) {
          b.age++; const pct=b.age/b.maxAge
          if (b.age>=b.maxAge) { b.active=false; dummy.position.set(0,0,-9999); dummy.scale.set(0,0,0); dummy.updateMatrix(); bodyMesh.setMatrixAt(i,dummy.matrix); leftWingMesh.setMatrixAt(i,dummy.matrix); rightWingMesh.setMatrixAt(i,dummy.matrix); continue }
          sc = pct<0.15 ? (pct/0.15)*b.scaleMult*0.25 : (1-(pct-0.15)/0.85)*b.scaleMult*0.25
          const sm=SPEED_MULT_MAP[SETTINGS.speed]; b.x+=b.vx*sm; b.y+=b.vy*sm; b.z+=b.vz*sm
          flap=Math.sin(b.age*FLAP_MULT_MAP[SETTINGS.flap]*0.02+b.flapOffset)*(Math.PI/2.8)
          op=(pct<0.15?pct/0.15:Math.max(0,1-(pct-0.15)/0.85))*0.85
        } else {
          b.time+=0.015; const sm=SPEED_MULT_MAP[SETTINGS.speed]
          b.x+=(b.vx+Math.sin(b.time)*0.005)*sm; b.y+=(b.vy+Math.cos(b.time*0.5)*0.003)*sm; b.z+=(b.vz+Math.sin(b.time*0.8)*0.004)*sm
          flap=Math.sin(b.time*b.flapSpeed+b.flapOffset)*(Math.PI/3)
          const dp=(b.z+8)/8; sc=b.scaleMult; op=0.35+dp*0.5
          if(b.y>6||b.x>8||b.x<-8||b.z>2||b.z<-10){ b.y=-4.5; b.x=(Math.random()-0.5)*12; b.z=-8+Math.random()*8; const dp2=(b.z+8)/8; b.scaleMult=0.1+dp2*0.18; b.time=Math.random()*100 }
        }
        const vx=b.isTrail?b.vx:(b.vx+Math.sin(b.time)*0.005), vy=b.isTrail?b.vy:(b.vy+Math.cos(b.time*0.5)*0.003), vz=b.isTrail?b.vz:(b.vz+Math.sin(b.time*0.8)*0.004)
        dummy.position.set(b.x,b.y,b.z); dummy.rotation.set(0,0,0)
        dummy.rotation.z=-Math.atan2(vx,vy); dummy.rotation.x=-Math.atan2(vz,Math.hypot(vx,vy))
        dummy.scale.set(sc,sc,sc); dummy.updateMatrix()
        bodyMesh.setMatrixAt(i, dummy.matrix)
        wingRot.makeRotationY(flap); tmp.multiplyMatrices(dummy.matrix,wingRot); leftWingMesh.setMatrixAt(i,tmp)
        wingRot.makeRotationY(-flap); tmp.multiplyMatrices(dummy.matrix,wingRot); rightWingMesh.setMatrixAt(i,tmp)
        colBuf.setRGB(op,op,op); bodyMesh.setColorAt(i,colBuf); leftWingMesh.setColorAt(i,colBuf); rightWingMesh.setColorAt(i,colBuf)
      }

      bodyMesh.instanceMatrix.needsUpdate=true; leftWingMesh.instanceMatrix.needsUpdate=true; rightWingMesh.instanceMatrix.needsUpdate=true
      if(bodyMesh.instanceColor) bodyMesh.instanceColor.needsUpdate=true
      if(leftWingMesh.instanceColor) leftWingMesh.instanceColor.needsUpdate=true
      if(rightWingMesh.instanceColor) rightWingMesh.instanceColor.needsUpdate=true

      // Butterflies render every frame (smooth 60fps trail effect on top)
      butterfliesRenderer.render(butterfliesScene, camera)

      // Backdrop renders every 3rd frame (~20fps) — terrain/grass doesn't need 60fps
      if (frameCount % 3 === 0) {
        animateMeadow(animTime)
        backdropRenderer.render(backdropScene, camera)
      }

      animId = requestAnimationFrame(animate)
    }

    const onVisChange = () => { if (document.hidden) { isVisible=false } else { isVisible=true } }
    document.addEventListener('visibilitychange', onVisChange)
    animate()

    // ── Cleanup ──
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisChange)
      cancelAnimationFrame(animId)
      butterfliesScene.remove(bodyMesh); butterfliesScene.remove(leftWingMesh); butterfliesScene.remove(rightWingMesh)
      bodyMesh.dispose(); leftWingMesh.dispose(); rightWingMesh.dispose()
      wingMat.dispose(); bodyMat.dispose()
      proceduralLeftWingGeo.dispose(); proceduralRightWingGeo.dispose(); proceduralBodyGeo.dispose()
      terrainGeo.dispose(); terrainMat.dispose()
      grassGeo.dispose(); grassMat.dispose(); grassTex.dispose(); flowerGeo.dispose()
      flowerMeshes.forEach(({mesh})=>{ (mesh.material as THREE.Material).dispose(); backdropScene.remove(mesh) })
      backdropRenderer.dispose()
      if (backdropRenderer.domElement && backdropContainer.contains(backdropRenderer.domElement)) backdropContainer.removeChild(backdropRenderer.domElement)
      butterfliesRenderer.dispose()
      if (butterfliesRenderer.domElement && butterfliesContainer.contains(butterfliesRenderer.domElement)) butterfliesContainer.removeChild(butterfliesRenderer.domElement)
    }
  }, [])

  return (
    <>
      {/* Background Canvas: renders landscape terrain, mountains, foliage */}
      <div
        ref={backdropContainerRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-[-10] overflow-hidden"
        style={{
          background: 'linear-gradient(to bottom, #87b9e8 0%, #b8d4ee 40%, #ffcbdc 100%)',
          transform: 'translate3d(0,0,0)',
          willChange: 'transform',
          contain: 'strict'
        }}
      />
      {/* Foreground Canvas: renders only the 3D flying butterflies ON TOP of everything */}
      <div
        ref={butterfliesContainerRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-[50] overflow-hidden"
        style={{
          transform: 'translate3d(0,0,0)',
          willChange: 'transform',
          contain: 'strict'
        }}
      />
    </>
  )
}
