// ═══════════════════════════════════════════════════════════════
// js/ui-panels.js – Interactive HUD Panels, 3D Exhibition Boards,
// Usage-Based Billing Calculator & Problem vs Solution Modals
// ═══════════════════════════════════════════════════════════════
import * as THREE from 'three';
import {
    COLORS, getMaterial, createTextPlane, createInfoPanel,
    createDesk, createServerRack,
    toggleFactoryRoofs, toggleHolographicXRay, isHolographicXRayActive,
    createFloatingFacilityLabel, FLOATING_FACILITY_LABELS,
    setFacilityInteriorCutaway, resetAllFacilityCutaways,
    highlightEquipment, INTERACTIVE_EQUIPMENT_OBJECTS
} from './utils.js';

// ─── EXACTLY 9 FACILITY DEFINITIONS (COMPLETE CAMPUS ROSTER) ────
export const FACILITY_HOTSPOTS_DATA = [
    {
        id: 'manufacturing',
        name: 'Automotive & Manufacturing Plant',
        subtitle: '6-Axis Robotic Welding & Precision CNC Cells',
        desc: 'Automobile chassis & 6-axis robotic welding cell with real-time CAD/CAM synchronization',
        pos: new THREE.Vector3(-130, 16, -90),
        roofH: 14.5,
        camPosExt: new THREE.Vector3(-105, 34, -45),
        targetExt: new THREE.Vector3(-130, 7, -90),
        camPosInside: new THREE.Vector3(-120, 19, -70),
        targetInside: new THREE.Vector3(-130, 3, -90),
        camPos: new THREE.Vector3(-105, 34, -45),
        target: new THREE.Vector3(-130, 7, -90)
    },
    {
        id: 'textile',
        name: 'Textile & Garment Works',
        subtitle: 'Automated Cutting & Fabric Pattern Database',
        desc: 'Garment racks, fabric carousel & steam press stations with digital design storage',
        pos: new THREE.Vector3(-130, 15, 90),
        roofH: 13.5,
        camPosExt: new THREE.Vector3(-105, 34, 135),
        targetExt: new THREE.Vector3(-130, 6, 90),
        camPosInside: new THREE.Vector3(-120, 18, 110),
        targetInside: new THREE.Vector3(-130, 3, 90),
        camPos: new THREE.Vector3(-105, 34, 135),
        target: new THREE.Vector3(-130, 6, 90)
    },
    {
        id: 'food',
        name: 'Food Processing Facility',
        subtitle: 'Sanitary Lines & HACCP Compliance Records',
        desc: 'Sanitary stainless lines, jar bottling & vacuum sealing with cloud batch lot traceability',
        pos: new THREE.Vector3(0, 15, -140),
        roofH: 13.5,
        camPosExt: new THREE.Vector3(35, 34, -100),
        targetExt: new THREE.Vector3(0, 6, -140),
        camPosInside: new THREE.Vector3(15, 18, -120),
        targetInside: new THREE.Vector3(0, 3, -140),
        camPos: new THREE.Vector3(35, 34, -100),
        target: new THREE.Vector3(0, 6, -140)
    },
    {
        id: 'printing',
        name: 'Commercial Printing & Packaging',
        subtitle: '4-Color Offset Press & Prepress File Storage',
        desc: '4-color offset press, paper reels & hydraulic guillotines with raster queue management',
        pos: new THREE.Vector3(0, 15, 140),
        roofH: 13.5,
        camPosExt: new THREE.Vector3(35, 34, 180),
        targetExt: new THREE.Vector3(0, 6, 140),
        camPosInside: new THREE.Vector3(15, 18, 160),
        targetInside: new THREE.Vector3(0, 3, 140),
        camPos: new THREE.Vector3(35, 34, 180),
        target: new THREE.Vector3(0, 6, 140)
    },
    {
        id: 'furniture',
        name: 'Precision Furniture & Woodworking',
        subtitle: 'CNC Timber Routing & Cyclone Dust Extraction',
        desc: 'Cyclone dust extraction & cantilever timber storage with automated G-code cut-lists',
        pos: new THREE.Vector3(130, 15, -90),
        roofH: 13.5,
        camPosExt: new THREE.Vector3(105, 34, -45),
        targetExt: new THREE.Vector3(130, 6, -90),
        camPosInside: new THREE.Vector3(120, 18, -70),
        targetInside: new THREE.Vector3(130, 3, -90),
        camPos: new THREE.Vector3(105, 34, -45),
        target: new THREE.Vector3(130, 6, -90)
    },
    {
        id: 'wholesale',
        name: 'Wholesale & Logistics Hub',
        subtitle: 'Multi-Tier Racks & Live Barcode Dispatch WMS',
        desc: 'Commercial box truck, pallet jacks & freight scales with real-time inventory databases',
        pos: new THREE.Vector3(130, 16, 90),
        roofH: 13.5,
        camPosExt: new THREE.Vector3(105, 34, 135),
        targetExt: new THREE.Vector3(130, 6, 90),
        camPosInside: new THREE.Vector3(120, 18, 110),
        targetInside: new THREE.Vector3(130, 3, 90),
        camPos: new THREE.Vector3(105, 34, 135),
        target: new THREE.Vector3(130, 6, 90)
    },
    {
        id: 'registration',
        name: 'Customer Registration & Onboarding Center',
        subtitle: 'Turnkey Onboarding & 7-Step Migration Journey',
        desc: 'Customer onboarding kiosks, technical assistance desks & zero-CapEx registration portal',
        pos: new THREE.Vector3(80, 14, 40),
        roofH: 11.5,
        camPosExt: new THREE.Vector3(112, 32, 78),
        targetExt: new THREE.Vector3(80, 7, 40),
        camPosInside: new THREE.Vector3(95, 16, 56),
        targetInside: new THREE.Vector3(80, 4, 40),
        camPos: new THREE.Vector3(112, 32, 78),
        target: new THREE.Vector3(80, 7, 40)
    },
    {
        id: 'datacenter',
        name: 'UdyogCloud Central Data Center',
        subtitle: 'Tier-3 Enterprise Cloud Infrastructure Core',
        desc: '42U compute blades, SAN arrays, CRAC cooling & biometric security containment',
        pos: new THREE.Vector3(0, 24, 0),
        roofH: 22.5,
        camPosExt: new THREE.Vector3(0, 42, 88),
        targetExt: new THREE.Vector3(0, 14, 0),
        camPosInside: new THREE.Vector3(0, 16, 32),
        targetInside: new THREE.Vector3(0, 4, 0),
        camPos: new THREE.Vector3(0, 42, 88),
        target: new THREE.Vector3(0, 14, 0)
    },
    {
        id: 'operations',
        name: 'Cloud Operations & 24/7 NOC Center',
        subtitle: 'Dedicated Cloud Engineers & Video Wall Telemetry',
        desc: 'Live video wall telemetry, multi-tenant monitoring, security patching & admin offices',
        pos: new THREE.Vector3(80, 16, -20),
        roofH: 13.5,
        camPosExt: new THREE.Vector3(118, 36, 18),
        targetExt: new THREE.Vector3(80, 8, -20),
        camPosInside: new THREE.Vector3(98, 18, 0),
        targetInside: new THREE.Vector3(80, 5, -20),
        camPos: new THREE.Vector3(118, 36, 18),
        target: new THREE.Vector3(80, 8, -20)
    }
];

