import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

// IMPORTE AS IMAGENS AQUI
// Se elas estiverem na pasta public, use: import bgImg from '/fundo_logo.png';
// Se estiverem na mesma pasta do componente, use: import bgImg from './fundo_logo.png';
import bgImg from '/fundo_logo2.png';
import fgImg from '/theoros2.png';

// Constante de módulo: identidade estável entre renders (essencial para o
// useEffect de setup do Three.js rodar só uma vez, e não a cada setState).
const RUNES = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ'];

// Mapeamento explícito: cada número do d20 (1..20) -> uma runa.
// A ordem aqui é 1->RUNES[0], 2->RUNES[1] ... mas é só uma tabela: pode ser
// reembaralhada à vontade sem afetar a lógica de rolagem.
const RUNE_BY_NUMBER = RUNES.reduce((map, rune, i) => {
map[i + 1] = rune;
return map;
}, {});

const D20Dice = () => {
// Estados do React para o texto
const [displayText, setDisplayText] = useState('clique no dado para rolar');
const [displayMode, setDisplayMode] = useState('phrase');
const [webglError, setWebglError] = useState(false);

// Refs para o Three.js e controle de animação
const containerRef = useRef(null);
const rendererRef = useRef(null);
const sceneRef = useRef(null);
const cameraRef = useRef(null);
const groupRef = useRef(null);
const faceNormalsRef = useRef([]);
const embersRef = useRef(null);
const rollingRef = useRef(false);
const frameRef = useRef(0);
const totalFramesRef = useRef(0);
const tRef = useRef(0);
const animIdRef = useRef(null);
const cooldownRef = useRef(false); // trava após cair o número
const cooldownTimeoutRef = useRef(null); // id do setTimeout do cooldown
const returningRef = useRef(false); // transição suave de volta ao início
const returnFrameRef = useRef(0);

// Tempo (ms) que o número fica congelado na tela antes de iniciar o retorno
const RESET_DELAY = 2500;
// Duração (frames ~60fps) da transição suave de volta ao estado inicial
const RETURN_FRAMES = 60;

// Função que desenha as faces no canvas (mesmo código original)
const faceTexture = useCallback((num) => {
const S = 512;
const cv = document.createElement('canvas');
cv.width = cv.height = S;
const ctx = cv.getContext('2d');
const cx = S / 2, topY = S * 0.04, lx = S * 0.03, rx = S * 0.97, by = S * 0.96;

ctx.fillStyle = '#000';
ctx.fillRect(0, 0, S, S);

ctx.beginPath();
ctx.moveTo(cx, topY); ctx.lineTo(lx, by); ctx.lineTo(rx, by);
ctx.closePath();
const g = ctx.createRadialGradient(cx, S * 0.55, S * 0.05, cx, S * 0.55, S * 0.52);
g.addColorStop(0, '#7a0000'); g.addColorStop(0.4, '#4a0000'); g.addColorStop(1, '#1a0000');
ctx.fillStyle = g; ctx.fill();

ctx.save(); ctx.clip();
ctx.strokeStyle = 'rgba(255,60,0,0.12)'; ctx.lineWidth = 0.8;
for (let a = 0; a < Math.PI * 2; a += Math.PI / 9) {
ctx.beginPath(); ctx.moveTo(cx, S * 0.58);
ctx.lineTo(cx + Math.cos(a) * S * 0.55, S * 0.58 + Math.sin(a) * S * 0.55);
ctx.stroke();
}
ctx.restore();

ctx.beginPath();
ctx.moveTo(cx, topY); ctx.lineTo(lx, by); ctx.lineTo(rx, by);
ctx.closePath();
const gg = ctx.createLinearGradient(lx, by, rx, topY);
gg.addColorStop(0, '#8b6914'); gg.addColorStop(0.3, '#ffd800');
gg.addColorStop(0.5, '#fff5a0'); gg.addColorStop(0.7, '#ffd700'); gg.addColorStop(1, '#8b6914');
ctx.strokeStyle = gg; ctx.lineWidth = num === 20 ? 9 : 7; ctx.lineJoin = 'round'; ctx.stroke();
ctx.strokeStyle = 'rgba(255,200,0,0.18)'; ctx.lineWidth = 18; ctx.stroke();

// Runa correspondente ao número (mapeamento 1:1 em RUNE_BY_NUMBER)
ctx.fillStyle = 'rgba(255,160,0,0.55)';
ctx.font = 'bold 80px serif';
ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
ctx.fillText(RUNE_BY_NUMBER[num], cx, S * 0.78);

ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
if (num === 20) {
ctx.font = 'bold 205px serif';
ctx.shadowColor = '#001affff'; ctx.shadowBlur = 10;
ctx.fillStyle = '#d400ffff'; ctx.fillText('20', cx, S * 0.58);//número atrás do número, CX serve para centralizar o eixo X e S*0.40 serve para alinhar o eixo Y
ctx.font = 'bold 180px serif';
ctx.shadowColor = '#ffe600ff'; ctx.shadowBlur = 100;//sobra do fundo central
ctx.fillStyle = '#cec004ff'; ctx.fillText('20', cx, S * 0.58); //Cor do centro do número
ctx.shadowBlur = -1;
ctx.strokeStyle = '#e5ff00ff'; ctx.lineWidth = 5; ctx.strokeText('20', cx, S * 0.58);//borda do número
} else {
ctx.font = `bold ${num >= 10 ? 160 : 170}px serif`;
ctx.shadowColor = '#ff3300'; ctx.shadowBlur = 30;
ctx.fillStyle = '#cc1100'; ctx.fillText(String(num), cx, S * 0.58);
ctx.shadowColor = '#ffaa00'; ctx.shadowBlur = 6;
ctx.fillStyle = '#ffcc44'; ctx.fillText(String(num), cx, S * 0.58);
ctx.shadowBlur = 0;
}
return new THREE.CanvasTexture(cv);
}, []);

// Configuração inicial do Three.js
useEffect(() => {
const W = Math.min(window.innerWidth, 200);
const H = Math.min(window.innerHeight * 0.6, 180);

let renderer;

const originalError = console.error;

console.error = (...args) => {
  if (
    typeof args[0] === "string" &&
    args[0].startsWith("THREE.WebGLRenderer:")
  ) {
    return; // Esconde somente o erro do Three.js
  }

  originalError(...args);
};

try {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });

  renderer.getContext(); // força a criação do contexto
} catch {
  setWebglError(true);
  console.error = originalError;
  return;
}

console.error = originalError;


renderer.setSize(W, H);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);
// Remove qualquer canvas remanescente (StrictMode/HMR no dev rodam o efeito 2x)
while (containerRef.current.firstChild) {
containerRef.current.removeChild(containerRef.current.firstChild);
}
containerRef.current.appendChild(renderer.domElement);
renderer.domElement.style.cursor = "url('/cursor/cursor_manopla_base2.webp') 0 0, auto";
rendererRef.current = renderer;

