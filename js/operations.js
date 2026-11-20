// ═══════════════════════════════════════════════════════════════
// js/operations.js – Cloud Operations Center & Customer Office
// Featuring: Professional Cloud Engineering Team, NOC Command Wall,
// 7-Step Customer Journey, and AWS/Azure Comparative Architecture
// ═══════════════════════════════════════════════════════════════
import * as THREE from 'three';
import {
    COLORS, LAYOUT, BUILDING_SIZES, getMaterial,
    createTextPlane, createInfoPanel, createLargeDisplay,
    createWorkstation, createPerson, createDesk, createChair,
    registerFacilityShell, tagEquipment
} from './utils.js';

export function createOperations() {
    const opsGroup = new THREE.Group();
    opsGroup.name = 'Operations_and_CustomerOffice';

    // ─────────────────────────────────────────────────────────────
    // 1. CLOUD OPERATIONS & NOC COMMAND CENTER BUILDING
    // ─────────────────────────────────────────────────────────────
    const opsPos = LAYOUT.OPS_CENTER; // (80, 0, -20)
    const { w: ow, h: oh, d: od } = BUILDING_SIZES.OPS_CENTER; // 35, 12, 22

    const opsBldg = new THREE.Group();
    opsBldg.name = 'Building_OpsCenter';
    opsBldg.position.copy(opsPos);

    // Foundation
    const opsPlinth = new THREE.Mesh(
        new THREE.BoxGeometry(ow + 2, 0.6, od + 2),
        getMaterial('concrete_dark')
    );
    opsPlinth.position.y = 0.3;
    opsBldg.add(opsPlinth);

    // Floor
    const opsFloor = new THREE.Mesh(
        new THREE.BoxGeometry(ow, 0.2, od),
        getMaterial('floor')
    );
    opsFloor.position.y = 0.7;
    opsBldg.add(opsFloor);

    // Roof Assembly Group (for clean individual interior cutaway)
    const opsRoofGroup = new THREE.Group();
    opsRoofGroup.name = 'OpsCenter_RoofGroup';

    // Roof with overhang
    const opsRoof = new THREE.Mesh(
        new THREE.BoxGeometry(ow + 1.5, 0.4, od + 1.5),
        getMaterial('metal_dark')
    );
    opsRoof.position.y = oh + 0.8;
    opsRoofGroup.add(opsRoof);

    // Glowing blue roof edge trim
    const opsRoofGlow = new THREE.Mesh(
        new THREE.BoxGeometry(ow + 1.6, 0.15, od + 1.6),
        getMaterial('led_blue')
    );
    opsRoofGlow.position.y = oh + 1.05;
    opsRoofGroup.add(opsRoofGlow);
    opsBldg.add(opsRoofGroup);

    // Outer architectural walls: Two-story corporate technology pavilion
    const wallThick = 0.35;
    // Back solid wall with architectural panels
    const opsBackWall = new THREE.Mesh(
        new THREE.BoxGeometry(ow, oh, wallThick),
        getMaterial('pir_white')
    );
    opsBackWall.position.set(0, oh / 2 + 0.6, -od / 2);
    opsBldg.add(opsBackWall);

    // Front wall: Double-height structural glass curtain wall
    const opsFrontGlass = new THREE.Mesh(
        new THREE.PlaneGeometry(ow - 2, oh - 1.2),
        new THREE.MeshPhysicalMaterial({
            color: 0x99d5ff,
            transparent: true,
            opacity: 0.90,
            transmission: 0.85,
            roughness: 0.08,
            metalness: 0.15,
            ior: 1.5,
            thickness: 0.5,
            side: THREE.DoubleSide
        })
    );
    opsFrontGlass.position.set(0, oh / 2 + 0.6, od / 2 - 0.05);
    opsBldg.add(opsFrontGlass);

    registerFacilityShell('operations', {
        id: 'operations',
        roofGroup: opsRoofGroup,
        frontGlass: opsFrontGlass,
        frontWalls: []
    });

    // Architectural Horizontal Brise-Soleil Louvers across upper floor
    const sunshadeMat = getMaterial('metal');
    for (let sy of [oh * 0.65, oh * 0.80, oh * 0.95]) {
        const shade = new THREE.Mesh(new THREE.BoxGeometry(ow, 0.08, 0.8), sunshadeMat);
        shade.position.set(0, sy + 0.6, od / 2 + 0.4);
        opsBldg.add(shade);
    }

    // Overhanging Entrance Canopy supported by steel columns
    const canopyW = 10, canopyD = 4, canopyH = 0.25;
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(canopyW, canopyH, canopyD), getMaterial('navy'));
    canopy.position.set(0, 4.2, od / 2 + canopyD / 2);
    opsBldg.add(canopy);

    [-canopyW / 2 + 0.6, canopyW / 2 - 0.6].forEach(cx => {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 4.2, 8), getMaterial('metal_light'));
        col.position.set(cx, 2.1, od / 2 + canopyD - 0.3);
        opsBldg.add(col);
    });

    // Side walls with composite panels
    const opsLeftWall = new THREE.Mesh(
        new THREE.BoxGeometry(wallThick, oh, od),
        getMaterial('pir_white')
    );
    opsLeftWall.position.set(-ow / 2, oh / 2 + 0.6, 0);
    opsBldg.add(opsLeftWall);

    const opsRightWall = new THREE.Mesh(
        new THREE.BoxGeometry(wallThick, oh, od),
        getMaterial('pir_white')
    );
    opsRightWall.position.set(ow / 2, oh / 2 + 0.6, 0);
    opsBldg.add(opsRightWall);

    // Exterior Building Marquee Sign
    const opsSign = createTextPlane('UDYOGCLOUD CLOUD OPERATIONS & 24/7 NOC', {
        worldW: 24,
        worldH: 1.8,
        fontSize: 32,
        bgColor: '#0A1628',
        color: '#00AAFF',
        canvasW: 1024,
        canvasH: 128
    });
    opsSign.position.set(0, oh + 1.8, od / 2 + 0.2);
    opsBldg.add(opsSign);

    // ─────────────────────────────────────────────────────────────
    // NOC INTERIOR: VIDEO WALL & TIERED COMMAND CONSOLES
    // ─────────────────────────────────────────────────────────────
    const nocGroup = new THREE.Group();
    nocGroup.position.set(0, 0.8, 0);

    // ── Phase C: Mega Curved NOC Dynamic Canvas Telemetry Displays ──
    // Center Screen: Multi-Tenant Industrial Cloud Cluster Telemetry (1024 x 512 Canvas)
    const centerCanvas = document.createElement('canvas');
    centerCanvas.width = 1024;
    centerCanvas.height = 512;
    const centerCtx = centerCanvas.getContext('2d');
    const centerTex = new THREE.CanvasTexture(centerCanvas);

    // Left Screen: Tier-3 Power & Climate Infrastructure (1024 x 512 Canvas)
    const leftCanvas = document.createElement('canvas');
    leftCanvas.width = 1024;
    leftCanvas.height = 512;
    const leftCtx = leftCanvas.getContext('2d');
    const leftTex = new THREE.CanvasTexture(leftCanvas);

    // Right Screen: 24/7 Managed Operations & Engineering Queue (1024 x 512 Canvas)
    const rightCanvas = document.createElement('canvas');
    rightCanvas.width = 1024;
    rightCanvas.height = 512;
    const rightCtx = rightCanvas.getContext('2d');
    const rightTex = new THREE.CanvasTexture(rightCanvas);

    // Initial Drawing of Screens
    function drawStaticLeftScreen() {
        const ctx = leftCtx;
        ctx.fillStyle = '#060E1A';
        ctx.fillRect(0, 0, 1024, 512);

        // Header
        ctx.fillStyle = '#00AAFF';
        ctx.fillRect(0, 0, 1024, 48);
        ctx.fillStyle = '#0A1628';
        ctx.font = 'bold 22px system-ui, sans-serif';
        ctx.fillText('POWER & PRECISION CRAC CLIMATE TELEMETRY (TIER-3 STANDARD)', 24, 32);

        // Section 1: Power Vault
        ctx.fillStyle = '#00FF88';
        ctx.font = 'bold 18px system-ui, sans-serif';
        ctx.fillText('1. ELECTRICAL POWER VAULT HEALTH', 30, 85);
        ctx.fillStyle = '#DDEEFF';
        ctx.font = '15px monospace';
        ctx.fillText('• Horizon High-Voltage Grid Feed: 415V 3-Phase STABLE (100%)', 40, 115);
        ctx.fillText('• N+1 Static UPS Battery Bank: 100% Float (45 Min Full Load Reserve)', 40, 140);
        ctx.fillText('• Standby Diesel Genset: AUTO-START STANDBY READY (Fuel: 94%)', 40, 165);
        ctx.fillText('• Automatic Transfer Switch (ATS): Redundant Dual Bus Active', 40, 190);

        // Section 2: CRAC Climate
        ctx.fillStyle = '#00FF88';
        ctx.font = 'bold 18px system-ui, sans-serif';
        ctx.fillText('2. COMPUTER ROOM AIR CONDITIONING (CRAC N+1)', 30, 240);
        ctx.fillStyle = '#DDEEFF';
        ctx.font = '15px monospace';
        ctx.fillText('• CRAC Units #1 - #4: ALL ACTIVE & EQUALIZED', 40, 270);
        ctx.fillText('• Cold Aisle Supply Temp: 21.2°C  (Target: 20-22°C)', 40, 295);
        ctx.fillText('• Hot Aisle Return Temp: 32.8°C  (Plenum Exhaust Normal)', 40, 320);
        ctx.fillText('• Relative Humidity: 46% RH      (ASHRAE Compliance: PASS)', 40, 345);

        // Section 3: Fire & Physical Security
        ctx.fillStyle = '#00FF88';
        ctx.font = 'bold 18px system-ui, sans-serif';
        ctx.fillText('3. PHYSICAL SECURITY & SUPPRESSION', 30, 395);
        ctx.fillStyle = '#DDEEFF';
        ctx.font = '15px monospace';
        ctx.fillText('• VESDA Laser Smoke Sampling: 0.00% Obscuration (NORMAL)', 40, 425);
        ctx.fillText('• Biometric Cold-Aisle Containment: 8 Doors Locked & Monitored', 40, 450);

        ctx.fillStyle = '#88AACC';
        ctx.font = 'italic 13px system-ui, sans-serif';
        ctx.fillText('[ILLUSTRATIVE ARCHITECTURAL TELEMETRY – UDYOGCLOUD FACILITY DEMO]', 30, 495);
        leftTex.needsUpdate = true;
    }

    function drawStaticRightScreen() {
        const ctx = rightCtx;
        ctx.fillStyle = '#060E1A';
        ctx.fillRect(0, 0, 1024, 512);

        // Header
        ctx.fillStyle = '#00AAFF';
        ctx.fillRect(0, 0, 1024, 48);
        ctx.fillStyle = '#0A1628';
        ctx.font = 'bold 22px system-ui, sans-serif';
        ctx.fillText('24/7 MANAGED CLOUD OPERATIONS & ENGINEERING QUEUE', 24, 32);

        // Content
        ctx.fillStyle = '#00FF88';
        ctx.font = 'bold 18px system-ui, sans-serif';
        ctx.fillText('MANAGED SERVICE STATUS FOR SMALL INDUSTRIES', 30, 85);

        ctx.fillStyle = '#DDEEFF';
        ctx.font = '15px monospace';
        ctx.fillText('• Active Escalation Tickets: 0 CRITICAL | 0 HIGH (All nominal)', 40, 120);
        ctx.fillText('• Proactive Kernel Live-Patching: Hardened Linux 9.4 LTS', 40, 150);
        ctx.fillText('• Automated Offsite Snapshots: 6/6 Customer Volumes Synced', 40, 180);
        ctx.fillText('• ZFS RAID-Z2 Storage Pools: 100% HEALTHY (0 Read/Write Errors)', 40, 210);

        ctx.fillStyle = '#00FF88';
        ctx.font = 'bold 18px system-ui, sans-serif';
        ctx.fillText('LIVE CONSULTATION DESK & ONBOARDING', 30, 260);

        ctx.fillStyle = '#DDEEFF';
        ctx.font = '15px monospace';
        ctx.fillText('• Active Studio: Senior Cloud Architect consulting Factory Owner', 40, 295);
        ctx.fillText('• Setup Model: Zero In-House DevOps or IT Staff Required by MSME', 40, 320);
        ctx.fillText('• Migration Support: Direct Phone/Desk Assistance Included', 40, 345);
        ctx.fillText('• Billing Metering: Pure pay-as-you-use monthly subscription', 40, 370);

        // Service Level
        ctx.fillStyle = '#00AAFF';
        ctx.fillRect(30, 410, 960, 45);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px system-ui, sans-serif';
        ctx.fillText('CORE VALUE: "Small industries do not build cloud management teams. UdyogCloud runs it."', 45, 438);

        ctx.fillStyle = '#88AACC';
        ctx.font = 'italic 13px system-ui, sans-serif';
        ctx.fillText('[ILLUSTRATIVE DEMONSTRATION DASHBOARD – PRD PART 8 & 9 ALIGNED]', 30, 495);
        rightTex.needsUpdate = true;
    }

    drawStaticLeftScreen();
    drawStaticRightScreen();

    // Data buffers for center animated sparkline
    const throughputHistory = [];
    for (let i = 0; i < 40; i++) {
        throughputHistory.push(24.5 + Math.sin(i * 0.4) * 2.8 + Math.random() * 1.2);
    }

    function renderCenterDashboard(tickTime) {
        const ctx = centerCtx;
        ctx.fillStyle = '#050D18';
        ctx.fillRect(0, 0, 1024, 512);

        // Header
        ctx.fillStyle = '#0066FF';
        ctx.fillRect(0, 0, 1024, 48);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 22px system-ui, sans-serif';
        ctx.fillText('UDYOGCLOUD 24/7 MANAGED OPERATIONS – 6 MSME TENANT CLUSTERS', 24, 32);

        // Subheader status pill
        ctx.fillStyle = '#00FF88';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('● ALL 6 INDUSTRIAL TENANTS ONLINE & HEALTHY', 680, 32);

        // Left Side: 6 Customer Industries Resource Utilization Gauges
        const tenants = [
            { name: '1. Automobile Mfg', cpu: 64 + Math.sin(tickTime + 1) * 4, ram: 58, stor: '1.4 TB' },
            { name: '2. Textile & Garment', cpu: 42 + Math.sin(tickTime + 2) * 3, ram: 36, stor: '840 GB' },
            { name: '3. Food Processing', cpu: 51 + Math.sin(tickTime + 3) * 5, ram: 48, stor: '450 GB' },
            { name: '4. Printing & Pkg', cpu: 78 + Math.sin(tickTime + 4) * 4, ram: 72, stor: '2.8 TB' },
            { name: '5. Wood Furniture', cpu: 38 + Math.sin(tickTime + 5) * 3, ram: 32, stor: '620 GB' },
            { name: '6. Wholesale Distr', cpu: 82 + Math.sin(tickTime + 6) * 5, ram: 79, stor: '3.4 TB' }
        ];

        ctx.fillStyle = '#00AAFF';
        ctx.font = 'bold 16px system-ui, sans-serif';
        ctx.fillText('TENANT RESOURCE WORKLOADS (vCPU / RAM / NVMe)', 30, 80);

        tenants.forEach((t, idx) => {
            const y = 110 + idx * 48;
            ctx.fillStyle = '#CCDDEE';
            ctx.font = '14px system-ui, sans-serif';
            ctx.fillText(t.name, 30, y);

            // Progress bar track
            ctx.fillStyle = '#102238';
            ctx.fillRect(180, y - 14, 240, 18);

            // Progress fill
            const fillW = (t.cpu / 100) * 240;
            ctx.fillStyle = t.cpu > 75 ? '#00AAFF' : '#00FF88';
            ctx.fillRect(180, y - 14, fillW, 18);

            // Metric label
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 12px monospace';
            ctx.fillText(`${Math.round(t.cpu)}% vCPU`, 430, y);
            ctx.fillStyle = '#88AACC';
            ctx.font = '12px monospace';
            ctx.fillText(`RAM: ${t.ram}% | NVMe: ${t.stor}`, 505, y);
        });

        // Right Side: Live Aggregate Network Throughput Graph
        ctx.fillStyle = '#00AAFF';
        ctx.font = 'bold 16px system-ui, sans-serif';
        ctx.fillText('REAL-TIME CAMPUS FIBER THROUGHPUT (Gbps)', 680, 80);

        // Chart area
        const chartX = 680, chartY = 100, chartW = 310, chartH = 200;
        ctx.fillStyle = '#081422';
        ctx.fillRect(chartX, chartY, chartW, chartH);
        ctx.strokeStyle = '#1E3A5F';
        ctx.strokeRect(chartX, chartY, chartW, chartH);

        // Grid lines
        ctx.strokeStyle = '#10243C';
        ctx.lineWidth = 1;
        for (let g = 1; g < 4; g++) {
            const gy = chartY + (g / 4) * chartH;
            ctx.beginPath();
            ctx.moveTo(chartX, gy);
            ctx.lineTo(chartX + chartW, gy);
            ctx.stroke();
        }

        // Throughput curve
        ctx.strokeStyle = '#00AAFF';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        throughputHistory.forEach((val, i) => {
            const px = chartX + (i / (throughputHistory.length - 1)) * chartW;
            const py = chartY + chartH - ((val - 15) / 20) * chartH;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        });
        ctx.stroke();

        // Throughput summary text
        const currentGbps = (throughputHistory[throughputHistory.length - 1]).toFixed(1);
        ctx.fillStyle = '#00FF88';
        ctx.font = 'bold 22px monospace';
        ctx.fillText(`${currentGbps} Gbps`, chartX + 15, chartY + 36);
        ctx.fillStyle = '#88AACC';
        ctx.font = '12px system-ui, sans-serif';
        ctx.fillText('Aggregate Bidirectional Flow (Uplink + Downlink)', chartX + 15, chartY + 56);

        // Bottom Disclaimer (Required by review guidelines)
        ctx.fillStyle = '#10243C';
        ctx.fillRect(24, 440, 976, 50);
        ctx.fillStyle = '#FFCC00';
        ctx.font = 'bold 13px system-ui, sans-serif';
        ctx.fillText('⚠ NOTE: ILLUSTRATIVE DEMONSTRATION TELEMETRY – SIMULATED CLOUD CLUSTER FOR COLLEGE EXHIBITION EVALUATION', 40, 470);

        centerTex.needsUpdate = true;
    }

    renderCenterDashboard(0);

    // 3 Curved Screen Meshes using the dynamic textures
    const centerMat = new THREE.MeshBasicMaterial({ map: centerTex });
    const leftMat = new THREE.MeshBasicMaterial({ map: leftTex });
    const rightMat = new THREE.MeshBasicMaterial({ map: rightTex });

    const centerScreen = new THREE.Mesh(new THREE.PlaneGeometry(10, 4.2), centerMat);
    centerScreen.position.set(0, 4.5, -od / 2 + 1.2);
    tagEquipment(centerScreen, {
        name: '24/7 Global NOC Command Video Wall',
        facility: 'Cloud Operations Center',
        role: 'Real-Time Infrastructure Observability',
        desc: 'Curved multi-display command video wall tracking live VM CPU/RAM utilization, disk latency, and tenant alerts.',
        connection: 'Continuously consumes streaming metrics from all 6 connected customer factory nodes.'
    });
    nocGroup.add(centerScreen);

    const leftScreen = new THREE.Mesh(new THREE.PlaneGeometry(8, 4.2), leftMat);
    leftScreen.position.set(-9.2, 4.5, -od / 2 + 2.4);
    leftScreen.rotation.y = 0.25;
    nocGroup.add(leftScreen);

    const rightScreen = new THREE.Mesh(new THREE.PlaneGeometry(8, 4.2), rightMat);
    rightScreen.position.set(9.2, 4.5, -od / 2 + 2.4);
    rightScreen.rotation.y = -0.25;
    nocGroup.add(rightScreen);

    // NOC Screen Labels
    const nocTitle = createTextPlane('24/7 GLOBAL NOC & CLOUD INFRASTRUCTURE HEALTH DASHBOARD', {
        worldW: 16,
        worldH: 0.9,
        fontSize: 26,
        bgColor: '#0A1628',
        color: '#FFFFFF',
        canvasW: 1024,
        canvasH: 64
    });
    nocTitle.position.set(0, 7.2, -od / 2 + 1.4);
    nocGroup.add(nocTitle);

    // Tier 1 Operator Consoles (Front row: 4 dual-monitor workstations)
    for (let i = 0; i < 4; i++) {
        const wx = -10.5 + i * 7.0;
        const ws = createWorkstation({ monitorCount: 2, deskW: 1.8 });
        ws.position.set(wx, 0, -2);
        tagEquipment(ws, {
            name: 'Cloud Operations Engineer Console',
            facility: 'Cloud Operations Center',
            role: 'Tier-1 & Tier-2 Systems Administration',
            desc: 'Workstation used by dedicated UdyogCloud engineers to monitor tenant clusters, execute rolling kernel patches, and tune databases.',
            connection: 'Direct SSH/API management gateway into KVM and Docker container orchestrators.'
        });
        nocGroup.add(ws);

        // Operator engineer
        const engColors = [0x0066FF, 0x0088CC, 0x1A2744, 0x0055AA];
        const engineer = createPerson({ shirtColor: engColors[i], pantsColor: 0x1A1A24 });
        engineer.position.set(wx, 0, -1.2);
        engineer.rotation.y = Math.PI;
        nocGroup.add(engineer);
    }

    // Tier 2 Senior Cloud Architects (Elevated rear row)
    const tier2Riser = new THREE.Mesh(
        new THREE.BoxGeometry(28, 0.4, 4),
        getMaterial('floor_tile')
    );
    tier2Riser.position.set(0, 0.2, 4);
    nocGroup.add(tier2Riser);

    for (let j = 0; j < 3; j++) {
        const wx = -8 + j * 8.0;
        const ws = createWorkstation({ monitorCount: 3, deskW: 2.2 });
        ws.position.set(wx, 0.4, 4);
        nocGroup.add(ws);

        const architect = createPerson({ shirtColor: 0x00AAFF, pantsColor: 0x222233 });
        architect.position.set(wx, 0.4, 4.8);
        architect.rotation.y = Math.PI;
        nocGroup.add(architect);
    }

    // Collaboration & Consultation Area (Cloud engineer assisting a customer)
    const consultTable = createDesk(2.4, 1.2, 0.75);
    consultTable.position.set(-11, 0, 7.5);
    nocGroup.add(consultTable);

    const chairCustomer = createChair();
    chairCustomer.position.set(-11, 0, 8.4);
    nocGroup.add(chairCustomer);

    const chairEngineer = createChair();
    chairEngineer.position.set(-11, 0, 6.6);
    chairEngineer.rotation.y = Math.PI;
    nocGroup.add(chairEngineer);

    // Customer figure (white/grey formal shirt)
    const customerPerson = createPerson({ shirtColor: 0xDDDDDD, pantsColor: 0x333344 });
    customerPerson.position.set(-11, 0, 8.5);
    nocGroup.add(customerPerson);

    // Dedicated Cloud Engineer assisting customer
    const supportLead = createPerson({ shirtColor: 0x0066FF, pantsColor: 0x111122 });
    supportLead.position.set(-11, 0, 6.4);
    supportLead.rotation.y = Math.PI;
    nocGroup.add(supportLead);

    // Laptop on consultation desk
    const laptop = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.02, 0.25),
        getMaterial('metal_dark')
    );
    laptop.position.set(-11, 0.78, 7.5);
    nocGroup.add(laptop);

    const laptopScreen = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.25, 0.02),
        getMaterial('screen')
    );
    laptopScreen.position.set(-11, 0.9, 7.38);
    nocGroup.add(laptopScreen);

    // Differentiating Feature Banner
    const diffBanner = createInfoPanel([
        'UDYOGCLOUD MANAGED OPERATIONS PILLAR',
        'NO IN-HOUSE IT TEAM REQUIRED FOR SMALL INDUSTRIES',
        '• Direct Hands-on Cloud Architect Consultation',
        '• Automated OS Patching & Database Maintenance',
        '• Proactive 24/7 Security & Performance Alerting',
        '• Rapid Escalation to Senior Linux & Container Engineers'
    ], {
        worldW: 9.5,
        worldH: 3.8,
        titleColor: '#00AAFF',
        textColor: '#FFFFFF',
        bgColor: 'rgba(10, 22, 40, 0.95)',
        fontSize: 22,
        titleSize: 26,
        canvasW: 1024,
        canvasH: 380
    });
    diffBanner.position.set(10.5, 3.2, 7.5);
    diffBanner.rotation.y = -Math.PI / 4;
    nocGroup.add(diffBanner);

    // NOC Ceiling downlights
    for (let lx = -12; lx <= 12; lx += 6) {
        const spot = new THREE.PointLight(0x00aaff, 1.0, 15, 1.2);
        spot.position.set(lx, 6.5, 0);
        nocGroup.add(spot);
    }

    opsBldg.add(nocGroup);
    opsGroup.add(opsBldg);

    // ─────────────────────────────────────────────────────────────
    // 2. CUSTOMER BUSINESS OFFICE & ONBOARDING FACILITY
    // ─────────────────────────────────────────────────────────────
    const custPos = LAYOUT.CUSTOMER_OFFICE; // (80, 0, 40)
    const { w: cw, h: ch, d: cd } = BUILDING_SIZES.CUSTOMER_OFFICE; // 22, 10, 15

    const custBldg = new THREE.Group();
    custBldg.name = 'Building_CustomerOffice';
    custBldg.position.copy(custPos);

    // Plinth
    const custPlinth = new THREE.Mesh(
        new THREE.BoxGeometry(cw + 1.5, 0.5, cd + 1.5),
        getMaterial('concrete_dark')
    );
    custPlinth.position.y = 0.25;
    custBldg.add(custPlinth);

    // Floor
    const custFloor = new THREE.Mesh(
        new THREE.BoxGeometry(cw, 0.2, cd),
        getMaterial('floor_tile')
    );
    custFloor.position.y = 0.6;
    custBldg.add(custFloor);

    // Walls
    const custBackWall = new THREE.Mesh(
        new THREE.BoxGeometry(cw, ch, wallThick),
        getMaterial('navy')
    );
    custBackWall.position.set(0, ch / 2 + 0.5, -cd / 2);
    custBldg.add(custBackWall);

    const custLeftWall = new THREE.Mesh(
        new THREE.BoxGeometry(wallThick, ch, cd),
        getMaterial('concrete_light')
    );
    custLeftWall.position.set(-cw / 2, ch / 2 + 0.5, 0);
    custBldg.add(custLeftWall);

    const custRightWall = new THREE.Mesh(
        new THREE.BoxGeometry(wallThick, ch, cd),
        getMaterial('concrete_light')
    );
    custRightWall.position.set(cw / 2, ch / 2 + 0.5, 0);
    custBldg.add(custRightWall);

    // Glass front
    const custGlass = new THREE.Mesh(
        new THREE.PlaneGeometry(cw - 2, ch - 1),
        new THREE.MeshStandardMaterial({
            color: 0x99ccff,
            transparent: true,
            opacity: 0.3,
            roughness: 0.1,
            metalness: 0.1,
            side: THREE.DoubleSide
        })
    );
    custGlass.position.set(0, ch / 2 + 0.5, cd / 2 - 0.05);
    custBldg.add(custGlass);

    // Roof Assembly Group (for clean individual interior cutaway)
    const custRoofGroup = new THREE.Group();
    custRoofGroup.name = 'CustomerOffice_RoofGroup';

    // Roof
    const custRoof = new THREE.Mesh(
        new THREE.BoxGeometry(cw + 1, 0.4, cd + 1),
        getMaterial('metal_dark')
    );
    custRoof.position.y = ch + 0.7;
    custRoofGroup.add(custRoof);

    // Marquee Sign
    const custSign = createTextPlane('CUSTOMER EXPERIENCE & ONBOARDING CENTER', {
        worldW: 16,
        worldH: 1.5,
        fontSize: 28,
        bgColor: '#0066FF',
        color: '#FFFFFF',
        canvasW: 1024,
        canvasH: 128
    });
    custSign.position.set(0, ch + 1.4, cd / 2 + 0.2);
    custRoofGroup.add(custSign);
    custBldg.add(custRoofGroup);

    registerFacilityShell('registration', {
        id: 'registration',
        roofGroup: custRoofGroup,
        frontGlass: custGlass,
        frontWalls: []
    });

    // ─────────────────────────────────────────────────────────────
    // 3. COMPLETE 7-STEP CUSTOMER JOURNEY EXHIBIT (PART 8)
    // ─────────────────────────────────────────────────────────────
    const journeyPanel = createInfoPanel([
        'THE UDYOGCLOUD 7-STEP ONBOARDING JOURNEY',
        '1. REGISTRATION: 2-minute web portal signup with zero upfront setup fees',
        '2. RESOURCE SELECTION: Tailored compute, storage & database tiers',
        '3. PRO CONFIGURATION: UdyogCloud engineers configure network & KVM',
        '4. DATA MIGRATION: Seamless transfer of existing files, Tally & DBs',
        '5. APP ACCESS: Workers access secure ERP/invoicing from any device',
        '6. MONITORING: Real-time telemetry on resource consumption',
        '7. BILLING: Transparent, pay-as-you-use monthly invoices'
    ], {
        worldW: 16,
        worldH: 4.8,
        titleColor: '#00FF88',
        textColor: '#FFFFFF',
        bgColor: 'rgba(10, 22, 40, 0.95)',
        fontSize: 22,
        titleSize: 28,
        canvasW: 1024,
        canvasH: 420
    });
    journeyPanel.position.set(0, 4.2, -cd / 2 + 0.8);
    tagEquipment(journeyPanel, {
        name: 'UdyogCloud 7-Step Onboarding Blueprint',
        facility: 'Customer Registration Center',
        role: 'Turnkey Cloud Adoption Roadmap',
        desc: 'Visual SOP guiding factory owners from initial data audit to live production cutover with zero downtime.',
        connection: 'Managed directly by assigned UdyogCloud cloud architects.'
    });
    custBldg.add(journeyPanel);

    // Customer Onboarding Kiosks
    for (let k = -2; k <= 2; k += 2) {
        const kiosk = new THREE.Group();
        kiosk.position.set(k * 3.5, 0.7, 0);

        const desk = createDesk(1.4, 0.8, 0.8);
        kiosk.add(desk);

        const mon = createLargeDisplay(1.2, 0.8, COLORS.SCREEN_GLOW);
        mon.position.set(0, 1.4, -0.3);
        kiosk.add(mon);

        const chair = createChair();
        chair.position.set(0, 0, 0.6);
        kiosk.add(chair);

        const cust = createPerson({ shirtColor: 0x3388CC, pantsColor: 0x222233 });
        cust.position.set(0, 0, 0.6);
        kiosk.add(cust);

        tagEquipment(kiosk, {
            name: 'Interactive Customer Onboarding Kiosk',
            facility: 'Customer Registration Center',
            role: 'Self-Service Resource Configuration',
            desc: 'Allows factory owners to select compute, memory, and database tiers without dealing with cloud jargon.',
            connection: 'Directly triggers automated KVM virtual machine provisioning in the central data center.'
        });

        custBldg.add(kiosk);
    }

    opsGroup.add(custBldg);

    // ─────────────────────────────────────────────────────────────
    // 4. COMPETITIVE POSITIONING PLAZA: AWS, AZURE & UDYOGCLOUD (PART 9)
    // Positioned outdoors in the plaza between Ops and Customer Office
    // ─────────────────────────────────────────────────────────────
    const compPlaza = new THREE.Group();
    compPlaza.name = 'Competitive_Comparison_Exhibit';
    compPlaza.position.set(80, 0, 10); // Between the two buildings

    // Plaza base slab
    const plazaSlab = new THREE.Mesh(
        new THREE.BoxGeometry(22, 0.2, 14),
        getMaterial('concrete_light')
    );
    plazaSlab.position.y = 0.1;
    compPlaza.add(plazaSlab);

    // Central Comparison Billboard
    const compBillboard = createInfoPanel([
        'COMPETITIVE POSITIONING: HYPERSCALERS VS UDYOGCLOUD',
        'AWS & AZURE: World-class global hyperscalers serving all enterprise tiers',
        '• Comprehensive feature sets but high configuration complexity for small units',
        '• Requires dedicated certified DevOps/cloud engineers on customer payroll',
        '───────────────────────────────────────────────────────────────',
        'UDYOGCLOUD: Dedicated Cloud Infrastructure for Small-Scale Industries',
        '✓ Right-sized packages with zero enterprise bloat',
        '✓ Fully managed by UdyogCloud engineers – no IT hire needed',
        '✓ Simple, predictable pay-as-you-use billing with local Indian support'
    ], {
        worldW: 18,
        worldH: 6.2,
        titleColor: '#00AAFF',
        textColor: '#FFFFFF',
        bgColor: 'rgba(10, 22, 40, 0.96)',
        fontSize: 22,
        titleSize: 28,
        canvasW: 1024,
        canvasH: 512
    });
    compBillboard.position.set(0, 4.2, 0);
    compPlaza.add(compBillboard);

    // Pillar supports for comparison billboard
    const pMat = getMaterial('metal');
    [-7, 7].forEach(px => {
        const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4.2, 0.4), pMat);
        pillar.position.set(px, 2.1, 0);
        compPlaza.add(pillar);
    });

    opsGroup.add(compPlaza);

    // Dynamic NOC Telemetry update hook & IoT Pulse Synchronization
    let opsTick = 0;
    let nextChartStep = 0;
    let pulseBlipBoost = 0;

    opsGroup.recordTelemetryPulse = function() {
        pulseBlipBoost = 4.2; // Temporary spike in throughput chart
    };
    window.UdyogCloudOps = opsGroup;

    opsGroup.update = function(delta) {
        opsTick += delta;
        nextChartStep += delta;
        if (nextChartStep > 0.15) { // update every 150ms for smooth 60fps performance
            nextChartStep = 0;
            const currentBoost = pulseBlipBoost;
            pulseBlipBoost = Math.max(0, pulseBlipBoost - 1.2);

            const nextVal = 24.5 + Math.sin(opsTick * 0.8) * 3.2 + Math.random() * 1.5 + currentBoost;
            throughputHistory.shift();
            throughputHistory.push(nextVal);
            renderCenterDashboard(opsTick);
        }
    };

    return opsGroup;
}