/**
 * Creates 3D in-world architectural exhibition boards
 * placed in campus plazas (Problem vs Solution & Pricing Dashboard)
 */
export function create3DUIPanels() {
    const panelsGroup = new THREE.Group();
    panelsGroup.name = '3D_Exhibition_Boards';

    // ─────────────────────────────────────────────────────────────
    // 1. PART 3: THE 8 PROBLEMS FACED BY SMALL INDUSTRIES (3D PLAZA EXHIBIT)
    // Located in the Western Industrial Courtyard near Manufacturing & Textile
    // ─────────────────────────────────────────────────────────────
    const problemGroup = new THREE.Group();
    problemGroup.position.set(-80, 0, -40);

    // Foundation plinth
    const plinth = new THREE.Mesh(
        new THREE.BoxGeometry(18, 0.3, 8),
        getMaterial('concrete_light')
    );
    plinth.position.y = 0.15;
    problemGroup.add(plinth);

    const problemBoard = createInfoPanel([
        'THE CHALLENGE: SMALL INDUSTRY ON-PREMISE IT VS UDYOGCLOUD',
        '1. Prohibitive Capital Expenditure on Physical Servers & Licenses',
        '2. Recurring Hardware Breakdowns & Expensive Replacement Parts',
        '3. Critical Shortage of In-House Cloud & Linux SysAdmin Talent',
        '4. Vulnerable Unencrypted Business & Accounting Databases',
        '5. Lack of Off-Site Redundant Backups Leading to Catastrophic Data Loss',
        '6. Complex Hyperscaler Portal Configurations & Cost Surprises',
        '───────────────────────────────────────────────────────────────',
        'UDYOGCLOUD SOLUTION: Zero Hardware CapEx • 100% Fully Managed by Cloud Pros'
    ], {
        worldW: 16,
        worldH: 5.8,
        titleColor: '#FF4444',
        textColor: '#FFFFFF',
        bgColor: 'rgba(10, 22, 40, 0.96)',
        fontSize: 21,
        titleSize: 26,
        canvasW: 1024,
        canvasH: 512
    });
    problemBoard.position.set(0, 3.8, 0);
    problemGroup.add(problemBoard);

    // Support pillars
    [-6.5, 6.5].forEach(px => {
        const p = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.8, 0.3), getMaterial('metal'));
        p.position.set(px, 1.9, 0);
        problemGroup.add(p);
    });

    panelsGroup.add(problemGroup);

    // ─────────────────────────────────────────────────────────────
    // 1b. PHASE D: 3D PHYSICAL ARCHITECTURAL COMPARISON DIORAMA
    // Side A: Traditional Fragile In-House MSME Server Closet
    // Side B: UdyogCloud Central Managed Micro-Pod
    // ─────────────────────────────────────────────────────────────
    const dioramaGroup = new THREE.Group();
    dioramaGroup.name = 'Physical_Comparison_Diorama';
    dioramaGroup.position.set(-80, 0, -22); // Courtyard location next to Problem Exhibit

    // Base presentation podium
    const podW = 16, podD = 8, podH = 0.4;
    const podium = new THREE.Mesh(
        new THREE.BoxGeometry(podW, podH, podD),
        getMaterial('concrete_dark')
    );
    podium.position.y = podH / 2;
    dioramaGroup.add(podium);

    // Dividing center glass acrylic barrier with neon edge
    const divider = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 3.6, podD),
        new THREE.MeshStandardMaterial({
            color: 0x00AAFF,
            transparent: true,
            opacity: 0.45,
            roughness: 0.1
        })
    );
    divider.position.set(0, 1.8 + podH, 0);
    dioramaGroup.add(divider);

    // ── SIDE A (LEFT): TRADITIONAL IN-HOUSE SERVER CLOSET ──
    const sideA = new THREE.Group();
    sideA.position.set(-podW / 4, podH, 0);

    // Dusty unfinished storeroom walls
    const wallA = new THREE.Mesh(
        new THREE.BoxGeometry(podW / 2 - 0.2, 3.2, 0.2),
        new THREE.MeshStandardMaterial({ color: 0x554433, roughness: 0.95 }) // Brown brick / rough plaster
    );
    wallA.position.set(0, 1.6, -podD / 2 + 0.1);
    sideA.add(wallA);

    // Noisy consumer tower server on makeshift wooden desk
    const deskA = createDesk(1.8, 0.8, 0.75);
    deskA.position.set(0, 0, 0);
    sideA.add(deskA);

    const towerServer = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.65, 0.55),
        new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.6 })
    );
    towerServer.position.set(-0.4, 1.1, 0);
    sideA.add(towerServer);

    // Cheap consumer UPS with red flashing warning LED
    const cheapUPS = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.25, 0.35),
        new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.7 })
    );
    cheapUPS.position.set(0.3, 0.15, 0.2);
    sideA.add(cheapUPS);

    const redAlert = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), getMaterial('led_red'));
    redAlert.position.set(0.3, 0.25, 0.38);
    sideA.add(redAlert);

    // Domestic dripping split AC with caution yellow tape
    const splitAC = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 0.4, 0.3),
        new THREE.MeshStandardMaterial({ color: 0xE8ECEF, roughness: 0.4 })
    );
    splitAC.position.set(0, 2.6, -podD / 2 + 0.35);
    sideA.add(splitAC);

    // Messy tangled floor spaghetti cables
    const messyCableMat = new THREE.MeshBasicMaterial({ color: 0x1A1A1A });
    for (let c = 0; c < 5; c++) {
        const cCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-0.4, 0.8, 0.2),
            new THREE.Vector3(-0.2 + c * 0.15, 0.05, 0.4 + (c % 2) * 0.3),
            new THREE.Vector3(0.3, 0.15, 0.2)
        ]);
        const wire = new THREE.Mesh(new THREE.TubeGeometry(cCurve, 10, 0.015, 4, false), messyCableMat);
        sideA.add(wire);
    }

    // Side A Title Banner
    const titleA = createTextPlane('TRADITIONAL ON-PREMISE IT CLOSET\nHigh CapEx • Unreliable • Vulnerable', {
        worldW: 5.5, worldH: 1.0, fontSize: 24, bgColor: '#881111', color: '#FFFFFF'
    });
    titleA.position.set(0, 3.4, 0);
    sideA.add(titleA);

    dioramaGroup.add(sideA);

    // ── SIDE B (RIGHT): UDYOGCLOUD MANAGED ENTERPRISE POD ──
    const sideB = new THREE.Group();
    sideB.position.set(podW / 4, podH, 0);

    // Clean data center back wall
    const wallB = new THREE.Mesh(
        new THREE.BoxGeometry(podW / 2 - 0.2, 3.2, 0.2),
        getMaterial('navy')
    );
    wallB.position.set(0, 1.6, -podD / 2 + 0.1);
    sideB.add(wallB);

    // Clean raised anti-static floor
    const cleanFloor = new THREE.Mesh(
        new THREE.BoxGeometry(podW / 2 - 0.2, 0.06, podD - 0.2),
        new THREE.MeshStandardMaterial({ color: 0x112233, roughness: 0.3, metalness: 0.4 })
    );
    cleanFloor.position.y = 0.03;
    sideB.add(cleanFloor);

    // Sealed 42U Enterprise Rack with organized cable management & glowing blue LEDs
    const proRack = createServerRack({ h: 2.3, w: 0.85, d: 1.1, units: 12 });
    proRack.position.set(0, 0, 0);
    sideB.add(proRack);

    // Precision CRAC supply duct overhead
    const ductB = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 1.2), getMaterial('metal'));
    ductB.position.set(0, 2.9, 0);
    sideB.add(ductB);

    // Armored 100G fiber connection with glowing blue conduit
    const fiberConduit = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 3.0, 8),
        getMaterial('led_blue')
    );
    fiberConduit.position.set(0.45, 1.5, 0.6);
    sideB.add(fiberConduit);

    // Side B Title Banner
    const titleB = createTextPlane('UDYOGCLOUD MANAGED CLOUD NODE\nZero CapEx • 100% Managed SLA • Enterprise N+1', {
        worldW: 5.5, worldH: 1.0, fontSize: 24, bgColor: '#0055AA', color: '#00FF88'
    });
    titleB.position.set(0, 3.4, 0);
    sideB.add(titleB);

    dioramaGroup.add(sideB);

    panelsGroup.add(dioramaGroup);

    // ─────────────────────────────────────────────────────────────
    // 2. PART 10: AFFORDABLE PRICING & PAY-AS-YOU-USE 3D DASHBOARD
    // Located at Central Campus Plaza facing Data Center
    // ─────────────────────────────────────────────────────────────
    const pricingGroup = new THREE.Group();
    pricingGroup.position.set(0, 0, 32);

    const pricingBoard = createInfoPanel([
        'PAY-AS-YOU-USE TRANSPARENT CLOUD PRICING TIERS',
        'STARTER TIER: Basic Cloud Storage, Automated Off-Site Backups, Secure File Sharing',
        'GROWTH TIER: Managed PostgreSQL/MySQL DBs, Application Hosting, Dual-Core KVM',
        'PRO TIER: Dedicated Virtual CPUs, Docker Microservices, 24/7 Managed NOC SLA',
        '───────────────────────────────────────────────────────────────',
        'CORE PRINCIPLE: Pay only for the resources your factory consumes.',
        'No lock-in contracts. Scale resources dynamically during peak production seasons.'
    ], {
        worldW: 18,
        worldH: 6.0,
        titleColor: '#00FF88',
        textColor: '#FFFFFF',
        bgColor: 'rgba(10, 22, 40, 0.96)',
        fontSize: 21,
        titleSize: 26,
        canvasW: 1024,
        canvasH: 512
    });
    pricingBoard.position.set(0, 4.0, 0);
    pricingGroup.add(pricingBoard);

    [-7.5, 7.5].forEach(px => {
        const p = new THREE.Mesh(new THREE.BoxGeometry(0.35, 4.0, 0.35), getMaterial('metal'));
        p.position.set(px, 2.0, 0);
        pricingGroup.add(p);
    });

    panelsGroup.add(pricingGroup);

    // ─────────────────────────────────────────────────────────────
    // 3. PHASE C: EXACTLY 8 INTERACTIVE FACILITY 3D HOTSPOT BEACONS
    // ─────────────────────────────────────────────────────────────
    const hotspotsGroup = new THREE.Group();
    hotspotsGroup.name = 'Facility_Hotspots';
    const hitMeshes = [];

    const beaconGeo = new THREE.SphereGeometry(0.55, 12, 12);
    const beaconMat = new THREE.MeshStandardMaterial({
        color: 0x00E1FF,
        emissive: 0x00AAFF,
        emissiveIntensity: 0.8,
        roughness: 0.2,
        metalness: 0.8
    });
    const stemMat = getMaterial('metal');

    FACILITY_HOTSPOTS_DATA.forEach(data => {
        const spot = new THREE.Group();
        spot.position.copy(data.pos);

        // Vertical mounting pin
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.2, 8), stemMat);
        stem.position.y = -1.6;
        spot.add(stem);

        // Glowing beacon orb
        const orb = new THREE.Mesh(beaconGeo, beaconMat);
        spot.add(orb);

        // Pulsing ring
        const ring = new THREE.Mesh(
            new THREE.RingGeometry(0.65, 0.85, 16),
            new THREE.MeshBasicMaterial({ color: 0x00E1FF, side: THREE.DoubleSide, transparent: true, opacity: 0.6 })
        );
        ring.rotation.x = Math.PI / 2;
        spot.add(ring);

        // Invisible Raycast Hit Sphere (sized for effortless mouse targeting)
        const hitSphere = new THREE.Mesh(
            new THREE.SphereGeometry(2.2, 8, 8),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        hitSphere.userData.hotspotData = data;
        spot.add(hitSphere);
        hitMeshes.push(hitSphere);

        hotspotsGroup.add(spot);
    });

    window.UdyogCloudHotspots = hitMeshes;
    panelsGroup.add(hotspotsGroup);

    // 3b. Add floating 3D facility label for every facility
    FACILITY_HOTSPOTS_DATA.forEach(fac => {
        const floatingLabel = createFloatingFacilityLabel(fac);
        panelsGroup.add(floatingLabel);
    });

    return panelsGroup;
}

