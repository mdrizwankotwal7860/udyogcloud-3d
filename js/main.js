// ═══════════════════════════════════════════════════════════════
// js/main.js – Master Orchestrator for UdyogCloud 3D Campus
// Initializes Scene, Camera, PBR Lighting, Controls, Subsystems,
// Cinematic Presentations, and Interactive UI Overlays
// ═══════════════════════════════════════════════════════════════
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

import { COLORS, LAYOUT, FLOATING_FACILITY_LABELS, INTERACTIVE_EQUIPMENT_OBJECTS } from './utils.js';
import { createCampus } from './campus.js';

if (typeof window !== 'undefined') {
    window.FLOATING_FACILITY_LABELS = FLOATING_FACILITY_LABELS;
    window.INTERACTIVE_EQUIPMENT_OBJECTS = INTERACTIVE_EQUIPMENT_OBJECTS;
}
import { createIndustries } from './industries.js';
import { createDataCenter } from './datacenter.js';
import { createOperations } from './operations.js';
import { createNetwork } from './network.js';
import { create3DUIPanels, initHTMLUI } from './ui-panels.js';
import { SceneController, SCENE_CONFIGS } from './scenes.js';

// ─────────────────────────────────────────────────────────────
// 1. ENGINE SETUP: RENDERER, SCENE & ATMOSPHERE
// ─────────────────────────────────────────────────────────────
const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0xD4E6F6, 1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
// Linear atmospheric fog: zero fog across campus (0-550m), smooth fade towards horizon (550-1800m)
scene.fog = new THREE.Fog(0xD4E6F6, 550, 1800);

// Atmospheric Crisp Daytime Sky Dome with Multi-Tone Gradient
const skyGeo = new THREE.SphereGeometry(1400, 32, 16);
const skyCanvas = document.createElement('canvas');
skyCanvas.width = 16;
skyCanvas.height = 256;
const skyCtx = skyCanvas.getContext('2d');
const skyGrad = skyCtx.createLinearGradient(0, 0, 0, 256);
skyGrad.addColorStop(0, '#164E8C');    // Deep zenith sky blue
skyGrad.addColorStop(0.40, '#3A7EC4'); // Mid sky blue
skyGrad.addColorStop(0.70, '#78B2E4'); // Lower atmosphere
skyGrad.addColorStop(0.92, '#C2DCF2'); // Horizon atmosphere
skyGrad.addColorStop(1.0, '#D4E6F6');  // Ground/fog blend
skyCtx.fillStyle = skyGrad;
skyCtx.fillRect(0, 0, 16, 256);
const skyTex = new THREE.CanvasTexture(skyCanvas);
const skyMesh = new THREE.Mesh(
    skyGeo,
    new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide })
);
scene.add(skyMesh);

// 1b. PROCEDURAL PMREM DAYTIME RADIANCE ENVIRONMENT
// Generates pre-filtered ambient radiance and sunlight specular highlights on glass/metals
const pmremGen = new THREE.PMREMGenerator(renderer);
pmremGen.compileEquirectangularShader();

const envCanvas = document.createElement('canvas');
envCanvas.width = 256;
envCanvas.height = 128;
const envCtx = envCanvas.getContext('2d');
const envGrad = envCtx.createLinearGradient(0, 0, 0, 128);
envGrad.addColorStop(0, '#1A5599');    // Zenith sky blue
envGrad.addColorStop(0.45, '#4E88CC'); // Sky luminance
envGrad.addColorStop(0.75, '#90C2EE'); // Low sky
envGrad.addColorStop(0.90, '#D4E6F6'); // Horizon haze
envGrad.addColorStop(1.0, '#5A6654');  // Warm earth/concrete bounce
envCtx.fillStyle = envGrad;
envCtx.fillRect(0, 0, 256, 128);

// Warm sunlight specular reflection highlight dot
const sunGlow = envCtx.createRadialGradient(180, 42, 2, 180, 42, 24);
sunGlow.addColorStop(0, 'rgba(255, 252, 240, 1.0)');
sunGlow.addColorStop(0.4, 'rgba(255, 240, 200, 0.6)');
sunGlow.addColorStop(1.0, 'rgba(255, 240, 200, 0.0)');
envCtx.fillStyle = sunGlow;
envCtx.beginPath();
envCtx.arc(180, 42, 24, 0, Math.PI * 2);
envCtx.fill();

const envTex = new THREE.CanvasTexture(envCanvas);
envTex.mapping = THREE.EquirectangularReflectionMapping;
const envRT = pmremGen.fromEquirectangular(envTex);
scene.environment = envRT.texture;
envTex.dispose();
pmremGen.dispose();

// ─────────────────────────────────────────────────────────────
// 2. CAMERA & ORBIT CONTROLS
// ─────────────────────────────────────────────────────────────
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.8,
    2200
);
// Initial establishing shot position
camera.position.set(0, 138, 205);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.maxPolarAngle = Math.PI / 2 - 0.02; // Restrict camera from going underground
controls.minDistance = 6;
controls.maxDistance = 750;
controls.target.set(0, 8, 5);
controls.update();

