import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import {
  computeLedActivation,
  computeScrollCameraPose,
  computeScrollProgress,
  dampValue,
} from '../utils/scrollLedConfig';
import { buildPinkLedScene } from '../three/pinkLedScene';

const _lookTarget = new THREE.Vector3();

function detectSoftwareGl(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl =
      probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export function PinkLedBackdrop() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    const hostEl: HTMLDivElement = container;

    const isSoftwareGl = detectSoftwareGl();
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
        alpha: false,
      });
    } catch {
      return;
    }

    const width = Math.max(window.innerWidth, 320);
    const height = Math.max(window.innerHeight, 320);
    const pixelRatio = isSoftwareGl
      ? 1
      : Math.min(window.devicePixelRatio || 1, 2);

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height);

    const canvasEl = renderer.domElement;
    canvasEl.style.width = '100%';
    canvasEl.style.height = '100%';
    canvasEl.style.display = 'block';
    canvasEl.setAttribute('data-testid', 'monark-3d-canvas');
    container.innerHTML = '';
    container.appendChild(canvasEl);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060609);
    scene.fog = new THREE.FogExp2(0x060609, 0.058);

    const initialFov = width < height ? 54 : 44;
    const camera = new THREE.PerspectiveCamera(
      initialFov,
      width / height,
      0.1,
      40
    );

    const rig = buildPinkLedScene(pixelRatio);
    scene.add(rig.root);

    let composer: EffectComposer | null = null;
    let bloomPass: UnrealBloomPass | null = null;
    if (!isSoftwareGl) {
      composer = new EffectComposer(renderer);
      composer.setPixelRatio(pixelRatio);
      composer.setSize(width, height);
      composer.addPass(new RenderPass(scene, camera));
      bloomPass = new UnrealBloomPass(
        new THREE.Vector2(width, height),
        0.65,
        0.55,
        0.62
      );
      composer.addPass(bloomPass);
      renderer.compile(scene, camera);
    }

    // Track page scroll & instantaneous scroll velocity + window pointer
    let targetScroll = computeScrollProgress(
      window.scrollY,
      document.documentElement.scrollHeight,
      window.innerHeight
    );
    let prevScrollY = window.scrollY;
    let scrollVelocity = 0;
    let pointerX = 0;
    let pointerY = 0;

    const onScroll = () => {
      const sy = window.scrollY;
      const delta = Math.abs(sy - prevScrollY);
      prevScrollY = sy;
      targetScroll = computeScrollProgress(
        sy,
        document.documentElement.scrollHeight,
        window.innerHeight
      );
      scrollVelocity = Math.min(2.2, scrollVelocity + delta * 0.012);
    };

    const onPointerMove = (ev: PointerEvent) => {
      if (window.innerWidth === 0 || window.innerHeight === 0) return;
      pointerX = (ev.clientX / window.innerWidth) * 2 - 1;
      pointerY = (ev.clientY / window.innerHeight) * 2 - 1;
    };

    const onResize = () => {
      const w = Math.max(window.innerWidth, 320);
      const h = Math.max(window.innerHeight, 320);
      camera.fov = w < h ? 54 : 44;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer?.setSize(w, h);
      bloomPass?.resolution.set(w, h);
      onScroll();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('resize', onResize);

    // Initial pose
    let smoothScroll = targetScroll;
    let smoothActivation = computeLedActivation(targetScroll, 0);
    let smoothPtrX = 0;
    let smoothPtrY = 0;
    let smoothVel = 0;

    const initPose = computeScrollCameraPose(smoothScroll, 0, 0);
    camera.position.set(initPose.posX, initPose.posY, initPose.posZ);
    _lookTarget.set(initPose.lookX, initPose.lookY, initPose.lookZ);
    camera.lookAt(_lookTarget);

    let frameId = 0;
    let disposed = false;
    const startMs = performance.now();
    let prevMs = startMs;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function renderFrame() {
      if (composer && !isSoftwareGl) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }
    }

    function tick() {
      if (disposed) return;
      const nowMs = performance.now();
      const dt = Math.min((nowMs - prevMs) * 0.001, 0.08);
      prevMs = nowMs;
      const elapsed = (nowMs - startMs) * 0.001;

      // Re-measure scrollHeight softly in case user switched catalog tabs
      targetScroll = computeScrollProgress(
        window.scrollY,
        document.documentElement.scrollHeight,
        window.innerHeight
      );

      smoothScroll = dampValue(smoothScroll, targetScroll, 6.5, dt);
      scrollVelocity = dampValue(scrollVelocity, 0, 4.2, dt);
      smoothVel = dampValue(smoothVel, scrollVelocity, 7.5, dt);

      const targetActivation = computeLedActivation(smoothScroll, smoothVel);
      smoothActivation = dampValue(smoothActivation, targetActivation, 5.5, dt);
      smoothPtrX = dampValue(smoothPtrX, pointerX, 5.5, dt);
      smoothPtrY = dampValue(smoothPtrY, pointerY, 5.5, dt);

      rig.uniforms.uTime.value = prefersReducedMotion ? 0 : elapsed;
      rig.uniforms.uScroll.value = smoothScroll;
      rig.uniforms.uActivation.value = smoothActivation;
      rig.uniforms.uVelocity.value = smoothVel;
      rig.uniforms.uPointer.value.set(smoothPtrX, smoothPtrY);

      hostEl.setAttribute(
        'data-scroll-activation',
        smoothActivation.toFixed(2)
      );
      hostEl.setAttribute('data-scroll-progress', smoothScroll.toFixed(2));

      if (!prefersReducedMotion) {
        rig.updateBarsTransform(elapsed, smoothScroll, smoothActivation);
        rig.ribbonGroup.rotation.z =
          Math.sin(elapsed * 0.25 + smoothScroll * 2.2) * 0.14;
        rig.ringsGroup.rotation.z = smoothScroll * 1.45 + elapsed * 0.08;
      }

      const pose = computeScrollCameraPose(smoothScroll, smoothPtrX, smoothPtrY);
      camera.position.set(pose.posX, pose.posY, pose.posZ);
      _lookTarget.set(pose.lookX, pose.lookY, pose.lookZ);
      camera.lookAt(_lookTarget);
      camera.rotation.z += pose.rollZ;

      renderFrame();

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    renderFrame();
    if (isSoftwareGl) {
      afterDraw(tick);
    } else {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      bloomPass?.dispose();
      composer?.dispose();
      rig.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      data-testid="pink-led-backdrop"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#060609]"
    />
  );
}
