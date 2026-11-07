import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js'

const DAY_IMAGE = '/images/tuna-bay-hero.jpg'
const NIGHT_IMAGE = '/images/tuna-bay-waterfront.png'
// Quaternius "Tuna" (CC0) via bob6664569/open-water; hosted locally to avoid CORS/dependency issues.
const FISH_GLB = '/models/tuna.glb'

type Pose = { at: number; x: number; y: number; s: number; yaw: number; pitch: number; roll: number }

function smoothstep(a: number, b: number, v: number) {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a || 1)))
  return t * t * (3 - 2 * t)
}
function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}
function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

export default function BlueTunaScene() {
  const root = useRef<HTMLDivElement>(null)
  const pondCanvas = useRef<HTMLCanvasElement>(null)
  const koiCanvas = useRef<HTMLCanvasElement>(null)
  const dayRef = useRef<HTMLDivElement>(null)
  const violetRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const nightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const pond = pondCanvas.current!
    const koi = koiCanvas.current!
    let raf = 0
    let dead = false

    // shared pointer
    const ptr = { u: 0.5, v: 0.5, tx: 0, ty: 0, inside: false }
    const onMove = (e: PointerEvent) => {
      ptr.u = e.clientX / window.innerWidth
      ptr.v = 1 - e.clientY / window.innerHeight
      ptr.tx = ptr.u * 2 - 1
      ptr.ty = ptr.v * 2 - 1
      ptr.inside = true
    }
    const onLeave = () => { ptr.inside = false; ptr.tx = 0; ptr.ty = 0 }
    window.addEventListener('pointermove', onMove)
    document.documentElement.addEventListener('pointerleave', onLeave)

    // --- hero background (stable). Ripple lens disabled to avoid edge/glitch artifacts over the hero. ---
    const img = new Image()
    img.src = DAY_IMAGE
    let imgReady = false
    img.onload = () => { imgReady = true }

    // --- Three.js tuna (Nectarline-style motion: scroll choreography, swim, pointer tilt) ---
    const renderer = new THREE.WebGLRenderer({ canvas: koi, alpha: true, antialias: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    const scene = new THREE.Scene()
    const pmrem = new THREE.PMREMGenerator(renderer)
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.add(new THREE.HemisphereLight(0xe6f6ff, 0x0b2a45, 1.15))
    const key = new THREE.DirectionalLight(0xffffff, 2.0); key.position.set(3, 5, 6); scene.add(key)
    const rim = new THREE.DirectionalLight(0x66ccff, 3.8); rim.position.set(-5, -1, -4); scene.add(rim)
    const fill = new THREE.PointLight(0x7fd8ff, 22, 30); fill.position.set(0, 0, 4); scene.add(fill)
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
    camera.position.set(0, 0, 10); camera.lookAt(0, 0, 0)

    const rig = new THREE.Group(); const body = new THREE.Group(); rig.add(body); scene.add(rig)
    let mixer: THREE.AnimationMixer | null = null

    const tune = (rootObj: THREE.Object3D) => {
      const mat = new THREE.MeshPhysicalMaterial({
        color: 0x1a86ff, emissive: 0x1e90ff, emissiveIntensity: 1.15,
        roughness: 0.16, metalness: 0.4, clearcoat: 1, clearcoatRoughness: 0.08,
        sheen: 0.55, sheenColor: new THREE.Color(0xdff6ff),
        envMapIntensity: 1.3, side: THREE.DoubleSide,
      })
      rootObj.traverse((o) => {
        const m = o as THREE.Mesh
        if (!m.isMesh) return
        m.material = mat
        m.frustumCulled = false
        m.castShadow = false
      })
    }

    body.visible = false // show only when real model is ready (avoids fallback/orientation glitches)

    new GLTFLoader().load(FISH_GLB, (gltf) => {
      if (dead) return
      try {
        const rootObj = (SkeletonUtils as any).clone(gltf.scene) as THREE.Object3D
        rootObj.updateMatrixWorld(true)
        tune(rootObj)

        // normalize: center, align longest axis to +X (nose right), scale to length 1
        const wrap = new THREE.Group()
        wrap.add(rootObj)
        rootObj.updateMatrixWorld(true)
        let box = new THREE.Box3().setFromObject(rootObj)
        let size = box.getSize(new THREE.Vector3())
        // rotate so the longest dimension lies along X
        if (size.z >= size.x && size.z >= size.y) wrap.rotation.y = Math.PI / 2
        else if (size.y >= size.x && size.y >= size.z) wrap.rotation.z = -Math.PI / 2
        wrap.updateMatrixWorld(true)
        box = new THREE.Box3().setFromObject(wrap)
        const center = box.getCenter(new THREE.Vector3())
        wrap.position.sub(center)
        wrap.updateMatrixWorld(true)
        // ensure head points toward +X (heuristic: model faces +X after alignment; flip if needed)
        wrap.rotation.y += Math.PI
        wrap.updateMatrixWorld(true)
        box = new THREE.Box3().setFromObject(wrap)
        const len = Math.max(box.getSize(new THREE.Vector3()).x, 0.001)
        wrap.scale.setScalar(1 / len)
        body.add(wrap)

        const clip = gltf.animations.find((a) => /Swimming_Normal/i.test(a.name)) || gltf.animations.find((a) => /swim/i.test(a.name)) || gltf.animations[0]
        mixer.clipAction(clip).play()
        body.visible = true
        console.info('BlueTuna ready', { clip: clip?.name, len, animations: gltf.animations?.length || 0 })
      } catch (e) { console.error('BlueTuna model setup failed', e) }
    }, undefined, (e) => { console.error('BlueTuna model load failed', FISH_GLB, e) })

    // (procedural fallback removed — GLB loads locally; avoids double/orientation artifacts)

    // controlled swim path: calm, clearly positioned (nose +X; yaw 0=right, PI=left)
    const anchors = (): Pose[] => {
      const h = window.innerHeight
      const top = (sel: string) => { const el = document.querySelector(sel) as HTMLElement | null; return el ? el.getBoundingClientRect().top + window.scrollY : h }
      const end = document.querySelector('#tuna-end') as HTMLElement | null
      const maxS = Math.max(0, document.documentElement.scrollHeight - h)
      const endAt = Math.min(end ? end.offsetTop : maxS, maxS)
      const phone = window.innerWidth <= 820
      if (phone) return [
        { at: 0, x: 0.22, y: 0.46, s: 0.30, yaw: Math.PI, pitch: 0, roll: 0 },              // hero: upper right, facing left
        { at: top('#tuna-about') + 0.1 * h, x: -0.15, y: -0.42, s: 0.22, yaw: 0.12, pitch: 0, roll: 0 },
        { at: top('#tuna-features') + 0.1 * h, x: 0.18, y: -0.46, s: 0.22, yaw: Math.PI - 0.12, pitch: 0, roll: 0 },
        { at: endAt, x: 0, y: -0.38, s: 0.20, yaw: Math.PI, pitch: 0, roll: 0 },
      ]
      return [
        { at: 0, x: 0.58, y: 0.18, s: 0.38, yaw: Math.PI - 0.15, pitch: 0.03, roll: 0 },     // hero: right side, clear of left text
        { at: top('#tuna-about') + 0.2 * h, x: -0.52, y: -0.30, s: 0.28, yaw: 0.15, pitch: 0.02, roll: 0 },
        { at: top('#tuna-features') + 0.15 * h, x: 0.50, y: -0.34, s: 0.28, yaw: Math.PI - 0.15, pitch: 0.02, roll: 0 },
        { at: top('#tuna-experience') + 0.15 * h, x: -0.48, y: -0.28, s: 0.26, yaw: 0.15, pitch: 0.02, roll: 0 },
        { at: endAt, x: 0.0, y: 0.42, s: 0.26, yaw: Math.PI - 0.12, pitch: 0, roll: 0 },
      ]
    }
    let poses = anchors()
    let cur: Omit<Pose,'at'> = { ...poses[0] }
    let lastY = window.scrollY, vel = 0, elapsed = 0

    const resize = () => {
      const w = window.innerWidth, h = window.innerHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h; camera.updateProjectionMatrix()
      poses = anchors()
    }
    resize(); window.addEventListener('resize', resize)

    const frustum = () => { const fh = 2*Math.tan(THREE.MathUtils.degToRad(15))*10; return { fw: fh*camera.aspect, fh } }

    let prev = performance.now()
    const tick = (now: number) => {
      if (dead) return
      const dt = Math.min(0.05, (now-prev)/1000); prev = now; elapsed += dt
      const h = window.innerHeight, y = window.scrollY
      const toV = smoothstep(0.15 * h, 1.05 * h, y)
      const endEl = document.querySelector('#tuna-end') as HTMLElement | null
      const endTop = endEl ? endEl.offsetTop : document.documentElement.scrollHeight
      const toN = smoothstep(endTop - 1.1*h, endTop - 0.1*h, y)
      // stable hero crossfade/parallax (no WebGL lens = no edge glitch)
      if (dayRef.current) { dayRef.current.style.opacity = String(1 - toV); dayRef.current.style.transform = `translateY(${-0.03 * y}px)` }
      if (violetRef.current) violetRef.current.style.opacity = String(toV*(1-toN))
      if (glowRef.current) glowRef.current.style.opacity = String(toV*(1-toN))
      if (nightRef.current) nightRef.current.style.opacity = String(toN)

      // (ripple lens removed — hero image renders cleanly via CSS background)

      // tuna motion: calm, eased path (no camera/erratic tilt)
      const inst = (y - lastY) / Math.max(dt, 0.001); lastY = y; vel += (inst - vel) * 0.12
      const speedUp = Math.min(Math.abs(vel) / 2000, 1.0)
      if (mixer && !reduce) mixer.update(dt * (0.9 + speedUp))
      let target = poses[0]
      for (let i = 0; i < poses.length - 1; i++) {
        const a = poses[i], b = poses[i + 1]
        if (y >= a.at && y <= b.at) { const tt = easeInOut((y - a.at) / (b.at - a.at || 1)); target = { at: y, x: lerp(a.x,b.x,tt), y: lerp(a.y,b.y,tt), s: lerp(a.s,b.s,tt), yaw: lerp(a.yaw,b.yaw,tt), pitch: lerp(a.pitch,b.pitch,tt), roll: lerp(a.roll,b.roll,tt) } as any; break }
        if (y > b.at) target = b
      }
      const k = reduce ? 1 : 1 - Math.exp(-2.0 * dt)
      ;(['x','y','s','yaw','pitch','roll'] as const).forEach((n) => { (cur as any)[n] += (((target as any)[n] || 0) - (cur as any)[n]) * k })
      const bob = reduce ? 0 : Math.sin(0.7 * elapsed) * 0.01
      const drift = reduce ? 0 : Math.sin(0.3 * elapsed) * 0.008
      const { fw, fh } = frustum()
      rig.position.set((cur.x + drift) * fw / 2, (cur.y + bob) * fh / 2, 0)
      rig.rotation.set(cur.roll, cur.yaw, cur.pitch, 'XYZ')
      body.scale.setScalar(cur.s * fh)
      renderer.render(scene, camera)

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      dead = true; cancelAnimationFrame(raf); window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove); document.documentElement.removeEventListener('pointerleave', onLeave)
      renderer.dispose(); pmrem.dispose()
    }
  }, [])

  return (
    <div ref={root} className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div ref={dayRef} className="absolute inset-0 will-change-[opacity]" style={{ backgroundImage: `url(${DAY_IMAGE})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        {/* Tuna Bay atmosphere: warm daylight lift + ocean depth (clean, no distortion) */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 90% at 70% 18%, rgba(255,214,140,.18), rgba(255,214,140,0) 55%), linear-gradient(180deg, rgba(6,58,78,.06) 0%, rgba(5,45,64,.22) 52%, rgba(4,34,52,.62) 100%)' }} />
        <div className="absolute inset-x-0 bottom-0 h-[38%]" style={{ background: 'linear-gradient(180deg, rgba(4,34,52,0), rgba(3,24,38,.68))' }} />
      </div>
      {/* Mid scroll: deep Pacific gradient, no flat purple */}
      <div ref={violetRef} className="absolute inset-0 opacity-0" style={{ background: 'linear-gradient(180deg, #0b4f63 0%, #083140 46%, #052633 100%)' }} />
      <div ref={glowRef} className="absolute inset-0 opacity-0" style={{ background: 'radial-gradient(80% 60% at 20% 10%, rgba(142,216,199,.16), rgba(142,216,199,0) 60%), radial-gradient(70% 55% at 85% 70%, rgba(231,111,81,.10), rgba(231,111,81,0) 65%)' }} />
      <div ref={nightRef} className="absolute inset-0 opacity-0" style={{ backgroundImage: `url(${NIGHT_IMAGE})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(4,28,42,.18) 0%, rgba(4,30,46,.48) 45%, rgba(5,38,51,.90) 100%)' }} />
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.35) 1px, transparent 1px)', backgroundSize: '120px 120px', backgroundPosition: '20px 30px' }} />
      </div>
      <canvas ref={koiCanvas} className="absolute inset-0 block h-full w-full" />
    </div>
  )
}
