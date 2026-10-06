import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

export const material = (color: string, roughness = 0.7, metalness = 0) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness })

export function box(
  parent: THREE.Object3D,
  size: number[],
  position: number[],
  color: string,
  roughness = 0.7,
  radius = Math.min(...size) * 0.14,
) {
  const dimensions = size as [number, number, number]
  const geometry =
    Math.min(...size) > 0.06
      ? new RoundedBoxGeometry(...dimensions, 3, radius)
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

export function cylinder(
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

export function glow(
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

// Place a cylinder between two attachment points instead of translating its
// geometry away from the pivot. Its endpoints remain connected when rotated.
export function strut(
  parent: THREE.Object3D,
  from: number[],
  to: number[],
  radius: number,
  color: string,
  top = radius,
) {
  const start = new THREE.Vector3(...(from as [number, number, number]))
  const end = new THREE.Vector3(...(to as [number, number, number]))
  const direction = end.clone().sub(start)
  const mesh = cylinder(
    parent,
    radius,
    direction.length(),
    [0, 0, 0],
    color,
    top,
  )
  mesh.position.copy(start.add(end).multiplyScalar(0.5))
  mesh.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.normalize(),
  )
  return mesh
}

export function tabletop(
  parent: THREE.Object3D,
  width: number,
  depth: number,
  color: string,
  compact: boolean,
) {
  const x = width / 2,
    z = depth / 2,
    r = compact ? Math.min(width, depth) * 0.2 : 0.025
  const outline = new THREE.Shape()
  outline.moveTo(-x + r, -z)
  outline.lineTo(x - r, -z)
  outline.quadraticCurveTo(x, -z, x, -z + r)
  outline.lineTo(x, z - r)
  outline.quadraticCurveTo(x, z, x - r, z)
  outline.lineTo(-x + r, z)
  outline.quadraticCurveTo(-x, z, -x, z - r)
  outline.lineTo(-x, -z + r)
  outline.quadraticCurveTo(-x, -z, -x + r, -z)
  const geometry = new THREE.ExtrudeGeometry(outline, {
    depth: 0.09,
    bevelEnabled: false,
    curveSegments: 8,
    steps: 1,
  })
  geometry.translate(0, 0, -0.045)
  geometry.rotateX(-Math.PI / 2)
  const mesh = new THREE.Mesh(geometry, material(color, 0.48))
  mesh.position.y = 0.815
  mesh.castShadow = true
  mesh.receiveShadow = true
  parent.add(mesh)
  return mesh
}
