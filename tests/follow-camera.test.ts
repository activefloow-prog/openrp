import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { followCameraAim, followCameraPosition } from '../client/follow-camera.ts';
import type { Box } from '../shared/types.ts';

test('third person follows behind the player from any heading', () => {
  const eye = new THREE.Vector3(0, 1.6, 0);
  const behindNorth = followCameraPosition(eye, 0, []);
  assert.ok(behindNorth.z > 4);
  assert.ok(behindNorth.y > eye.y);
  const behindWest = followCameraPosition(eye, Math.PI / 2, []);
  assert.ok(behindWest.x > 4);
  assert.ok(Math.abs(behindWest.z) < 0.001);
});

test('third person camera never passes through a solid wall', () => {
  const eye = new THREE.Vector3(0, 1.6, 0);
  const wall: Box = { x: 0, y: 2, z: 2.2, w: 8, h: 4, d: 0.5 };
  const position = followCameraPosition(eye, 0, [wall]);
  assert.ok(position.z > 0);
  assert.ok(position.z < 1.95, 'camera should stop before the near face');
});

test('aim vector points forward and responds to camera pitch', () => {
  const eye = new THREE.Vector3(0, 1.6, 0);
  const forward = followCameraAim(eye, 0, 0);
  assert.ok(forward.z < eye.z);
  const up = followCameraAim(eye, 0, 0.3);
  assert.ok(up.y > eye.y);
});
