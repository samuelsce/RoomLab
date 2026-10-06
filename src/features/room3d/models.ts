import * as THREE from 'three'
import { box, cylinder, glow, material, tabletop } from './primitives.ts'
import { buildChair } from './chair.ts'
import type { SceneName, SceneObject } from '../editor/scenes'
import { projectObject } from './projection.ts'
import { defaultAppearance, floors } from '../editor/appearance.ts'
import type { RoomAppearance } from '../editor/appearance'

function screenTexture(gamer: boolean) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 300
  const context = canvas.getContext('2d')!
  const gradient = context.createLinearGradient(0, 0, 512, 300)
  gradient.addColorStop(0, gamer ? '#171833' : '#283e51')
  gradient.addColorStop(1, gamer ? '#6056aa' : '#7298a4')
  context.fillStyle = gradient
  context.fillRect(0, 0, 512, 300)
  context.strokeStyle = gamer ? '#59dcd6' : '#adc3cd'
  context.lineWidth = 4
  for (let i = 0; i < 5; i++) {
    context.beginPath()
    context.moveTo(0, 190 + i * 16)
    context.bezierCurveTo(140, 60 + i * 20, 340, 340, 512, 100 + i * 25)
    context.stroke()
  }
  context.fillStyle = '#ffffff'
  context.font = '500 24px sans-serif'
  context.fillText(gamer ? 'After hours' : 'Make room for ideas', 30, 46)
  context.fillStyle = '#ffffff44'
  context.fillRect(0, 275, 512, 25)
  for (let i = 0; i < 7; i++) {
    context.fillStyle = ['#59dcd6', '#c0b2ed', '#efc897'][i % 3]
    context.fillRect(205 + i * 16, 282, 9, 9)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function buildRoom(
  objects: SceneObject[],
  scene: SceneName,
  night: boolean,
  appearance: RoomAppearance = defaultAppearance(scene),
) {
  const root = new THREE.Group()
  const gamer = scene === 'gamer'
  const wall = appearance.wall
  const floor = floors[appearance.floor]
  const stone = appearance.floor === 'stone'
  const trim = gamer ? '#192639' : '#f4f4ed'
  box(root, [5.4, 0.2, 4.28], [0, -0.1, 0], floor.base)
  // Slight variations in the individual floorboards make the material legible.
  for (let row = 0; row < (stone ? 8 : 16); row++) {
    for (let col = 0; col < (stone ? 8 : 4); col++) {
      const w = stone ? 0.6525 : 1.305
      const d = stone ? 0.512 : 0.256
      box(
        root,
        [w - 0.012, 0.018, d - 0.006],
        [-2.61 + w / 2 + col * w, 0.009, -2.053 + d / 2 + row * d],
        floor.colors[(row + col) % 3],
        floor.roughness,
      )
    }
  }
  box(root, [5.4, 2.7, 0.13], [0, 1.35, -2.12], wall)
  // Right wall is built around a real opening rather than a painted window.
  box(root, [0.13, 2.7, 1.03], [2.68, 1.35, -1.58], wall)
  box(root, [0.13, 2.7, 0.95], [2.68, 1.35, 1.65], wall)
  box(root, [0.13, 0.88, 2.2], [2.68, 0.44, 0], wall)
  box(root, [0.13, 0.45, 2.2], [2.68, 2.475, 0], wall)
  box(root, [5.23, 0.12, 0.055], [0, 0.08, -2.035], trim)
  box(root, [0.055, 0.12, 4.12], [2.595, 0.08, 0], trim)
  box(root, [0.19, 0.09, 2.25], [2.63, 0.9, 0], trim)
  box(root, [0.19, 0.09, 2.25], [2.63, 2.23, 0], trim)
  for (const z of [-1.08, 0, 1.08])
    box(root, [0.19, 1.37, 0.065], [2.63, 1.56, z], trim)
  box(root, [0.19, 0.05, 2.2], [2.63, 1.56, 0], trim)
  const sky = box(
    root,
    [0.018, 1.25, 2.1],
    [2.69, 1.57, 0],
    night ? '#263965' : '#b8d2df',
  )
  sky.material.dispose()
  sky.material = new THREE.MeshBasicMaterial({
    color: night ? '#263965' : '#b8d2df',
  })
  // A quiet skyline beyond the window gives the room a surrounding world.
  for (let i = 0; i < 9; i++)
    box(
      root,
      [0.02, 0.12 + (i % 3) * 0.14, 0.15],
      [2.67, 1.0 + (i % 3) * 0.07, -0.96 + i * 0.23],
      night ? '#18284e' : '#93b4c5',
    )
  if (gamer) {
    glow(root, [4.85, 0.025, 0.025], [0, 0.18, -2.025], '#927cf6')
    glow(root, [0.025, 0.025, 3.95], [2.58, 0.18, 0], '#59dcd6')
    // Acoustic panels with a geometric rhythm behind the workstation.
    for (let i = 0; i < 6; i++) {
      box(
        root,
        [0.29, 0.65, 0.065],
        [-2.15 + i * 0.32, 1.85, -2.015],
        i % 2 ? '#1d2a3e' : '#24334a',
      )
    }
  }
  // Rooms without screens do not allocate an unreferenced GPU texture.
  const texture = objects.some(
    (object) => object.kind === 'monitor' || object.kind === 'dual-monitor',
  )
    ? screenTexture(gamer)
    : null
  for (const object of objects) {
    const p = projectObject(object, objects)
    const group = new THREE.Group()
    group.position.set(p.x, p.elevation, p.z)
    group.rotation.y = p.rotation
    group.userData.objectId = object.id
    root.add(group)
    const w = p.width,
      d = p.depth,
      c = object.color
    const dark = '#25313b'
    switch (object.kind) {
      case 'desk':
      case 'round-desk': {
        const compact = object.kind === 'round-desk'
        tabletop(group, w, d, c, compact)
        for (const x of [-w * 0.41, w * 0.41])
          for (const z of [-d * 0.37, d * 0.37])
            box(
              group,
              [0.055, 0.77, 0.055],
              [x, 0.39, z],
              gamer ? '#172334' : '#706250',
              0.4,
            )
        box(group, [w * 0.8, 0.06, 0.05], [0, 0.45, -d * 0.37], dark)
        if (gamer)
          glow(group, [w * 0.9, 0.018, 0.025], [0, 0.79, d * 0.49], '#59dcd6')
        else
          for (let i = 0; i < 5; i++)
            box(
              group,
              [w * 0.85, 0.002, 0.006],
              [0, 0.857, -d * 0.38 + i * d * 0.17],
              '#a68b6b',
            )
        break
      }
      case 'monitor':
      case 'dual-monitor': {
        const count = object.kind === 'dual-monitor' ? 2 : 1
        const sw = (w / count) * 0.94
        const sh = sw / (16 / 9)
        const stand = Math.min(0.24, sw * 0.25)
        const centerY = stand + sh / 2
        const thickness = Math.min(0.065, sw * 0.055)
        for (let i = 0; i < count; i++) {
          const x = count === 1 ? 0 : (i - 0.5) * w * 0.5
          box(
            group,
            [sw * 1.04, sh + sw * 0.04, thickness],
            [x, centerY, -d * 0.17],
            c,
            0.3,
          )
          box(
            group,
            [0.04, stand + sh * 0.2, 0.04],
            [x, (stand + sh * 0.2) / 2, -d * 0.17],
            dark,
          )
          box(group, [sw * 0.38, 0.024, d * 0.7], [x, 0.012, 0], dark, 0.3)
          const screen = new THREE.Mesh(
            new THREE.PlaneGeometry(sw, sh),
            new THREE.MeshStandardMaterial({
              map: texture,
              emissiveMap: texture,
              emissive: '#ffffff',
              emissiveIntensity: night ? 0.6 : 0.25,
              roughness: 0.4,
            }),
          )
          screen.position.set(x, centerY, -d * 0.17 + thickness / 2 + 0.001)
          group.add(screen)
        }
        break
      }
      case 'pc': {
        const height = d * 1.05
        // Open chassis on the glazed side so the glass reveals components.
        box(group, [w * 0.86, 0.045, d * 0.86], [0, 0.024, 0], c, 0.35)
        box(group, [w * 0.86, 0.045, d * 0.86], [0, height - 0.023, 0], c, 0.35)
        box(
          group,
          [0.035, height, d * 0.86],
          [w * 0.41, height / 2, 0],
          c,
          0.35,
        )
        box(
          group,
          [w * 0.86, height, 0.04],
          [0, height / 2, -d * 0.41],
          c,
          0.35,
        )
        box(group, [w * 0.86, height, 0.035], [0, height / 2, d * 0.41], dark)
        const pane = box(
          group,
          [0.01, height - 0.08, d * 0.74],
          [-w * 0.44, height / 2, 0],
          '#7993ac',
          0.1,
        )
        pane.material.dispose()
        pane.material = new THREE.MeshStandardMaterial({
          color: '#abc7de',
          transparent: true,
          opacity: 0.28,
          roughness: 0.05,
          metalness: 0.35,
        })
        box(
          group,
          [0.028, height * 0.73, d * 0.6],
          [w * 0.32, height * 0.52, 0],
          '#141e2c',
        )
        box(
          group,
          [w * 0.65, height * 0.11, d * 0.45],
          [0, height * 0.37, 0],
          '#42516a',
        )
        box(
          group,
          [w * 0.65, height * 0.17, d * 0.75],
          [0, height * 0.13, 0],
          dark,
        )
        for (let i = 0; i < 3; i++) {
          const fan = new THREE.Mesh(
            new THREE.TorusGeometry(
              Math.min(w * 0.24, height * 0.12),
              0.012,
              8,
              24,
            ),
            new THREE.MeshStandardMaterial({
              color: gamer ? ['#59dcd6', '#927cf6', '#df85ae'][i] : '#7798b9',
              emissive: gamer
                ? ['#59dcd6', '#927cf6', '#df85ae'][i]
                : '#7798b9',
              emissiveIntensity: 1.5,
            }),
          )
          fan.position.set(0, height * (0.19 + i * 0.3), d * 0.435)
          group.add(fan)
          const hub = cylinder(
            group,
            w * 0.055,
            0.008,
            [0, fan.position.y, d * 0.438],
            '#68758a',
          )
          hub.rotation.x = Math.PI / 2
        }
        break
      }
      case 'keyboard': {
        box(group, [w, 0.035, d], [0, 0.02, 0], c, 0.45)
        for (let row = 0; row < 4; row++)
          for (let col = 0; col < 12; col++)
            box(
              group,
              [w * 0.058, 0.015, d * 0.15],
              [-w * 0.43 + col * w * 0.078, 0.047, -d * 0.34 + row * d * 0.22],
              gamer
                ? ['#8dbdc9', '#a89edb', '#d5bdcb'][Math.floor(col / 4)]
                : '#dddcd7',
            )
        break
      }
      case 'chair': {
        buildChair(group, w, d, c, gamer)
        break
      }
      case 'lamp': {
        const height = Math.min(w, d) * 1.4
        cylinder(group, w * 0.3, 0.035, [0, 0.02, 0], c)
        cylinder(group, 0.018, height * 0.8, [0, height * 0.4, 0], c)
        const shade = cylinder(
          group,
          w * 0.28,
          height * 0.3,
          [0, height * 0.85, 0],
          c,
          w * 0.12,
        )
        shade.rotation.z = -0.2
        glow(
          group,
          [w * 0.28, 0.012, d * 0.24],
          [0, height * 0.71, 0.02],
          '#ffda9c',
        )
        break
      }
      case 'plant': {
        const scale = Math.min(w, d)
        cylinder(
          group,
          scale * 0.22,
          scale * 0.4,
          [0, scale * 0.2, 0],
          '#c49f81',
          scale * 0.28,
        )
        cylinder(group, scale * 0.24, 0.014, [0, scale * 0.405, 0], '#5b463b')
        for (let i = 0; i < 11; i++) {
          const angle = i * 2.4,
            height = scale * (0.62 + (i % 4) * 0.12)
          cylinder(
            group,
            0.011,
            height * 0.65,
            [
              Math.sin(angle) * scale * 0.08,
              height * 0.55,
              Math.cos(angle) * scale * 0.08,
            ],
            '#5d7050',
          )
          const leaf = new THREE.Mesh(
            new THREE.SphereGeometry(1, 10, 8),
            material(c, 0.9),
          )
          leaf.scale.set(scale * 0.12, scale * 0.28, scale * 0.048)
          leaf.position.set(
            Math.sin(angle) * scale * 0.2,
            height,
            Math.cos(angle) * scale * 0.2,
          )
          leaf.rotation.set(0.3, angle, 0.65)
          leaf.castShadow = true
          group.add(leaf)
        }
        break
      }
      case 'rug': {
        box(group, [w, 0.025, d], [0, 0.026, 0], c, 1)
        for (let i = 0; i < 9; i++)
          box(
            group,
            [w * 0.89, 0.002, 0.009],
            [0, 0.04, -d * 0.4 + i * d * 0.1],
            gamer ? '#4c5c78' : '#aec0c4',
          )
        for (const z of [-d * 0.49, d * 0.49])
          box(group, [w * 0.95, 0.002, 0.024], [0, 0.04, z], '#b4b7b2')
        break
      }
      case 'frame': {
        const height = w * 0.79
        box(
          group,
          [w, height, 0.055],
          [0, 1.88, 0],
          gamer ? '#192639' : '#927754',
        )
        box(
          group,
          [w * 0.87, height * 0.84, 0.012],
          [0, 1.88, 0.035],
          gamer ? '#24334a' : '#f5eee2',
        )
        const art = cylinder(
          group,
          w * 0.19,
          0.012,
          [0, 1.88 + height * 0.075, 0.05],
          c,
        )
        art.rotation.x = Math.PI / 2
        box(
          group,
          [w * 0.32, height * 0.19, 0.013],
          [w * 0.12, 1.88 - height * 0.27, 0.05],
          gamer ? '#927cf6' : '#658571',
        )
        break
      }
      case 'shelf': {
        const height = Math.min(1.1, w * 0.7)
        box(group, [w, height, 0.035], [0, height / 2, -d * 0.4], c)
        for (const x of [-w * 0.48, w * 0.48])
          box(group, [0.045, height, d * 0.82], [x, height / 2, 0], c)
        for (let row = 0; row < 3; row++)
          box(
            group,
            [w, 0.045, d * 0.85],
            [0, 0.06 + (row * (height - 0.08)) / 2, 0],
            c,
          )
        box(
          group,
          [0.035, height - 0.08, d * 0.8],
          [w * 0.15, height / 2, 0],
          c,
        )
        for (let row = 0; row < 2; row++) {
          for (let i = 0; i < 7; i++) {
            const bookHeight = height * (0.23 + (i % 3) * 0.025)
            box(
              group,
              [w * 0.035, bookHeight, d * 0.58],
              [
                -w * 0.41 + i * w * 0.065,
                0.083 + (row * (height - 0.08)) / 2 + bookHeight / 2,
                0,
              ],
              ['#65878d', '#dec9ac', '#9d7469', '#88987a'][i % 4],
            )
          }
          box(
            group,
            [w * 0.2, height * 0.17, d * 0.55],
            [w * 0.31, 0.084 + (row * (height - 0.08)) / 2 + height * 0.085, 0],
            gamer ? '#34425b' : '#e1d4c0',
            0.9,
          )
        }
        break
      }
      case 'bed': {
        box(group, [w, 0.35, d], [0, 0.21, 0], gamer ? '#283548' : '#a48667')
        box(group, [w * 0.96, 0.2, d * 0.94], [0, 0.47, 0], '#e4e2dc', 1)
        box(group, [w * 0.97, 0.06, d * 0.68], [0, 0.59, d * 0.13], c, 1)
        box(
          group,
          [w, 0.83, 0.1],
          [0, 0.46, -d * 0.48],
          gamer ? '#283548' : '#a48667',
        )
        for (const x of [-w * 0.23, w * 0.23])
          box(
            group,
            [w * 0.39, 0.12, d * 0.17],
            [x, 0.63, -d * 0.3],
            '#f4f2ee',
            1,
          )
        box(
          group,
          [w * 0.99, 0.045, d * 0.17],
          [0, 0.64, d * 0.34],
          gamer ? '#9295b2' : '#c0ac94',
          1,
        )
        break
      }
    }
  }
  return root
}

export function disposeRoom(root: THREE.Object3D) {
  const materials = new Set<THREE.Material>()
  const textures = new Set<THREE.Texture>()
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    object.geometry.dispose()
    for (const mat of Array.isArray(object.material)
      ? object.material
      : [object.material]) {
      materials.add(mat)
      if (mat instanceof THREE.MeshStandardMaterial) {
        if (mat.map) textures.add(mat.map)
        if (mat.emissiveMap) textures.add(mat.emissiveMap)
      }
    }
  })
  for (const mat of materials) mat.dispose()
  for (const texture of textures) texture.dispose()
}