const scene = new THREE.Scene();
sceneRef.current = scene;

const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
camera.position.z = 4.5;
cameraRef.current = camera;

// Luzes
scene.add(new THREE.AmbientLight(0x2a1200, 25.0)); // intensidade geral da cena
const goldLight = new THREE.PointLight(0xffc700, 24, 12); // brilho da luz dourada
goldLight.position.set(2, 2, 4);
scene.add(goldLight);
const redLight = new THREE.PointLight(0xff1100, 25.0, 10); // brilho da luz vermelha
redLight.position.set(-1, -3, 2);
scene.add(redLight);
const rimLight = new THREE.PointLight(0xff4400, 10.2, 8); // brilho do contorno/rim light
rimLight.position.set(-3, 1, -3);
scene.add(rimLight);

// Geometria do Dado
const icoGeo = new THREE.IcosahedronGeometry(0.70, 0); // Tamanho configurado aqui
const pos = icoGeo.attributes.position;
const group = new THREE.Group();
group.position.y = -0.4; // Posição Y configurada aqui
group.position.x = 0.0;
scene.add(group);
groupRef.current = group;

const faceNormals = [];
const faceUps = []; // direção "para cima" da face: meio da base -> apex (vértice A)
const diceMeshes = []; // só as faces do dado (alvos do clique via raycast)

