import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Initial setup
const container = document.getElementById('canvas-container');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true
});

renderer.setClearColor(0x000000, 0);
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// Initial orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Create cube
const side = 1;
const geometry = new THREE.BoxGeometry(side, side, side);
const material = new THREE.MeshStandardMaterial({
    color: 0x00bcff,
    transparent: true,
    opacity: 0.5,
    roughness: 0.5,
    metalness: 0.1,
    side: THREE.DoubleSide
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Edges
const edges = new THREE.EdgesGeometry(geometry);
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
const wireframe = new THREE.LineSegments(edges, lineMaterial);
cube.add(wireframe); 

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 2);
scene.add(new THREE.AmbientLight(0xffffff, 0.3), light);

// Text Canvas Label
function createLabel(text, color = '#00bcff') {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 128;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '600 44px IBM Plex Mono, monospace';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true,
        depthTest: false
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(0.8, 0.4, 1);
    return sprite;
}

const labelL = createLabel('1 m');
const labelW = createLabel('1 m');
const labelH = createLabel('1 m');
scene.add(labelL, labelW, labelH);

const updateLabelText = (label, text) => {
    const canvas = label.material.map.image; 
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '600 44px IBM Plex Mono, monospace';
    ctx.fillStyle = '#00bcff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 64);
    label.material.map.needsUpdate = true;
};

let currentMaxScale = 2.5;

const updateCamera = () => {
    const width = container.clientWidth;

    if (width < 1024) {
        camera.position.set(1.6, 1.6, 1.6);
        currentMaxScale = 1.4; 
    } else {
        camera.position.set(2.2, 2.2, 2.2);
        currentMaxScale = 2.4;
    }

    camera.lookAt(0, 0, 0);
    controls.target.set(0, 0, 0);
};

// Container resize handling
window.addEventListener('resize', () => {
    const width = container.clientWidth;
    const height = container.clientHeight;

    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    updateCamera();
    calculateVolume();
});

// Animate loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// UI Elements & Logic
const inputS = document.getElementById('input-s');
const unitSelect = document.getElementById('unit-select');
const volumeDisplay = document.getElementById('volume-display');
const baseAreaDisplay = document.getElementById('area-display');

const calculateVolume = () => {
    const s = parseFloat(inputS.value) || 0;
    const unit = unitSelect.value;

    // 1. Update 3D Object Scale
    const visualScale = s > 0 ? Math.min(s, currentMaxScale) : 0.1; 
    cube.scale.set(visualScale, visualScale, visualScale);

    // 2. Math Calculations
    const volume = Math.pow(s, 3);
    const baseArea = Math.pow(s, 2);

    // 3. Update Text UI Dashboard HTML
    volumeDisplay.innerHTML = `Volume: ${volume.toLocaleString(undefined, {maximumFractionDigits: 4})} <span class="text-sm text-zinc-500 font-normal">${unit}<sup>3</sup></span>`;
    baseAreaDisplay.innerHTML = `${baseArea.toLocaleString(undefined, {maximumFractionDigits: 4})} ${unit}<sup>2</sup>`;

    // 4. Update Teks Label
    updateLabelText(labelL, `${s} ${unit}`);
    updateLabelText(labelW, `${s} ${unit}`);
    updateLabelText(labelH, `${s} ${unit}`);

    // 5. Update Label Distance
    const offset = (visualScale / 2) + 0.25;
    labelL.position.set(0, -offset, visualScale / 2 + 0.25);
    labelW.position.set(visualScale / 2 + 0.25, -offset, 0);
    labelH.position.set(-(visualScale / 2) - 0.25, 0, visualScale / 2 + 0.25);
};

inputS.addEventListener('input', calculateVolume);
unitSelect.addEventListener('change', calculateVolume);

// Initial call order
updateCamera();
calculateVolume();