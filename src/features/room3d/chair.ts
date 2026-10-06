import * as THREE from 'three'
import { box, cylinder, glow, material, strut } from './primitives.ts'

export function buildChair(
  parent: THREE.Object3D,
  width: number,
  depth: number,
  color: string,
  gamer: boolean,
) {
  const chair = new THREE.Group()
  chair.name = 'chair-body'
  // Scale the complete assembly together; independently resized footprints
  // stretch the base without flattening the seat or disconnecting the wheels.
  chair.scale.set(width / 0.95, Math.min(width, depth) / 0.95, depth / 0.95)
  parent.add(chair)
  const dark = '#25313b'
  const metal = '#59606a'
  cylinder(chair, 0.07, 0.13, [0, 0.16, 0], dark)
  cylinder(chair, 0.039, 0.29, [0, 0.32, 0], metal)
  box(chair, [0.31, 0.065, 0.3], [0, 0.45, -0.02], dark)
  strut(chair, [0.12, 0.44, 0], [0.27, 0.44, -0.06], 0.012, metal)
  box(chair, [0.08, 0.028, 0.045], [0.27, 0.44, -0.06], dark)

  const seat = box(
    chair,
    [0.64, 0.115, 0.59],
    [0, 0.53, -0.035],
    color,
    0.95,
    0.05,
  )
  seat.name = 'seat'
  box(chair, [0.48, 0.015, 0.41], [0, 0.591, -0.045], color, 1)

  const back = new THREE.Group()
  back.position.set(0, 0.53, 0.23)
  back.rotation.x = 0.12
  chair.add(back)
  const height = gamer ? 0.76 : 0.65
  const outline = new THREE.Shape()
  outline.moveTo(-0.23, 0)
  outline.quadraticCurveTo(-0.3, 0, -0.3, 0.09)
  outline.lineTo(-0.29, height - 0.18)
  outline.quadraticCurveTo(-0.29, height, -0.19, height)
  outline.lineTo(0.19, height)
  outline.quadraticCurveTo(0.29, height, 0.29, height - 0.18)
  outline.lineTo(0.3, 0.09)
  outline.quadraticCurveTo(0.3, 0, 0.23, 0)
  outline.closePath()
  const shell = new THREE.Mesh(
    new THREE.ExtrudeGeometry(outline, {
      depth: 0.07,
      bevelEnabled: true,
      bevelThickness: 0.025,
      bevelSize: 0.025,
      bevelSegments: 3,
      steps: 1,
      curveSegments: 8,
    }),
    material(color, 0.95),
  )
  shell.position.z = -0.035
  shell.castShadow = true
  shell.receiveShadow = true
  back.add(shell)
  box(
    back,
    [0.41, height * 0.64, 0.07],
    [0, height * 0.48, -0.08],
    color,
    1,
    0.03,
  )
  box(back, [0.38, 0.11, 0.1], [0, 0.19, -0.12], color, 1, 0.04)
  box(
    back,
    [0.36, 0.13, 0.095],
    [0, height - 0.12, -0.1],
    gamer ? dark : color,
    1,
    0.04,
  )
  // Two restrained seams make the rear readable in the default camera view.
  for (const x of [-0.19, 0.19]) {
    box(back, [0.009, height * 0.65, 0.006], [x, height * 0.48, 0.064], metal)
    if (gamer)
      glow(back, [0.01, 0.19, 0.008], [x, height * 0.66, 0.069], '#59dcd6')
  }
  for (const x of [-0.37, 0.37]) {
    strut(chair, [x * 0.74, 0.45, 0.07], [x, 0.7, 0.07], 0.022, dark)
    box(chair, [0.105, 0.047, 0.35], [x, 0.735, 0.015], dark, 0.8)
  }

  for (let i = 0; i < 5; i++) {
    const spoke = new THREE.Group()
    spoke.name = `chair-spoke-${i}`
    spoke.rotation.y = (i * Math.PI * 2) / 5
    chair.add(spoke)
    strut(spoke, [0, 0.16, 0.035], [0, 0.105, 0.4], 0.029, dark, 0.022)
    const caster = new THREE.Group()
    caster.name = `chair-caster-${i}`
    caster.position.set(0, 0, 0.4)
    spoke.add(caster)
    cylinder(caster, 0.018, 0.053, [0, 0.104, 0], metal)
    box(caster, [0.086, 0.018, 0.039], [0, 0.079, 0], dark)
    for (const x of [-0.032, 0.032]) {
      const wheel = cylinder(caster, 0.044, 0.023, [x, 0.05, 0], dark)
      wheel.rotation.z = Math.PI / 2
      const hub = cylinder(caster, 0.018, 0.024, [x, 0.05, 0], metal)
      hub.rotation.z = Math.PI / 2
    }
  }
  return chair
}
