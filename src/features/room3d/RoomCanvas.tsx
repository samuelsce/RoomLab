import { useEffect, useEffectEvent, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import type { SceneName, SceneObject } from '../editor/scenes'
import { buildRoom, disposeRoom } from './models'
import {
  createSelectionMarker,
  isSelectionTap,
  pickObject,
  updateSelectionMarker,
} from './selection'

interface Props {
  scene: SceneName
  objects: SceneObject[]
  night: boolean
  command: { action: 'left' | 'right' | 'reset'; version: number }
  onReady: () => void
  onUnavailable: () => void
  selectedId?: string
  onSelect?: (id: string | null) => void
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
  marker: ReturnType<typeof createSelectionMarker>
}

export default function RoomCanvas({
  scene,
  objects,
  night,
  command,
  onReady,
  onUnavailable,
  selectedId,
  onSelect,
}: Props) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const engine = useRef<Engine | null>(null)
  const editable = !!onSelect
  const selectObject = useEffectEvent((id: string | null) => onSelect?.(id))
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
    const marker = createSelectionMarker()
    world.add(marker)
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
      marker,
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
    const snapshot = () => {
      const selected = marker.visible
      marker.visible = false
      renderer.render(world, camera)
      marker.visible = selected
      render()
    }
    element.addEventListener('roomlab:snapshot', snapshot)
    const lost = (event: Event) => {
      event.preventDefault()
      onUnavailable()
    }
    element.addEventListener('webglcontextlost', lost)
    document.addEventListener('visibilitychange', render)
    const raycaster = new THREE.Raycaster()
    const point = new THREE.Vector2()
    const activePointers = new Set<number>()
    let tap: { id: string | null } | null = null
    let gesture: {
      pointerId: number
      x: number
      y: number
      started: number
      distance: number
      multiple: boolean
      objectId: string | null
    } | null = null
    const pick = (event: PointerEvent) => {
      const root = engine.current?.root
      const rect = element.getBoundingClientRect()
      if (
        !root ||
        !rect.width ||
        !rect.height ||
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      )
        return null
      point.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      )
      return pickObject(raycaster, root, camera, point)
    }
    const pointerDown = (event: PointerEvent) => {
      if (!editable || event.button !== 0) return
      tap = null
      activePointers.add(event.pointerId)
      if (gesture) {
        gesture.multiple = true
        return
      }
      gesture = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        started: event.timeStamp,
        distance: 0,
        multiple: activePointers.size > 1,
        objectId: pick(event),
      }
    }
    const pointerMove = (event: PointerEvent) => {
      if (!editable) return
      if (gesture && gesture.pointerId === event.pointerId) {
        gesture.distance += Math.hypot(
          event.clientX - gesture.x,
          event.clientY - gesture.y,
        )
        gesture.x = event.clientX
        gesture.y = event.clientY
        element.style.cursor = 'grabbing'
      } else if (!gesture && event.pointerType === 'mouse')
        element.style.cursor = pick(event) ? 'pointer' : 'grab'
    }
    const pointerUp = (event: PointerEvent) => {
      activePointers.delete(event.pointerId)
      if (!gesture || gesture.pointerId !== event.pointerId) return
      const finished = gesture
      gesture = null
      element.style.cursor = 'grab'
      const rect = element.getBoundingClientRect()
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      )
        return
      const distance =
        finished.distance +
        Math.hypot(event.clientX - finished.x, event.clientY - finished.y)
      if (
        isSelectionTap(
          distance,
          event.timeStamp - finished.started,
          finished.multiple,
        ) &&
        pick(event) === finished.objectId
      )
        tap = { id: finished.objectId }
    }
    const pointerCancel = (event: PointerEvent) => {
      activePointers.delete(event.pointerId)
      gesture = null
      tap = null
      element.style.cursor = 'grab'
    }
    const click = () => {
      if (!tap) return
      const selected = tap.id
      tap = null
      // Touch synthesizes mouse focus before click. Reveal properties afterwards.
      selectObject(selected)
    }
    // Capture runs before OrbitControls releases pointer capture on pointerup.
    element.addEventListener('pointerdown', pointerDown, true)
    element.addEventListener('pointermove', pointerMove, true)
    element.addEventListener('pointerup', pointerUp, true)
    element.addEventListener('pointercancel', pointerCancel)
    element.addEventListener('click', click)
    resize()
    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      element.removeEventListener('pointerdown', pointerDown, true)
      element.removeEventListener('pointermove', pointerMove, true)
      element.removeEventListener('pointerup', pointerUp, true)
      element.removeEventListener('pointercancel', pointerCancel)
      element.removeEventListener('click', click)
      element.removeEventListener('webglcontextlost', lost)
      document.removeEventListener('visibilitychange', render)
      controls.dispose()
      element.removeEventListener('roomlab:snapshot', snapshot)
      if (engine.current?.root) disposeRoom(engine.current.root)
      renderer.dispose()
      sun.shadow.dispose()
      marker.geometry.dispose()
      marker.material.dispose()
      setTimeout(() => {
        if (!element.isConnected) renderer.forceContextLoss()
      }, 0)
      engine.current = null
    }
  }, [editable, onReady, onUnavailable])

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
    const current = engine.current
    if (!current) return
    const target = selectedId
      ? current.root?.children.find(
          (object) => object.userData.objectId === selectedId,
        )
      : undefined
    updateSelectionMarker(current.marker, target)
    current.render()
  }, [objects, scene, night, selectedId, editable])

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
      data-selected-id={selectedId}
      tabIndex={editable ? 0 : undefined}
      aria-description={
        editable
          ? 'Selecione uma peça com clique ou toque. Arraste para girar a câmera. Use a lista de objetos para selecionar pelo teclado.'
          : undefined
      }
      onKeyDown={(event) => {
        if (editable && event.key === 'Escape') {
          event.preventDefault()
          onSelect?.(null)
        }
      }}
    />
  )
}
