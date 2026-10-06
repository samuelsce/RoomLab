import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import type { SceneName, SceneObject } from '../editor/scenes'
import { buildRoom, disposeRoom } from './models'

interface Props {
  scene: SceneName
  objects: SceneObject[]
  night: boolean
  command: { action: 'left' | 'right' | 'reset'; version: number }
  onReady: () => void
  onUnavailable: () => void
}
interface Engine {
  scene: THREE.Scene
  root?: THREE.Group
  camera: THREE.PerspectiveCamera
  controls: OrbitControls
  sun: THREE.DirectionalLight
  fill: THREE.HemisphereLight
  blue: THREE.PointLight
  violet: THREE.PointLight
  render: () => void
}

export default function RoomCanvas({
  scene,
  objects,
  night,
  command,
  onReady,
  onUnavailable,
}: Props) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const engine = useRef<Engine | null>(null)
  useEffect(() => {
    const element = canvas.current!
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: element,
        antialias: true,
        alpha: true,
        powerPreference: 'low-power',
      })
    } catch {
      onUnavailable()
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    const world = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60)
    camera.position.set(-7, 6, 8)
    const controls = new OrbitControls(camera, element)
    element.style.touchAction = 'pan-y'
    controls.target.set(0, 0.8, 0)
    controls.enablePan = false
    controls.enableDamping = false
    controls.enableZoom = false
    // Keep the open faces facing the visitor; the two rear walls frame the room.
    controls.minAzimuthAngle = -1.25
    controls.maxAzimuthAngle = 0.05
    controls.minPolarAngle = 0.58
    controls.maxPolarAngle = 1.25
    controls.update()
    const fill = new THREE.HemisphereLight('#dfe8ff', '#92816d', 2.2)
    world.add(fill)
    const sun = new THREE.DirectionalLight('#fff0d6', 3)
    sun.position.set(-3, 8, 5)
    sun.castShadow = true
    sun.shadow.mapSize.set(1024, 1024)
    Object.assign(sun.shadow.camera, {
      left: -6,
      right: 6,
      top: 6,
      bottom: -6,
      near: 0.5,
      far: 25,
    })
    sun.shadow.normalBias = 0.03
    world.add(sun)
    const blue = new THREE.PointLight('#59dcd6', 0, 7, 2)
    blue.position.set(-1, 1.5, -1.4)
    const violet = new THREE.PointLight('#927cf6', 0, 7, 2)
    violet.position.set(1.9, 1.4, 0)
    world.add(blue, violet)
    let frame = 0
    let disposed = false
    const render = () => {
      if (disposed || frame || document.hidden) return
      frame = requestAnimationFrame(() => {
        frame = 0
        if (disposed) return
        renderer.render(world, camera)
        onReady()
      })
    }
    engine.current = {
      scene: world,
      camera,
      controls,
      sun,
      fill,
      blue,
      violet,
      render,
    }
    const resize = () => {
      const rect = element.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      renderer.setSize(rect.width, rect.height, false)
      camera.aspect = rect.width / rect.height
      camera.fov = camera.aspect < 1 ? 46 : 38
      camera.zoom = camera.aspect > 1.45 ? 1.4 : 1.08
      camera.updateProjectionMatrix()
      render()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(element)
    controls.addEventListener('change', render)
    const snapshot = () => renderer.render(world, camera)
    element.addEventListener('roomlab:snapshot', snapshot)
    const lost = (event: Event) => {
      event.preventDefault()
      onUnavailable()
    }
    element.addEventListener('webglcontextlost', lost)
    document.addEventListener('visibilitychange', render)
    resize()
    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      element.removeEventListener('webglcontextlost', lost)
      document.removeEventListener('visibilitychange', render)
      controls.dispose()
      element.removeEventListener('roomlab:snapshot', snapshot)
      if (engine.current?.root) disposeRoom(engine.current.root)
      renderer.dispose()
      sun.shadow.dispose()
      setTimeout(() => {
        if (!element.isConnected) renderer.forceContextLoss()
      }, 0)
      engine.current = null
    }
  }, [onReady, onUnavailable])

  useEffect(() => {
    const current = engine.current
    if (!current) return
    if (current.root) {
      current.scene.remove(current.root)
      disposeRoom(current.root)
    }
    current.root = buildRoom(objects, scene, night)
    current.scene.add(current.root)
    current.fill.intensity = night ? 1.3 : 2.2
    current.sun.intensity = night ? 1.8 : 3
    current.sun.color.set(night ? '#b9c8ed' : '#fff0d6')
    current.blue.intensity = scene === 'gamer' && night ? 12 : 0
    current.violet.intensity = scene === 'gamer' && night ? 14 : 0
    current.render()
  }, [objects, scene, night])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const animation = canvas.current?.animate(
      [{ opacity: 0.45 }, { opacity: 1 }],
      { duration: 350, easing: 'ease-out' },
    )
    return () => animation?.cancel()
  }, [scene, night])

  useEffect(() => {
    const current = engine.current
    if (!current) return
    const spherical = new THREE.Spherical().setFromVector3(
      current.camera.position.clone().sub(current.controls.target),
    )
    spherical.theta = THREE.MathUtils.clamp(
      spherical.theta + (command.action === 'left' ? -0.2 : 0.2),
      -1.25,
      0.05,
    )
    const target =
      command.action === 'reset'
        ? new THREE.Vector3(-7, 6, 8)
        : new THREE.Vector3()
            .setFromSpherical(spherical)
            .add(current.controls.target)
    if (
      target.distanceTo(current.camera.position) < 0.001 ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      current.camera.position.copy(target)
      current.controls.update()
      current.render()
      return
    }
    const start = current.camera.position.clone()
    const started = performance.now()
    let frame = 0
    const step = (now: number) => {
      const progress = Math.min(1, (now - started) / 320)
      current.camera.position.lerpVectors(
        start,
        target,
        1 - Math.pow(1 - progress, 3),
      )
      current.controls.update()
      current.render()
      if (progress < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [command])
  return (
    <canvas
      ref={canvas}
      role="img"
      aria-label="Visualização 3D do quarto"
      data-scene={scene}
      data-object-count={objects.length}
    />
  )
}
