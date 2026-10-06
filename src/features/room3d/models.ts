import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import type { SceneName, SceneObject } from '../editor/scenes'
import { projectObject } from './projection'

const material = (color: string, roughness = 0.7, metalness = 0) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness })

function box(
  parent: THREE.Object3D,
  size: number[],
  position: number[],
  color: string,
  roughness = 0.7,
) {
  const dimensions = size as [number, number, number]
  const geometry =
    Math.min(...size) > 0.06
      ? new RoundedBoxGeometry(...dimensions, 2, Math.min(...size) * 0.14)
      : new THREE.BoxGeometry(...dimensions)
  const mesh: THREE.Mesh<THREE.BoxGeometry, THREE.Material> = new THREE.Mesh(
    geometry,
    material(color, roughness),
  )
  mesh.position.set(...(position as [number, number, number]))
  mesh.castShadow = true
  mesh.receiveShadow = true
  parent.add(mesh)
  return mesh
}
function cylinder(
  parent: THREE.Object3D,
  radius: number,
  height: number,
  position: number[],
  color: string,
  top = radius,
) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(top, radius, height, 20),
    material(color),
  )
  mesh.position.set(...(position as [number, number, number]))
  mesh.castShadow = true
  mesh.receiveShadow = true
  parent.add(mesh)
  return mesh
}
function glow(
  parent: THREE.Object3D,
  size: number[],
  position: number[],
  color: string,
) {
  const mesh = box(parent, size, position, color)
  mesh.material.dispose()
  mesh.material = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 2,
    roughness: 0.3,
  })
  return mesh
}

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
) {
  const root = new THREE.Group()
  const gamer = scene === 'gamer'
  const wall = gamer ? '#34425b' : '#e3e8e4'
  const trim = gamer ? '#192639' : '#f4f4ed'
  box(root, [5.4, 0.2, 4.28], [0, -0.1, 0], gamer ? '#29364b' : '#b19474')
  // Slight variations in the individual floorboards make the material legible.
  for (let row = 0; row < 16; row++) {
    for (let col = 0; col < 4; col++) {
      const w = 1.305
      box(
        root,
        [w - 0.012, 0.018, 0.25],
        [-2.61 + w / 2 + col * w, 0.009, -1.925 + row * 0.256],
        gamer
          ? ['#7c7169', '#8a7f75', '#84796f'][(row + col) % 3]
          : ['#c6ab88', '#d4b995', '#cdb18c'][(row + col) % 3],
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
  const texture = screenTexture(gamer)
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
        box(group, [w, 0.09, d], [0, 0.81, 0], c, 0.48)
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
        const sw = (w / count) * 0.93
        for (let i = 0; i < count; i++) {
          const x = count === 1 ? 0 : (i - 0.5) * w * 0.51
          box(group, [sw, 0.57, 0.065], [x, 0.53, -d * 0.17], c, 0.3)
          box(group, [0.055, 0.24, 0.055], [x, 0.17, -d * 0.17], dark)
          box(group, [sw * 0.4, 0.027, d * 0.43], [x, 0.015, 0], dark, 0.3)
          const screen = new THREE.Mesh(
            new THREE.PlaneGeometry(sw * 0.92, 0.49),
            new THREE.MeshStandardMaterial({
              map: texture,
              emissiveMap: texture,
              emissive: '#ffffff',
              emissiveIntensity: night ? 0.6 : 0.25,
              roughness: 0.4,
            }),
          )
          screen.position.set(x, 0.54, -d * 0.17 + 0.034)
          group.add(screen)
        }
        break
      }
      case 'pc': {
        box(group, [w * 0.86, 0.74, d * 0.86], [0, 0.37, 0], c, 0.35)
        const pane = box(
          group,
          [0.01, 0.62, d * 0.69],
          [w * 0.44, 0.38, 0],
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
        box(group, [0.028, 0.5, d * 0.5], [w * 0.36, 0.34, 0], '#141e2c')
        for (let i = 0; i < 3; i++) {
          const fan = new THREE.Mesh(
            new THREE.TorusGeometry(Math.min(w * 0.24, 0.105), 0.014, 8, 24),
            new THREE.MeshStandardMaterial({
              color: gamer ? ['#59dcd6', '#927cf6', '#df85ae'][i] : '#7798b9',
              emissive: gamer
                ? ['#59dcd6', '#927cf6', '#df85ae'][i]
                : '#7798b9',
              emissiveIntensity: 1.5,
            }),
          )
          fan.position.set(0, 0.15 + i * 0.21, d * 0.435)
          group.add(fan)
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
        cylinder(group, 0.06, 0.42, [0, 0.25, 0], '#59606a')
        box(group, [w * 0.68, 0.12, d * 0.57], [0, 0.51, 0], c, 0.95)
        box(
          group,
          [w * 0.62, gamer ? 0.82 : 0.64, 0.13],
          [0, gamer ? 0.95 : 0.89, d * 0.29],
          c,
          0.95,
        )
        box(
          group,
          [w * 0.45, 0.13, 0.16],
          [0, 1.27, d * 0.29],
          gamer ? '#141e2c' : c,
        )
        for (const x of [-w * 0.4, w * 0.4]) {
          box(group, [0.06, 0.26, 0.06], [x, 0.51, 0], dark)
          box(group, [0.12, 0.05, d * 0.4], [x, 0.66, 0], dark)
          if (gamer) {
            box(
              group,
              [0.026, 0.66, 0.028],
              [x * 0.72, 0.95, d * 0.215],
              '#59dcd6',
            )
            box(
              group,
              [0.026, 0.66, 0.028],
              [x * 0.72, 0.95, d * 0.365],
              '#59dcd6',
            )
          }
        }
        for (let i = 0; i < 5; i++) {
          const leg = box(
            group,
            [0.06, 0.04, w * 0.43],
            [0, 0.08, w * 0.2],
            dark,
          )
          leg.geometry.translate(0, 0, -w * 0.2)
          leg.rotation.y = (i * Math.PI * 2) / 5
          leg.position.set(
            Math.sin((i * Math.PI * 2) / 5) * w * 0.2,
            0.08,
            Math.cos((i * Math.PI * 2) / 5) * w * 0.2,
          )
          cylinder(
            group,
            0.055,
            0.06,
            [
              Math.sin((i * Math.PI * 2) / 5) * w * 0.4,
              0.045,
              Math.cos((i * Math.PI * 2) / 5) * w * 0.4,
            ],
            dark,
          )
        }
        break
      }
      case 'lamp': {
        cylinder(group, w * 0.3, 0.035, [0, 0.02, 0], c)
        cylinder(group, 0.018, 0.55, [0, 0.3, 0], c)
        const shade = cylinder(group, w * 0.28, 0.2, [0, 0.62, 0], c, w * 0.12)
        shade.rotation.z = -0.2
        glow(group, [w * 0.28, 0.012, d * 0.24], [0, 0.53, 0.02], '#ffda9c')
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
        box(
          group,
          [w, 0.67, 0.055],
          [0, 1.88, 0],
          gamer ? '#192639' : '#927754',
        )
        box(
          group,
          [w * 0.87, 0.56, 0.012],
          [0, 1.88, 0.035],
          gamer ? '#24334a' : '#f5eee2',
        )
        const art = cylinder(group, w * 0.19, 0.012, [0, 1.93, 0.05], c)
        art.rotation.x = Math.PI / 2
        box(
          group,
          [w * 0.32, 0.13, 0.013],
          [w * 0.12, 1.7, 0.05],
          gamer ? '#927cf6' : '#658571',
        )
        break
      }
      case 'shelf': {
        box(group, [w, 1.02, d * 0.78], [0, 0.51, 0], c)
        for (let row = 0; row < 2; row++) {
          box(
            group,
            [w * 0.89, 0.35, 0.015],
            [0, 0.25 + row * 0.48, d * 0.399],
            gamer ? '#182638' : '#816b53',
          )
          for (let i = 0; i < 8; i++)
            box(
              group,
              [0.07 + (i % 2) * 0.02, 0.2 + (i % 3) * 0.045, d * 0.3],
              [-w * 0.39 + i * w * 0.085, 0.21 + row * 0.48, d * 0.29],
              ['#65878d', '#dec9ac', '#9d7469', '#88987a'][i % 4],
            )
        }
        box(group, [w * 1.02, 0.045, d * 0.83], [0, 1.04, 0], c)
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