for (let f = 0; f < 20; f++) {
const i0 = f * 3;
const vA = new THREE.Vector3(pos.getX(i0), pos.getY(i0), pos.getZ(i0));
const vB = new THREE.Vector3(pos.getX(i0 + 1), pos.getY(i0 + 1), pos.getZ(i0 + 1));
const vC = new THREE.Vector3(pos.getX(i0 + 2), pos.getY(i0 + 2), pos.getZ(i0 + 2));

faceNormals.push(vA.clone().add(vB).add(vC).divideScalar(3).normalize());
// apex (vA) é o topo do número na textura; este vetor aponta p/ cima na face
faceUps.push(vA.clone().sub(vB.clone().add(vC).multiplyScalar(0.5)).normalize());

const geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.Float32BufferAttribute([
vA.x, vA.y, vA.z, vB.x, vB.y, vB.z, vC.x, vC.y, vC.z
], 3));
geo.setAttribute('uv', new THREE.Float32BufferAttribute([
0.5, 0.96, 0.03, 0.04, 0.97, 0.04
], 2));
geo.computeVertexNormals();

const mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
map: faceTexture(f + 1),
shininess: 1200,
emissive: new THREE.Color(0x1a0000),
emissiveIntensity: 0.35, // quanto o material "brilha" por si só
}));
group.add(mesh);
diceMeshes.push(mesh);
}

group.add(new THREE.LineSegments(
new THREE.EdgesGeometry(icoGeo),
new THREE.LineBasicMaterial({ color: 0xffcc00, transparent: true, opacity: 0.85 })
));

faceNormalsRef.current = faceNormals;

// Partículas
const N = 100;
const eArr = new Float32Array(N * 3);
for (let i = 0; i < N; i++) {
eArr[i * 3] = (Math.random() - 0.5) * 6;
eArr[i * 3 + 1] = (Math.random() - 0.5) * 6;
eArr[i * 3 + 2] = (Math.random() - 0.5) * 4;
}
//criação dos embers
const emberGeo = new THREE.BufferGeometry();
emberGeo.setAttribute('position', new THREE.BufferAttribute(eArr, 3));
const embers = new THREE.Points(emberGeo,
new THREE.PointsMaterial({ color: 0xff6600, size: 0.025, transparent: true, opacity: 0.6 })
);
scene.add(embers);
embersRef.current = embers;

// Direção da câmera: a face cuja normal aponta para +Z fica de frente p/ o jogador
const camDir = new THREE.Vector3(0, 0, 1);

// Estado do "tween" de rotação por quaternions (compartilhado entre roll/animate)
const qStart = new THREE.Quaternion(); // orientação no início da transição
const qEnd = new THREE.Quaternion(); // orientação alvo (face achatada na câmera)
const qBase = new THREE.Quaternion(); // temporário p/ o slerp
const qSpin = new THREE.Quaternion(); // giro extra (tombamento) que decai a 0
const spinAxis = new THREE.Vector3();
let spinTurns = 0; // nº de voltas de tombamento durante a rolagem
let resultNum = 1; // número (1..20) sorteado para esta rolagem

// Quaternion que deixa a face `idx` (0..19) achatada de frente para a câmera
const faceToCameraQuat = (idx, out) =>
out.setFromUnitVectors(faceNormalsRef.current[idx], camDir);

// Estado inicial / posição de descanso: face em que o dado fica parado
// antes do 1º clique e para onde ele volta após cada rolagem.
const HOME_FACE = 20; // troque para o número que quiser (1..20)
const HOME_ROLL_DEG = 0; // ajuste fino do giro da face (graus; + = inclina p/ a esquerda)
const homeQuat = new THREE.Quaternion();
faceToCameraQuat(HOME_FACE - 1, homeQuat);

// Deixa o número "em pé": gira a face em torno do eixo da câmera (Z) até o
// topo do número apontar para cima na tela (+Y), mais o ajuste manual opcional.
{
const worldUp = faceUps[HOME_FACE - 1].clone().applyQuaternion(homeQuat);
const roll = Math.PI / 2 - Math.atan2(worldUp.y, worldUp.x)
+ HOME_ROLL_DEG * Math.PI / 180;
homeQuat.premultiply(new THREE.Quaternion().setFromAxisAngle(camDir, roll));
}