// ─────────────────────────────────────────────────────────────
// 3. CINEMATIC DAYTIME LIGHTING RIG
// ─────────────────────────────────────────────────────────────
// Soft ambient base fill (calibrated for crisp daytime contrast)
const ambientLight = new THREE.AmbientLight(0xE4EDF6, 0.40);
scene.add(ambientLight);

// Sky & ground hemisphere balance (natural sky blue top, earth bounce bottom)
const hemiLight = new THREE.HemisphereLight(0xDCEDFF, 0x556050, 0.90);
scene.add(hemiLight);

// Primary Sun / Key Architectural Light (crisp realistic daylight shadows)
const dirLight = new THREE.DirectionalLight(0xFFFBF0, 2.40);
dirLight.position.set(160, 240, 110);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 4096;
dirLight.shadow.mapSize.height = 4096;
dirLight.shadow.camera.near = 10;
dirLight.shadow.camera.far = 700;
dirLight.shadow.camera.left = -260;
dirLight.shadow.camera.right = 260;
dirLight.shadow.camera.top = 260;
dirLight.shadow.camera.bottom = -260;
dirLight.shadow.bias = -0.00012;
scene.add(dirLight);

// Soft Skylight Fill from opposite quadrant to soften high-contrast shadows
const fillLight = new THREE.DirectionalLight(0x88B8E8, 0.45);
fillLight.position.set(-150, 120, -120);
scene.add(fillLight);

// ─────────────────────────────────────────────────────────────
// 3b. POST-PROCESSING PIPELINE: CALIBRATED ARCHITECTURAL BLOOM
// ─────────────────────────────────────────────────────────────
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// Threshold 0.92 ensures text and 3D buildings remain pin-sharp and clean
// while status LEDs and laser fiber conduits have a realistic optical glow
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.22, // strength
    0.25, // radius
    0.92  // threshold
);
composer.addPass(bloomPass);

// ─────────────────────────────────────────────────────────────
// 4. ASSEMBLE 3D CAMPUS INFRASTRUCTURE
// ─────────────────────────────────────────────────────────────
console.log('Loading UdyogCloud Campus subsystems...');

// A. Campus ground, roads, landscaping, perimeter, entry gate
const campusGroup = createCampus();
scene.add(campusGroup);

// B. Six Customer Industries (Manufacturing, Textile, Food, Printing, Furniture, Wholesale)
const industriesGroup = createIndustries();
scene.add(industriesGroup);

// C. Central UdyogCloud Data Center (Hero Showcase with full server hall)
const dataCenterGroup = createDataCenter();
scene.add(dataCenterGroup);

// D. Cloud Operations Center, NOC Wall & Customer Office
const opsGroup = createOperations();
scene.add(opsGroup);

// E. Campus Network Infrastructure & Animated Fiber Data Streams
const network = createNetwork();
scene.add(network.group);
window.UdyogCloudNetwork = network; // Expose globally for interactive UI triggers

// F. In-World 3D Exhibition Boards (Problem vs Solution & Pricing Dashboard)
const boardsGroup = create3DUIPanels();
scene.add(boardsGroup);

// ─────────────────────────────────────────────────────────────
// 5. PRESENTATION SCENE CONTROLLER & UI SYNC
// ─────────────────────────────────────────────────────────────
const sceneTitleEl = document.getElementById('scene-title');
const sceneDescEl = document.getElementById('scene-desc');
const navButtons = document.querySelectorAll('.scene-btn[data-scene]');
const playBtn = document.getElementById('play-btn');

function onSceneChange(config) {
    if (sceneTitleEl) sceneTitleEl.textContent = config.title;
    if (sceneDescEl) sceneDescEl.textContent = config.description;

    const hdrTitle = document.getElementById('facility-title');
    const hdrSub = document.getElementById('facility-subtitle');
    const hdrBadge = document.getElementById('facility-badge-text');

    if (config.headerTitle && hdrTitle) hdrTitle.textContent = config.headerTitle;
    if (config.headerSubtitle && hdrSub) hdrSub.textContent = config.headerSubtitle;
    if (hdrBadge) {
        hdrBadge.textContent = (config.facilityId === 'campus' || config.facilityId === 'industries_overview')
            ? 'CAMPUS OVERVIEW'
            : 'ACTIVE SCENE';
    }

    // Sync toolbar and floating 3D labels with active scene
    if (window.FacilityManager) {
        const tb = document.getElementById('facility-inspector-toolbar');
        const eqCard = document.getElementById('equipment-card');
        if (eqCard) eqCard.classList.add('hidden');

        if (config.facilityId && config.facilityId !== 'campus' && config.facilityId !== 'industries_overview' && config.facilityId !== 'services' && config.facilityId !== 'connectivity') {
            window.FacilityManager.selectedFacilityId = config.facilityId;
            if (tb) tb.classList.remove('hidden');
            window.FacilityManager.updateToolbarActiveState('exterior');
        } else {
            if (tb) tb.classList.add('hidden');
            window.FacilityManager.selectedFacilityId = null;
        }

        FLOATING_FACILITY_LABELS.forEach(label => {
            const isMatch = label.userData.facilityId === config.facilityId;
            label.visible = true;
            if (isMatch) {
                label.scale.set(1.2, 1.2, 1.2);
            } else {
                label.scale.set(0.82, 0.82, 0.82);
            }
        });
    }

    navButtons.forEach(btn => {
        const sceneIdx = parseInt(btn.getAttribute('data-scene'));
        if (sceneIdx === config.id) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

const sceneController = new SceneController(camera, controls, onSceneChange);

// Bind Navigation Buttons
navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-scene'));
        sceneController.goToScene(idx);
    });
});

