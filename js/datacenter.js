// ═══════════════════════════════════════════════════════════════
// js/datacenter.js – Central UdyogCloud Enterprise Data Center
// Main Showcase Facility: Full architecture, server hall, cooling,
// power infrastructure, virtualization & container displays
// ═══════════════════════════════════════════════════════════════
import * as THREE from 'three';
import {
    COLORS, LAYOUT, BUILDING_SIZES, getMaterial,
    createTextPlane, createInfoPanel, createLargeDisplay,
    createServerRack, createWorkstation, createPerson,
    registerFacilityShell, tagEquipment
} from './utils.js';

export function createDataCenter() {
    const dcGroup = new THREE.Group();
    dcGroup.name = 'DataCenter_Central';
    dcGroup.position.copy(LAYOUT.DATACENTER);

    const { w, h, d } = BUILDING_SIZES.DATACENTER; // w: 50, h: 18, d: 30

    // ─────────────────────────────────────────────────────────────
    // 1. ARCHITECTURAL PLINTH & FOUNDATION
    // ─────────────────────────────────────────────────────────────
    const plinthH = 1.0;
    const plinthGeo = new THREE.BoxGeometry(w + 4, plinthH, d + 4);
    const plinthMat = getMaterial('concrete_dark');
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = plinthH / 2;
    plinth.receiveShadow = true;
    dcGroup.add(plinth);

    // Front access steps & accessibility ramp
    const stepsW = 10, stepsD = 4, stepsH = plinthH;
    const stepsGeo = new THREE.BoxGeometry(stepsW, stepsH, stepsD);
    const steps = new THREE.Mesh(stepsGeo, getMaterial('concrete_light'));
    steps.position.set(0, stepsH / 2, (d + 4) / 2 + stepsD / 2 - 0.2);
    dcGroup.add(steps);

    // ─────────────────────────────────────────────────────────────
    // 2. STRUCTURAL STEEL SKELETON & GLASS CURTAIN WALLS
    // ─────────────────────────────────────────────────────────────
    // Floor of the server room (y = 1.0)
    const floorGeo = new THREE.BoxGeometry(w, 0.2, d);
    const floor = new THREE.Mesh(floorGeo, getMaterial('floor_tile'));
    floor.position.y = plinthH + 0.1;
    floor.receiveShadow = true;
    dcGroup.add(floor);

    // Roof Assembly Group (for clean individual interior cutaway)
    const dcRoofGroup = new THREE.Group();
    dcRoofGroup.name = 'DataCenter_RoofGroup';

    const roofH = 0.5;
    const roofGeo = new THREE.BoxGeometry(w + 1.2, roofH, d + 1.2);
    const roof = new THREE.Mesh(roofGeo, getMaterial('metal_dark'));
    roof.position.y = plinthH + h + roofH / 2;
    roof.castShadow = true;
    dcRoofGroup.add(roof);

    // Roof parapet
    const parapetGeo = new THREE.BoxGeometry(w + 1.4, 0.8, d + 1.4);
    const parapet = new THREE.Mesh(parapetGeo, getMaterial('navy'));
    parapet.position.y = plinthH + h + roofH + 0.4;
    dcRoofGroup.add(parapet);

    // Structural columns (heavy steel box girders along exterior)
    const colGeo = new THREE.BoxGeometry(0.8, h, 0.8);
    const colMat = getMaterial('metal');
    const colSpacingX = w / 6;
    for (let i = 0; i <= 6; i++) {
        const x = -w / 2 + i * colSpacingX;
        // Front column
        const colF = new THREE.Mesh(colGeo, colMat);
        colF.position.set(x, plinthH + h / 2, d / 2);
        dcGroup.add(colF);

        // Back column
        const colB = new THREE.Mesh(colGeo, colMat);
        colB.position.set(x, plinthH + h / 2, -d / 2);
        dcGroup.add(colB);
    }

    const colSpacingZ = d / 4;
    for (let j = 0; j <= 4; j++) {
        const z = -d / 2 + j * colSpacingZ;
        const colL = new THREE.Mesh(colGeo, colMat);
        colL.position.set(-w / 2, plinthH + h / 2, z);
        dcGroup.add(colL);

        const colR = new THREE.Mesh(colGeo, colMat);
        colR.position.set(w / 2, plinthH + h / 2, z);
        dcGroup.add(colR);
    }

    // Horizontal structural spandrels
    const spandrelH = 0.5;
    const frontSpandrel1 = new THREE.Mesh(new THREE.BoxGeometry(w, spandrelH, 0.4), getMaterial('navy'));
    frontSpandrel1.position.set(0, plinthH + h * 0.35, d / 2 + 0.1);
    dcGroup.add(frontSpandrel1);

    const frontSpandrel2 = new THREE.Mesh(new THREE.BoxGeometry(w, spandrelH, 0.4), getMaterial('navy'));
    frontSpandrel2.position.set(0, plinthH + h * 0.7, d / 2 + 0.1);
    dcGroup.add(frontSpandrel2);

    // Blue architectural glowing LED strip on building crown
    const crownStripGeo = new THREE.BoxGeometry(w + 1.6, 0.18, d + 1.6);
    const crownStrip = new THREE.Mesh(crownStripGeo, getMaterial('led_blue'));
    crownStrip.position.y = plinthH + h + roofH + 0.85;
    dcRoofGroup.add(crownStrip);

    // Glass curtain walls: Front facade with physical transmission to reveal interior
    const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0x88ccff,
        roughness: 0.08,
        metalness: 0.15,
        transmission: 0.88,
        ior: 1.5,
        thickness: 0.6,
        transparent: true,
        opacity: 1.0,
        side: THREE.DoubleSide
    });

    const frontGlass = new THREE.Mesh(new THREE.PlaneGeometry(w - 1, h - 0.5), glassMat);
    frontGlass.position.set(0, plinthH + h / 2, d / 2 - 0.05);
    dcGroup.add(frontGlass);

    registerFacilityShell('datacenter', {
        id: 'datacenter',
        roofGroup: dcRoofGroup,
        frontGlass: frontGlass,
        frontWalls: []
    });

    // Architectural Vertical Solar Louvers on Front Glazing
    const louverMat = getMaterial('metal');
    const louverGeo = new THREE.BoxGeometry(0.08, h - 1, 0.45);
    for (let lx = -w / 2 + 2; lx <= w / 2 - 2; lx += 2.2) {
        if (Math.abs(lx) < 4.5) continue; // Clear entrance portal view
        const louver = new THREE.Mesh(louverGeo, louverMat);
        louver.position.set(lx, plinthH + h / 2, d / 2 + 0.22);
        dcGroup.add(louver);
    }

    // Left, right, and back tinted/translucent walls
    const sideGlassMat = new THREE.MeshStandardMaterial({
        color: 0x224466,
        roughness: 0.2,
        metalness: 0.5,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
    });

    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(w, h), getMaterial('concrete_dark'));
    backWall.position.set(0, plinthH + h / 2, -d / 2 + 0.1);
    dcGroup.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(d, h), sideGlassMat);
    leftWall.position.set(-w / 2 + 0.1, plinthH + h / 2, 0);
    leftWall.rotation.y = Math.PI / 2;
    dcGroup.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(d, h), sideGlassMat);
    rightWall.position.set(w / 2 - 0.1, plinthH + h / 2, 0);
    rightWall.rotation.y = -Math.PI / 2;
    dcGroup.add(rightWall);

    // ─────────────────────────────────────────────────────────────
    // 2b. EXTERIOR CRITICAL INFRASTRUCTURE YARDS (TIER-3 REDUNDANCY)
    // ─────────────────────────────────────────────────────────────
    // A. WEST FLANK: CENTRAL LIQUID CHILLER & COOLING TOWER YARD
    const chillerYard = new THREE.Group();
    chillerYard.name = 'Chiller_Cooling_Yard';
    chillerYard.position.set(-w / 2 - 8, 0, 0);

    const cyPad = new THREE.Mesh(
        new THREE.BoxGeometry(12, 0.25, 22),
        getMaterial('concrete')
    );
    cyPad.position.y = 0.12;
    cyPad.receiveShadow = true;
    chillerYard.add(cyPad);

    // 2 Industrial Centrifugal Liquid Chillers
    for (let c = -1; c <= 1; c += 2) {
        const ch = new THREE.Group();
        ch.position.set(2.5, 0.25, c * 6.5);
        // Compressor body
        const chBody = new THREE.Mesh(new THREE.BoxGeometry(4.8, 2.4, 2.2), getMaterial('metal_light'));
        chBody.position.y = 1.2;
        ch.add(chBody);
        // Condenser barrel
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 4.6, 12), getMaterial('peb_blue'));
        barrel.rotation.z = Math.PI / 2;
        barrel.position.y = 2.4;
        ch.add(barrel);
        chillerYard.add(ch);
    }

    // 2 Induced Draft Cooling Towers
    for (let t = -1; t <= 1; t += 2) {
        const ct = new THREE.Group();
        ct.position.set(-2.5, 0.25, t * 6.5);
        const ctBox = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.8, 4.2), getMaterial('concrete_light'));
        ctBox.position.y = 1.9;
        ct.add(ctBox);
        // Fan Cowl
        const cowl = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 0.8, 16), getMaterial('metal_dark'));
        cowl.position.y = 4.2;
        ct.add(cowl);
        chillerYard.add(ct);
    }

    // Acoustic louver screening wall surrounding chiller yard
    const screenWallMat = getMaterial('metal');
    const screenGeo = new THREE.BoxGeometry(0.2, 3.2, 22);
    const screenW = new THREE.Mesh(screenGeo, screenWallMat);
    screenW.position.set(-6, 1.6, 0);
    chillerYard.add(screenW);

    // Blue chilled-water pipe bridge entering DC wall
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x0066FF, roughness: 0.3, metalness: 0.7 });
    for (let py of [2.2, 3.0]) {
        const pBridge = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 8, 8), pipeMat);
        pBridge.rotation.z = Math.PI / 2;
        pBridge.position.set(4, py, 0);
        chillerYard.add(pBridge);
    }
    dcGroup.add(chillerYard);

    // B. NORTH REAR: EMERGENCY STANDBY DIESEL GENERATOR FARM
    const genFarm = new THREE.Group();
    genFarm.name = 'Generator_Farm';
    genFarm.position.set(0, 0, -d / 2 - 8);

    const genPad = new THREE.Mesh(new THREE.BoxGeometry(26, 0.25, 10), getMaterial('concrete'));
    genPad.position.y = 0.12;
    genPad.receiveShadow = true;
    genFarm.add(genPad);

    // 2 Sound-Attenuated 2000kVA Generator Enclosures
    [-6.5, 6.5].forEach(gx => {
        const gen = new THREE.Group();
        gen.position.set(gx, 0.25, 0);
        const gBox = new THREE.Mesh(new THREE.BoxGeometry(6.5, 3.2, 2.8), getMaterial('yellow_safety'));
        gBox.position.y = 1.6;
        gen.add(gBox);
        // Vertical exhaust silencer stack
        const silencer = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 4.5, 8), getMaterial('metal_light'));
        silencer.position.set(2.2, 4.5, 0);
        gen.add(silencer);
        genFarm.add(gen);
    });

    // Bunded diesel fuel tank
    const fuelTank = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 5.0, 16), getMaterial('concrete_dark'));
    fuelTank.rotation.z = Math.PI / 2;
    fuelTank.position.set(0, 1.25, 3.5);
    genFarm.add(fuelTank);

    dcGroup.add(genFarm);

    // C. EAST FLANK: HIGH-VOLTAGE SUBSTATION YARD
    const subYard = new THREE.Group();
    subYard.name = 'Substation_Yard';
    subYard.position.set(w / 2 + 8, 0, 0);

    const subGravel = new THREE.Mesh(new THREE.BoxGeometry(12, 0.1, 22), getMaterial('concrete_dark'));
    subGravel.position.y = 0.05;
    subYard.add(subGravel);

    // 2 Step-down transformers with cooling radiator fins
    for (let tz of [-6, 6]) {
        const trans = new THREE.Group();
        trans.position.set(0, 0.1, tz);
        const tCore = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.0, 2.4), getMaterial('peb_grey'));
        tCore.position.y = 1.5;
        trans.add(tCore);
        // Radiator cooling fins
        for (let fx of [-1.8, 1.8]) {
            const fin = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.4, 2.2), getMaterial('metal'));
            fin.position.set(fx, 1.5, 0);
            trans.add(fin);
        }
        // High-voltage ceramic bushings
        [-0.8, 0, 0.8].forEach(bx => {
            const bush = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 1.2, 6), getMaterial('metal_light'));
            bush.position.set(bx, 3.6, 0);
            trans.add(bush);
        });
        subYard.add(trans);
    }

    // High-voltage lightning arrestor mast
    const lightningMast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 14, 6), getMaterial('metal'));
    lightningMast.position.set(0, 7, -9);
    subYard.add(lightningMast);

    dcGroup.add(subYard);

    // ─────────────────────────────────────────────────────────────
    // 2c. FLANKING ARCHITECTURAL ANNEX WINGS (Expands DC from 50m to 68m width)
    // ─────────────────────────────────────────────────────────────
    const wingMat = getMaterial('concrete_dark');
    const wingGlassMat = getMaterial('glass_dark');
    [-w / 2 - 4.5, w / 2 + 4.5].forEach((wx, idx) => {
        const wing = new THREE.Group();
        wing.position.set(wx, 0, 0);
        // 2-story wing block
        const wingBody = new THREE.Mesh(new THREE.BoxGeometry(9.0, 10.0, d - 4), wingMat);
        wingBody.position.y = 5.0;
        wing.add(wingBody);
        // Wing decorative roof coping
        const wingLouver = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.35, d - 3.8), getMaterial('metal'));
        wingLouver.position.y = 10.15;
        wing.add(wingLouver);
        // Ribbon windows
        const wWin = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.8, d - 8), wingGlassMat);
        wWin.position.set(idx === 0 ? -4.51 : 4.51, 6.0, 0);
        wing.add(wWin);
        dcGroup.add(wing);
    });

    // Elevated Central Architectural Crown Tower (Raises DC height to 22.5m)
    const crownTowerH = 4.2;
    const crownTower = new THREE.Mesh(
        new THREE.BoxGeometry(28, crownTowerH, 16),
        getMaterial('navy')
    );
    crownTower.position.set(0, plinthH + h + roofH + crownTowerH / 2, 0);
    dcRoofGroup.add(crownTower);

    // Glowing cyan accent line on the elevated crown
    const crownGlowStrip = new THREE.Mesh(
        new THREE.BoxGeometry(28.2, 0.15, 16.2),
        getMaterial('led_blue')
    );
    crownGlowStrip.position.set(0, plinthH + h + roofH + crownTowerH + 0.08, 0);
    dcRoofGroup.add(crownGlowStrip);

    // ─────────────────────────────────────────────────────────────
    // 3. BRANDING & HERO SIGNAGE
    // ─────────────────────────────────────────────────────────────
    // Main UDYOGCLOUD marquee on elevated crown fascia
    const mainBrandSign = createTextPlane('UDYOGCLOUD', {
        worldW: 24,
        worldH: 3.8,
        fontSize: 76,
        bgColor: '#0A1628',
        color: '#00AAFF',
        canvasW: 1024,
        canvasH: 256
    });
    mainBrandSign.position.set(0, plinthH + h + roofH + crownTowerH / 2 + 0.4, 8.2);
    dcRoofGroup.add(mainBrandSign);

    // Sub-brand tagline
    const taglineSign = createTextPlane('Enterprise Cloud Infrastructure for Small Industries', {
        worldW: 26,
        worldH: 1.6,
        fontSize: 34,
        bgColor: '#0066FF',
        color: '#FFFFFF',
        canvasW: 1024,
        canvasH: 128
    });
    taglineSign.position.set(0, plinthH + h + 0.2, d / 2 + 0.5);
    dcRoofGroup.add(taglineSign);

    // Add roof group to datacenter
    dcGroup.add(dcRoofGroup);

    // Entrance Lobby Portal
    const portalW = 8, portalH = 4.5, portalD = 1.2;
    const portal = new THREE.Mesh(new THREE.BoxGeometry(portalW, portalH, portalD), getMaterial('navy'));
    portal.position.set(0, plinthH + portalH / 2, d / 2 + portalD / 2);
    dcGroup.add(portal);

    const doorSign = createTextPlane('ENTERPRISE DATA CENTER - NOC ACCESS ONLY', {
        worldW: 6.5,
        worldH: 0.6,
        fontSize: 24,
        bgColor: '#112233',
        color: '#00FF88',
        canvasW: 512,
        canvasH: 64
    });
    doorSign.position.set(0, plinthH + portalH - 0.4, d / 2 + portalD + 0.02);
    dcGroup.add(doorSign);

    // ─────────────────────────────────────────────────────────────
    // 4. RAISED SERVER FLOOR & PEDESTALS
    // ─────────────────────────────────────────────────────────────
    const serverHallGroup = new THREE.Group();
    serverHallGroup.name = 'ServerHall_Interior';

    const raisedFloorH = 0.4;
    const raisedFloorY = plinthH + raisedFloorH; // y = 1.4

    // Under-floor support pedestals grid (visible through cutaway/clear tiles)
    const pedGeo = new THREE.CylinderGeometry(0.04, 0.04, raisedFloorH, 6);
    const pedMat = getMaterial('metal');
    for (let px = -18; px <= 18; px += 6) {
        for (let pz = -10; pz <= 8; pz += 4.5) {
            const ped = new THREE.Mesh(pedGeo, pedMat);
            ped.position.set(px, plinthH + raisedFloorH / 2, pz);
            serverHallGroup.add(ped);
        }
    }

    // Top finished raised floor surface
    const rfMesh = new THREE.Mesh(
        new THREE.BoxGeometry(w - 2, 0.08, d - 2),
        new THREE.MeshStandardMaterial({
            color: 0x1e242d,
            roughness: 0.6,
            metalness: 0.3
        })
    );
    rfMesh.position.y = raisedFloorY;
    rfMesh.receiveShadow = true;
    serverHallGroup.add(rfMesh);

    // Cold Aisle / Hot Aisle floor boundary lines
    const lineMat = getMaterial('yellow_safety');
    for (let rz of [-7, -2.5, 2, 6.5]) {
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(36, 0.01, 0.15), lineMat);
        stripe.position.set(0, raisedFloorY + 0.045, rz);
        serverHallGroup.add(stripe);
    }

    // ─────────────────────────────────────────────────────────────
    // 5. PHASE C: SPECIALIZED SERVER RACKS, ACTIVE LEDS & COLD AISLE DOORS
    // ─────────────────────────────────────────────────────────────
    const rackRowsZ = [-7, -2.5, 2, 6.5]; // 4 rows
    const racksPerRow = 7;
    const rackStartX = -15;
    const rackSpacingX = 5.0;

    const allRacks = [];
    const dynamicLEDMaterials = [];

    // Helper: Create dynamic blinking LED material
    function createBlinkingLEDMaterial(colorHex) {
        const mat = new THREE.MeshStandardMaterial({
            color: colorHex,
            emissive: colorHex,
            emissiveIntensity: 0.85,
            roughness: 0.2
        });
        dynamicLEDMaterials.push({
            mat: mat,
            baseColor: colorHex,
            freq: 1.5 + Math.random() * 3.5,
            phase: Math.random() * Math.PI * 2
        });
        return mat;
    }

    // Helper: Compute Blade Server Rack
    function createBladeComputeRack() {
        const g = new THREE.Group();
        const cabMat = getMaterial('metal_dark');
        const bladeMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, metalness: 0.6, roughness: 0.4 });
        const handleMat = getMaterial('metal');

        // Cabinet frame
        const cab = new THREE.Mesh(new THREE.BoxGeometry(0.85, 2.4, 1.15), cabMat);
        cab.position.y = 1.2;
        g.add(cab);

        // 4 Blade chassis enclosures
        for (let c = 0; c < 4; c++) {
            const cy = 0.35 + c * 0.55;
            const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.48, 1.1), bladeMat);
            chassis.position.set(0, cy, 0.02);
            g.add(chassis);

            // 6 Vertical blade sleds per chassis
            for (let b = 0; b < 6; b++) {
                const bx = -0.32 + b * 0.128;
                const handle = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.38, 0.04), handleMat);
                handle.position.set(bx, cy, 0.58);
                g.add(handle);

                // Compute activity LEDs (Cyan/Blue)
                const led = new THREE.Mesh(
                    new THREE.BoxGeometry(0.015, 0.015, 0.01),
                    createBlinkingLEDMaterial(0x00AAFF)
                );
                led.position.set(bx, cy + 0.15, 0.585);
                g.add(led);
            }
        }
        return g;
    }

    // Helper: High-Density Storage SAN/NAS Array Rack
    function createStorageSanRack() {
        const g = new THREE.Group();
        const cabMat = getMaterial('metal_dark');
        const diskShelfMat = new THREE.MeshStandardMaterial({ color: 0x1E242B, metalness: 0.5, roughness: 0.4 });
        const caddyMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 });

        const cab = new THREE.Mesh(new THREE.BoxGeometry(0.85, 2.4, 1.15), cabMat);
        cab.position.y = 1.2;
        g.add(cab);

        // 4 High-density disk shelves
        for (let s = 0; s < 4; s++) {
            const sy = 0.35 + s * 0.55;
            const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.48, 1.1), diskShelfMat);
            shelf.position.set(0, sy, 0.02);
            g.add(shelf);

            // 12 Drive caddies per shelf with green/amber read-write activity LEDs
            for (let d = 0; d < 12; d++) {
                const dx = -0.32 + (d % 6) * 0.128;
                const dy = sy + (d < 6 ? 0.12 : -0.12);

                const caddy = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.18, 0.02), caddyMat);
                caddy.position.set(dx, dy, 0.58);
                g.add(caddy);

                const ledColor = (s + d) % 4 === 0 ? 0xFFAA00 : 0x00FF88;
                const led = new THREE.Mesh(
                    new THREE.BoxGeometry(0.015, 0.015, 0.01),
                    createBlinkingLEDMaterial(ledColor)
                );
                led.position.set(dx + 0.035, dy, 0.585);
                g.add(led);
            }
        }
        return g;
    }

    // Helper: Network Core & Fiber Patch Rack
    function createNetworkCoreRack() {
        const g = new THREE.Group();
        const cabMat = getMaterial('metal_dark');
        const switchMat = new THREE.MeshStandardMaterial({ color: 0x0F172A, metalness: 0.8, roughness: 0.2 });

        const cab = new THREE.Mesh(new THREE.BoxGeometry(0.85, 2.4, 1.15), cabMat);
        cab.position.y = 1.2;
        g.add(cab);

        // 6 Top-of-rack aggregation switch units
        for (let sw = 0; sw < 6; sw++) {
            const swY = 0.3 + sw * 0.36;
            const switchUnit = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.28, 1.1), switchMat);
            switchUnit.position.set(0, swY, 0.02);
            g.add(switchUnit);

            // Dense fiber port cluster strip
            const portStrip = new THREE.Mesh(
                new THREE.BoxGeometry(0.72, 0.06, 0.02),
                createBlinkingLEDMaterial(0x00FF66)
            );
            portStrip.position.set(0, swY, 0.58);
            g.add(portStrip);

            // Cascading colorful fiber patch cables (Yellow single-mode & Cyan OM4)
            const fiberMat = new THREE.MeshBasicMaterial({ color: (sw % 2 === 0 ? 0xFFDD00 : 0x00E5FF) });
            const patchCurve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(-0.25, swY, 0.585),
                new THREE.Vector3(-0.15, swY - 0.12, 0.65),
                new THREE.Vector3(0.2, swY + 0.08, 0.585)
            ]);
            const patchGeo = new THREE.TubeGeometry(patchCurve, 10, 0.008, 4, false);
            g.add(new THREE.Mesh(patchGeo, fiberMat));
        }
        return g;
    }

    // Helper: Microservices & KVM Virtualization Rack
    function createMicroservicesRack() {
        const g = new THREE.Group();
        const cabMat = getMaterial('metal_dark');
        const serverMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, metalness: 0.6, roughness: 0.35 });

        const cab = new THREE.Mesh(new THREE.BoxGeometry(0.85, 2.4, 1.15), cabMat);
        cab.position.y = 1.2;
        g.add(cab);

        for (let u = 0; u < 8; u++) {
            const uy = 0.25 + u * 0.27;
            const node = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.22, 1.1), serverMat);
            node.position.set(0, uy, 0.02);
            g.add(node);

            // Microservice container status LEDs
            [-0.25, -0.15, 0.15, 0.25].forEach(lx => {
                const led = new THREE.Mesh(
                    new THREE.BoxGeometry(0.015, 0.015, 0.01),
                    createBlinkingLEDMaterial(0x0066FF)
                );
                led.position.set(lx, uy, 0.585);
                g.add(led);
            });
        }
        return g;
    }

    // Generate Specialized Rows
    rackRowsZ.forEach((rz, rowIdx) => {
        // Transparent polycarbonate cold-aisle roof canopy
        const canopy = new THREE.Mesh(
            new THREE.BoxGeometry(35, 0.04, 1.8),
            new THREE.MeshStandardMaterial({
                color: 0x0088ff,
                transparent: true,
                opacity: 0.32,
                roughness: 0.1
            })
        );
        canopy.position.set(0, raisedFloorY + 2.8, rz);
        serverHallGroup.add(canopy);

        // Perforated airflow floor tiles along center of each cold aisle
        const ventTileMat = new THREE.MeshStandardMaterial({
            color: 0x0055AA,
            emissive: 0x003388,
            emissiveIntensity: 0.4,
            roughness: 0.6,
            metalness: 0.5
        });
        const ventTile = new THREE.Mesh(new THREE.PlaneGeometry(33, 1.1), ventTileMat);
        ventTile.rotation.x = -Math.PI / 2;
        ventTile.position.set(0, raisedFloorY + 0.042, rz);
        serverHallGroup.add(ventTile);

        // Overhead structured cable tray
        const cableTray = new THREE.Mesh(
            new THREE.BoxGeometry(35, 0.1, 0.4),
            getMaterial('metal_dark')
        );
        cableTray.position.set(0, raisedFloorY + 3.1, rz);
        serverHallGroup.add(cableTray);

        // Fiber optic conduits running inside cable tray
        const fiberBlue = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 35, 4),
            getMaterial('led_blue')
        );
        fiberBlue.rotation.z = Math.PI / 2;
        fiberBlue.position.set(0, raisedFloorY + 3.18, rz - 0.08);
        serverHallGroup.add(fiberBlue);

        const fiberGreen = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 35, 4),
            getMaterial('led_green')
        );
        fiberGreen.rotation.z = Math.PI / 2;
        fiberGreen.position.set(0, raisedFloorY + 3.18, rz + 0.08);
        serverHallGroup.add(fiberGreen);

        // Cold Aisle Sliding Glass Containment Doors at both ends
        [-18.2, 18.2].forEach(dx => {
            const doorGroup = new THREE.Group();
            doorGroup.position.set(dx, raisedFloorY, rz);

            // Door frame
            const frame = new THREE.Mesh(
                new THREE.BoxGeometry(0.12, 2.7, 2.0),
                getMaterial('metal_dark')
            );
            frame.position.y = 1.35;
            doorGroup.add(frame);

            // Sliding glass panel with physical optical transmission
            const glassPanel = new THREE.Mesh(
                new THREE.PlaneGeometry(1.8, 2.5),
                new THREE.MeshPhysicalMaterial({
                    color: 0x88CCFF,
                    transmission: 0.85,
                    roughness: 0.08,
                    ior: 1.5,
                    thickness: 0.4,
                    transparent: true,
                    opacity: 1.0,
                    side: THREE.DoubleSide
                })
            );
            glassPanel.position.set(0, 1.35, 0);
            glassPanel.rotation.y = Math.PI / 2;
            doorGroup.add(glassPanel);

            // Biometric badge reader with green LED
            const scanner = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.18, 0.12), getMaterial('metal_dark'));
            scanner.position.set(dx > 0 ? 0.08 : -0.08, 1.35, 0.85);
            doorGroup.add(scanner);

            const accessLed = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), getMaterial('led_green'));
            accessLed.position.set(dx > 0 ? 0.12 : -0.12, 1.4, 0.85);
            doorGroup.add(accessLed);

            serverHallGroup.add(doorGroup);
        });

        // Generate Racks in this row with specialized architecture
        for (let ri = 0; ri < racksPerRow; ri++) {
            const rx = rackStartX + ri * rackSpacingX;
            let rack;
            if (rowIdx === 0) {
                rack = createStorageSanRack();
                tagEquipment(rack, {
                    name: 'Ceph High-IOPS NVMe SAN Array',
                    facility: 'UdyogCloud Central Data Center',
                    role: 'Distributed Block & Object Storage Array',
                    desc: 'Enterprise Ceph storage cluster with 3-way replication, automatic failover, and immutable snapshots.',
                    connection: 'Supplies real-time encrypted block volumes to customer ERP databases with sub-millisecond access.'
                });
            } else if (rowIdx === 1) {
                rack = createBladeComputeRack();
                tagEquipment(rack, {
                    name: '42U High-Density Compute Blade Rack',
                    facility: 'UdyogCloud Central Data Center',
                    role: 'Enterprise Linux & KVM Virtualization Host',
                    desc: 'Houses 14x dual-socket blade servers powering isolated tenant virtual machines with zero hypervisor tax.',
                    connection: 'Transmits real-time CPU/RAM utilization and I/O metrics to the 24/7 Operations NOC.'
                });
            } else if (rowIdx === 2) {
                rack = createMicroservicesRack();
                tagEquipment(rack, {
                    name: 'Docker Microservices Container Cluster',
                    facility: 'UdyogCloud Central Data Center',
                    role: 'Application Hosting & Container Swarm',
                    desc: 'Containerized production environments running ERPNext, Tally Prime, and web gateways with automated scaling.',
                    connection: 'Balances tenant HTTP/TCP requests across redundant worker nodes.'
                });
            } else {
                rack = createNetworkCoreRack();
                tagEquipment(rack, {
                    name: '10GbE Top-of-Rack Core Switch',
                    facility: 'UdyogCloud Central Data Center',
                    role: 'Spine-Leaf Optical Aggregation',
                    desc: 'High-bandwidth, low-latency ToR switches routing traffic between computing nodes and customer utility corridors.',
                    connection: 'Delivers 10Gbps non-blocking throughput across the campus fiber network.'
                });
            }

            rack.position.set(rx, raisedFloorY + 0.04, rz);
            serverHallGroup.add(rack);
            allRacks.push(rack);

            // Vertical cable drop conduit
            const dropConduit = new THREE.Mesh(
                new THREE.BoxGeometry(0.08, 0.7, 0.08),
                getMaterial('metal')
            );
            dropConduit.position.set(rx, raisedFloorY + 2.75, rz);
            serverHallGroup.add(dropConduit);
        }
    });

    // ─────────────────────────────────────────────────────────────
    // 6. UDYOGCLOUD 10 CLOUD SERVICE ZONES (PART 5 & PART 6)
    // ─────────────────────────────────────────────────────────────
    // Dedicated Service Zone Markers with 3D Signage Planes
    const serviceZones = [
        { title: '1. CLOUD STORAGE', sub: 'Redundant Ceph SAN/NAS Array', x: -14, z: -10, color: '#00AAFF' },
        { title: '2. DATABASE ENGINES', sub: 'Managed PostgreSQL & MySQL Cluster', x: -4, z: -10, color: '#00FF88' },
        { title: '3. COMPUTE NODES', sub: 'Multi-Core KVM Virtual Instances', x: 6, z: -10, color: '#0066FF' },
        { title: '4. APP HOSTING', sub: 'Automated Container Engine', x: 16, z: -10, color: '#FF9900' },
        { title: '5. BACKUP & DR', sub: 'Automated Daily Snapshots & Vault', x: -14, z: 10, color: '#00CCFF' },
        { title: '6. DOCKER CONTAINERS', sub: 'Microservices & Worker Swarms', x: -4, z: 10, color: '#3388FF' },
        { title: '7. KVM VIRTUALIZATION', sub: 'Isolated Multi-Tenant VMs', x: 6, z: 10, color: '#AA66FF' },
        { title: '8. LINUX KERNEL OS', sub: 'Hardened Enterprise Linux 9', x: 16, z: 10, color: '#FFCC00' }
    ];

    serviceZones.forEach(sz => {
        const sign = createTextPlane(`${sz.title}\n${sz.sub}`, {
            worldW: 4.8,
            worldH: 1.4,
            fontSize: 26,
            bgColor: '#0A1628',
            color: sz.color,
            canvasW: 512,
            canvasH: 160
        });
        sign.position.set(sz.x, raisedFloorY + 3.6, sz.z);
        // Angled slightly downwards towards center
        sign.rotation.x = 0.15;
        serverHallGroup.add(sign);

        // Pedestal mount rod
        const rod = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, 1.2, 6),
            getMaterial('metal')
        );
        rod.position.set(sz.x, raisedFloorY + 2.8, sz.z);
        serverHallGroup.add(rod);
    });

    // ─────────────────────────────────────────────────────────────
    // 7. PHASE D: EXPLODED 3D SOFTWARE ARCHITECTURE STACK (PART 6)
    // Physical Bare-Metal -> Linux Kernel -> KVM Hypervisor -> Docker Containers
    // ─────────────────────────────────────────────────────────────
    const techArchGroup = new THREE.Group();
    techArchGroup.name = 'Exploded_3D_Virtualization_Stack';
    techArchGroup.position.set(0, raisedFloorY + 0.1, -12);

    const stackW = 8.4, stackD = 3.6;

    // Corner vertical glowing laser alignment pillars
    const pillarMat = getMaterial('led_blue');
    const pGeo = new THREE.CylinderGeometry(0.04, 0.04, 5.6, 8);
    [[-stackW / 2 + 0.2, -stackD / 2 + 0.2], [stackW / 2 - 0.2, -stackD / 2 + 0.2],
     [-stackW / 2 + 0.2, stackD / 2 - 0.2], [stackW / 2 - 0.2, stackD / 2 - 0.2]].forEach(([px, pz]) => {
        const pMesh = new THREE.Mesh(pGeo, pillarMat);
        pMesh.position.set(px, 2.8, pz);
        techArchGroup.add(pMesh);
    });

    // ── LAYER 1 (y = 0.6): Physical Bare-Metal Enterprise Hardware & NVMe ──
    const l1Group = new THREE.Group();
    l1Group.position.y = 0.6;
    const l1Mesh = new THREE.Mesh(
        new THREE.BoxGeometry(stackW, 0.25, stackD),
        new THREE.MeshStandardMaterial({ color: 0x1E293B, metalness: 0.8, roughness: 0.2 })
    );
    l1Group.add(l1Mesh);

    // Dual CPU Sockets with copper heatsinks
    const cpuMat = new THREE.MeshStandardMaterial({ color: 0xCC7733, metalness: 0.7, roughness: 0.3 });
    [-1.2, 1.2].forEach(cx => {
        const cpu = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.18, 0.9), cpuMat);
        cpu.position.set(cx, 0.2, 0);
        l1Group.add(cpu);
    });

    // NVMe SSD storage banks
    const nvmeMat = new THREE.MeshStandardMaterial({ color: 0x00FF88, emissive: 0x006633, emissiveIntensity: 0.4 });
    for (let i = 0; i < 6; i++) {
        const nv = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.08, 0.18), nvmeMat);
        nv.position.set(-2.8 + i * 1.1, 0.16, -1.1);
        l1Group.add(nv);
    }

    const l1Sign = createTextPlane('LAYER 1: Dual Enterprise Xeon/EPYC Nodes & All-NVMe Fabric', {
        worldW: 7.2, worldH: 0.45, fontSize: 24, bgColor: '#0F172A', color: '#00AAFF'
    });
    l1Sign.position.set(0, 0.4, stackD / 2 + 0.02);
    l1Group.add(l1Sign);
    techArchGroup.add(l1Group);

    // ── LAYER 2 (y = 1.9): Hardened Enterprise Linux OS & Kernel ──
    const l2Group = new THREE.Group();
    l2Group.position.y = 1.9;
    const l2Mesh = new THREE.Mesh(
        new THREE.BoxGeometry(stackW, 0.18, stackD),
        new THREE.MeshStandardMaterial({
            color: 0x0A2540,
            transparent: true,
            opacity: 0.75,
            roughness: 0.2,
            metalness: 0.3
        })
    );
    l2Group.add(l2Mesh);

    const l2Sign = createTextPlane('LAYER 2: Hardened Enterprise Linux Kernel 9 LTS (SELinux Security)', {
        worldW: 7.2, worldH: 0.45, fontSize: 24, bgColor: '#061727', color: '#FFCC00'
    });
    l2Sign.position.set(0, 0.35, stackD / 2 + 0.02);
    l2Group.add(l2Sign);
    techArchGroup.add(l2Group);

    // ── LAYER 3 (y = 3.2): Multi-Tenant KVM Virtualization Hypervisor ──
    const l3Group = new THREE.Group();
    l3Group.position.y = 3.2;
    const l3Mesh = new THREE.Mesh(
        new THREE.BoxGeometry(stackW, 0.18, stackD),
        new THREE.MeshStandardMaterial({
            color: 0x0055AA,
            transparent: true,
            opacity: 0.65,
            roughness: 0.1,
            metalness: 0.4
        })
    );
    l3Group.add(l3Mesh);

    // 6 Isolated virtual machine memory segments
    for (let vm = 0; vm < 6; vm++) {
        const vmX = -2.8 + (vm % 3) * 2.8;
        const vmZ = vm < 3 ? -0.8 : 0.8;
        const vmBox = new THREE.Mesh(
            new THREE.BoxGeometry(2.2, 0.12, 1.2),
            new THREE.MeshStandardMaterial({ color: 0x0088FF, wireframe: true })
        );
        vmBox.position.set(vmX, 0.15, vmZ);
        l3Group.add(vmBox);
    }

    const l3Sign = createTextPlane('LAYER 3: Hardware-Assisted KVM Virtualization & Strict Quotas', {
        worldW: 7.2, worldH: 0.45, fontSize: 24, bgColor: '#003366', color: '#00FF88'
    });
    l3Sign.position.set(0, 0.35, stackD / 2 + 0.02);
    l3Group.add(l3Sign);
    techArchGroup.add(l3Group);

    // ── LAYER 4 (y = 4.5): Docker Microservices & Customer ERP/CRM Applications ──
    const l4Group = new THREE.Group();
    l4Group.position.y = 4.5;
    const l4Mesh = new THREE.Mesh(
        new THREE.BoxGeometry(stackW, 0.18, stackD),
        new THREE.MeshStandardMaterial({
            color: 0x0077B6,
            transparent: true,
            opacity: 0.65,
            roughness: 0.1,
            metalness: 0.2
        })
    );
    l4Group.add(l4Mesh);

    // 6 Microservice application container cubes
    const apps = ['ERP', 'CRM', 'INVOICE', 'CAD', 'STORE', 'METRICS'];
    apps.forEach((app, i) => {
        const ax = -2.8 + (i % 3) * 2.8;
        const az = i < 3 ? -0.8 : 0.8;
        const cube = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 0.5, 0.8),
            new THREE.MeshStandardMaterial({ color: 0x00EEFF, roughness: 0.3, metalness: 0.6 })
        );
        cube.position.set(ax, 0.38, az);
        l4Group.add(cube);

        const appLabel = createTextPlane(app, {
            worldW: 0.9, worldH: 0.3, fontSize: 22, bgColor: '#0A1628', color: '#FFFFFF'
        });
        appLabel.position.set(ax, 0.4, az + 0.42);
        l4Group.add(appLabel);
    });

    const l4Sign = createTextPlane('LAYER 4: Docker Containers & Turnkey MSME Business Applications', {
        worldW: 7.2, worldH: 0.45, fontSize: 24, bgColor: '#004477', color: '#FFFFFF'
    });
    l4Sign.position.set(0, 0.75, stackD / 2 + 0.02);
    l4Group.add(l4Sign);
    techArchGroup.add(l4Group);

    serverHallGroup.add(techArchGroup);

    // ─────────────────────────────────────────────────────────────
    // 8. DATA CENTER INFRASTRUCTURE: HVAC CRAC & COOLING
    // ─────────────────────────────────────────────────────────────
    // 4 Industrial Computer Room Air Conditioners (CRAC) along left wall
    for (let c = 0; c < 4; c++) {
        const cracZ = -9 + c * 6;
        const crac = new THREE.Group();

        // Main housing
        const hBody = new THREE.Mesh(
            new THREE.BoxGeometry(1.6, 3.4, 2.4),
            getMaterial('concrete_light')
        );
        hBody.position.y = 1.7;
        crac.add(hBody);

        // Vent grille
        const grille = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 2.0, 1.8),
            getMaterial('metal_dark')
        );
        grille.position.set(0.81, 1.8, 0);
        crac.add(grille);

        // Digital display
        const cracScreen = new THREE.Mesh(
            new THREE.PlaneGeometry(0.5, 0.3),
            getMaterial('screen_green')
        );
        cracScreen.position.set(0.82, 3.0, 0);
        cracScreen.rotation.y = Math.PI / 2;
        crac.add(cracScreen);

        // Cold airflow duct pointing toward floor plenum
        const duct = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.2, 0.8, 8),
            getMaterial('metal')
        );
        duct.position.set(0, 3.8, 0);
        crac.add(duct);

        crac.position.set(-w / 2 + 2.2, raisedFloorY, cracZ);
        tagEquipment(crac, {
            name: 'Downflow Precision CRAC Unit',
            facility: 'UdyogCloud Central Data Center',
            role: 'Thermal & Humidity Regulation',
            desc: 'Maintains cold-aisle server intake at 21°C ± 2°C and humidity at 45% with EC variable-speed fans.',
            connection: 'Feeds continuous temperature and airflow telemetry into the NOC monitoring wall.'
        });
        serverHallGroup.add(crac);
    }

    // ─────────────────────────────────────────────────────────────
    // 9. POWER INFRASTRUCTURE: DIESEL GENSET & N+1 UPS BATTERY BANKS
    // ─────────────────────────────────────────────────────────────
    // Power room on right rear corner
    const powerGroup = new THREE.Group();
    powerGroup.position.set(w / 2 - 4.5, raisedFloorY, -7);

    // Backup UPS Racks (3 modules)
    for (let u = 0; u < 3; u++) {
        const ups = new THREE.Mesh(
            new THREE.BoxGeometry(1.4, 2.6, 1.2),
            new THREE.MeshStandardMaterial({ color: 0x182026, roughness: 0.3, metalness: 0.8 })
        );
        ups.position.set(0, 1.3, u * 2.2);
        tagEquipment(ups, {
            name: '2N Modular Online Double-Conversion UPS',
            facility: 'UdyogCloud Central Data Center',
            role: 'Zero-Millisecond Power Protection',
            desc: 'Enterprise battery bank supplying instantaneous clean power bridging to twin 2000kVA diesel generators.',
            connection: 'Ensures 99.98% power uptime for all server racks during utility grid fluctuations.'
        });
        powerGroup.add(ups);

        // Green power indicator LEDs
        for (let l = 0; l < 4; l++) {
            const led = new THREE.Mesh(
                new THREE.SphereGeometry(0.03, 4, 4),
                getMaterial('led_green')
            );
            led.position.set(-0.71, 2.2 - l * 0.2, u * 2.2 + 0.3);
            powerGroup.add(led);
        }
    }

    // Heavy Industrial Standby Diesel Generator
    const genBody = new THREE.Mesh(
        new THREE.BoxGeometry(3.5, 2.2, 2.2),
        new THREE.MeshStandardMaterial({ color: 0x4a5568, roughness: 0.6, metalness: 0.5 })
    );
    genBody.position.set(0, 1.1, 7.5);
    powerGroup.add(genBody);

    // Generator exhaust manifold & vertical chimney
    const exhaust = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.18, 4.0, 8),
        getMaterial('metal')
    );
    exhaust.position.set(0.8, 3.8, 7.5);
    powerGroup.add(exhaust);

    const powerSign = createTextPlane('EMERGENCY N+1 POWER VAULT (UPS & GENSET)', {
        worldW: 5.5,
        worldH: 0.8,
        fontSize: 22,
        bgColor: '#111827',
        color: '#FFCC00',
        canvasW: 512,
        canvasH: 64
    });
    powerSign.position.set(0, 3.2, 3);
    powerSign.rotation.y = -Math.PI / 2;
    powerGroup.add(powerSign);

    serverHallGroup.add(powerGroup);

    // ─────────────────────────────────────────────────────────────
    // 10. NETWORK CORE & FIBER PATCH WALL
    // ─────────────────────────────────────────────────────────────
    const netCoreGroup = new THREE.Group();
    netCoreGroup.position.set(0, raisedFloorY, -d / 2 + 1.2);

    // Enterprise Core Switches and Routers Rack Wall
    for (let p = -2; p <= 2; p++) {
        const patchRack = new THREE.Mesh(
            new THREE.BoxGeometry(1.8, 3.2, 0.4),
            getMaterial('metal_dark')
        );
        patchRack.position.set(p * 2.2, 1.6, 0);
        netCoreGroup.add(patchRack);

        // Blinking indicator ports
        const portStrip = new THREE.Mesh(
            new THREE.PlaneGeometry(1.5, 2.5),
            new THREE.MeshStandardMaterial({
                color: 0x002244,
                emissive: 0x004488,
                emissiveIntensity: 0.8
            })
        );
        portStrip.position.set(p * 2.2, 1.6, 0.21);
        netCoreGroup.add(portStrip);
    }

    const netCoreSign = createTextPlane('100G FIBER OPTIC CORE BACKBONE ROUTING', {
        worldW: 8,
        worldH: 0.8,
        fontSize: 24,
        bgColor: '#001A33',
        color: '#00AAFF',
        canvasW: 512,
        canvasH: 64
    });
    netCoreSign.position.set(0, 3.6, 0.3);
    netCoreGroup.add(netCoreSign);

    serverHallGroup.add(netCoreGroup);

    // ─────────────────────────────────────────────────────────────
    // 11. SECURITY, BIOMETRIC ENTRY & LOCAL NOC MONITORING
    // ─────────────────────────────────────────────────────────────
    // Security vestibule at front interior
    const secWorkstation = createWorkstation({ monitorCount: 3, deskW: 2.2 });
    secWorkstation.position.set(12, raisedFloorY + 0.04, 10);
    secWorkstation.rotation.y = Math.PI;
    serverHallGroup.add(secWorkstation);

    // Security guard / datacenter engineer
    const dcEngineer = createPerson({ shirtColor: 0x0066FF, pantsColor: 0x1A2744 });
    dcEngineer.position.set(12, raisedFloorY + 0.04, 8.8);
    dcEngineer.rotation.y = 0;
    serverHallGroup.add(dcEngineer);

    // Wall-mounted NOC displays above workstation
    const nocScreen1 = createLargeDisplay(3.6, 2.0, COLORS.SCREEN_GLOW);
    nocScreen1.position.set(12, raisedFloorY + 3.2, 13);
    nocScreen1.rotation.y = Math.PI;
    serverHallGroup.add(nocScreen1);

    // CCTV Security Cameras in corners
    const cctvGeo = new THREE.ConeGeometry(0.12, 0.3, 6);
    const cctvMat = getMaterial('metal_dark');
    [[-w / 2 + 1, d / 2 - 1], [w / 2 - 1, d / 2 - 1], [-w / 2 + 1, -d / 2 + 1], [w / 2 - 1, -d / 2 + 1]].forEach(([cx, cz]) => {
        const cam = new THREE.Mesh(cctvGeo, cctvMat);
        cam.position.set(cx, raisedFloorY + 4.5, cz);
        cam.rotation.x = 0.5;
        serverHallGroup.add(cam);
    });

    // ─────────────────────────────────────────────────────────────
    // 12. INTERNAL ARCHITECTURAL LIGHTING
    // ─────────────────────────────────────────────────────────────
    // Cool cyan/blue accent point lights down each cold aisle
    rackRowsZ.forEach((rz, idx) => {
        const aisleLight = new THREE.PointLight(0x00aaff, 1.2, 18, 1.2);
        aisleLight.position.set(0, raisedFloorY + 3.5, rz);
        serverHallGroup.add(aisleLight);

        // White task lights for engineering inspections
        const taskLight1 = new THREE.PointLight(0xffffff, 0.8, 12, 1.0);
        taskLight1.position.set(-10, raisedFloorY + 3.2, rz);
        serverHallGroup.add(taskLight1);

        const taskLight2 = new THREE.PointLight(0xffffff, 0.8, 12, 1.0);
        taskLight2.position.set(10, raisedFloorY + 3.2, rz);
        serverHallGroup.add(taskLight2);
    });

    // Center ceiling linear glow fixtures
    for (let lx = -18; lx <= 18; lx += 9) {
        const ceilingFixture = new THREE.Mesh(
            new THREE.BoxGeometry(7.0, 0.1, 0.3),
            getMaterial('blue_emissive')
        );
        ceilingFixture.position.set(lx, raisedFloorY + 4.8, 0);
        serverHallGroup.add(ceilingFixture);
    }

    // Rooftop HVAC Chiller Units (visible on building top)
    for (let rx of [-14, -4, 6, 16]) {
        for (let rz of [-8, 8]) {
            const chiller = new THREE.Group();
            const chBox = new THREE.Mesh(
                new THREE.BoxGeometry(4.2, 2.0, 3.2),
                getMaterial('metal_light')
            );
            chBox.position.y = 1.0;
            chiller.add(chBox);

            // Two circular fans on top of each chiller
            for (let f of [-1.0, 1.0]) {
                const fan = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.7, 0.7, 0.1, 12),
                    getMaterial('metal_dark')
                );
                fan.position.set(f, 2.05, 0);
                chiller.add(fan);
            }

            chiller.position.set(rx, plinthH + h + roofH + 0.8, rz);
            dcGroup.add(chiller);
        }
    }

    dcGroup.add(serverHallGroup);

    // Dynamic Server LED Activity update hook
    let ledTick = 0;
    dcGroup.update = function(delta) {
        ledTick += delta * 4.0;
        dynamicLEDMaterials.forEach(item => {
            const flicker = Math.sin(ledTick * item.freq + item.phase);
            item.mat.emissiveIntensity = flicker > 0 ? 0.75 + flicker * 0.35 : 0.25;
        });
    };

    return dcGroup;
}

