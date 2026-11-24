import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeLedActivation,
  computeScrollCameraPose,
  computeScrollProgress,
  dampValue,
} from './scrollLedConfig';

test('computeScrollProgress normalizes and clamps page scroll cleanly', () => {
  assert.equal(computeScrollProgress(0, 3000, 900), 0);
  assert.equal(computeScrollProgress(1050, 3000, 900), 0.5);
  assert.equal(computeScrollProgress(5000, 3000, 900), 1);
  assert.equal(computeScrollProgress(-100, 3000, 900), 0);
});

test('computeLedActivation starts calm at top and activates automatically on scroll', () => {
  const atTop = computeLedActivation(0, 0);
  const scrolling = computeLedActivation(0.35, 0.4);
  assert.ok(atTop < 0.3, 'top activation should stay subtle and ambient');
  assert.ok(scrolling > 0.8, 'scrolling down should ignite LED activation');
  assert.ok(scrolling <= 1.0);
});

test('computeScrollCameraPose flies camera deeper and shifts look target with scroll', () => {
  const topPose = computeScrollCameraPose(0, 0, 0);
  const bottomPose = computeScrollCameraPose(1, 0, 0);
  assert.ok(bottomPose.posZ < topPose.posZ, 'camera moves forward along Z as page scrolls');
  assert.ok(bottomPose.lookZ < topPose.lookZ);
});

test('dampValue approaches target smoothly and clamps extreme deltas', () => {
  const next = dampValue(0, 1, 6, 0.016);
  assert.ok(next > 0 && next < 0.25);
  assert.equal(dampValue(0.5, 1, 5, 0), 0.5);
});
