// Bola de futebol em 3D no topo do site (Three.js).
// O desenho dos gomos é feito no shader: os 32 centros de um icosaedro truncado
// (12 pentágonos + 20 hexágonos) formam um diagrama de Voronoi na esfera.
// Pentágonos laranja, hexágonos brancos, costuras escuras. Sem textura para baixar.
import * as THREE from 'three';

const palco = document.querySelector('[data-bola3d]');
const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)');

function suportaWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch { return false; }
}

if (palco && suportaWebGL()) iniciar();

function centrosDosGomos() {
  const phi = (1 + Math.sqrt(5)) / 2;
  const v = [
    [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
    [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
    [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1],
  ].map((p) => new THREE.Vector3(...p).normalize());
  const faces = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];
  const centrosFaces = faces.map(([a, b, c]) => v[a].clone().add(v[b]).add(v[c]).normalize());
  return [...v, ...centrosFaces]; // 0..11 pentágonos, 12..31 hexágonos
}

function iniciar() {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  palco.appendChild(renderer.domElement);
  palco.classList.add('com-3d');
  renderer.domElement.setAttribute('aria-hidden', 'true');

  const cena = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, 0, 6.2);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uCentros: { value: centrosDosGomos() },
      uLaranja: { value: new THREE.Color('#f86100') },
      uBranco: { value: new THREE.Color('#fbf7f2') },
      uCostura: { value: new THREE.Color('#2a2622') },
      uLuz: { value: new THREE.Vector3(-0.55, 0.75, 0.9).normalize() },
    },
    vertexShader: /* glsl */ `
      varying vec3 vObj;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vObj = normalize(position);
        vNormal = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uCentros[32];
      uniform vec3 uLaranja;
      uniform vec3 uBranco;
      uniform vec3 uCostura;
      uniform vec3 uLuz;
      varying vec3 vObj;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        float d1 = -2.0; float d2 = -2.0; int idx = 0;
        for (int i = 0; i < 32; i++) {
          float d = dot(vObj, uCentros[i]);
          if (d > d1) { d2 = d1; d1 = d; idx = i; }
          else if (d > d2) { d2 = d; }
        }
        vec3 base = idx < 12 ? uLaranja : uBranco;
        // costura: fronteira do Voronoi, com leve afundamento (sombra) ao redor
        float borda = d1 - d2;
        float costura = 1.0 - smoothstep(0.004, 0.012, borda);
        float afundado = 1.0 - smoothstep(0.012, 0.05, borda);
        // luz: difusa + preenchimento + brilho especular + contorno
        vec3 n = normalize(vNormal);
        float dif = max(dot(n, uLuz), 0.0);
        float preench = 0.42 + 0.58 * dif;
        vec3 h = normalize(uLuz + vView);
        float esp = pow(max(dot(n, h), 0.0), 48.0) * (idx < 12 ? 0.35 : 0.5);
        float aro = pow(1.0 - max(dot(n, vView), 0.0), 3.0);
        vec3 cor = base * preench * (1.0 - 0.18 * afundado);
        cor = mix(cor, uCostura, costura * 0.9);
        cor += esp;
        cor += aro * vec3(0.97, 0.38, 0.0) * 0.35;
        gl_FragColor = vec4(cor, 1.0);
        #include <colorspace_fragment>
      }`,
  });

  const bola = new THREE.Mesh(new THREE.SphereGeometry(1.45, 128, 96), material);
  bola.rotation.set(0.35, -0.6, 0.1);
  cena.add(bola);

  // Poeira de cal em volta, bem sutil (camada ambiente)
  const qtd = 140;
  const pos = new Float32Array(qtd * 3);
  for (let i = 0; i < qtd; i++) {
    const r = 1.9 + Math.random() * 1.4;
    const t = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 2.6;
    pos.set([Math.cos(t) * r, y, Math.sin(t) * r * 0.6 - 0.5], i * 3);
  }
  const poGeo = new THREE.BufferGeometry();
  poGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const poeira = new THREE.Points(poGeo, new THREE.PointsMaterial({ color: '#f86100', size: 0.035, transparent: true, opacity: 0.55, depthWrite: false }));
  cena.add(poeira);

  function redimensionar() {
    const { width, height } = palco.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / height || 1;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(redimensionar).observe(palco);
  redimensionar();

  // Ponteiro inclina a bola; scroll dá um "chute" (gira rápido e sobe)
  const alvo = { x: 0, y: 0 };
  const atual = { x: 0, y: 0 };
  let giroScroll = 0;
  let ultimoScroll = window.scrollY;
  window.addEventListener('pointermove', (e) => {
    alvo.x = (e.clientY / window.innerHeight - 0.5) * 0.6;
    alvo.y = (e.clientX / window.innerWidth - 0.5) * 0.9;
  }, { passive: true });
  window.addEventListener('scroll', () => {
    giroScroll += (window.scrollY - ultimoScroll) * 0.004;
    ultimoScroll = window.scrollY;
  }, { passive: true });

  let visivel = true;
  new IntersectionObserver(([en]) => { visivel = en.isIntersecting; }).observe(palco);

  const relogio = new THREE.Clock();
  function quadro() {
    const dt = Math.min(relogio.getDelta(), 0.05);
    if (visivel) {
      atual.x += (alvo.x - atual.x) * 0.06;
      atual.y += (alvo.y - atual.y) * 0.06;
      const vel = giroScroll * 0.12;
      giroScroll -= vel;
      bola.rotation.x += dt * 0.12 + vel;
      bola.rotation.y += dt * 0.28;
      bola.position.x = atual.y * 0.25;
      bola.position.y = -atual.x * 0.2 + Math.sin(relogio.elapsedTime * 1.1) * 0.05;
      const progresso = Math.min(window.scrollY / (window.innerHeight * 0.9), 1);
      bola.position.y += progresso * 1.2;
      bola.scale.setScalar(1 - progresso * 0.25);
      poeira.rotation.y += dt * 0.05;
      renderer.render(cena, camera);
    }
    if (!reduzido.matches) requestAnimationFrame(quadro);
  }
  if (reduzido.matches) renderer.render(cena, camera);
  else requestAnimationFrame(quadro);
  reduzido.addEventListener?.('change', () => { if (!reduzido.matches) requestAnimationFrame(quadro); });
}