// Auto-play button toggle
if (playBtn) {
    playBtn.addEventListener('click', () => {
        const playing = sceneController.togglePlay();
        if (playing) {
            playBtn.classList.add('playing');
            playBtn.innerHTML = '&#10074;&#10074;'; // Pause icon
        } else {
            playBtn.classList.remove('playing');
            playBtn.innerHTML = '&#9654;'; // Play icon
        }
    });
}

// Initialize HTML Overlays (Calculators, Problems Modal, Competitor Comparison)
initHTMLUI(sceneController);

// Start on Scene 0 (Introduction)
sceneController.goToScene(0, true);

// ─────────────────────────────────────────────────────────────
// 6. INTERACTIVE RAYCASTING (CLICK-TO-INSPECT FACILITY & EQUIPMENT)
// ─────────────────────────────────────────────────────────────
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
    // Only inspect if clicking directly on 3D canvas (not UI overlay)
    if (event.target.tagName !== 'CANVAS') return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    // 1. Check if clicking on equipment object
    if (INTERACTIVE_EQUIPMENT_OBJECTS.length > 0 && window.FacilityManager) {
        const eqHits = raycaster.intersectObjects(INTERACTIVE_EQUIPMENT_OBJECTS, false);
        if (eqHits.length > 0 && eqHits[0].object.userData.equipmentData) {
            window.FacilityManager.showEquipmentCard(eqHits[0].object.userData.equipmentData, eqHits[0].object);
            return;
        }
    }

    // 2. Check if clicking directly on building groups
    const intersects = raycaster.intersectObjects([
        dataCenterGroup, opsGroup, industriesGroup
    ], true);

    if (intersects.length > 0 && window.FacilityManager) {
        let cur = intersects[0].object;
        let foundId = null;
        while (cur && cur.parent && !foundId) {
            if (cur.userData && cur.userData.facilityId) {
                foundId = cur.userData.facilityId;
            } else if (cur.name) {
                const n = cur.name.toLowerCase();
                if (n.includes('datacenter')) foundId = 'datacenter';
                else if (n.includes('opscenter') || n.includes('operations')) foundId = 'operations';
                else if (n.includes('customeroffice') || n.includes('registration')) foundId = 'registration';
                else if (n.includes('manufacturing')) foundId = 'manufacturing';
                else if (n.includes('textile')) foundId = 'textile';
                else if (n.includes('food')) foundId = 'food';
                else if (n.includes('printing')) foundId = 'printing';
                else if (n.includes('furniture')) foundId = 'furniture';
                else if (n.includes('wholesale')) foundId = 'wholesale';
            }
            cur = cur.parent;
        }
        if (foundId) {
            window.FacilityManager.selectFacility(foundId, 'exterior');
        }
    }
});

// ─────────────────────────────────────────────────────────────
// 7. RESPONSIVE RESIZE
// ─────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    bloomPass.resolution.set(window.innerWidth, window.innerHeight);
});

// ─────────────────────────────────────────────────────────────
// 8. RENDER LOOP
// ─────────────────────────────────────────────────────────────
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.1);

    // Billboard floating 3D facility labels towards camera
    if (FLOATING_FACILITY_LABELS.length > 0) {
        FLOATING_FACILITY_LABELS.forEach(lbl => {
            lbl.quaternion.copy(camera.quaternion);
        });
    }

    // Update camera interpolations & presentation timeline
    sceneController.update(delta);

    // Update fiber network data packet particles
    if (network && network.update) {
        network.update(delta);
    }

    // Phase B: Update 6 industrial machinery kinematics
    if (industriesGroup && industriesGroup.update) {
        industriesGroup.update(delta);
    }

    // Phase C: Update datacenter LED activity and operations NOC telemetry
    if (dataCenterGroup && dataCenterGroup.update) {
        dataCenterGroup.update(delta);
    }
    if (opsGroup && opsGroup.update) {
        opsGroup.update(delta);
    }

    // Render via post-processing pipeline
    composer.render(delta);
}

// ─────────────────────────────────────────────────────────────
// 9. DISMISS LOADING OVERLAY
// ─────────────────────────────────────────────────────────────
setTimeout(() => {
    const loader = document.getElementById('loading');
    if (loader) {
        loader.classList.add('hidden');
        setTimeout(() => loader.remove(), 900);
    }
    animate();
}, 600);

