'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
// @ts-ignore
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'

// Configuration constants from the user's settings image:
const SETTINGS = {
  density: 59,       // Spawn Distance: 59px
  scale: 1.2,        // Butterfly Size: 1.2x
  flap: 3,           // Flapping Speed: Medium (level 3)
  fade: 1.8,         // Lifespan: 1.8s
  backdrop: 15,      // Backdrop Butterflies: 15
  speed: 3           // Flight Speed: Normal (level 3)
}

const FLAP_MULT_MAP: Record<number, number> = { 1: 8, 2: 18, 3: 30, 4: 48, 5: 72 } // Wing flap frequency multipliers
const SPEED_MULT_MAP: Record<number, number> = { 1: 0.3, 2: 0.6, 3: 1.0, 4: 1.6, 5: 2.5 } // Flight speed multipliers

export default function ButterflyOverlay() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    let isModelLoaded = false
    let objSplitGeos: {
      leftWing: THREE.BufferGeometry
      rightWing: THREE.BufferGeometry
      body: THREE.BufferGeometry
    } | null = null

    // 1. Setup Three.js Scene, Camera, and Renderer
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 12

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // cap pixel ratio for performance
    renderer.setSize(window.innerWidth, window.innerHeight)
    container.appendChild(renderer.domElement)

    // 2. Setup Lighting (Cyan and Purple accents to match homepage theme)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75)
    scene.add(ambientLight)

    const cyanLight = new THREE.DirectionalLight(0x00E5FF, 1.4)
    cyanLight.position.set(5, 8, 8)
    scene.add(cyanLight)

    const purpleLight = new THREE.DirectionalLight(0xBD00FF, 1.2)
    purpleLight.position.set(-6, -4, 4)
    scene.add(purpleLight)

    const whiteLight = new THREE.DirectionalLight(0xffffff, 0.9)
    whiteLight.position.set(0, 10, 15)
    scene.add(whiteLight)

    // 3. Fallback Procedural Geometries (used while base.obj is loading)
    const proceduralWingGeo = new THREE.PlaneGeometry(2.0, 2.0, 12, 12)
    const posAttr = proceduralWingGeo.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i)
      const y = posAttr.getY(i)
      const normX = x + 1
      const normY = y + 1
      const z = Math.sin(normX * Math.PI / 2) * Math.sin(normY * Math.PI / 2) * 0.35
      posAttr.setZ(i, z)
    }
    proceduralWingGeo.computeVertexNormals()

    const proceduralBodyGeo = new THREE.CylinderGeometry(0.04, 0.03, 0.6, 8)
    proceduralBodyGeo.rotateX(Math.PI / 2)

    // 4. Geometry Splitting Helper for base.obj
    function splitButterflyGeometry(geo: THREE.BufferGeometry) {
      const positionAttr = geo.attributes.position as THREE.BufferAttribute
      if (!positionAttr) return null

      // Ensure geometry is non-indexed for simple triangle parsing
      const tempGeo = geo.index ? geo.clone().toNonIndexed() : geo.clone()
      const positions = (tempGeo.attributes.position as THREE.BufferAttribute).array as Float32Array
      const normals = tempGeo.attributes.normal 
        ? ((tempGeo.attributes.normal as THREE.BufferAttribute).array as Float32Array) 
        : null

      const leftVerts: number[] = []
      const leftNorms: number[] = []

      const rightVerts: number[] = []
      const rightNorms: number[] = []

      const bodyVerts: number[] = []
      const bodyNorms: number[] = []

      const bodyThreshold = 0.08

      for (let i = 0; i < positions.length; i += 9) {
        const x1 = positions[i],     y1 = positions[i+1], z1 = positions[i+2]
        const x2 = positions[i+3],   y2 = positions[i+4], z2 = positions[i+5]
        const x3 = positions[i+6],   y3 = positions[i+7], z3 = positions[i+8]

        const centroidX = (x1 + x2 + x3) / 3

        let vTarget: number[], nTarget: number[]

        if (centroidX < -bodyThreshold) {
          vTarget = leftVerts
          nTarget = leftNorms
        } else if (centroidX > bodyThreshold) {
          vTarget = rightVerts
          nTarget = rightNorms
        } else {
          vTarget = bodyVerts
          nTarget = bodyNorms
        }

        vTarget.push(x1, y1, z1, x2, y2, z2, x3, y3, z3)

        if (normals) {
          nTarget.push(
            normals[i],   normals[i+1], normals[i+2],
            normals[i+3], normals[i+4], normals[i+5],
            normals[i+6], normals[i+7], normals[i+8]
          )
        }
      }

      const leftGeo = new THREE.BufferGeometry()
      leftGeo.setAttribute('position', new THREE.Float32BufferAttribute(leftVerts, 3))
      if (leftNorms.length) leftGeo.setAttribute('normal', new THREE.Float32BufferAttribute(leftNorms, 3))
      leftGeo.computeVertexNormals()

      const rightGeo = new THREE.BufferGeometry()
      rightGeo.setAttribute('position', new THREE.Float32BufferAttribute(rightVerts, 3))
      if (rightNorms.length) rightGeo.setAttribute('normal', new THREE.Float32BufferAttribute(rightNorms, 3))
      rightGeo.computeVertexNormals()

      const bGeo = new THREE.BufferGeometry()
      bGeo.setAttribute('position', new THREE.Float32BufferAttribute(bodyVerts, 3))
      if (bodyNorms.length) bGeo.setAttribute('normal', new THREE.Float32BufferAttribute(bodyNorms, 3))
      bGeo.computeVertexNormals()

      // Hinge translations: translate meshes so pivots lie at X = 0
      leftGeo.translate(bodyThreshold, 0, 0)
      rightGeo.translate(-bodyThreshold, 0, 0)

      return {
        leftWing: leftGeo,
        rightWing: rightGeo,
        body: bGeo
      }
    }

    // 5. Load base.obj dynamically
    const objLoader = new OBJLoader()
    objLoader.load(
      '/base.obj',
      (object: any) => {
        let butterflyMesh: THREE.Mesh | null = null
        object.traverse((child: any) => {
          if (child instanceof THREE.Mesh) {
            butterflyMesh = child
          }
        })

        if (butterflyMesh) {
          objSplitGeos = splitButterflyGeometry((butterflyMesh as THREE.Mesh).geometry)
          isModelLoaded = true
          rebuildBackdrop()
        }
      },
      undefined,
      (err: any) => {
        console.warn('Error loading base.obj, running fallback procedural renderer.', err)
      }
    )

    // 6. Base Butterfly Logic
    class ButterflyInstance {
      group: THREE.Group
      wingMat: THREE.MeshLambertMaterial
      bodyMat: THREE.MeshLambertMaterial
      leftWingGroup: THREE.Group
      rightWingGroup: THREE.Group
      leftWingMesh: THREE.Mesh
      rightWingMesh: THREE.Mesh
      bodyMesh: THREE.Mesh
      scaleMult: number
      flapOffset: number
      vx: number = 0
      vy: number = 0
      vz: number = 0
      age: number = 0
      maxAge: number = 60 * SETTINGS.fade
      time: number = Math.random() * 100
      flapSpeed: number = 15 + Math.random() * 15

      constructor() {
        this.group = new THREE.Group()

        this.wingMat = new THREE.MeshLambertMaterial({
          color: 0xffffff,
          emissive: 0x333333,
          transparent: true,
          opacity: 0.8,
          side: THREE.DoubleSide,
          depthWrite: false
        })

        this.bodyMat = new THREE.MeshLambertMaterial({
          color: 0x181c26,
          emissive: 0x07090e
        })

        const leftG = isModelLoaded && objSplitGeos ? objSplitGeos.leftWing : proceduralWingGeo
        const rightG = isModelLoaded && objSplitGeos ? objSplitGeos.rightWing : proceduralWingGeo
        const bG = isModelLoaded && objSplitGeos ? objSplitGeos.body : proceduralBodyGeo

        this.bodyMesh = new THREE.Mesh(bG, this.bodyMat)
        this.group.add(this.bodyMesh)

        this.leftWingGroup = new THREE.Group()
        this.leftWingMesh = new THREE.Mesh(leftG, this.wingMat)
        if (!isModelLoaded) {
          this.leftWingMesh.position.x = 1.0
          this.leftWingGroup.position.set(-0.02, 0, 0)
        }
        this.leftWingGroup.add(this.leftWingMesh)
        this.group.add(this.leftWingGroup)

        this.rightWingGroup = new THREE.Group()
        this.rightWingMesh = new THREE.Mesh(rightG, this.wingMat)
        if (!isModelLoaded) {
          this.rightWingMesh.scale.x = -1
          this.rightWingMesh.position.x = -1.0
          this.rightWingGroup.position.set(0.02, 0, 0)
        }
        this.rightWingGroup.add(this.rightWingMesh)
        this.group.add(this.rightWingGroup)

        this.scaleMult = SETTINGS.scale * (0.8 + Math.random() * 0.4)
        this.flapOffset = Math.random() * Math.PI * 2
        this.group.scale.set(0.25, 0.25, 0.25)
      }

      destroy() {
        scene.remove(this.group)
        this.wingMat.dispose()
        this.bodyMat.dispose()
      }
    }

    // 7. Interactive Trail Butterflies
    const trailButterflies: TrailButterfly[] = []
    const MAX_TRAIL_BUTTERFLIES = 15 // Performance cap

    class TrailButterfly extends ButterflyInstance {
      constructor(x: number, y: number) {
        super()
        this.group.position.set(x + (Math.random() - 0.5) * 0.2, y + (Math.random() - 0.5) * 0.2, 0.5)

        const phi = Math.random() * Math.PI * 2
        const theta = Math.acos((Math.random() * 2) - 1)
        const baseSpeed = 0.05 + Math.random() * 0.05

        this.vx = Math.sin(theta) * Math.cos(phi) * baseSpeed
        this.vy = Math.sin(theta) * Math.sin(phi) * baseSpeed + 0.01
        this.vz = Math.cos(theta) * baseSpeed

        this.group.scale.set(0.001, 0.001, 0.001)
        scene.add(this.group)
      }

      update() {
        this.age++
        const pct = this.age / this.maxAge

        let scaleVal = 1
        if (pct < 0.15) {
          scaleVal = (pct / 0.15) * this.scaleMult * 0.25
        } else {
          scaleVal = (1.0 - (pct - 0.15) / 0.85) * this.scaleMult * 0.25
        }
        this.group.scale.set(scaleVal, scaleVal, scaleVal)

        const speedMult = SPEED_MULT_MAP[SETTINGS.speed]
        this.group.position.x += this.vx * speedMult
        this.group.position.y += this.vy * speedMult
        this.group.position.z += this.vz * speedMult

        const flapMult = FLAP_MULT_MAP[SETTINGS.flap]
        const flapAngle = Math.sin(this.age * flapMult * 0.02 + this.flapOffset) * (Math.PI / 2.8)
        this.leftWingGroup.rotation.y = flapAngle
        this.rightWingGroup.rotation.y = -flapAngle

        const travelSpeed = Math.hypot(this.vx, this.vy, this.vz)
        if (travelSpeed > 0.01) {
          const yaw = Math.atan2(this.vx, this.vy)
          const pitch = -Math.atan2(this.vz, Math.hypot(this.vx, this.vy))
          this.group.rotation.z = -yaw
          this.group.rotation.x = pitch
        }

        const opacityDecay = pct < 0.15 ? (pct / 0.15) : Math.max(0, 1.0 - (pct - 0.15) / 0.85)
        this.wingMat.opacity = opacityDecay * 0.8

        if (this.age >= this.maxAge) {
          this.destroy()
          return false
        }
        return true
      }
    }

    // 8. Backdrop Ambient Butterflies
    const backdropButterflies: BackdropButterfly[] = []

    class BackdropButterfly extends ButterflyInstance {
      constructor(isInitial = false) {
        super()
        const depthZ = -8 + Math.random() * 8.0
        this.group.position.set(
          (Math.random() - 0.5) * 12,
          isInitial ? (Math.random() - 0.5) * 10 : -6,
          depthZ
        )

        const depthPct = (depthZ + 8) / 8.0
        this.scaleMult = 0.1 + depthPct * 0.18
        this.group.scale.set(this.scaleMult, this.scaleMult, this.scaleMult)

        const phi = Math.random() * Math.PI * 2
        const theta = Math.acos((Math.random() * 2) - 1)
        const baseSpeed = 0.015 + Math.random() * 0.02

        this.vx = Math.sin(theta) * Math.cos(phi) * baseSpeed
        this.vy = Math.sin(theta) * Math.sin(phi) * baseSpeed + 0.015
        this.vz = Math.cos(theta) * baseSpeed * 0.5

        this.wingMat.opacity = 0.35 + depthPct * 0.5
        scene.add(this.group)
      }

      update() {
        this.time += 0.015
        const speedMult = SPEED_MULT_MAP[SETTINGS.speed]

        this.group.position.x += (this.vx + Math.sin(this.time) * 0.005) * speedMult
        this.group.position.y += (this.vy + Math.cos(this.time * 0.5) * 0.003) * speedMult
        this.group.position.z += (this.vz + Math.sin(this.time * 0.8) * 0.004) * speedMult

        const yaw = Math.atan2(this.vx + Math.sin(this.time) * 0.005, this.vy)
        const pitch = -Math.atan2(this.vz, Math.hypot(this.vx, this.vy))
        this.group.rotation.z = -yaw
        this.group.rotation.x = pitch

        const flapAngle = Math.sin(this.time * this.flapSpeed + this.flapOffset) * (Math.PI / 3)
        this.leftWingGroup.rotation.y = flapAngle
        this.rightWingGroup.rotation.y = -flapAngle

        // Loop bounds
        if (this.group.position.y > 6 || this.group.position.x > 8 || this.group.position.x < -8 || this.group.position.z > 2 || this.group.position.z < -10) {
          this.group.position.y = -6
          this.group.position.x = (Math.random() - 0.5) * 12
          this.group.position.z = -8 + Math.random() * 8.0
          const depthPct = (this.group.position.z + 8) / 8.0
          this.scaleMult = 0.1 + depthPct * 0.18
          this.group.scale.set(this.scaleMult, this.scaleMult, this.scaleMult)
          this.wingMat.opacity = 0.35 + depthPct * 0.5
        }
        return true
      }
    }

    function initBackdrop() {
      for (let i = 0; i < SETTINGS.backdrop; i++) {
        backdropButterflies.push(new BackdropButterfly(true))
      }
    }

    function rebuildBackdrop() {
      for (let i = backdropButterflies.length - 1; i >= 0; i--) {
        backdropButterflies[i].destroy()
      }
      backdropButterflies.length = 0
      initBackdrop()
    }

    initBackdrop()

    // 9. Mouse Projector & Spawner
    function projectMouseTo3D(clientX: number, clientY: number) {
      const vector = new THREE.Vector3(
        (clientX / window.innerWidth) * 2 - 1,
        -(clientY / window.innerHeight) * 2 + 1,
        0.5
      )
      vector.unproject(camera)
      const dir = vector.sub(camera.position).normalize()
      const distance = -camera.position.z / dir.z
      return camera.position.clone().add(dir.multiplyScalar(distance))
    }

    let lastScreenX: number | null = null
    let lastScreenY: number | null = null

    const handleMouseMove = (e: MouseEvent) => {
      // Exclude mouse tracking on control panel or buttons
      if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) return

      if (lastScreenX === null || lastScreenY === null) {
        lastScreenX = e.clientX
        lastScreenY = e.clientY
        return
      }

      const dist = Math.hypot(e.clientX - lastScreenX, e.clientY - lastScreenY)

      if (dist >= SETTINGS.density) {
        const steps = Math.floor(dist / SETTINGS.density)

        for (let i = 1; i <= steps; i++) {
          const pct = i / steps
          const currX = lastScreenX + (e.clientX - lastScreenX) * pct
          const currY = lastScreenY + (e.clientY - lastScreenY) * pct
          const pos3D = projectMouseTo3D(currX, currY)

          // Spawn cluster of 3
          for (let c = 0; c < 3; c++) {
            if (trailButterflies.length >= MAX_TRAIL_BUTTERFLIES) {
              const oldest = trailButterflies.shift()
              if (oldest) oldest.destroy()
            }
            trailButterflies.push(new TrailButterfly(pos3D.x, pos3D.y))
          }
        }

        lastScreenX = e.clientX
        lastScreenY = e.clientY
      }
    }

    const handleMouseLeave = () => {
      lastScreenX = null
      lastScreenY = null
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)

    // 10. Frame resizing handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    // 11. Tick Render Loop (with Page Visbility optimization)
    let animationFrameId: number
    let isVisible = true

    const animate = () => {
      if (!isVisible) return

      // Update background butterflies
      backdropButterflies.forEach((b) => b.update())

      // Update trail butterflies
      for (let i = trailButterflies.length - 1; i >= 0; i--) {
        const active = trailButterflies[i].update()
        if (!active) {
          trailButterflies.splice(i, 1)
        }
      }

      renderer.render(scene, camera)
      animationFrameId = requestAnimationFrame(animate)
    }

    // Tab visibility change optimization
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isVisible = false
        cancelAnimationFrame(animationFrameId)
      } else {
        isVisible = true
        animate()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Start render loop
    animate()

    // 12. Cleanup on Unmount
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      cancelAnimationFrame(animationFrameId)

      // Dispose active butterflies
      trailButterflies.forEach((b) => b.destroy())
      backdropButterflies.forEach((b) => b.destroy())

      // Dispose procedural geometries
      proceduralWingGeo.dispose()
      proceduralBodyGeo.dispose()

      // Dispose WebGL context
      renderer.dispose()
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
