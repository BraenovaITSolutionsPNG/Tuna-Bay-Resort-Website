import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

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

    // --- ripple on hero image ---
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = DAY_IMAGE
    let gl: WebGLRenderingContext | null = null
    let prog: WebGLProgram | null = null
    let uni: Record<string, WebGLUniformLocation | null> = {}
    let tex: WebGLTexture | null = null
    let imgReady = false
    let pTime = 0
    let presence = 0
    let mouse = { x: 0.5, y: 0.5 }
    let tilt = { x: 0, y: 0 }

    const initPond = () => {
      if (reduce) return
      gl = pond.getContext('webgl', { alpha: false, antialias: false, premultipliedAlpha: false })
      if (!gl) return
      const vs = `attribute vec2 p; varying vec2 v; void main(){ v=p*0.5+0.5; gl_Position=vec4(p,0.,1.); }`
      const fs = `precision mediump float; varying vec2 v; uniform sampler2D tex; uniform vec2 res; uniform vec2 img; uniform vec2 mouse; uniform float time; uniform float presence; uniform vec2 tilt; uniform float zoom;
        void main(){
          vec2 A=res, I=img; float a=A.x/A.y, i=I.x/I.y; vec2 sc=a>i?vec2(1.,i/a):vec2(a/i,1.); sc*=zoom;
          vec2 uv=(v-0.5)*sc+0.5+tilt;
          float d=distance(v,mouse); float r=sin(d*20.-time*5.)*0.006; float s=smoothstep(0.2,0.0,d)*presence;
          vec2 off=normalize(v-mouse+1e-5)*r*s;
          float R=texture2D(tex,uv+off+vec2(0.005,0.)*s).r;
          float G=texture2D(tex,uv+off).g;
          float B=texture2D(tex,uv+off-vec2(0.005,0.)*s).b;
          gl_FragColor=vec4(R,G,B,1.);
        }`
      const mk = (t: number, s: string) => { const sh = gl!.createShader(t)!; gl!.shaderSource(sh, s); gl!.compileShader(sh); return sh }
      prog = gl.createProgram()!
      gl.attachShader(prog, mk(gl.VERTEX_SHADER, vs))
      gl.attachShader(prog, mk(gl.FRAGMENT_SHADER, fs))
      gl.linkProgram(prog)
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { gl = null; return }
      gl.useProgram(prog)
      const buf = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW)
      const loc = gl.getAttribLocation(prog, 'p')
      gl.enableVertexAttribArray(loc)
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
      tex = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      ;['tex','res','img','mouse','time','presence','tilt','zoom'].forEach((n) => (uni[n] = gl!.getUniformLocation(prog!, n)))
      gl.uniform1i(uni.tex, 0)
      gl.uniform1f(uni.zoom, 0.985)
    }
    img.onload = () => {
      imgReady = true
      if (gl && tex) { gl.bindTexture(gl.TEXTURE_2D, tex); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img) }
      pond.style.opacity = '1'
    }
    initPond()

    // --- Three.js tuna ---
    const renderer = new THREE.WebGLRenderer({ canvas: koi, alpha: true, antialias: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0
    const scene = new THREE.Scene()
    const pmrem = new THREE.PMREMGenerator(renderer)
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.add(new THREE.HemisphereLight(0xdff3ff, 0x10304a, 1.0))
    const key = new THREE.DirectionalLight(0xffffff, 1.8); key.position.set(3,5,6); scene.add(key)
    const rim = new THREE.DirectionalLight(0x4fc3ff, 3.2); rim.position.set(-5,-1,-4); scene.add(rim)
    const fill = new THREE.PointLight(0x66bfff, 18, 30); fill.position.set(0,0,4); scene.add(fill)
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
    camera.position.set(0,0,10); camera.lookAt(0,0,0)

    const rig = new THREE.Group(); const body = new THREE.Group(); rig.add(body); scene.add(rig)
    let swimUniforms: { time: { value: number }; speed: { value: number }; amp: { value: number }; freq: { value: number } } | null = null

    new GLTFLoader().load(FISH_GLB, (gltf) => {
      if (dead) return
      try {
        const rootObj = gltf.scene
        rootObj.updateMatrixWorld(true)
        const meshes: THREE.Mesh[] = []
        rootObj.traverse((o) => { if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh) })
        if (!meshes.length) throw new Error('no meshes')
        meshes.forEach((m) => { m.geometry = m.geometry.clone(); m.geometry.applyMatrix4(m.matrixWorld); m.geometry.computeVertexNormals() })
        const box = new THREE.Box3()
        meshes.forEach((m) => box.expandByObject(m))
        const size = box.getSize(new THREE.Vector3())
        let longest = 'x'
        if (size.z >= size.x && size.z >= size.y) longest = 'z'
        if (size.y >= size.x && size.y >= size.z) longest = 'y'
        const rot = new THREE.Matrix4()
        if (longest === 'z') rot.makeRotationY(Math.PI / 2)
        if (longest === 'y') rot.makeRotationZ(-Math.PI / 2)
        rot.multiply(new THREE.Matrix4().makeRotationY(Math.PI)) // nose +X
        meshes.forEach((m) => { m.geometry.applyMatrix4(rot); m.geometry.computeVertexNormals() })
        const box2 = new THREE.Box3(); meshes.forEach((m) => box2.expandByObject(m))
        const c = box2.getCenter(new THREE.Vector3()); const s2 = box2.getSize(new THREE.Vector3())
        const len = Math.max(s2.x,s2.y,s2.z) || 1
        meshes.forEach((m) => { m.geometry.translate(-c.x,-c.y,-c.z); m.geometry.computeVertexNormals() })
        const group = new THREE.Group()
        swimUniforms = { time: { value: 0 }, speed: { value: 6.2 }, amp: { value: 0.075 }, freq: { value: 5.0 } }
        const mat = new THREE.MeshPhysicalMaterial({
          color: 0x2ea8ff, roughness: 0.12, metalness: 0.45,
          clearcoat: 1, clearcoatRoughness: 0.04,
          iridescence: 0.18, iridescenceIOR: 1.28,
          iridescenceThicknessRange: [120, 380] as any,
          emissive: 0x4fc3ff, emissiveIntensity: 1.35,
          sheen: 0.6, sheenColor: new THREE.Color(0xffffff),
          transparent: false, opacity: 1, envMapIntensity: 1.4, side: THREE.DoubleSide,
        })
        mat.onBeforeCompile = (shader) => {
          shader.uniforms.uTime = swimUniforms!.time
          shader.uniforms.uSpeed = swimUniforms!.speed
          shader.uniforms.uAmp = swimUniforms!.amp
          shader.uniforms.uFreq = swimUniforms!.freq
          shader.vertexShader = `uniform float uTime,uSpeed,uAmp,uFreq;\n` + shader.vertexShader
          shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
            vec3 transformed = vec3(position);
            float tail = clamp((0.32 - transformed.x) / 0.82, 0.0, 1.0);
            float w = sin(transformed.x * uFreq - uTime * uSpeed);
            transformed.z += w * uAmp * (0.15 + 1.6 * tail * tail);
            transformed.y += cos(transformed.x * uFreq * 0.5 - uTime * uSpeed * 0.5) * uAmp * 0.12 * tail;
          `)
        }
        meshes.forEach((m) => { m.material = mat; group.add(m) })
        group.scale.setScalar(1/len)
        body.add(group)
        console.info('BlueTuna ready', { meshes: meshes.length, len })
      } catch (e) { console.error('BlueTuna model setup failed', e) }
    }, undefined, (e) => { console.error('BlueTuna model load failed', FISH_GLB, e) })

    // guaranteed-visible fallback (procedural tuna shape) so a fish always shows
    const fallback = (() => {
      const g = new THREE.Group()
      const mat = new THREE.MeshStandardMaterial({ color: 0x33b7ff, emissive: 0x1e90ff, emissiveIntensity: 1.1, metalness: 0.35, roughness: 0.2 })
      const bodyGeo = new THREE.SphereGeometry(0.5, 28, 20)
      bodyGeo.scale(1.9, 0.72, 0.42)
      const torso = new THREE.Mesh(bodyGeo, mat); g.add(torso)
      const tail = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.62, 20), mat)
      tail.rotation.z = -Math.PI / 2; tail.position.set(-1.1, 0, 0); g.add(tail)
      const fin = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.42, 16), mat)
      fin.position.set(0.05, 0.38, 0); g.add(fin)
      const belly = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 16), mat)
      belly.rotation.z = Math.PI; belly.position.set(0.05, -0.32, 0); g.add(belly)
      g.scale.setScalar(0.85)
      return g
    })()
    body.add(fallback)
    // hide fallback once real model is added
    const fallbackWatch = setInterval(() => { if (body.children.length > 1) { body.remove(fallback); clearInterval(fallbackWatch) } }, 200)
    setTimeout(() => clearInterval(fallbackWatch), 15000)

    // scroll poses
    const anchors = () => {
      const h = window.innerHeight
      const top = (sel: string) => { const el = document.querySelector(sel) as HTMLElement | null; return el ? el.getBoundingClientRect().top + window.scrollY : h }
      const end = document.querySelector('#tuna-end') as HTMLElement | null
      const maxS = Math.max(0, document.documentElement.scrollHeight - h)
      const phone = window.innerWidth <= 820
      const P = (x:number,y:number,s:number,yaw:number,pitch:number,roll:number, xp:number,yp:number,sp:number): Omit<Pose,'at'> =>
        phone ? {x:xp,y:yp,s:sp,yaw,pitch,roll} : {x,y,s,yaw,pitch,roll}
      return [
        { at: 0, ...P(0.52,0.22,1.35,0.25,-0.55,0.04, 0.18,0.32,0.85) },
        { at: top('#tuna-about') + 0.15*h, ...P(-0.48,-0.35,0.95,0.55,0.14,-0.08, 0.3,-0.48,0.62) },
        { at: top('#tuna-features') + 0.2*h, ...P(0.44,-0.32,1.0,-0.4,0.22,0.08, -0.24,-0.48,0.64) },
        { at: top('#tuna-experience') + 0.2*h, ...P(-0.34,-0.36,1.02,2.9,0.1,-0.05, 0.24,-0.5,0.66) },
        { at: Math.min(end ? end.offsetTop : maxS, maxS), ...P(-0.5,0.34,0.95,0.3,-0.1,0.04, 0.18,-0.48,0.64) },
      ] as Pose[]
    }
    let poses = anchors()
    let cur: Omit<Pose,'at'> = {x:0.52,y:0.22,s:1.35,yaw:0.25,pitch:-0.55,roll:0.04}
    let lastY = window.scrollY, vel = 0, elapsed = 0

    const resize = () => {
      const w = window.innerWidth, h = window.innerHeight, dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      pond.width = Math.floor(w*dpr); pond.height = Math.floor(h*dpr); pond.style.width=w+'px'; pond.style.height=h+'px'
      if (gl) { gl.viewport(0,0,pond.width,pond.height); gl.uniform2f(uni.res, pond.width, pond.height); if (imgReady) gl.uniform2f(uni.img, img.naturalWidth, img.naturalHeight) }
      renderer.setSize(w,h,false)
      camera.aspect = w/h; camera.updateProjectionMatrix()
      poses = anchors()
    }
    resize(); window.addEventListener('resize', resize)

    const frustum = () => { const fh = 2*Math.tan(THREE.MathUtils.degToRad(15))*10; return { fw: fh*camera.aspect, fh } }

    let prev = performance.now()
    const tick = (now: number) => {
      if (dead) return
      const dt = Math.min(0.05, (now-prev)/1000); prev = now; elapsed += dt
      const h = window.innerHeight, y = window.scrollY
      const toV = smoothstep(0.12*h, 1.0*h, y)
      const endEl = document.querySelector('#tuna-end') as HTMLElement | null
      const endTop = endEl ? endEl.offsetTop : document.documentElement.scrollHeight
      const toN = smoothstep(endTop - 1.1*h, endTop - 0.1*h, y)
      if (dayRef.current) { dayRef.current.style.opacity = String(1-toV); dayRef.current.style.transform = `scale(${1+0.06*toV}) translateY(${-0.04*y}px)` }
      if (violetRef.current) violetRef.current.style.opacity = String(toV*(1-toN))
      if (nightRef.current) nightRef.current.style.opacity = String(toN)

      // ripple
      if (gl && imgReady && toV < 0.999 && !reduce) {
        pTime += dt
        const pk = 1 - Math.exp(-6*dt)
        presence += ((ptr.inside?1:0)-presence)*pk
        if (ptr.inside) { mouse.x = ptr.u; mouse.y = ptr.v }
        const tk = 1 - Math.exp(-dt/0.1)
        tilt.x += (ptr.tx*0.009-tilt.x)*tk; tilt.y += (ptr.ty*0.009-tilt.y)*tk
        gl.uniform2f(uni.mouse, mouse.x, mouse.y)
        gl.uniform1f(uni.time, pTime)
        gl.uniform1f(uni.presence, presence)
        gl.uniform2f(uni.tilt, tilt.x*0.985, tilt.y*0.985)
        gl.drawArrays(gl.TRIANGLES, 0, 6)
      } else if (gl && imgReady && !reduce) {
        // draw still last frame? cheap: just clear to nothing/skip; day layer handles fade
      }

      // tuna
      const inst = (y-lastY)/Math.max(dt,0.001); lastY=y; vel += (inst-vel)*0.1
      const speedUp = Math.min(Math.abs(vel)/1800, 1.3)
      if (swimUniforms && !reduce) { swimUniforms.time.value += dt*(1+speedUp); swimUniforms.amp.value = 0.07+0.03*speedUp }
      let target = poses[0]
      for (let i=0;i<poses.length-1;i++) {
        const a=poses[i], b=poses[i+1]
        if (y >= a.at && y <= b.at) { const tt = easeInOut((y-a.at)/(b.at-a.at||1)); target = { at:y, x:lerp(a.x,b.x,tt), y:lerp(a.y,b.y,tt), s:lerp(a.s,b.s,tt), yaw:lerp(a.yaw,b.yaw,tt), pitch:lerp(a.pitch,b.pitch,tt), roll:lerp(a.roll,b.roll,tt) } as any; break }
        if (y > b.at) target = b
      }
      const k = reduce ? 1 : 1 - Math.exp(-3.2*dt)
      ;(['x','y','s','yaw','pitch','roll'] as const).forEach((n)=>{ (cur as any)[n] += (((target as any)[n]||0)-(cur as any)[n])*k })
      const bob = reduce ? 0 : Math.sin(0.9*elapsed)*0.016
      const {fw,fh} = frustum()
      rig.position.set(cur.x*fw/2, (cur.y+bob)*fh/2, 0)
      rig.rotation.set(cur.roll + (reduce?0:Math.sin(0.7*elapsed)*0.035), cur.yaw + (reduce?0:Math.sin(0.5*elapsed)*0.05), cur.pitch, 'XYZ')
      body.scale.setScalar(cur.s*fh)
      // camera tilt
      const camK = 1 - Math.exp(-dt/0.1)
      camera.rotation.y += (-ptr.tx*0.01745 - camera.rotation.y)*camK
      camera.rotation.x += (ptr.ty*0.01745 - camera.rotation.x)*camK
      renderer.render(scene,camera)

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
    <div ref={root} className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 5 }} aria-hidden="true">
      <div ref={dayRef} className="absolute inset-0 will-change-[opacity,transform]" style={{ backgroundImage: `url(${DAY_IMAGE})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <canvas ref={pondCanvas} className="absolute inset-0 block h-full w-full opacity-0 transition-opacity duration-[1200ms]" />
      </div>
      <div ref={violetRef} className="absolute inset-0 opacity-0" style={{ background: 'linear-gradient(180deg,rgba(6,40,58,.72) 0%,rgba(8,49,64,.68) 50%,rgba(5,38,51,.72) 100%)' }} />
      <div ref={nightRef} className="absolute inset-0 opacity-0" style={{ backgroundImage: `url(${NIGHT_IMAGE})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,rgba(5,38,51,.2),rgba(5,38,51,.55) 55%,rgba(5,38,51,.94))' }} />
      </div>
      <canvas ref={koiCanvas} className="absolute inset-0 block h-full w-full" style={{ zIndex: 2 }} />
    </div>
  )
}