groupRef.current.quaternion.copy(homeQuat); // nasce virado para o HOME_FACE, em pé

// Lógica de rolagem (roll)
const roll = () => {
if (rollingRef.current || cooldownRef.current || returningRef.current) return;
rollingRef.current = true;
totalFramesRef.current = Math.floor(120 + Math.random() * 80);
frameRef.current = 0;

// Sorteia a face (d20 justo) e calcula a orientação EXATA de chegada
const idx = Math.floor(Math.random() * 20);
resultNum = idx + 1;
qStart.copy(groupRef.current.quaternion);
faceToCameraQuat(idx, qEnd);

// Eixo aleatório e nº de voltas para o tombamento parecer uma rolagem real
spinAxis.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
spinTurns = 2 + Math.floor(Math.random() * 3); // 2 a 4 voltas

setDisplayText('');
setDisplayMode('hidden');
};

// Raycast: o clique (e o cursor) só valem quando o ponteiro está sobre o dado,
// não no canvas inteiro.
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const pointerHitsDie = (event) => {
const rect = renderer.domElement.getBoundingClientRect();
pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
raycaster.setFromCamera(pointer, cameraRef.current);
return raycaster.intersectObjects(diceMeshes, false).length > 0;
};

const onClick = (event) => {
if (pointerHitsDie(event)) roll();
};
const onPointerMove = (event) => {
const isHovering = pointerHitsDie(event);
renderer.domElement.style.cursor = isHovering
? "url('/cursor/cursor_manopla_pointer2.webp') 0 0, pointer"
: "url('/cursor/cursor_manopla_base2.webp') 0 0, auto";
};

renderer.domElement.addEventListener('click', onClick);
renderer.domElement.addEventListener('mousemove', onPointerMove);

// Loop de animação
const animate = () => {
tRef.current += 0.01;

if (rollingRef.current && groupRef.current) {
frameRef.current++;
const p = Math.min(frameRef.current / totalFramesRef.current, 1);
const ease = 1 - Math.pow(1 - p, 3); // easeOutCubic: desacelera no fim

// Orientação base: interpola (caminho curto) até a face alvo alinhada
qBase.copy(qStart).slerp(qEnd, ease);
// Tombamento: giro extra que vai de (spinTurns voltas) até 0
const extraAngle = spinTurns * Math.PI * 2 * (1 - ease);
qSpin.setFromAxisAngle(spinAxis, extraAngle);
groupRef.current.quaternion.copy(qBase).multiply(qSpin);

if (p >= 1) {
rollingRef.current = false;
groupRef.current.quaternion.copy(qEnd); // trava EXATAMENTE na face sorteada
const num = resultNum;
setDisplayText(String(num));
setDisplayMode('result');

// Congela o dado: ignora cliques e mantém o número parado na tela
cooldownRef.current = true;
cooldownTimeoutRef.current = setTimeout(() => {
cooldownRef.current = false;
// Descongela e prepara a transição suave de volta ao estado inicial.
// slerp sempre faz o caminho curto, então não há voltas a desenrolar.
qStart.copy(groupRef.current.quaternion);
qEnd.copy(homeQuat);
returnFrameRef.current = 0;
returningRef.current = true;
}, RESET_DELAY);
}
}

if (returningRef.current && groupRef.current) {
returnFrameRef.current++;
const p = Math.min(returnFrameRef.current / RETURN_FRAMES, 1);
const ease = 1 - Math.pow(1 - p, 3); // easeOutCubic
groupRef.current.quaternion.copy(qStart).slerp(qEnd, ease);

if (p >= 1) {
returningRef.current = false;
groupRef.current.quaternion.copy(homeQuat);
setDisplayText('clique no dado para rolar');
setDisplayMode('phrase');
}
}

//altera a posição dos embers
if (embersRef.current) {
const ep = embersRef.current.geometry.attributes.position;
for (let i = 0; i < 100; i++) {
ep.array[i * 3 + 1] += 0.004;
ep.array[i * 3] += Math.sin(tRef.current + i) * 0.001;
if (ep.array[i * 3 + 1] > 3) ep.array[i * 3 + 1] = -3;
}
ep.needsUpdate = true;
}

rendererRef.current.render(sceneRef.current, cameraRef.current);
animIdRef.current = requestAnimationFrame(animate);
};

