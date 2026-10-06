import * as THREE from 'three'

export function pickObject(
  raycaster: THREE.Raycaster,
  root: THREE.Object3D,
  camera: THREE.Camera,
  point: THREE.Vector2,
) {
  root.updateWorldMatrix(true, true)
  camera.updateWorldMatrix(true, false)
  raycaster.setFromCamera(point, camera)
  // Include the room itself: a wall must block objects behind it.
  let hit: THREE.Object3D | null =
    raycaster.intersectObject(root, true)[0]?.object ?? null
  while (hit && hit !== root) {
    if (typeof hit.userData.objectId === 'string') return hit.userData.objectId
    hit = hit.parent
  }
  return null
}

export function createSelectionMarker() {
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(new Float32Array(144), 3),
  )
  const marker = new THREE.LineSegments(
    geometry,
    new THREE.LineBasicMaterial({ color: '#59dcd6', toneMapped: false }),
  )
  marker.visible = false
  return marker
}

export function updateSelectionMarker(
  marker: ReturnType<typeof createSelectionMarker>,
  target?: THREE.Object3D,
) {
  marker.visible = false
  if (!target) return
  const bounds = new THREE.Box3().setFromObject(target)
  if (bounds.isEmpty()) return
  bounds.expandByScalar(0.035)
  const size = bounds.getSize(new THREE.Vector3())
  const positions = marker.geometry.getAttribute('position')
  let vertex = 0
  for (const x of [bounds.min.x, bounds.max.x])
    for (const y of [bounds.min.y, bounds.max.y])
      for (const z of [bounds.min.z, bounds.max.z]) {
        const corner = new THREE.Vector3(x, y, z)
        for (const axis of ['x', 'y', 'z'] as const) {
          const end = corner.clone()
          end[axis] +=
            (corner[axis] === bounds.min[axis] ? 1 : -1) * size[axis] * 0.22
          positions.setXYZ(vertex++, x, y, z)
          positions.setXYZ(vertex++, end.x, end.y, end.z)
        }
      }
  positions.needsUpdate = true
  marker.geometry.computeBoundingSphere()
  marker.visible = true
}

// Movement is accumulated so dragging away and back is still a camera gesture.
export function isSelectionTap(
  distance: number,
  duration: number,
  multiplePointers: boolean,
) {
  return distance <= 6 && duration < 700 && !multiplePointers
}
