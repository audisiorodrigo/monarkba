import * as THREE from 'three';

export interface PinkLedUniforms {
  uTime: { value: number };
  uScroll: { value: number };
  uActivation: { value: number };
  uVelocity: { value: number };
  uPointer: { value: THREE.Vector2 };
  uPixelRatio: { value: number };
}

export interface PinkLedRig {
  root: THREE.Group;
  ledBarsMesh: THREE.InstancedMesh;
  ribbonGroup: THREE.Group;
  ringsGroup: THREE.Group;
  uniforms: PinkLedUniforms;
  updateBarsTransform: (elapsed: number, scroll: number, activation: number) => void;
  dispose: () => void;
}

interface BarSpec {
  baseX: number;
  baseY: number;
  baseZ: number;
  baseRotZ: number;
  baseRotX: number;
  scaleY: number;
  phase: number;
}

export function buildPinkLedScene(pixelRatio: number): PinkLedRig {
  const disposables: Array<{ dispose: () => void }> = [];
  const root = new THREE.Group();

  const uniforms: PinkLedUniforms = {
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uActivation: { value: 0.22 },
    uVelocity: { value: 0 },
    uPointer: { value: new THREE.Vector2(0, 0) },
    uPixelRatio: { value: pixelRatio },
  };

  // 1. Lusion / Active Theory Full-Screen Dark Rose-Silk Shader Backdrop
  const backdropGeo = new THREE.PlaneGeometry(2, 2);
  const backdropMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: uniforms.uTime,
      uScroll: uniforms.uScroll,
      uActivation: uniforms.uActivation,
      uVelocity: uniforms.uVelocity,
      uPointer: uniforms.uPointer,
    },
    depthWrite: false,
    depthTest: false,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.999, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uScroll;
      uniform float uActivation;
      uniform float uVelocity;
      uniform vec2 uPointer;
      varying vec2 vUv;

      float hash21(vec2 p) {
        p = fract(p * vec2(127.1, 311.7));
        p += dot(p, p + 34.23);
        return fract(p.x * p.y);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
          mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x),
          f.y
        );
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);
        for (int i = 0; i < 4; i++) {
          v += a * noise(p);
          p = rot * p * 2.04;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec2 uv = vUv * 2.0 - 1.0;
        float t = uTime * 0.24 + uScroll * 2.4;
        vec2 ptr = uPointer * 0.4;

        vec2 q = vec2(
          fbm(uv * 1.4 + vec2(t * 0.6, -t * 0.4) + ptr * 0.35),
          fbm(uv * 1.5 + vec2(-t * 0.35, t * 0.7) + vec2(4.1, 2.7))
        );
        float silk = fbm(uv * 1.75 + 2.15 * q + vec2(0.0, -uScroll * 1.8));
        float ridge = pow(max(0.0, 1.0 - abs(silk - 0.5) * 5.0), 2.3);

        float ptrDist = length(uv - vec2(uPointer.x * 0.45, -uPointer.y * 0.45));
        float ptrGlow = exp(-ptrDist * 2.3) * (0.18 + uActivation * 0.28 + uVelocity * 0.35);

        vec3 baseObsidian = vec3(0.022, 0.020, 0.032);
        vec3 deepWine = vec3(0.16, 0.018, 0.085);
        vec3 hotPinkLed = vec3(0.98, 0.14, 0.48);
        vec3 softRose = vec3(1.0, 0.46, 0.72);

        // Keep center slightly calmer for UI legibility, push richer pink silk toward edges & scroll activation
        float edgeBias = smoothstep(0.15, 0.95, abs(uv.x) * 0.85 + abs(uv.y) * 0.35);
        float scrollBoost = smoothstep(0.18, 0.95, uActivation);

        vec3 color = mix(baseObsidian, deepWine, smoothstep(0.28, 0.86, silk) * (0.32 + scrollBoost * 0.72));
        color += hotPinkLed * (ridge * (0.08 + scrollBoost * 0.34) * (0.45 + 0.55 * edgeBias) + ptrGlow * 0.36);
        color += softRose * ridge * scrollBoost * 0.12 * edgeBias;

        float vig = smoothstep(1.58, 0.18, length(uv * vec2(0.85, 1.0)));
        color *= mix(0.42, 1.0, vig);

        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
  const backdropMesh = new THREE.Mesh(backdropGeo, backdropMat);
  backdropMesh.frustumCulled = false;
  backdropMesh.renderOrder = -10;
  root.add(backdropMesh);
  disposables.push(backdropGeo, backdropMat);

  // 2. Architectural Pink LED Corridor Blades (32 Instanced Vertical/Tilted LED Strips along left & right flanks)
  const barCount = 32;
  const barGeo = new THREE.BoxGeometry(0.068, 4.4, 0.068);
  const barPhases = new Float32Array(barCount);
  const barSpecs: BarSpec[] = [];

  for (let i = 0; i < barCount; i++) {
    const t = i / (barCount - 1);
    const side = i % 2 === 0 ? -1 : 1;
    const z = 0.8 - t * 17.0;
    // Wide architectural corridor so central text remains velvety & readable while LED monoliths flank both sides
    const spreadX = (3.25 + Math.sin(t * Math.PI * 2.0) * 0.95 + (i % 3) * 0.38) * side;
    const offsetY = Math.cos(t * Math.PI * 2.5) * 0.72;
    const phase = t;
    barPhases[i] = phase;
    barSpecs.push({
      baseX: spreadX,
      baseY: offsetY,
      baseZ: z,
      baseRotZ: side * (0.14 + (i % 4) * 0.045),
      baseRotX: Math.cos(i * 0.5) * 0.08,
      scaleY: 0.78 + ((i * 37) % 10) * 0.075,
      phase,
    });
  }
  barGeo.setAttribute(
    'aBarPhase',
    new THREE.InstancedBufferAttribute(barPhases, 1)
  );

  const ledBarMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: uniforms.uTime,
      uScroll: uniforms.uScroll,
      uActivation: uniforms.uActivation,
      uVelocity: uniforms.uVelocity,
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute float aBarPhase;
      varying vec2 vUv;
      varying vec3 vNormalView;
      varying float vPhase;

      void main() {
        vUv = uv;
        vPhase = aBarPhase;
        vec4 mvPos = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
        vNormalView = normalize(normalMatrix * mat3(instanceMatrix) * normal);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uScroll;
      uniform float uActivation;
      uniform float uVelocity;
      varying vec2 vUv;
      varying vec3 vNormalView;
      varying float vPhase;

      void main() {
        float edgeY = smoothstep(0.0, 0.14, vUv.y) * smoothstep(1.0, 0.86, vUv.y);
        float wavePos = fract(uScroll * 2.1 + uTime * 0.16);
        float distWave = abs(vPhase - wavePos);
        distWave = min(distWave, 1.0 - distWave);
        float chase = exp(-distWave * 10.5);

        float filament = 0.55 + 0.45 * sin(vUv.y * 8.0 - uTime * 3.2 - vPhase * 10.0 - uScroll * 16.0);
        float facing = pow(abs(vNormalView.z), 0.75);

        // Calm architectural presence at rest, vivid pink LED ignition on scroll
        float power = 0.10 + uActivation * 0.72 + chase * (0.32 + uActivation * 0.85) + uVelocity * 0.38;
        vec3 deepMagenta = vec3(0.92, 0.09, 0.40);
        vec3 neonRose = vec3(1.0, 0.30, 0.60);
        vec3 roseCore = vec3(1.0, 0.72, 0.86);

        vec3 col = mix(deepMagenta, neonRose, filament);
        col = mix(col, roseCore, smoothstep(0.58, 1.0, facing * chase + filament * 0.35 * uActivation));

        float alpha = edgeY * clamp(power * (0.5 + 0.5 * filament), 0.0, 0.92);
        gl_FragColor = vec4(col * (0.85 + power * 0.7), alpha);
      }
    `,
  });

  const ledBarsMesh = new THREE.InstancedMesh(barGeo, ledBarMat, barCount);
  ledBarsMesh.frustumCulled = false;
  root.add(ledBarsMesh);
  disposables.push(barGeo, ledBarMat);

  // 3. Two Sweeping Peripheral Pink LED Light Ribbons (Framing Left & Right Depth Corridor cleanly)
  const ribbonGroup = new THREE.Group();
  const ribbonMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: uniforms.uTime,
      uScroll: uniforms.uScroll,
      uActivation: uniforms.uActivation,
      uVelocity: uniforms.uVelocity,
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vNormalView;
      void main() {
        vUv = uv;
        vNormalView = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uScroll;
      uniform float uActivation;
      uniform float uVelocity;
      varying vec2 vUv;
      varying vec3 vNormalView;

      void main() {
        float ends = smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x);
        float streamA = sin(vUv.x * 14.0 - uTime * 2.8 - uScroll * 20.0);
        float streamB = sin(vUv.x * 26.0 + uTime * 1.9 - uScroll * 12.0);
        float packet = smoothstep(0.25, 0.98, streamA * 0.65 + streamB * 0.35);

        float core = pow(max(0.0, abs(vNormalView.z)), 0.85);
        vec3 baseRose = vec3(0.92, 0.10, 0.42);
        vec3 brightPink = vec3(1.0, 0.40, 0.68);
        vec3 softPearlPink = vec3(1.0, 0.78, 0.89);

        vec3 col = mix(baseRose, brightPink, packet);
        col = mix(col, softPearlPink, packet * core * (0.3 + uActivation * 0.45));

        float alpha = ends * (0.08 + uActivation * 0.56 + packet * (0.24 + uVelocity * 0.35));
        gl_FragColor = vec4(col * (0.8 + uActivation * 0.65), clamp(alpha, 0.0, 0.88));
      }
    `,
  });
  disposables.push(ribbonMat);

  const ribbonCurves = [
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4.8, -1.8, 1.4),
      new THREE.Vector3(-3.8, -0.3, -2.5),
      new THREE.Vector3(-3.4, 1.3, -7.0),
      new THREE.Vector3(-4.2, 0.4, -12.2),
      new THREE.Vector3(-2.8, -1.2, -16.8),
    ]),
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(4.8, 1.7, 1.2),
      new THREE.Vector3(3.9, 0.2, -2.8),
      new THREE.Vector3(3.3, -1.2, -7.2),
      new THREE.Vector3(4.3, -0.3, -12.4),
      new THREE.Vector3(2.9, 1.1, -16.8),
    ]),
  ];

  ribbonCurves.forEach((curve) => {
    const tubeGeo = new THREE.TubeGeometry(curve, 110, 0.036, 10, false);
    const mesh = new THREE.Mesh(tubeGeo, ribbonMat);
    mesh.frustumCulled = false;
    ribbonGroup.add(mesh);
    disposables.push(tubeGeo);
  });
  root.add(ribbonGroup);

  // 4. Deep Architectural Pink LED Portal Frames (Wide outer halos framing depth rather than crossing center text)
  const ringsGroup = new THREE.Group();
  const ringMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: uniforms.uTime,
      uScroll: uniforms.uScroll,
      uActivation: uniforms.uActivation,
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uScroll;
      uniform float uActivation;
      varying vec2 vUv;

      void main() {
        float pulse = 0.5 + 0.5 * sin(vUv.x * 12.566 - uTime * 2.2 - uScroll * 18.0);
        // Subtle outer framing at rest, stronger tunnel presence as scroll activates
        float scrollGate = smoothstep(0.18, 0.85, uActivation);
        vec3 col = mix(vec3(0.88, 0.10, 0.42), vec3(1.0, 0.45, 0.72), pulse);
        float alpha = (0.04 + scrollGate * 0.34) * (0.45 + 0.55 * pulse);
        gl_FragColor = vec4(col, alpha);
      }
    `,
  });
  disposables.push(ringMat);

  const ringCount = 5;
  for (let i = 0; i < ringCount; i++) {
    const rGeo = new THREE.TorusGeometry(4.45 + (i % 2) * 0.45, 0.018, 10, 96);
    const rMesh = new THREE.Mesh(rGeo, ringMat);
    rMesh.position.set(0, -0.1, -3.2 - i * 3.1);
    rMesh.rotation.set(0.05 * Math.sin(i), 0.08 * Math.cos(i), i * 0.25);
    ringsGroup.add(rMesh);
    disposables.push(rGeo);
  }
  root.add(ringsGroup);

  // 5. 3D Undulating Pink LED Wave Floor Grid
  const waveGeo = new THREE.PlaneGeometry(26, 26, 56, 56);
  waveGeo.rotateX(-Math.PI / 2);
  const waveMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: uniforms.uTime,
      uScroll: uniforms.uScroll,
      uActivation: uniforms.uActivation,
      uPointer: uniforms.uPointer,
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uScroll;
      uniform float uActivation;
      uniform vec2 uPointer;
      varying vec3 vWavePos;
      varying float vElev;

      void main() {
        vec3 p = position;
        float travelZ = p.z - uScroll * 8.5;
        float wave1 = sin(p.x * 0.68 + uTime * 1.15) * cos(travelZ * 0.62 - uTime * 0.95);
        float wave2 = sin((p.x + travelZ) * 0.40 - uTime * 1.35);
        float amp = 0.26 + uActivation * 0.52;
        p.y += (wave1 * 0.65 + wave2 * 0.35) * amp;
        vElev = wave1 * 0.5 + 0.5;
        vWavePos = p;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uScroll;
      uniform float uActivation;
      varying vec3 vWavePos;
      varying float vElev;

      void main() {
        vec2 gridCoord = vec2(vWavePos.x * 1.15, vWavePos.z * 1.15 - uScroll * 6.5);
        vec2 cell = abs(fract(gridCoord - 0.5) - 0.5) / max(fwidth(gridCoord), vec2(0.001));
        float line = 1.0 - min(min(cell.x, cell.y), 1.0);

        float pulseBand = exp(-abs(fract(vWavePos.z * 0.14 + uScroll * 1.6 + uTime * 0.15) - 0.5) * 8.5);
        float distFade = smoothstep(13.0, 2.0, length(vWavePos.xz));

        vec3 pinkGrid = mix(vec3(0.90, 0.10, 0.42), vec3(1.0, 0.52, 0.78), vElev * 0.55 + pulseBand * 0.45);
        float alpha = line * distFade * (0.10 + uActivation * 0.36 + pulseBand * 0.26);

        gl_FragColor = vec4(pinkGrid * (1.15 + pulseBand * 0.85), clamp(alpha, 0.0, 0.88));
      }
    `,
  });
  const waveFloor = new THREE.Mesh(waveGeo, waveMat);
  waveFloor.position.set(0, -2.3, -6.0);
  waveFloor.frustumCulled = false;
  root.add(waveFloor);
  disposables.push(waveGeo, waveMat);

  // 6. 300 Kinetic Rose-Pink LED Bokeh Particles Streaming Along Outer Corridor
  const particleCount = 300;
  const pPos = new Float32Array(particleCount * 3);
  const pScale = new Float32Array(particleCount);
  const pPhase = new Float32Array(particleCount);
  let seed = 7711;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < particleCount; i++) {
    const r = 2.0 + rand() * 4.5;
    const a = rand() * Math.PI * 2;
    pPos[i * 3] = Math.cos(a) * r;
    pPos[i * 3 + 1] = (rand() - 0.5) * 4.8;
    pPos[i * 3 + 2] = 2.5 - rand() * 19.5;
    pScale[i] = 0.42 + rand() * 1.05;
    pPhase[i] = rand() * Math.PI * 2;
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  particleGeo.setAttribute('aScale', new THREE.BufferAttribute(pScale, 1));
  particleGeo.setAttribute('aPhase', new THREE.BufferAttribute(pPhase, 1));

  const particleMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: uniforms.uTime,
      uScroll: uniforms.uScroll,
      uActivation: uniforms.uActivation,
      uPointer: uniforms.uPointer,
      uPixelRatio: uniforms.uPixelRatio,
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute float aScale;
      attribute float aPhase;
      uniform float uTime;
      uniform float uScroll;
      uniform float uActivation;
      uniform vec2 uPointer;
      uniform float uPixelRatio;
      varying float vMix;
      varying float vAlpha;

      void main() {
        vec3 p = position;
        float swirl = uTime * 0.14 + uScroll * 1.3 + aPhase * 0.22;
        float c = cos(swirl);
        float s = sin(swirl);
        p.xy = mat2(c, -s, s, c) * p.xy;

        p.z = mod(p.z + uScroll * 10.5 + uTime * 0.42 + 16.5, 19.5) - 16.5;
        p.x += uPointer.x * 0.22 * fract(aPhase);
        p.y -= uPointer.y * 0.16 * fract(aPhase);

        vec4 mvPos = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mvPos;

        float pulse = 0.55 + 0.45 * sin(uTime * 2.6 + aPhase * 5.0);
        gl_PointSize = aScale * (115.0 * uPixelRatio / max(1.2, -mvPos.z)) * (0.72 + uActivation * 0.55);
        vMix = fract(aPhase * 0.618);
        vAlpha = pulse * (0.24 + uActivation * 0.65) * smoothstep(17.0, 2.8, -mvPos.z);
      }
    `,
    fragmentShader: /* glsl */ `
      varying float vMix;
      varying float vAlpha;

      void main() {
        vec2 cxy = gl_PointCoord * 2.0 - 1.0;
        float r2 = dot(cxy, cxy);
        if (r2 > 1.0) discard;
        float glow = pow(1.0 - r2, 2.3);
        vec3 col = mix(vec3(0.94, 0.11, 0.44), vec3(1.0, 0.64, 0.82), vMix);
        gl_FragColor = vec4(col * 1.25, glow * vAlpha);
      }
    `,
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  particles.frustumCulled = false;
  root.add(particles);
  disposables.push(particleGeo, particleMat);

  // Reusable dummy Object3D outside tick loop (zero GC)
  const dummy = new THREE.Object3D();

  const updateBarsTransform = (
    elapsed: number,
    scroll: number,
    activation: number
  ) => {
    for (let i = 0; i < barCount; i++) {
      const spec = barSpecs[i];
      const breathe = Math.sin(elapsed * 1.1 + spec.phase * 10.0) * (0.10 + activation * 0.20);
      const scrollTilt = Math.sin(scroll * Math.PI * 2.0 + spec.phase * 5.0) * 0.18 * activation;
      dummy.position.set(
        spec.baseX,
        spec.baseY + breathe,
        spec.baseZ
      );
      dummy.rotation.set(
        spec.baseRotX + scrollTilt * 0.45,
        elapsed * 0.16 + spec.phase * 2.5 + scroll * 1.4,
        spec.baseRotZ + scrollTilt
      );
      const pulseScale = spec.scaleY * (0.85 + activation * 0.35);
      dummy.scale.set(1, pulseScale, 1);
      dummy.updateMatrix();
      ledBarsMesh.setMatrixAt(i, dummy.matrix);
    }
    ledBarsMesh.instanceMatrix.needsUpdate = true;
  };

  // Populate initial transforms synchronously
  updateBarsTransform(0, 0, 0.22);

  const dispose = () => {
    disposables.forEach((d) => d.dispose());
  };

  return {
    root,
    ledBarsMesh,
    ribbonGroup,
    ringsGroup,
    uniforms,
    updateBarsTransform,
    dispose,
  };
}