animate();

// Função de redimensionamento
const handleResize = () => {
const nW = Math.min(window.innerWidth, 200);
const nH = Math.min(window.innerHeight * 0.6, 180);
if (cameraRef.current) {
cameraRef.current.aspect = nW / nH;
cameraRef.current.updateProjectionMatrix();
}
if (rendererRef.current) {
rendererRef.current.setSize(nW, nH);
}
};
window.addEventListener('resize', handleResize);

// Cleanup (limpeza) quando o componente for desmontado
return () => {
cancelAnimationFrame(animIdRef.current);
clearTimeout(cooldownTimeoutRef.current);
window.removeEventListener('resize', handleResize);
// Usa a variável LOCAL `renderer` (não o ref, que pode ter sido sobrescrito
// pela 2ª montagem do StrictMode) para remover exatamente este canvas.
renderer.domElement.removeEventListener('click', onClick);
renderer.domElement.removeEventListener('mousemove', onPointerMove);
renderer.dispose();
renderer.domElement.remove();
};
}, [faceTexture]);

if (webglError) {
return (
<div
style={{
width: "200px",
height: "180px",
display: "flex",
justifyContent: "center",
alignItems: "center",
flexDirection: "column",
color: "#ffc400",
textAlign: "center",
fontSize: "13px",
}}
>
    
<img src="/logo.png" style={{ marginLeft: "320px", marginTop:"100px" ,width: "180px", height: "auto" }}/></div>
);
}

return (

<div style={{
display: 'flex',
flexDirection: 'column',
alignItems: 'center',
width: '100%',
minHeight: '220px',
cursor: "url('/cursor/cursor_manopla_base2.webp') 0 0, auto",
}}>
{/* PALCO: fundo + dado + logo sobrepostos. */}
<div style={{
position: 'relative',
width: 'clamp(200px, 95vw, 200px)',
height: 'min(60vh, 180px)',

}}>

{/* Imagem de fundo — centralizada (vertical + horizontal) */}
<img
src={bgImg}
alt="Fundo"
style={{
position: 'absolute', top: '75%', left: '50%',
transform: 'translate(-50%, -50%)',
width: '10rem',
objectFit: 'contain', pointerEvents: 'auto',
mixBlendMode: 'screen', zIndex: 1,
cursor: "url('/cursor/cursor_manopla_base2.webp') 0 0, auto",
}}
/>

{/* Logo — centralizado na horizontal, com o texto abaixo */}
<img
src={fgImg}
alt="Logo"
style={{
position: 'absolute', top: '88%', left: '50%',
transform: 'translate(-50%, -50%)',
width: '70%',
pointerEvents: 'auto', zIndex: 1000,
cursor: "url('/cursor/cursor_manopla_base2.webp') 0 0, auto"
}}
/>

{/* Container do dado (Three.js) — centralizado (vertical + horizontal) */}
<div
ref={containerRef}
style={{
position: 'absolute', top: '58%', left: '50%',
transform: 'translate(-50%, -50%)', zIndex: 3,
cursor: "url('/cursor/cursor_manopla_base2.webp') 0 0, auto",
}}
/>

{/* Texto do resultado — logo abaixo da logo */}
<div
style={{
position: 'absolute',
top: '125%',
left: '50%',
transform: 'translate(-50%, -50%)',
textAlign: 'center',
zIndex: 1000,
pointerEvents: 'none',
width: '100%',
display: 'flex',
justifyContent: 'center',
alignItems: 'center',
minHeight: '24px',
}}
>
<div
style={{
...(displayMode === 'result'
? {
fontSize: '25px',
fontWeight: 'bold',
color: '#ffc400ff',
textShadow: '0 0 16px #ff4400, 0 0 36px #ff2200',
letterSpacing: '4px',
lineHeight: 1,
}
: {
fontSize: '10px',
color: 'rgba(255,160,0,0.5)',
letterSpacing: '3px',
textTransform: 'uppercase',
}),
opacity: displayMode === 'hidden' ? 0 : 1,
minHeight: '24px',
}}
>
{displayMode === 'hidden' ? '' : displayText}
</div>
</div>
</div>
</div>
);
};

export default D20Dice;