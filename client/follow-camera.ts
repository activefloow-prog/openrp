import * as THREE from 'three';
import { rayBox } from '../shared/movement.ts';
import type { Box } from '../shared/types.ts';

/**
 * Third-person follow camera. Uses the same server-provided collision geometry
 * as player movement, so the camera cannot pass through a solid wall.
 * This module has no game authority and cannot grant items, money or access.
 */
export function followCameraPosition(
  eye: THREE.Vector3,
  yaw: number,
  walls: readonly Box[],
  distance = 4.25,
  elevation = 1.25,
): THREE.Vector3 {
  const offset = new THREE.Vector3(Math.sin(yaw) * distance, elevation, Math.cos(yaw) * distance);
  const length = offset.length();
  const direction = offset.clone().divideScalar(length);
  let allowed = length;
  for (const wall of walls) {
    const hit = rayBox(eye, direction, wall, length);
    if (hit !== null && hit >= 0) allowed = Math.min(allowed, Math.max(0.35, hit - 0.28));
  }
  return eye.clone().addScaledVector(direction, allowed);
}

export function followCameraAim(
  eye: THREE.Vector3,
  yaw: number,
  pitch: number,
): THREE.Vector3 {
  const forward = 8 * Math.cos(pitch);
  return new THREE.Vector3(
    eye.x - Math.sin(yaw) * forward,
    eye.y + Math.sin(pitch) * 8,
    eye.z - Math.cos(yaw) * forward,
  );
}