/**
 * Injects interactive HTML modal overlays, quick toolbars,
 * and the live Usage-Based Billing Calculator
 */
export function initHTMLUI(sceneController) {
    // 1. Add interactive Quick Actions Toolbar to UI Overlay
    const overlay = document.getElementById('ui-overlay');
    if (!overlay) return;

    // Create toolbar container
    const toolbar = document.createElement('div');
    toolbar.id = 'quick-toolbar';
    toolbar.innerHTML = `
        <button id="btn-fullscreen" class="tool-btn">⛶ Fullscreen</button>
        <button id="btn-roofs" class="tool-btn">🏛️ Hide Roofs (Cutaway)</button>
        <button id="btn-xray" class="tool-btn">👁️ Holographic X-Ray</button>
        <button id="btn-surge" class="tool-btn">⚡ Trigger Data Surge</button>
        <button id="btn-calc" class="tool-btn">💰 Pricing Calculator</button>
        <button id="btn-problems" class="tool-btn">⚠️ Problems Solved</button>
        <button id="btn-compare" class="tool-btn">⚖️ AWS / Azure Comparison</button>
    `;
    overlay.appendChild(toolbar);

    // Create Modals Container
    const modalContainer = document.createElement('div');
    modalContainer.id = 'modal-container';
    modalContainer.innerHTML = `
        <!-- PRICING CALCULATOR MODAL -->
        <div id="modal-calc" class="modal-card hidden">
            <div class="modal-header">
                <h3>UDYOGCLOUD USAGE-BASED BILLING ESTIMATOR</h3>
                <button class="close-modal" data-target="modal-calc">&times;</button>
            </div>
            <div class="modal-body">
                <p class="modal-sub">Real-time resource scaling demonstration (PRD Part 10: "Pay only for what you use")</p>
                
                <div class="calc-row">
                    <label>Encrypted Cloud Storage: <span id="val-storage" class="val-highlight">250 GB</span></label>
                    <input type="range" id="slider-storage" min="50" max="2000" step="50" value="250">
                </div>

                <div class="calc-row">
                    <label>Virtual Compute (vCPU Cores): <span id="val-cpu" class="val-highlight">4 Cores</span></label>
                    <input type="range" id="slider-cpu" min="1" max="16" step="1" value="4">
                </div>

                <div class="calc-row">
                    <label>Managed RAM: <span id="val-ram" class="val-highlight">8 GB</span></label>
                    <input type="range" id="slider-ram" min="2" max="64" step="2" value="8">
                </div>

                <div class="calc-row">
                    <label>Managed Business Databases: <span id="val-db" class="val-highlight">2 DBs</span></label>
                    <input type="range" id="slider-db" min="1" max="8" step="1" value="2">
                </div>

                <div class="bill-summary">
                    <div class="summary-item">
                        <span class="label">Recommended Tier:</span>
                        <span id="recommended-tier" class="badge">GROWTH PLAN</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Estimated Monthly Bill:</span>
                        <span id="estimated-bill" class="bill-amount">₹ 2,450 / month</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 8 PROBLEMS SOLVED MODAL -->
        <div id="modal-problems" class="modal-card hidden">
            <div class="modal-header">
                <h3>8 CORE CHALLENGES FACED BY SMALL-SCALE INDUSTRIES</h3>
                <button class="close-modal" data-target="modal-problems">&times;</button>
            </div>
            <div class="modal-body">
                <div class="problem-grid">
                    <div class="prob-col">
                        <h4>❌ Traditional Self-Managed IT Nightmare</h4>
                        <ul>
                            <li><strong>High Initial Hardware Outlay:</strong> ₹3L-₹10L upfront for servers & UPS.</li>
                            <li><strong>Severe In-House Skill Deficit:</strong> Small factories cannot afford full-time DevOps.</li>
                            <li><strong>Unreliable Local Backups:</strong> Hard drive failures destroy tally and CAD files.</li>
                            <li><strong>Expensive Downtime:</strong> Parts replacement takes days during peak shifts.</li>
                            <li><strong>Database Corruption:</strong> Improper shutdowns during factory power cuts.</li>
                            <li><strong>Complex Hyperscalers:</strong> 300+ confusing cloud services on AWS/Azure.</li>
                        </ul>
                    </div>
                    <div class="sol-col">
                        <h4>✅ The UdyogCloud Managed Solution</h4>
                        <ul>
                            <li><strong>Zero Hardware CapEx:</strong> Pure pay-as-you-use monthly subscription.</li>
                            <li><strong>Dedicated Cloud Pros:</strong> 24/7 remote engineers manage setup & tuning.</li>
                            <li><strong>Automated Offsite Snapshots:</strong> Immutable zero-loss backup vault.</li>
                            <li><strong>High Availability Architecture:</strong> Redundant N+1 generators and CRAC precision cooling.</li>
                            <li><strong>Managed DB Clusters:</strong> PostgreSQL & MySQL with automated health checks.</li>
                            <li><strong>Turnkey Onboarding:</strong> Tailored for manufacturing, textiles & wholesale.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <!-- AWS/AZURE COMPETITIVE POSITIONING MODAL -->
        <div id="modal-compare" class="modal-card hidden">
            <div class="modal-header">
                <h3>COMPETITIVE POSITIONING: HYPERSCALERS VS UDYOGCLOUD</h3>
                <button class="close-modal" data-target="modal-compare">&times;</button>
            </div>
            <div class="modal-body">
                <p class="modal-sub">AWS and Azure serve businesses of all sizes worldwide. UdyogCloud focuses specifically on making cloud infrastructure accessible, right-sized, and managed for small-scale industries.</p>
                <table class="compare-table">
                    <thead>
                        <tr>
                            <th>Parameter</th>
                            <th>Global Hyperscalers (AWS / Azure)</th>
                            <th>UdyogCloud</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Primary Focus</strong></td>
                            <td>Enterprises, tech startups, global corporations</td>
                            <td>Small & Medium Scale Industries (MSMEs)</td>
                        </tr>
                        <tr>
                            <td><strong>Setup & Onboarding</strong></td>
                            <td>Self-service DIY, complex IAM policies & VPCs</td>
                            <td>Turnkey setup by assigned UdyogCloud engineers</td>
                        </tr>
                        <tr>
                            <td><strong>IT Personnel Required</strong></td>
                            <td>Certified Cloud Architects / DevOps required on payroll</td>
                            <td>Zero IT hire required; fully managed by UdyogCloud</td>
                        </tr>
                        <tr>
                            <td><strong>Pricing Predictability</strong></td>
                            <td>Multi-variable egress, IOPS, and API call billing</td>
                            <td>Flat, transparent, predictable resource-based billing</td>
                        </tr>
                        <tr>
                            <td><strong>Customer Support</strong></td>
                            <td>Tiered enterprise support contracts</td>
                            <td>Direct, local phone/desk engineer assistance included</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    overlay.appendChild(modalContainer);

    // ─────────────────────────────────────────────────────────────
    // WIRE EVENT LISTENERS
    // ─────────────────────────────────────────────────────────────
    const setupModal = (btnId, modalId) => {
        const btn = document.getElementById(btnId);
        const modal = document.getElementById(modalId);
        if (btn && modal) {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.modal-card').forEach(m => m.classList.add('hidden'));
                modal.classList.remove('hidden');
            });
        }
    };

    setupModal('btn-calc', 'modal-calc');
    setupModal('btn-problems', 'modal-problems');
    setupModal('btn-compare', 'modal-compare');

    // Fullscreen presentation toggle
    const fsBtn = document.getElementById('btn-fullscreen');
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
            if (fsBtn) fsBtn.textContent = '✖ Exit Fullscreen';
        } else {
            if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
            if (fsBtn) fsBtn.textContent = '⛶ Fullscreen';
        }
    };
    if (fsBtn) fsBtn.addEventListener('click', toggleFullscreen);

    // Keyboard shortcut 'F' for presentation ease
    window.addEventListener('keydown', (e) => {
        if ((e.key === 'f' || e.key === 'F') && e.target.tagName !== 'INPUT') {
            toggleFullscreen();
        }
    });

    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement && fsBtn) {
            fsBtn.textContent = '⛶ Fullscreen';
        }
    });

    // Factory Roofs Cutaway / Architectural Exterior Toggle
    const roofBtn = document.getElementById('btn-roofs');
    const updateRoofBtn = (visible) => {
        if (!roofBtn) return;
        roofBtn.textContent = visible ? '🏛️ Hide Roofs (Cutaway)' : '🏛️ Show Roofs';
    };
    if (roofBtn) {
        roofBtn.addEventListener('click', () => {
            const isVisible = toggleFactoryRoofs();
            updateRoofBtn(isVisible);
        });
    }

    // Keyboard shortcut 'R' to toggle factory roofs cleanly during live demo
    window.addEventListener('keydown', (e) => {
        if ((e.key === 'r' || e.key === 'R') && e.target.tagName !== 'INPUT') {
            const isVisible = toggleFactoryRoofs();
            updateRoofBtn(isVisible);
        }
    });

    // Holographic X-Ray View (Button & Hotkey 'X')
    const xrayBtn = document.getElementById('btn-xray');
    const updateXRayBtn = (active) => {
        if (!xrayBtn) return;
        xrayBtn.textContent = active ? '👁️ Disable X-Ray' : '👁️ Holographic X-Ray';
        xrayBtn.classList.toggle('active', active);
    };
    if (xrayBtn) {
        xrayBtn.addEventListener('click', () => {
            const isActive = toggleHolographicXRay();
            updateXRayBtn(isActive);
        });
    }

    // Keyboard shortcut 'X' to toggle holographic X-Ray mode
    window.addEventListener('keydown', (e) => {
        if ((e.key === 'x' || e.key === 'X') && e.target.tagName !== 'INPUT') {
            const isActive = toggleHolographicXRay();
            updateXRayBtn(isActive);
        }
    });

    // Data Surge Trigger (Button & Hotkey 'S')
    const surgeBtn = document.getElementById('btn-surge');
    const executeSurge = () => {
        if (window.UdyogCloudNetwork && window.UdyogCloudNetwork.triggerSurge) {
            window.UdyogCloudNetwork.triggerSurge(4.0);
            if (surgeBtn) {
                surgeBtn.textContent = '⚡ SURGE ACTIVE (2.6x)!';
                surgeBtn.style.color = '#00FF88';
                setTimeout(() => {
                    if (surgeBtn) {
                        surgeBtn.textContent = '⚡ Trigger Data Surge';
                        surgeBtn.style.color = '#FFFFFF';
                    }
                }, 4000);
            }
        }
    };
    if (surgeBtn) surgeBtn.addEventListener('click', executeSurge);

    window.addEventListener('keydown', (e) => {
        if ((e.key === 's' || e.key === 'S') && e.target.tagName !== 'INPUT') {
            executeSurge();
        }
    });

    // Close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = e.target.getAttribute('data-target');
            const target = document.getElementById(targetId);
            if (target) target.classList.add('hidden');
        });
    });

    // Pricing Calculator Interactive Logic
    const sliderStorage = document.getElementById('slider-storage');
    const sliderCpu = document.getElementById('slider-cpu');
    const sliderRam = document.getElementById('slider-ram');
    const sliderDb = document.getElementById('slider-db');

    const updateCalc = () => {
        const storage = parseInt(sliderStorage.value);
        const cpu = parseInt(sliderCpu.value);
        const ram = parseInt(sliderRam.value);
        const db = parseInt(sliderDb.value);

        document.getElementById('val-storage').textContent = `${storage} GB`;
        document.getElementById('val-cpu').textContent = `${cpu} Core${cpu > 1 ? 's' : ''}`;
        document.getElementById('val-ram').textContent = `${ram} GB`;
        document.getElementById('val-db').textContent = `${db} DB${db > 1 ? 's' : ''}`;

        // Compute simulated price in INR
        // Storage: ₹1.5/GB, CPU: ₹250/core, RAM: ₹120/GB, DB: ₹300/DB
        const total = Math.round(storage * 1.5 + cpu * 250 + ram * 120 + db * 300);
        document.getElementById('estimated-bill').textContent = `₹ ${total.toLocaleString()} / month`;

        // Tier classification
        let tier = 'STARTER PLAN';
        if (cpu > 6 || ram > 16 || storage > 800) {
            tier = 'PROFESSIONAL PLAN';
        } else if (cpu > 2 || ram > 4 || storage > 200) {
            tier = 'GROWTH PLAN';
        }
        document.getElementById('recommended-tier').textContent = tier;
    };

    if (sliderStorage) {
        sliderStorage.addEventListener('input', updateCalc);
        sliderCpu.addEventListener('input', updateCalc);
        sliderRam.addEventListener('input', updateCalc);
        sliderDb.addEventListener('input', updateCalc);
        updateCalc();
    }

    // ── Phase C & D: Facility Selection Manager & Interactive Exploration ──
    const facilityManager = new FacilitySelectionManager(sceneController);
    window.FacilityManager = facilityManager;

    const tooltip = document.createElement('div');
    tooltip.id = 'hotspot-tooltip';
    tooltip.className = 'hidden';
    document.body.appendChild(tooltip);

    const canvas = document.getElementById('canvas');
    const hpRaycaster = new THREE.Raycaster();
    const hpMouse = new THREE.Vector2();

    if (canvas) {
        canvas.addEventListener('pointermove', (e) => {
            if (!window.UdyogCloudHotspots || window.UdyogCloudHotspots.length === 0) return;
            hpMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            hpMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            hpRaycaster.setFromCamera(hpMouse, sceneController.camera);

            // Check equipment tooltip in equipment mode
            if (facilityManager.currentMode === 'equipment' && INTERACTIVE_EQUIPMENT_OBJECTS.length > 0) {
                const eqHits = hpRaycaster.intersectObjects(INTERACTIVE_EQUIPMENT_OBJECTS, false);
                if (eqHits.length > 0 && eqHits[0].object.userData.equipmentData) {
                    const eqData = eqHits[0].object.userData.equipmentData;
                    tooltip.innerHTML = `<h4>⚙️ ${eqData.name}</h4><p>${eqData.role}</p>`;
                    tooltip.style.left = `${e.clientX}px`;
                    tooltip.style.top = `${e.clientY}px`;
                    tooltip.classList.remove('hidden');
                    canvas.style.cursor = 'pointer';
                    return;
                }
            }

            const intersects = hpRaycaster.intersectObjects(window.UdyogCloudHotspots, false);
            if (intersects.length > 0) {
                const data = intersects[0].object.userData.hotspotData;
                tooltip.innerHTML = `<h4>📍 ${data.name}</h4><p>${data.desc}</p>`;
                tooltip.style.left = `${e.clientX}px`;
                tooltip.style.top = `${e.clientY}px`;
                tooltip.classList.remove('hidden');
                canvas.style.cursor = 'pointer';
            } else {
                tooltip.classList.add('hidden');
                canvas.style.cursor = 'default';
            }
        });

        canvas.addEventListener('click', (e) => {
            if (e.target.tagName !== 'CANVAS') return;
            hpMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            hpMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            hpRaycaster.setFromCamera(hpMouse, sceneController.camera);

            // 1. Check equipment click if inside or equipment mode
            if (INTERACTIVE_EQUIPMENT_OBJECTS.length > 0) {
                const eqIntersects = hpRaycaster.intersectObjects(INTERACTIVE_EQUIPMENT_OBJECTS, false);
                if (eqIntersects.length > 0 && eqIntersects[0].object.userData.equipmentData) {
                    const eqData = eqIntersects[0].object.userData.equipmentData;
                    facilityManager.showEquipmentCard(eqData, eqIntersects[0].object);
                    tooltip.classList.add('hidden');
                    return;
                }
            }

            // 2. Check hotspot beacon click
            if (window.UdyogCloudHotspots && window.UdyogCloudHotspots.length > 0) {
                const intersects = hpRaycaster.intersectObjects(window.UdyogCloudHotspots, false);
                if (intersects.length > 0) {
                    const data = intersects[0].object.userData.hotspotData;
                    facilityManager.selectFacility(data.id, 'exterior');
                    tooltip.classList.add('hidden');
                    return;
                }
            }
        });
    }
}

export class FacilitySelectionManager {
    constructor(sceneController) {
        this.sceneController = sceneController;
        this.selectedFacilityId = null;
        this.currentMode = 'exterior';
        this.badgeEl = document.getElementById('facility-badge-text');
        this.titleEl = document.getElementById('facility-title');
        this.subtitleEl = document.getElementById('facility-subtitle');
        this.toolbarEl = document.getElementById('facility-inspector-toolbar');
        this.equipCardEl = document.getElementById('equipment-card');
        this.activeButtons = {
            exterior: document.getElementById('btn-inspect-ext'),
            interior: document.getElementById('btn-inspect-inside'),
            xray: document.getElementById('btn-inspect-xray'),
            equipment: document.getElementById('btn-inspect-equip')
        };

        this.initToolbarListeners();
    }

    updateToolbarActiveState(mode) {
        Object.entries(this.activeButtons).forEach(([key, btn]) => {
            if (btn) {
                if (key === mode) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            }
        });
    }

    initToolbarListeners() {
        const extBtn = document.getElementById('btn-inspect-ext');
        const insideBtn = document.getElementById('btn-inspect-inside');
        const xrayBtn = document.getElementById('btn-inspect-xray');
        const equipBtn = document.getElementById('btn-inspect-equip');
        const resetBtn = document.getElementById('btn-inspect-reset');
        const backBtn = document.getElementById('btn-inspect-back');
        const closeEquipBtn = document.getElementById('close-equip-card');

        if (extBtn) extBtn.addEventListener('click', () => this.setMode('exterior'));
        if (insideBtn) insideBtn.addEventListener('click', () => this.setMode('interior'));
        if (xrayBtn) xrayBtn.addEventListener('click', () => this.setMode('xray'));
        if (equipBtn) equipBtn.addEventListener('click', () => this.setMode('equipment'));
        if (resetBtn) resetBtn.addEventListener('click', () => {
            if (this.selectedFacilityId) {
                this.selectFacility(this.selectedFacilityId, 'exterior');
            }
        });
        if (backBtn) backBtn.addEventListener('click', () => this.deselect());
        if (closeEquipBtn) closeEquipBtn.addEventListener('click', () => this.hideEquipmentCard());
    }

    selectFacility(facilityId, mode = 'exterior') {
        const facility = FACILITY_HOTSPOTS_DATA.find(f => f.id === facilityId);
        if (!facility) {
            this.deselect();
            return;
        }

        this.selectedFacilityId = facilityId;
        this.currentMode = mode;

        if (this.badgeEl) this.badgeEl.textContent = 'SELECTED FACILITY';
        if (this.titleEl) this.titleEl.textContent = facility.name.toUpperCase();
        if (this.subtitleEl) this.subtitleEl.textContent = facility.subtitle || facility.desc;

        if (this.toolbarEl) this.toolbarEl.classList.remove('hidden');
        this.updateToolbarActiveState(mode);

        FLOATING_FACILITY_LABELS.forEach(label => {
            const isMatch = label.userData.facilityId === facilityId;
            label.visible = true;
            if (isMatch) {
                label.scale.set(1.2, 1.2, 1.2);
            } else {
                label.scale.set(0.75, 0.75, 0.75);
            }
        });

        const leftTitle = document.getElementById('scene-title');
        const leftDesc = document.getElementById('scene-desc');
        if (leftTitle) leftTitle.textContent = `FACILITY: ${facility.name.toUpperCase()}`;
        if (leftDesc) leftDesc.textContent = facility.desc;

        if (mode === 'interior') {
            setFacilityInteriorCutaway(facilityId, true);
            this.sceneController.flyTo(facility.camPosInside || facility.camPos, facility.targetInside || facility.target, 2.2);
        } else {
            setFacilityInteriorCutaway(facilityId, false);
            this.sceneController.flyTo(facility.camPosExt || facility.camPos, facility.targetExt || facility.target, 2.5);
        }

        this.hideEquipmentCard();
    }

    setMode(mode) {
        if (!this.selectedFacilityId) return;
        this.currentMode = mode;
        this.updateToolbarActiveState(mode);
        const facility = FACILITY_HOTSPOTS_DATA.find(f => f.id === this.selectedFacilityId);
        if (!facility) return;

        if (mode === 'exterior') {
            setFacilityInteriorCutaway(this.selectedFacilityId, false);
            this.sceneController.flyTo(facility.camPosExt || facility.camPos, facility.targetExt || facility.target, 2.0);
            this.hideEquipmentCard();
        } else if (mode === 'interior') {
            setFacilityInteriorCutaway(this.selectedFacilityId, true);
            this.sceneController.flyTo(facility.camPosInside || facility.camPos, facility.targetInside || facility.target, 2.2);
        } else if (mode === 'xray') {
            toggleHolographicXRay();
        } else if (mode === 'equipment') {
            setFacilityInteriorCutaway(this.selectedFacilityId, true);
            this.sceneController.flyTo(facility.camPosInside || facility.camPos, facility.targetInside || facility.target, 1.8);
        }
    }

    showEquipmentCard(data, mesh) {
        if (!data || !this.equipCardEl) return;
        this.equipCardEl.classList.remove('hidden');
        const nameEl = document.getElementById('equip-name');
        const facEl = document.getElementById('equip-facility');
        const roleEl = document.getElementById('equip-role');
        const descEl = document.getElementById('equip-desc');
        const connEl = document.getElementById('equip-conn');

        if (nameEl) nameEl.textContent = data.name;
        if (facEl) facEl.textContent = data.facility || 'Campus Asset';
        if (roleEl) roleEl.textContent = data.role || 'Operational Machinery';
        if (descEl) descEl.textContent = data.desc || data.description || '';
        if (connEl) connEl.textContent = data.connection || 'Integrated into UdyogCloud monitoring telemetry.';

        highlightEquipment(mesh, true);
    }

    hideEquipmentCard() {
        if (this.equipCardEl) this.equipCardEl.classList.add('hidden');
        highlightEquipment(null, false);
    }

    deselect() {
        this.selectedFacilityId = null;
        this.currentMode = 'exterior';
        resetAllFacilityCutaways();

        if (this.badgeEl) this.badgeEl.textContent = 'CAMPUS OVERVIEW';
        if (this.titleEl) this.titleEl.textContent = 'UDYOGCLOUD INDUSTRIAL TECHNOLOGY CAMPUS';
        if (this.subtitleEl) this.subtitleEl.textContent = 'Complete 3D Industrial Cloud Ecosystem • 6 Connected Plants & Data Center Core';

        if (this.toolbarEl) this.toolbarEl.classList.add('hidden');
        this.hideEquipmentCard();

        FLOATING_FACILITY_LABELS.forEach(label => {
            label.visible = true;
            label.scale.set(0.9, 0.9, 0.9);
        });

        this.sceneController.goToScene(0);
    }
}

