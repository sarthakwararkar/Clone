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
  const backdropContainerRef = useRef<HTMLDivElement>(null)
  const butterfliesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!backdropContainerRef.current || !butterfliesContainerRef.current) return

    const backdropContainer = backdropContainerRef.current
    const butterfliesContainer = butterfliesContainerRef.current
    let isModelLoaded = false
    let objSplitGeos: {
      leftWing: THREE.BufferGeometry
      rightWing: THREE.BufferGeometry
      body: THREE.BufferGeometry
    } | null = null

    // 1. Setup Dual Scenes
    const backdropScene = new THREE.Scene()
    const butterfliesScene = new THREE.Scene()

    // 2. Setup Camera
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(0, 0.5, 12)

    // 3. Setup Renderers
    const backdropRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    backdropRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)) // Optimize pixel ratio
    backdropRenderer.setSize(window.innerWidth, window.innerHeight)
    backdropContainer.appendChild(backdropRenderer.domElement)

    const butterfliesRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    butterfliesRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    butterfliesRenderer.setSize(window.innerWidth, window.innerHeight)
    butterfliesContainer.appendChild(butterfliesRenderer.domElement)

    // 4. Setup Lighting for both scenes
    const addLights = (sceneInstance: THREE.Scene) => {
      const ambient = new THREE.AmbientLight(0xffffff, 0.7)
      sceneInstance.add(ambient)

      const sun = new THREE.DirectionalLight(0xfff5e6, 1.7)
      sun.position.set(10, 15, 10)
      sceneInstance.add(sun)

      const sky = new THREE.DirectionalLight(0x8ecae6, 0.9)
      sky.position.set(-10, 10, -5)
      sceneInstance.add(sky)
    }
    
    addLights(backdropScene)
    addLights(butterfliesScene)

    // Setup backdrop fog
    backdropScene.fog = new THREE.FogExp2(0xbde0fe, 0.045)

    // 5. Fallback Procedural Geometries (used while base.obj is loading)
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

    // 6. HIGH-RES CONTINUOUS TERRAIN HEIGHTMAP (Meadow to Snow Mountains)
    const terrainGeo = new THREE.PlaneGeometry(35, 35, 110, 110)
    terrainGeo.rotateX(-Math.PI / 2) // lie flat

    const colors: number[] = []
    const terrainPos = terrainGeo.attributes.position as THREE.BufferAttribute
    
    for (let i = 0; i < terrainPos.count; i++) {
      const x = terrainPos.getX(i)
      const z = terrainPos.getZ(i)

      // 6.1 Meadow height
      const meadowY = Math.sin(x * 0.12) * Math.cos(z * 0.12) * 0.8 + Math.sin(x * 0.3) * Math.cos(z * 0.3) * 0.2
      
      let finalY = meadowY
      let r = 0.18, g = 0.38, b = 0.15 // default grass green
      
      // 6.2 Rising mountain range at the back (z < -2)
      if (z < -2) {
        // Transition weight (0 at z=-2, 1 at z=-17.5)
        const t = (Math.abs(z) - 2) / 15.5 
        
        // Rugged mountain ridges (fractional Brownian motion approximation)
        let mountainNoise = Math.sin(x * 0.4) * 2.8       // giant peaks
        mountainNoise += Math.sin(x * 1.2) * 0.75         // secondary ridges
        mountainNoise += Math.sin(x * 3.5) * 0.25         // rocky details
        mountainNoise += Math.sin(x * 8.0) * 0.08         // fine gravel
        
        // Blend meadow plane to mountain peaks
        finalY = meadowY * (1 - t) + (2.5 + mountainNoise) * t

        // Color coding by altitude & slope
        if (t > 0.35) {
          if (finalY > 2.1) {
            // Snow-capped peaks
            r = 0.95; g = 0.95; b = 0.95
          } else if (finalY > 1.0) {
            // Rocky dark grey
            r = 0.36; g = 0.40; b = 0.42
          } else {
            // Alpine forest transition
            r = 0.22; g = 0.33; b = 0.20
          }
        }
      }
      
      // 6.3 Winding dirt path (only in the front meadow area z > -5)
      if (z >= -5) {
        const pathCenter = Math.sin(z * 0.22) * 2.2
        const distToPath = Math.abs(x - pathCenter)

        if (distToPath < 1.2) {
          const factor = distToPath / 1.2
          finalY -= (1 - factor) * 0.28 // path depression

          // Sandy dirt trail color
          r = 0.64 - (1 - factor) * 0.1
          g = 0.50 - (1 - factor) * 0.08
          b = 0.38 - (1 - factor) * 0.05
        } else if (distToPath < 2.0) {
          // Blend path edge
          const factor = (distToPath - 1.2) / 0.8
          const rBrown = 0.54, gBrown = 0.44, bBrown = 0.34
          const rGrass = 0.18, gGrass = 0.38, bGrass = 0.15

          r = rBrown * (1 - factor) + rGrass * factor
          g = gBrown * (1 - factor) + gGrass * factor
          b = bBrown * (1 - factor) + bGrass * factor
        }
      }

      terrainPos.setY(i, finalY)
      colors.push(r, g, b)
    }
    terrainGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    terrainGeo.computeVertexNormals()

    const terrainMat = new THREE.MeshLambertMaterial({
      vertexColors: true,
      flatShading: true
    })

    const terrain = new THREE.Mesh(terrainGeo, terrainMat)
    terrain.position.y = -3.2
    backdropScene.add(terrain)

    // -------------------------------------------------------------
    // HIGH-RES PROCEDURAL TEXTURES
    // -------------------------------------------------------------
    function createHighResTexture(type: string) {
      const canvas = document.createElement('canvas')
      canvas.width = 128
      canvas.height = 256
      const ctx = canvas.getContext('2d')
      if (!ctx) return new THREE.Texture()
      ctx.clearRect(0, 0, 128, 256)

      if (type === 'grass') {
        const grad = ctx.createLinearGradient(64, 256, 64, 10)
        grad.addColorStop(0, '#132a13')
        grad.addColorStop(0.3, '#3f5e3d')
        grad.addColorStop(0.8, '#52b788')
        grad.addColorStop(1, '#b7e4c7')

        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.moveTo(56, 256)
        ctx.quadraticCurveTo(50, 120, 72, 10)
        ctx.quadraticCurveTo(74, 120, 72, 256)
        ctx.fill()

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(64, 256)
        ctx.quadraticCurveTo(57, 120, 72, 20)
        ctx.stroke()

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(62, 256)
        ctx.quadraticCurveTo(55, 120, 70, 20)
        ctx.stroke()
      } else if (type === 'red') {
        ctx.strokeStyle = '#2d6a4f'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.moveTo(64, 256)
        ctx.quadraticCurveTo(58, 150, 64, 60)
        ctx.stroke()

        ctx.fillStyle = '#3B7A3E'
        ctx.beginPath()
        ctx.ellipse(50, 160, 6, 18, -Math.PI/6, 0, Math.PI*2)
        ctx.ellipse(78, 120, 5, 15, Math.PI/4, 0, Math.PI*2)
        ctx.fill()

        ctx.fillStyle = '#b7094c'
        ctx.beginPath()
        ctx.ellipse(64, 60, 26, 22, 0, 0, Math.PI*2)
        ctx.fill()

        const flowerGrad = ctx.createRadialGradient(64, 60, 2, 64, 60, 28)
        flowerGrad.addColorStop(0, '#000814')
        flowerGrad.addColorStop(0.25, '#780000')
        flowerGrad.addColorStop(0.7, '#c1121f')
        flowerGrad.addColorStop(1, '#f25c54')

        ctx.fillStyle = flowerGrad
        for (let i = 0; i < 4; i++) {
          const angle = (i * Math.PI) / 2
          const ox = Math.cos(angle) * 8
          const oy = Math.sin(angle) * 8
          ctx.beginPath()
          ctx.arc(64 + ox, 60 + oy, 18, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.fillStyle = '#ffb703'
        for (let i = 0; i < 12; i++) {
          const a = (i * Math.PI) / 6
          const px = 64 + Math.cos(a) * 8
          const py = 60 + Math.sin(a) * 8
          ctx.beginPath()
          ctx.arc(px, py, 1.5, 0, Math.PI * 2)
          ctx.fill()
        }
      } else if (type === 'yellow') {
        ctx.strokeStyle = '#2d6a4f'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.moveTo(64, 256)
        ctx.quadraticCurveTo(66, 160, 64, 60)
        ctx.stroke()

        ctx.fillStyle = '#ffb703'
        for (let i = 0; i < 16; i++) {
          const angle = (i * Math.PI) / 8
          ctx.save()
          ctx.translate(64, 60)
          ctx.rotate(angle)
          ctx.fillStyle = i % 2 === 0 ? '#ffb703' : '#ffc300'
          ctx.beginPath()
          ctx.moveTo(0, 0)
          ctx.quadraticCurveTo(-6, -18, 0, -28)
          ctx.quadraticCurveTo(6, -18, 0, 0)
          ctx.fill()
          ctx.restore()
        }

        const centerGrad = ctx.createRadialGradient(64, 60, 0, 64, 60, 10)
        centerGrad.addColorStop(0, '#582f0e')
        centerGrad.addColorStop(0.7, '#7f4f24')
        centerGrad.addColorStop(1, '#a68a64')
        ctx.fillStyle = centerGrad
        ctx.beginPath()
        ctx.arc(64, 60, 10, 0, Math.PI * 2)
        ctx.fill()
      } else if (type === 'purple') {
        ctx.strokeStyle = '#3a5a40'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(64, 256)
        ctx.lineTo(64, 30)
        ctx.stroke()

        const blossomColors = ['#5e548e', '#9f86c0', '#be95c4', '#e0b1cb']
        for (let y = 30; y < 140; y += 6) {
          const sizeX = Math.max(6, 16 - (y - 30) * 0.08)
          ctx.fillStyle = blossomColors[Math.floor(Math.random() * blossomColors.length)]
          ctx.beginPath()
          ctx.ellipse(64 - sizeX/2, y, sizeX/2.5, 4, -Math.PI/6, 0, Math.PI*2)
          ctx.ellipse(64 + sizeX/2, y, sizeX/2.5, 4, Math.PI/6, 0, Math.PI*2)
          ctx.fill()

          ctx.fillStyle = blossomColors[Math.floor(Math.random() * blossomColors.length)]
          ctx.beginPath()
          ctx.arc(64, y - 2, 3, 0, Math.PI*2)
          ctx.fill()
        }
      } else {
        ctx.strokeStyle = '#2d6a4f'
        ctx.lineWidth = 3.5
        ctx.beginPath()
        ctx.moveTo(64, 256)
        ctx.quadraticCurveTo(68, 140, 64, 60)
        ctx.stroke()

        ctx.fillStyle = '#0077b6'
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4
          ctx.save()
          ctx.translate(64, 60)
          ctx.rotate(angle)
          ctx.beginPath()
          ctx.moveTo(0, 0)
          ctx.lineTo(-7, -24)
          ctx.lineTo(0, -28)
          ctx.lineTo(7, -24)
          ctx.closePath()
          ctx.fill()

          ctx.strokeStyle = '#90e0ef'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(0, 0)
          ctx.lineTo(0, -22)
          ctx.stroke()
          ctx.restore()
        }

        ctx.fillStyle = '#caf0f8'
        ctx.beginPath()
        ctx.arc(64, 60, 5, 0, Math.PI * 2)
        ctx.fill()
      }

      const texture = new THREE.CanvasTexture(canvas)
      texture.minFilter = THREE.LinearMipmapLinearFilter
      return texture
    }

    // -------------------------------------------------------------
    // INSTANCED FOLIAGE (2,500 Swaying Grass Blades - Optimized)
    // -------------------------------------------------------------
    const grassGeo = new THREE.PlaneGeometry(0.2, 0.7)
    grassGeo.translate(0, 0.35, 0)

    const totalGrass = 1800 // Optimized density for high FPS
    const grassTex = createHighResTexture('grass')
    const grassMat = new THREE.MeshLambertMaterial({
      map: grassTex,
      transparent: true,
      alphaTest: 0.5,
      side: THREE.DoubleSide
    })

    // High performance GPU Sway Vertex Shader Injection
    grassMat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = { value: 0 }
      shader.vertexShader = 'uniform float uTime;\n' + shader.vertexShader
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        float swayFactor = position.y;
        float sway = sin(uTime * 1.5 + instanceMatrix[3].x * 0.2 + instanceMatrix[3].z * 0.2) * 0.15 * swayFactor;
        transformed.x += sway;
        transformed.z += sway * 0.4;
        `
      )
      grassMat.userData.shader = shader
    }

    const grassMesh = new THREE.InstancedMesh(grassGeo, grassMat, totalGrass)
    const grassDummy = new THREE.Object3D()

    for (let i = 0; i < totalGrass; i++) {
      let rx = 0, rz = 0, distToPath = 0
      do {
        rx = (Math.random() - 0.5) * 28
        rz = (Math.random() - 0.5) * 28
        
        if (rz < -6) continue
        
        const pCenter = Math.sin(rz * 0.22) * 2.2
        distToPath = Math.abs(rx - pCenter)
      } while (distToPath < 1.1 || rz < -6)

      const ry = Math.sin(rx * 0.15) * Math.cos(rz * 0.15) * 0.8 + Math.sin(rx * 0.4) * 0.2 - 3.2

      grassDummy.position.set(rx, ry, rz)
      grassDummy.rotation.y = Math.random() * Math.PI * 2
      grassDummy.rotation.x = (Math.random() - 0.5) * 0.2
      
      const scale = 0.7 + Math.random() * 0.8
      grassDummy.scale.set(scale, scale, scale)
      grassDummy.updateMatrix()
      grassMesh.setMatrixAt(i, grassDummy.matrix)
    }
    backdropScene.add(grassMesh)

    // -------------------------------------------------------------
    // INSTANCED WILDFLOWERS
    // -------------------------------------------------------------
    const flowerGeo = new THREE.PlaneGeometry(0.35, 0.7)
    flowerGeo.translate(0, 0.35, 0)

    const totalFlowersPerType = 100 // Optimized density
    const flowerColors = ['red', 'yellow', 'purple', 'blue']
    const instancedMeshes: { mesh: THREE.InstancedMesh; color: string }[] = []

    flowerColors.forEach((color) => {
      const tex = createHighResTexture(color)
      const mat = new THREE.MeshLambertMaterial({
        map: tex,
        transparent: true,
        alphaTest: 0.5,
        side: THREE.DoubleSide
      })

      // High performance GPU Sway Vertex Shader Injection for Flowers
      mat.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = { value: 0 }
        shader.vertexShader = 'uniform float uTime;\n' + shader.vertexShader
        shader.vertexShader = shader.vertexShader.replace(
          '#include <begin_vertex>',
          `
          #include <begin_vertex>
          float swayFactor = position.y;
          float sway = sin(uTime * 1.5 + instanceMatrix[3].x * 0.2 + instanceMatrix[3].z * 0.2) * 0.10 * swayFactor;
          transformed.x += sway;
          transformed.z += sway * 0.3;
          `
        )
        mat.userData.shader = shader
      }

      const mesh = new THREE.InstancedMesh(flowerGeo, mat, totalFlowersPerType)
      const dummy = new THREE.Object3D()

      for (let i = 0; i < totalFlowersPerType; i++) {
        let rx = 0, rz = 0, distToPath = 0
        do {
          rx = (Math.random() - 0.5) * 28
          rz = (Math.random() - 0.5) * 28
          
          if (rz < -6) continue
          
          const pCenter = Math.sin(rz * 0.22) * 2.2
          distToPath = Math.abs(rx - pCenter)
        } while (distToPath < 1.15 || rz < -6)

        const ry = Math.sin(rx * 0.15) * Math.cos(rz * 0.15) * 0.8 + Math.sin(rx * 0.4) * 0.2 - 3.2

        dummy.position.set(rx, ry, rz)
        dummy.rotation.y = Math.random() * Math.PI * 2
        dummy.rotation.x = (Math.random() - 0.5) * 0.15
        
        const scale = 0.5 + Math.random() * 0.7
        dummy.scale.set(scale, scale, scale)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
      }
      
      backdropScene.add(mesh)
      instancedMeshes.push({ mesh, color })
    })

    // -------------------------------------------------------------
    // WIND SWAY SIMULATION (100% GPU Accelerated)
    // -------------------------------------------------------------
    function animateMeadow(time: number) {
      if (grassMat.userData.shader) {
        grassMat.userData.shader.uniforms.uTime.value = time
      }
      instancedMeshes.forEach(({ mesh }) => {
        const mat = mesh.material as THREE.MeshLambertMaterial
        if (mat.userData.shader) {
          mat.userData.shader.uniforms.uTime.value = time
        }
      })
    }

    // -------------------------------------------------------------
    // GEOMETRY SPLITTING HELPER FOR base.obj
    // -------------------------------------------------------------
    function splitButterflyGeometry(geo: THREE.BufferGeometry) {
      const positionAttr = geo.attributes.position as THREE.BufferAttribute
      if (!positionAttr) return null

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

      leftGeo.translate(bodyThreshold, 0, 0)
      rightGeo.translate(-bodyThreshold, 0, 0)

      return {
        leftWing: leftGeo,
        rightWing: rightGeo,
        body: bGeo
      }
    }

    // 6. Load base.obj dynamically
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

    // 7. Base Butterfly Logic
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
          emissive: 0x444444,
          transparent: true,
          opacity: 0.85,
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
        butterfliesScene.remove(this.group)
        this.wingMat.dispose()
        this.bodyMat.dispose()
      }
    }

    // 8. Interactive Trail Butterflies (rendered in Butterflies scene overlay)
    const trailButterflies: TrailButterfly[] = []
    const MAX_TRAIL_BUTTERFLIES = 15

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
        butterfliesScene.add(this.group)
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
        this.wingMat.opacity = opacityDecay * 0.85

        if (this.age >= this.maxAge) {
          this.destroy()
          return false
        }
        return true
      }
    }

    // 9. Backdrop Ambient Butterflies
    const backdropButterflies: BackdropButterfly[] = []

    class BackdropButterfly extends ButterflyInstance {
      constructor(isInitial = false) {
        super()
        const depthZ = -8 + Math.random() * 8.0
        this.group.position.set(
          (Math.random() - 0.5) * 12,
          isInitial ? (Math.random() - 0.5) * 10 : -4.5,
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
        butterfliesScene.add(this.group)
      }

      update() {
        this.time += 0.015
        const speedMult = SPEED_MULT_MAP[SETTINGS.speed]

        this.group.position.x += (this.vx + Math.sin(this.time) * 0.005) * speedMult
        this.group.position.y += (this.vy + Math.cos(this.time * 0.5) * 0.003) * speedMult
        this.group.position.z += (this.vz + Math.sin(this.time * 0.8) * 0.004) * speedMult

        const yaw = Math.atan2(this.vx + Math.sin(this.time) * 0.005, this.vy)
        const pitch = -Math.atan2(this.vz, Math.hypot(this.vx, this.vy))
        this.group.rotation.z = -yaw;
        this.group.rotation.x = pitch;

        const flapAngle = Math.sin(this.time * this.flapSpeed + this.flapOffset) * (Math.PI / 3)
        this.leftWingGroup.rotation.y = flapAngle
        this.rightWingGroup.rotation.y = -flapAngle

        // Loop bounds
        if (this.group.position.y > 6 || this.group.position.x > 8 || this.group.position.x < -8 || this.group.position.z > 2 || this.group.position.z < -10) {
          this.group.position.y = -4.5
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

    // 10. Mouse Projector & Spawner
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

    // 11. Frame resizing handler
    const handleResize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      backdropRenderer.setSize(w, h)
      butterfliesRenderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    // 12. Tick Render Loop (with Page Visbility optimization)
    let animationFrameId: number
    let isVisible = true
    let animTime = 0

    const animate = () => {
      if (!isVisible) return

      animTime += 0.015

      // Sway foliage on GPU via shader uniforms
      animateMeadow(animTime)

      // Update background butterflies
      backdropButterflies.forEach((b) => b.update())

      // Update trail butterflies
      for (let i = trailButterflies.length - 1; i >= 0; i--) {
        const active = trailButterflies[i].update()
        if (!active) {
          trailButterflies.splice(i, 1)
        }
      }

      backdropRenderer.render(backdropScene, camera)
      butterfliesRenderer.render(butterfliesScene, camera)
      
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

    // 13. Cleanup on Unmount
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

      // Dispose terrain geometries
      terrainGeo.dispose()
      terrainMat.dispose()

      // Dispose foliage meshes/materials
      grassGeo.dispose()
      grassMat.dispose()
      grassTex.dispose()
      flowerGeo.dispose()
      instancedMeshes.forEach(({ mesh }) => {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose())
        } else {
          mesh.material.dispose()
        }
        backdropScene.remove(mesh)
      })

      // Dispose WebGL contexts
      backdropRenderer.dispose()
      if (backdropRenderer.domElement && backdropContainer.contains(backdropRenderer.domElement)) {
        backdropContainer.removeChild(backdropRenderer.domElement)
      }

      butterfliesRenderer.dispose()
      if (butterfliesRenderer.domElement && butterfliesContainer.contains(butterfliesRenderer.domElement)) {
        butterfliesContainer.removeChild(butterfliesRenderer.domElement)
      }
    }
  }, [])

  return (
    <>
      {/* Background Canvas: renders landscape terrain, mountains, foliage */}
      <div
        ref={backdropContainerRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-[-10] overflow-hidden"
        style={{
          background: 'linear-gradient(to bottom, #87b9e8 0%, #b8d4ee 40%, #ffcbdc 100%)'
        }}
      />
      {/* Foreground Canvas: renders only the 3D flying butterflies */}
      <div
        ref={butterfliesContainerRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-[50] overflow-hidden"
      />
    </>
  )
}
