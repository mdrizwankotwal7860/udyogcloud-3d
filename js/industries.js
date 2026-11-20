// ═══════════════════════════════════════════════════════════════
// js/industries.js – 6 Industry Buildings for UdyogCloud Campus
// ═══════════════════════════════════════════════════════════════
import * as THREE from 'three';
import {
    COLORS, LAYOUT, BUILDING_SIZES, INDUSTRY_NAMES,
    getMaterial, createTextSprite, createTextPlane, createInfoPanel,
    createPerson, createSeatedPerson, createDesk, createChair, createMonitor,
    createWorkstation, createServerRack, createShelf, createMachine,
    createBuilding, createTree, createStreetLight,
    registerFacilityShell, tagEquipment
} from './utils.js';

// ─── HELPER: interior point light ────────────────────────────
function addInteriorLight(group, x, y, z, intensity = 0.4, color = 0xCCDDFF) {
    const light = new THREE.PointLight(color, intensity, 30);
    light.position.set(x, y, z);
    group.add(light);
}

// ─── HELPER: safety floor stripe ─────────────────────────────
function addFloorStripe(group, x, z, length, axis = 'x') {
    const geo = axis === 'x'
        ? new THREE.BoxGeometry(length, 0.02, 0.15)
        : new THREE.BoxGeometry(0.15, 0.02, length);
    const stripe = new THREE.Mesh(geo, getMaterial('yellow_safety'));
    stripe.position.set(x, 0.22, z);
    group.add(stripe);
}

// ─── HELPER: simple forklift ─────────────────────────────────
function createForklift() {
    const g = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xDDAA00, roughness: 0.5, metalness: 0.3 });
    const metalMat = getMaterial('metal');

    // Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.0, 0.9), bodyMat);
    body.position.set(0, 0.7, 0);
    g.add(body);

    // Cabin roof
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.06, 0.85), metalMat);
    roof.position.set(0, 1.6, 0);
    g.add(roof);

    // Cabin posts
    const postGeo = new THREE.BoxGeometry(0.06, 0.5, 0.06);
    [[-0.5, -0.38], [-0.5, 0.38], [0.5, -0.38], [0.5, 0.38]].forEach(([x, z]) => {
        const post = new THREE.Mesh(postGeo, metalMat);
        post.position.set(x, 1.35, z);
        g.add(post);
    });

    // Mast (front vertical bars)
    const mastGeo = new THREE.BoxGeometry(0.06, 1.8, 0.06);
    [-0.3, 0.3].forEach(z => {
        const mast = new THREE.Mesh(mastGeo, metalMat);
        mast.position.set(0.75, 0.9, z);
        g.add(mast);
    });

    // Forks
    const forkGeo = new THREE.BoxGeometry(1.0, 0.05, 0.12);
    const forkMat = getMaterial('metal_dark');
    [-0.2, 0.2].forEach(z => {
        const fork = new THREE.Mesh(forkGeo, forkMat);
        fork.position.set(1.1, 0.25, z);
        g.add(fork);
    });

    // Fork backplate
    const backplate = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.6, 0.7), metalMat);
    backplate.position.set(0.65, 0.5, 0);
    g.add(backplate);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.12, 12);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    [[-0.4, -0.5], [-0.4, 0.5], [0.4, -0.5], [0.4, 0.5]].forEach(([x, z]) => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(x, 0.18, z);
        g.add(wheel);
    });

    // Steering wheel hint
    const steer = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.015, 6, 12),
        new THREE.MeshStandardMaterial({ color: 0x333333 }));
    steer.position.set(-0.15, 1.1, 0);
    steer.rotation.x = -Math.PI * 0.3;
    g.add(steer);

    // Seat
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.08, 0.35), 
        new THREE.MeshStandardMaterial({ color: 0x222222 }));
    seat.position.set(-0.2, 0.9, 0);
    g.add(seat);

    return g;
}

// ─── HELPER: hand cart / trolley ─────────────────────────────
function createHandCart() {
    const g = new THREE.Group();
    const metalMat = getMaterial('metal');

    // Platform
    const platform = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.04, 0.5), metalMat);
    platform.position.set(0, 0.22, 0);
    g.add(platform);

    // Handle
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.6, 0.04), metalMat);
    handle.position.set(-0.38, 0.5, 0);
    g.add(handle);
    const handleBar = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.4), metalMat);
    handleBar.position.set(-0.38, 0.8, 0);
    g.add(handleBar);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.06, 10);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });
    [[-0.25, -0.22], [-0.25, 0.22], [0.3, -0.22], [0.3, 0.22]].forEach(([x, z]) => {
        const w = new THREE.Mesh(wheelGeo, wheelMat);
        w.rotation.x = Math.PI / 2;
        w.position.set(x, 0.1, z);
        g.add(w);
    });

    return g;
}

// ─── HELPER: conveyor belt ───────────────────────────────────
function createConveyorBelt(length = 8, width = 0.8) {
    const g = new THREE.Group();
    const metalMat = getMaterial('metal');
    const darkMat = getMaterial('metal_dark');

    // Belt surface
    const belt = new THREE.Mesh(
        new THREE.BoxGeometry(length, 0.05, width),
        new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.7 })
    );
    belt.position.y = 0.75;
    g.add(belt);

    // Side rails
    [-width / 2, width / 2].forEach(z => {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(length, 0.1, 0.04), metalMat);
        rail.position.set(0, 0.72, z);
        g.add(rail);
    });

    // Legs
    const legGeo = new THREE.BoxGeometry(0.06, 0.7, 0.06);
    const numLegs = Math.floor(length / 1.5);
    for (let i = 0; i <= numLegs; i++) {
        const x = -length / 2 + (i / numLegs) * length;
        [-width / 2, width / 2].forEach(z => {
            const leg = new THREE.Mesh(legGeo, metalMat);
            leg.position.set(x, 0.35, z);
            g.add(leg);
        });
    }

    // Rollers on top
    const rollerGeo = new THREE.CylinderGeometry(0.04, 0.04, width - 0.1, 8);
    const numRollers = Math.floor(length / 0.4);
    for (let i = 0; i < numRollers; i++) {
        const x = -length / 2 + 0.2 + i * 0.4;
        const roller = new THREE.Mesh(rollerGeo, darkMat);
        roller.rotation.x = Math.PI / 2;
        roller.position.set(x, 0.78, 0);
        g.add(roller);
    }

    // End drums (large rollers)
    const drumGeo = new THREE.CylinderGeometry(0.1, 0.1, width - 0.06, 12);
    [-length / 2 + 0.05, length / 2 - 0.05].forEach(x => {
        const drum = new THREE.Mesh(drumGeo, metalMat);
        drum.rotation.x = Math.PI / 2;
        drum.position.set(x, 0.75, 0);
        g.add(drum);
    });

    return g;
}

// ─── HELPER: add small office corner ─────────────────────────
function addOfficeCorner(group, cx, cz, rotation = 0) {
    const office = new THREE.Group();

    // 2 workstations
    const ws1 = createWorkstation();
    ws1.position.set(0, 0, 0);
    office.add(ws1);

    const ws2 = createWorkstation();
    ws2.position.set(2.0, 0, 0);
    office.add(ws2);

    // Seated workers
    const sp1 = createSeatedPerson();
    sp1.position.set(0, 0, 0.55);
    office.add(sp1);

    const sp2 = createSeatedPerson();
    sp2.position.set(2.0, 0, 0.55);
    office.add(sp2);

    // Divider panel
    const divider = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 1.5, 2.5),
        new THREE.MeshStandardMaterial({ color: 0x556677, roughness: 0.7 })
    );
    divider.position.set(-0.8, 0.95, 0);
    office.add(divider);

    // Small shelf
    const shelf = createShelf(1.2, 1.5, 0.4, 3);
    shelf.position.set(3.5, 0.2, -0.2);
    office.add(shelf);

    office.position.set(cx, 0, cz);
    office.rotation.y = rotation;
    group.add(office);
}

// ─── HELPER: building sign ───────────────────────────────────
function addBuildingSign(group, text, x, y, z, rotY = 0) {
    const sign = createTextPlane(text, {
        worldW: 8, worldH: 1.5, fontSize: 42,
        bgColor: '#0A1628', color: '#FFFFFF'
    });
    sign.position.set(x, y, z);
    sign.rotation.y = rotY;
    group.add(sign);
}


// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// PHASE B: DETAILED INDUSTRIAL EQUIPMENT CONSTRUCTORS
// ═══════════════════════════════════════════════════════════════

// 1. AUTOMOTIVE CHASSIS / VEHICLE SPACEFRAME
function createAutomobileChassis() {
    const g = new THREE.Group();
    g.name = 'Automobile_Chassis';
    const tubeMat = new THREE.MeshStandardMaterial({
        color: 0x0077CC,
        metalness: 0.6,
        roughness: 0.35
    });
    const subMat = getMaterial('metal_dark');

    const baseL = 4.0, baseW = 1.6;
    const perimeterBarGeoX = new THREE.BoxGeometry(baseL, 0.08, 0.08);
    const perimeterBarGeoZ = new THREE.BoxGeometry(0.08, 0.08, baseW);

    [-baseW / 2, baseW / 2].forEach(z => {
        const bar = new THREE.Mesh(perimeterBarGeoX, tubeMat);
        bar.position.set(0, 0.15, z);
        g.add(bar);
    });
    [-baseL / 2, 0, baseL / 2].forEach(x => {
        const cross = new THREE.Mesh(perimeterBarGeoZ, tubeMat);
        cross.position.set(x, 0.15, 0);
        g.add(cross);
    });

    const rollCageMat = tubeMat;
    const aPillarL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6), rollCageMat);
    aPillarL.position.set(-0.5, 0.7, -baseW / 2 + 0.05);
    aPillarL.rotation.z = -0.3;
    g.add(aPillarL);

    const aPillarR = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6), rollCageMat);
    aPillarR.position.set(-0.5, 0.7, baseW / 2 - 0.05);
    aPillarR.rotation.z = -0.3;
    g.add(aPillarR);

    const bPillarL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.1, 6), rollCageMat);
    bPillarL.position.set(0.6, 0.65, -baseW / 2 + 0.05);
    g.add(bPillarL);

    const bPillarR = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.1, 6), rollCageMat);
    bPillarR.position.set(0.6, 0.65, baseW / 2 - 0.05);
    g.add(bPillarR);

    const roofHoop = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.06, baseW - 0.1), rollCageMat);
    roofHoop.position.set(0.05, 1.2, 0);
    g.add(roofHoop);

    const engineCradle = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.35, 0.9), subMat);
    engineCradle.position.set(-1.2, 0.35, 0);
    g.add(engineCradle);

    const discGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.06, 16);
    const discMat = getMaterial('metal');
    [[-1.2, -baseW / 2 - 0.08], [-1.2, baseW / 2 + 0.08], [1.3, -baseW / 2 - 0.08], [1.3, baseW / 2 + 0.08]].forEach(([x, z]) => {
        const disc = new THREE.Mesh(discGeo, discMat);
        disc.rotation.x = Math.PI / 2;
        disc.position.set(x, 0.24, z);
        g.add(disc);
    });

    return g;
}

// 2. CMM PRECISION QUALITY INSPECTION SUITE
function createCMMStation() {
    const g = new THREE.Group();
    g.name = 'CMM_Inspection_Station';
    const graniteMat = new THREE.MeshStandardMaterial({ color: 0x1A1C1E, roughness: 0.2, metalness: 0.1 });
    const silverMat = getMaterial('metal');
    const darkMat = getMaterial('metal_dark');

    const base = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.45, 1.6), graniteMat);
    base.position.y = 0.45;
    g.add(base);

    const legGeo = new THREE.BoxGeometry(0.25, 0.45, 0.25);
    [[-0.9, -0.6], [0.9, -0.6], [-0.9, 0.6], [0.9, 0.6]].forEach(([x, z]) => {
        const l = new THREE.Mesh(legGeo, darkMat);
        l.position.set(x, 0.225, z);
        g.add(l);
    });

    const portal = new THREE.Group();
    portal.position.set(0.1, 0.68, 0);

    const colGeo = new THREE.BoxGeometry(0.2, 1.8, 0.25);
    [-0.7, 0.7].forEach(z => {
        const col = new THREE.Mesh(colGeo, silverMat);
        col.position.set(0, 0.9, z);
        portal.add(col);
    });

    const crossbeam = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.22, 1.65), silverMat);
    crossbeam.position.set(0, 1.8, 0);
    portal.add(crossbeam);

    const ram = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.0, 12), silverMat);
    ram.position.set(0, 1.25, 0);
    portal.add(ram);

    const probe = new THREE.Mesh(
        new THREE.SphereGeometry(0.03, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0xDD1122, roughness: 0.1, metalness: 0.1 })
    );
    probe.position.set(0, 0.73, 0);
    portal.add(probe);

    g.add(portal);

    const engineBlock = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, 0.35, 0.45),
        new THREE.MeshStandardMaterial({ color: 0xDDEEFF, metalness: 0.85, roughness: 0.2 })
    );
    engineBlock.position.set(0.1, 0.85, 0);
    g.add(engineBlock);

    const cab = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.4, 0.45), darkMat);
    cab.position.set(1.4, 0.7, 0.6);
    g.add(cab);

    const mon = createMonitor(0x00FF88);
    mon.position.set(1.4, 1.45, 0.6);
    mon.rotation.y = -Math.PI / 4;
    g.add(mon);

    return g;
}

// 3. INDUSTRIAL ROBOTIC WELDING CELL
function createRoboticWelder() {
    const g = new THREE.Group();
    g.name = 'Robotic_Welding_Cell';
    const yellowMat = new THREE.MeshStandardMaterial({ color: 0xEE9900, roughness: 0.4, metalness: 0.3 });
    const darkMat = getMaterial('metal_dark');

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 0.3, 16), darkMat);
    base.position.y = 0.15;
    g.add(base);

    // Kinematic Articulated Arm Group (rotates on Y axis)
    const armGroup = new THREE.Group();
    armGroup.position.set(0, 0.3, 0);

    const turret = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.4, 16), yellowMat);
    turret.position.y = 0.2;
    armGroup.add(turret);

    const lowerArm = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.2, 0.22), yellowMat);
    lowerArm.position.set(0.25, 0.8, 0);
    lowerArm.rotation.z = -0.35;
    armGroup.add(lowerArm);

    const upperArm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.1, 0.18), yellowMat);
    upperArm.position.set(0.45, 1.5, 0);
    upperArm.rotation.z = 0.6;
    armGroup.add(upperArm);

    const wrist = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.25, 8), darkMat);
    wrist.position.set(0.85, 1.6, 0);
    wrist.rotation.z = Math.PI / 2;
    armGroup.add(wrist);

    const nozzle = new THREE.Mesh(
        new THREE.ConeGeometry(0.04, 0.18, 8),
        new THREE.MeshStandardMaterial({ color: 0xCC7733, metalness: 0.8, roughness: 0.3 })
    );
    nozzle.position.set(0.98, 1.55, 0);
    nozzle.rotation.z = -Math.PI / 3;
    armGroup.add(nozzle);

    const arcLight = new THREE.PointLight(0x00CCFF, 1.2, 6);
    arcLight.position.set(1.05, 1.5, 0);
    armGroup.add(arcLight);

    g.add(armGroup);
    g.userData.armGroup = armGroup;
    g.userData.arcLight = arcLight;

    const fenceMat = new THREE.MeshStandardMaterial({
        color: 0x88CCFF,
        transparent: true,
        opacity: 0.25,
        roughness: 0.1
    });
    const cage = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.6, 2.4), fenceMat);
    cage.position.set(0.3, 0.8, 0);
    g.add(cage);

    const postGeo = new THREE.BoxGeometry(0.06, 1.6, 0.06);
    [[-0.9, -1.2], [-0.9, 1.2], [1.5, -1.2], [1.5, 1.2]].forEach(([x, z]) => {
        const p = new THREE.Mesh(postGeo, yellowMat);
        p.position.set(x, 0.8, z);
        g.add(p);
    });

    return g;
}

// 4. ROLLING GARMENT RACK
function createGarmentRack(opts = {}) {
    const { w = 2.4, h = 1.8 } = opts;
    const g = new THREE.Group();
    g.name = 'Garment_Rolling_Rack';
    const chromeMat = getMaterial('metal');

    const baseRail1 = new THREE.Mesh(new THREE.BoxGeometry(w, 0.04, 0.04), chromeMat);
    baseRail1.position.set(0, 0.15, -0.3);
    g.add(baseRail1);
    const baseRail2 = new THREE.Mesh(new THREE.BoxGeometry(w, 0.04, 0.04), chromeMat);
    baseRail2.position.set(0, 0.15, 0.3);
    g.add(baseRail2);

    [-w / 2 + 0.1, w / 2 - 0.1].forEach(x => {
        const cross = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.6), chromeMat);
        cross.position.set(x, 0.15, 0);
        g.add(cross);

        [-0.28, 0.28].forEach(z => {
            const wheel = new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.05, 0.04, 8),
                new THREE.MeshStandardMaterial({ color: 0x222222 })
            );
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(x, 0.05, z);
            g.add(wheel);
        });

        const upright = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, h, 8), chromeMat);
        upright.position.set(x, h / 2 + 0.15, 0);
        g.add(upright);
    });

    const hangRail = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, w, 8), chromeMat);
    hangRail.rotation.z = Math.PI / 2;
    hangRail.position.set(0, h + 0.15, 0);
    g.add(hangRail);

    const shirtColors = [0x1A365D, 0x8C1D40, 0xF7FAFC, 0x2D3748, 0x2F855A, 0xDD6B20, 0x553C9A, 0x319795];
    const garmentCount = 8;
    for (let i = 0; i < garmentCount; i++) {
        const gx = -w / 2 + 0.35 + (i / (garmentCount - 1)) * (w - 0.7);
        const col = shirtColors[i % shirtColors.length];

        const hook = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.08, 0.02), chromeMat);
        hook.position.set(gx, h + 0.1, 0);
        g.add(hook);

        const shirt = new THREE.Mesh(
            new THREE.BoxGeometry(0.18, 0.75, 0.42),
            new THREE.MeshStandardMaterial({ color: col, roughness: 0.75 })
        );
        shirt.position.set(gx, h - 0.32, 0);
        g.add(shirt);
    }

    return g;
}

// 5. FABRIC BOLT A-FRAME CAROUSEL
function createFabricBoltCarousel() {
    const g = new THREE.Group();
    g.name = 'Fabric_Bolt_Carousel';
    const metalMat = getMaterial('metal_dark');
    const chromeMat = getMaterial('metal');

    const w = 3.2, h = 2.4, d = 1.2;
    [-w / 2, w / 2].forEach(x => {
        const leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, h + 0.1, 0.06), metalMat);
        leg1.position.set(x, h / 2, -d / 4);
        leg1.rotation.x = 0.22;
        g.add(leg1);

        const leg2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, h + 0.1, 0.06), metalMat);
        leg2.position.set(x, h / 2, d / 4);
        leg2.rotation.x = -0.22;
        g.add(leg2);
    });

    const boltColors = [
        0xE53E3E, 0x3182CE, 0x38A169, 0xD69E2E, 0x805AD5, 0xD53F8C, 0x319795, 0xDD6B20,
        0x4A5568, 0xED8936, 0x48BB78, 0x4299E1, 0x9F7AEA, 0xF56565, 0x667EEA, 0x38B2AC
    ];

    let colorIdx = 0;
    // Lower 3 static tiers
    for (let level = 0; level < 3; level++) {
        const ly = 0.5 + level * 0.52;
        const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, w, 8), chromeMat);
        rod.rotation.z = Math.PI / 2;
        rod.position.set(0, ly, 0);
        g.add(rod);

        for (let r = 0; r < 3; r++) {
            const rx = -w / 2 + 0.6 + r * 1.0;
            const roll = new THREE.Mesh(
                new THREE.CylinderGeometry(0.2, 0.2, 0.82, 16),
                new THREE.MeshStandardMaterial({ color: boltColors[colorIdx++ % boltColors.length], roughness: 0.65 })
            );
            roll.rotation.z = Math.PI / 2;
            roll.position.set(rx, ly, 0);
            g.add(roll);
        }
    }

    // Top rotating focal spindle
    const activeSpindle = new THREE.Group();
    activeSpindle.position.set(0, 0.5 + 3 * 0.52, 0);
    const topRod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, w, 8), chromeMat);
    topRod.rotation.z = Math.PI / 2;
    activeSpindle.add(topRod);

    for (let r = 0; r < 3; r++) {
        const rx = -w / 2 + 0.6 + r * 1.0;
        const roll = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.2, 0.82, 16),
            new THREE.MeshStandardMaterial({ color: boltColors[colorIdx++ % boltColors.length], roughness: 0.65 })
        );
        roll.rotation.z = Math.PI / 2;
        roll.position.set(rx, 0, 0);
        activeSpindle.add(roll);
    }
    g.add(activeSpindle);
    g.userData.rollGroup = activeSpindle;

    return g;
}

// 6. STEAM PRESS & VACUUM IRONING STATION
function createSteamIroningStation() {
    const g = new THREE.Group();
    g.name = 'Steam_Press_Station';
    const chromeMat = getMaterial('metal');

    const tableTop = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.08, 0.65),
        new THREE.MeshStandardMaterial({ color: 0x99AABB, roughness: 0.7 })
    );
    tableTop.position.set(0, 0.85, 0);
    g.add(tableTop);

    const legGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.85, 8);
    [[-0.7, -0.25], [-0.7, 0.25], [0.7, -0.25], [0.7, 0.25]].forEach(([x, z]) => {
        const leg = new THREE.Mesh(legGeo, chromeMat);
        leg.position.set(x, 0.425, z);
        g.add(leg);
    });

    const boiler = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.18, 0.45, 12),
        new THREE.MeshStandardMaterial({ color: 0x223344, metalness: 0.7, roughness: 0.3 })
    );
    boiler.position.set(0.4, 0.45, 0);
    g.add(boiler);

    const boomPost = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 6), chromeMat);
    boomPost.position.set(-0.7, 1.45, -0.25);
    g.add(boomPost);

    const boomArm = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.03, 0.03), chromeMat);
    boomArm.position.set(-0.35, 2.05, -0.15);
    boomArm.rotation.y = 0.3;
    g.add(boomArm);

    const iron = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.12, 0.12),
        new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.2 })
    );
    iron.position.set(-0.1, 0.94, 0);
    g.add(iron);

    return g;
}

// 7. SANITARY PIPING NETWORK
function createSanitaryPipeNetwork(w, d, h) {
    const g = new THREE.Group();
    g.name = 'Sanitary_Stainless_Piping';
    const pipeMat = new THREE.MeshStandardMaterial({
        color: 0xEEEEFF,
        metalness: 0.92,
        roughness: 0.15
    });
    const valveMat = new THREE.MeshStandardMaterial({ color: 0xDD2222 });

    const mainPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, w * 0.7, 12), pipeMat);
    mainPipe.rotation.z = Math.PI / 2;
    mainPipe.position.set(0, h - 1.2, -2);
    g.add(mainPipe);

    [-6, 0, 6].forEach(x => {
        const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 10, 10), pipeMat);
        branch.rotation.x = Math.PI / 2;
        branch.position.set(x, h - 1.2, 1);
        g.add(branch);

        const dropPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.2, 8), pipeMat);
        dropPipe.position.set(x, h - 2.8, 3.5);
        g.add(dropPipe);

        const valve = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.14, 8), valveMat);
        valve.position.set(x, h - 2.0, 3.5);
        g.add(valve);

        const gauge = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.08, 0.03, 12),
            new THREE.MeshStandardMaterial({ color: 0xFFFFFF })
        );
        gauge.rotation.x = Math.PI / 2;
        gauge.position.set(x, h - 1.6, 3.58);
        g.add(gauge);
    });

    return g;
}

// 8. AUTOMATED BOTTLING & CAPPING LINE
function createBottlingLine(length = 6) {
    const g = new THREE.Group();
    g.name = 'Bottling_Capping_Line';
    const stainlessMat = new THREE.MeshStandardMaterial({ color: 0xCCDDEE, metalness: 0.85, roughness: 0.25 });
    const glassJarMat = new THREE.MeshStandardMaterial({
        color: 0xDDFFFF,
        transparent: true,
        opacity: 0.65,
        roughness: 0.1,
        metalness: 0.1
    });
    const goldLidMat = new THREE.MeshStandardMaterial({ color: 0xCC9900, metalness: 0.7, roughness: 0.3 });

    const belt = new THREE.Mesh(new THREE.BoxGeometry(length, 0.06, 0.6), stainlessMat);
    belt.position.y = 0.85;
    g.add(belt);

    const legCount = Math.floor(length / 1.5);
    for (let i = 0; i <= legCount; i++) {
        const lx = -length / 2 + (i / legCount) * length;
        [-0.25, 0.25].forEach(lz => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.85, 8), stainlessMat);
            leg.position.set(lx, 0.425, lz);
            g.add(leg);
        });
    }

    const fillerGantry = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.8), stainlessMat);
    fillerGantry.position.set(-1.0, 1.5, 0);
    g.add(fillerGantry);

    for (let n = 0; n < 4; n++) {
        const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35, 8), stainlessMat);
        nozzle.position.set(-1.4 + n * 0.25, 1.05, 0);
        g.add(nozzle);
    }

    // Rotating Rotary Capping Head
    const capperHead = new THREE.Group();
    capperHead.position.set(1.2, 1.25, 0);

    const capper = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.4, 16), stainlessMat);
    capperHead.add(capper);

    for (let a = 0; a < 4; a++) {
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.06), stainlessMat);
        arm.rotation.y = (a * Math.PI) / 4;
        capperHead.add(arm);
    }
    g.add(capperHead);
    g.userData.capperHead = capperHead;

    const jarCount = 10;
    for (let j = 0; j < jarCount; j++) {
        const jx = -length / 2 + 0.4 + (j / (jarCount - 1)) * (length - 0.8);
        const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.2, 12), glassJarMat);
        jar.position.set(jx, 0.98, 0);
        g.add(jar);

        const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.03, 12), goldLidMat);
        lid.position.set(jx, 1.09, 0);
        g.add(lid);
    }

    return g;
}

// 9. CONFECTIONERY SPEED COOLING RACK
function createCoolingRack() {
    const g = new THREE.Group();
    g.name = 'Confectionery_Cooling_Rack';
    const silverMat = new THREE.MeshStandardMaterial({ color: 0xDDEEFF, metalness: 0.8, roughness: 0.25 });
    const trayMat = new THREE.MeshStandardMaterial({ color: 0xEEBB88, roughness: 0.7 });

    const w = 1.0, d = 0.7, h = 1.9;
    [[-w / 2, -d / 2], [-w / 2, d / 2], [w / 2, -d / 2], [w / 2, d / 2]].forEach(([x, z]) => {
        const p = new THREE.Mesh(new THREE.BoxGeometry(0.04, h, 0.04), silverMat);
        p.position.set(x, h / 2 + 0.1, z);
        g.add(p);

        const wheel = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), new THREE.MeshStandardMaterial({ color: 0x222222 }));
        wheel.position.set(x, 0.05, z);
        g.add(wheel);
    });

    for (let l = 0; l < 6; l++) {
        const ty = 0.35 + l * 0.26;
        const tray = new THREE.Mesh(new THREE.BoxGeometry(w - 0.06, 0.02, d - 0.06), silverMat);
        tray.position.set(0, ty, 0);
        g.add(tray);

        const treats = new THREE.Mesh(new THREE.BoxGeometry(w - 0.15, 0.03, d - 0.15), trayMat);
        treats.position.set(0, ty + 0.025, 0);
        g.add(treats);
    }

    return g;
}

// 10. CMYK OFFSET PRINTING PRESS
function createCMYKPrintingPress() {
    const g = new THREE.Group();
    g.name = 'CMYK_Offset_Press';
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x2A3340, roughness: 0.5, metalness: 0.6 });
    const chromeMat = getMaterial('metal');

    const cmykColors = [
        { name: 'Cyan', color: 0x00AEEF },
        { name: 'Magenta', color: 0xEC008C },
        { name: 'Yellow', color: 0xFFF200 },
        { name: 'KeyBlack', color: 0x231F20 }
    ];

    const pressBed = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.4, 1.8), baseMat);
    pressBed.position.set(0, 0.2, 0);
    g.add(pressBed);

    cmykColors.forEach((c, idx) => {
        const tx = -2.25 + idx * 1.5;
        const tower = new THREE.Group();
        tower.position.set(tx, 0.4, 0);

        const housing = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.8, 1.6), baseMat);
        housing.position.y = 0.9;
        tower.add(housing);

        const inkHood = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.3, 1.4),
            new THREE.MeshStandardMaterial({ color: c.color, roughness: 0.3, metalness: 0.4 })
        );
        inkHood.position.set(0, 1.85, 0);
        tower.add(inkHood);

        const roller = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 1.35, 16), chromeMat);
        roller.rotation.x = Math.PI / 2;
        roller.position.set(0, 0.9, 0);
        tower.add(roller);

        g.add(tower);
    });

    const consoleStand = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.1, 0.4), baseMat);
    consoleStand.position.set(3.4, 0.55, 0.8);
    g.add(consoleStand);

    const touchScreen = createMonitor(0x00AAFF);
    touchScreen.position.set(3.4, 1.25, 0.8);
    touchScreen.rotation.y = -Math.PI / 4;
    g.add(touchScreen);

    return g;
}

// 11. INDUSTRIAL PAPER REEL UNWIND STAND
function createPaperReelUnwind() {
    const g = new THREE.Group();
    g.name = 'Paper_Reel_Unwind_Stand';
    const standMat = getMaterial('metal_dark');
    const paperMat = new THREE.MeshStandardMaterial({ color: 0xF4EBD9, roughness: 0.9 });

    [-0.8, 0.8].forEach(z => {
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.4, 0.15), standMat);
        arm.position.set(0, 0.7, z);
        g.add(arm);
    });

    // Kinematic rotating reel assembly
    const paperReelGroup = new THREE.Group();
    paperReelGroup.position.set(0, 0.9, 0);

    const reel = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 1.4, 24), paperMat);
    reel.rotation.x = Math.PI / 2;
    paperReelGroup.add(reel);

    // Contrasting strip on roll so rotation is clearly visible
    const strip = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 1.42, 0.72),
        new THREE.MeshStandardMaterial({ color: 0xCCAA88, roughness: 0.8 })
    );
    paperReelGroup.add(strip);

    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.8, 12), getMaterial('metal'));
    core.rotation.x = Math.PI / 2;
    paperReelGroup.add(core);

    g.add(paperReelGroup);
    g.userData.paperReel = paperReelGroup;

    return g;
}

// 12. HYDRAULIC GUILLOTINE PAPER CUTTER
function createGuillotineCutter() {
    const g = new THREE.Group();
    g.name = 'Guillotine_Paper_Cutter';
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x334455, roughness: 0.6, metalness: 0.4 });
    const chromeMat = getMaterial('metal');

    const bed = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 1.6), ironMat);
    bed.position.y = 0.4;
    g.add(bed);

    const arch = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.2, 1.55), ironMat);
    arch.position.set(0, 1.2, 0);
    g.add(arch);

    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.25, 1.4), chromeMat);
    blade.position.set(0.1, 0.95, 0);
    g.add(blade);

    return g;
}

// 13. CYCLONE DUST EXTRACTION SYSTEM
function createCycloneDustExtractor(h = 8) {
    const g = new THREE.Group();
    g.name = 'Cyclone_Dust_Extractor';
    const silverDuctMat = new THREE.MeshStandardMaterial({ color: 0xCCDDEE, metalness: 0.8, roughness: 0.3 });
    const darkMat = getMaterial('metal_dark');

    const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.0, 16), darkMat);
    drum.position.y = 0.5;
    g.add(drum);

    const cone = new THREE.Mesh(new THREE.ConeGeometry(1.1, 1.6, 16), silverDuctMat);
    cone.rotation.x = Math.PI;
    cone.position.y = 1.8;
    g.add(cone);

    const chamber = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 1.8, 16), silverDuctMat);
    chamber.position.y = 3.4;
    g.add(chamber);

    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.7, 12), darkMat);
    motor.position.y = 4.6;
    g.add(motor);

    // Rotating internal air vortex impeller
    const impeller = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 0.7), darkMat);
    impeller.position.y = 5.02;
    g.add(impeller);
    g.userData.impeller = impeller;

    const mainDuct = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 18, 12), silverDuctMat);
    mainDuct.rotation.x = Math.PI / 2;
    mainDuct.position.set(0, h - 1.5, -4);
    g.add(mainDuct);

    [-4, 2].forEach(dz => {
        const dropDuct = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.5, 8), silverDuctMat);
        dropDuct.position.set(0, h - 3.25, dz);
        g.add(dropDuct);
    });

    return g;
}

// 14. CANTILEVER TIMBER STORAGE RACK
function createLumberCantileverRack() {
    const g = new THREE.Group();
    g.name = 'Lumber_Cantilever_Rack';
    const orangeMat = new THREE.MeshStandardMaterial({ color: 0xEE7700, roughness: 0.5, metalness: 0.3 });
    const woodPlankMat = getMaterial('wood');
    const plywoodMat = getMaterial('wood_light');

    const w = 4.0, h = 2.8, armLen = 1.0;
    [-w / 2 + 0.5, 0, w / 2 - 0.5].forEach(cx => {
        const col = new THREE.Mesh(new THREE.BoxGeometry(0.18, h, 0.22), orangeMat);
        col.position.set(cx, h / 2, 0);
        g.add(col);

        const foot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.15, armLen * 1.4), orangeMat);
        foot.position.set(cx, 0.08, 0);
        g.add(foot);

        for (let tier = 1; tier <= 3; tier++) {
            const ay = tier * 0.8;
            const arm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, armLen), orangeMat);
            arm.position.set(cx, ay, armLen / 2);
            g.add(arm);
        }
    });

    for (let tier = 1; tier <= 3; tier++) {
        const ay = tier * 0.8 + 0.1;
        const mat = tier % 2 === 0 ? plywoodMat : woodPlankMat;
        const stack = new THREE.Mesh(new THREE.BoxGeometry(w - 0.3, 0.16, armLen * 0.85), mat);
        stack.position.set(0, ay, armLen / 2);
        g.add(stack);
    }

    return g;
}

// 15. REGIONAL COMMERCIAL DELIVERY TRUCK
function createDeliveryTruck() {
    const g = new THREE.Group();
    g.name = 'Commercial_Delivery_Truck';
    const cabColorMat = new THREE.MeshStandardMaterial({ color: 0x0A2540, roughness: 0.4, metalness: 0.5 });
    const cargoWhiteMat = new THREE.MeshStandardMaterial({ color: 0xF0F4F8, roughness: 0.5 });
    const chromeMat = getMaterial('metal');
    const darkMat = getMaterial('metal_dark');
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x181818, roughness: 0.95 });

    const chassis = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.28, 1.8), darkMat);
    chassis.position.set(0, 0.65, 0);
    g.add(chassis);

    const wheelGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.3, 16);
    const rimGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.32, 12);

    const wheelPositions = [
        [-2.8, -1.05], [-2.8, 1.05],
        [1.6, -1.05], [1.6, 1.05],
        [2.7, -1.05], [2.7, 1.05]
    ];
    wheelPositions.forEach(([wx, wz]) => {
        const tire = new THREE.Mesh(wheelGeo, tireMat);
        tire.rotation.x = Math.PI / 2;
        tire.position.set(wx, 0.48, wz);
        g.add(tire);

        const rim = new THREE.Mesh(rimGeo, chromeMat);
        rim.rotation.x = Math.PI / 2;
        rim.position.set(wx, 0.48, wz);
        g.add(rim);
    });

    const fuelTank = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 1.4, 16), chromeMat);
    fuelTank.rotation.z = Math.PI / 2;
    fuelTank.position.set(-0.6, 0.55, -1.0);
    g.add(fuelTank);

    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, 2.2), cabColorMat);
    cab.position.set(-2.6, 1.85, 0);
    g.add(cab);

    const windshield = new THREE.Mesh(
        new THREE.PlaneGeometry(1.9, 0.85),
        new THREE.MeshStandardMaterial({ color: 0x112233, roughness: 0.1, metalness: 0.8 })
    );
    windshield.position.set(-3.81, 2.15, 0);
    windshield.rotation.y = -Math.PI / 2;
    g.add(windshield);

    const grille = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.65, 1.4), chromeMat);
    grille.position.set(-3.82, 1.35, 0);
    g.add(grille);

    const bumper = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.35, 2.3), darkMat);
    bumper.position.set(-3.8, 0.75, 0);
    g.add(bumper);

    [-0.8, 0.8].forEach(hz => {
        const light = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0xFFFFAA, emissive: 0xFFFFAA, emissiveIntensity: 0.6 })
        );
        light.position.set(-3.85, 0.95, hz);
        g.add(light);
    });

    const boxLength = 5.6, boxHeight = 2.6, boxWidth = 2.35;
    const cargoBox = new THREE.Mesh(new THREE.BoxGeometry(boxLength, boxHeight, boxWidth), cargoWhiteMat);
    cargoBox.position.set(1.4, 2.15, 0);
    cargoBox.castShadow = true;
    g.add(cargoBox);

    const truckSignL = createTextPlane('UDYOG EXPRESS - LOGISTICS', {
        worldW: 4.8, worldH: 0.8, fontSize: 30,
        bgColor: '#0066FF', color: '#FFFFFF'
    });
    truckSignL.position.set(1.4, 2.25, boxWidth / 2 + 0.02);
    g.add(truckSignL);

    const truckSignR = createTextPlane('UDYOG EXPRESS - LOGISTICS', {
        worldW: 4.8, worldH: 0.8, fontSize: 30,
        bgColor: '#0066FF', color: '#FFFFFF'
    });
    truckSignR.position.set(1.4, 2.25, -boxWidth / 2 - 0.02);
    truckSignR.rotation.y = Math.PI;
    g.add(truckSignR);

    const rearOpening = new THREE.Mesh(new THREE.PlaneGeometry(boxWidth - 0.2, boxHeight - 0.4), darkMat);
    rearOpening.position.set(1.4 + boxLength / 2 + 0.01, 2.15, 0);
    rearOpening.rotation.y = Math.PI / 2;
    g.add(rearOpening);

    return g;
}

// 16. HYDRAULIC MANUAL PALLET JACK
function createPalletJack() {
    const g = new THREE.Group();
    g.name = 'Hydraulic_Pallet_Jack';
    const yellowMat = new THREE.MeshStandardMaterial({ color: 0xFFAA00, roughness: 0.4, metalness: 0.3 });
    const darkMat = getMaterial('metal_dark');

    [-0.18, 0.18].forEach(z => {
        const tine = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.06, 0.14), yellowMat);
        tine.position.set(0.6, 0.12, z);
        g.add(tine);
    });

    const pump = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.45, 10), darkMat);
    pump.position.set(0, 0.35, 0);
    g.add(pump);

    // Kinematic hydraulic pump handle assembly
    const handlePivot = new THREE.Group();
    handlePivot.position.set(0, 0.35, 0);

    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.9, 8), darkMat);
    handle.position.set(-0.25, 0.35, 0);
    handle.rotation.z = -0.4;
    handlePivot.add(handle);

    g.add(handlePivot);
    g.userData.handlePivot = handlePivot;

    return g;
}

// 17. DRIVE-ON FREIGHT FLOOR SCALE
function createDriveOnScale() {
    const g = new THREE.Group();
    g.name = 'Drive_On_Freight_Scale';
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x445566, roughness: 0.5, metalness: 0.7 });
    const safetyMat = getMaterial('yellow_safety');

    const plat = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.04, 1.8), steelMat);
    plat.position.y = 0.22;
    g.add(plat);

    const border = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.02, 1.95), safetyMat);
    border.position.y = 0.21;
    g.add(border);

    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.1, 8), getMaterial('metal'));
    post.position.set(1.1, 0.75, 0.9);
    g.add(post);

    const terminal = createTextPlane('WEIGHT: 420.5 KG', {
        worldW: 0.9, worldH: 0.35, fontSize: 26,
        bgColor: '#000000', color: '#00FF66'
    });
    terminal.position.set(1.1, 1.35, 0.9);
    terminal.rotation.y = -Math.PI / 4;
    g.add(terminal);

    return g;
}

// INDUSTRY 1: MANUFACTURING
// ═══════════════════════════════════════════════════════════════
function createManufacturing() {
    const pos = LAYOUT.MANUFACTURING;
    const size = BUILDING_SIZES.MANUFACTURING;
    const g = new THREE.Group();

    // Building shell
    const shell = createBuilding(size.w, size.h, size.d, {
        name: INDUSTRY_NAMES.MANUFACTURING, wallType: 'peb_blue', wallOpacity: 1.0, isFactory: true
    });
    g.add(shell);

    // ── Interior Lighting ──
    addInteriorLight(g, -8, size.h - 1, 0, 0.5);
    addInteriorLight(g, 8, size.h - 1, 0, 0.5);
    addInteriorLight(g, 0, size.h - 1, -6, 0.4);
    addInteriorLight(g, 0, size.h - 1, 6, 0.4);

    // ── 3 CNC Machines (production area, left side) ──
    const cnc1 = createMachine(2, 1.5, 1.5, 0x556677);
    cnc1.position.set(-10, 0.2, -5);
    g.add(cnc1);

    const cnc2 = createMachine(2, 1.5, 1.5, 0x556677);
    cnc2.position.set(-10, 0.2, 0);
    g.add(cnc2);

    const cnc3 = createMachine(2, 1.5, 1.5, 0x556677);
    cnc3.position.set(-10, 0.2, 5);
    g.add(cnc3);

    // ── 2 Manufacturing Workstations ──
    const mws1 = createWorkstation();
    mws1.position.set(-4, 0.2, -6);
    g.add(mws1);

    const mws2 = createWorkstation();
    mws2.position.set(-4, 0.2, 6);
    g.add(mws2);

    // ── Conveyor Belt & Automobile Chassis Assembly ──
    const conveyor = createConveyorBelt(8, 0.8);
    conveyor.position.set(3, 0.2, 0);
    g.add(conveyor);

    // Vehicle spaceframe chassis moving along assembly conveyor
    const autoChassis = createAutomobileChassis();
    autoChassis.position.set(3, 0.85, 0);
    g.add(autoChassis);

    // ── High-Precision CMM Coordinate Quality Inspection Station ──
    const cmmStation = createCMMStation();
    cmmStation.position.set(8, 0.2, -4);
    g.add(cmmStation);

    // ── 6-Axis Industrial Robotic Spot Welding Cell ──
    const roboticWelder = createRoboticWelder();
    roboticWelder.position.set(3, 0.2, 3.8);
    g.add(roboticWelder);

    // Stamped automotive parts stillage bins
    const stillageGeo = new THREE.BoxGeometry(1.2, 0.7, 0.9);
    const stillageMat = new THREE.MeshStandardMaterial({ color: 0x445566, metalness: 0.7, roughness: 0.4 });
    const stillage = new THREE.Mesh(stillageGeo, stillageMat);
    stillage.position.set(-1, 0.55, 5);
    g.add(stillage);

    // ── Inventory Shelves (back wall) ──
    const sh1 = createShelf(2, 2.5, 0.6, 5);
    sh1.position.set(-4, 0.2, -size.d / 2 + 1);
    g.add(sh1);

    const sh2 = createShelf(2, 2.5, 0.6, 5);
    sh2.position.set(0, 0.2, -size.d / 2 + 1);
    g.add(sh2);

    const sh3 = createShelf(2, 2.5, 0.6, 5);
    sh3.position.set(4, 0.2, -size.d / 2 + 1);
    g.add(sh3);

    // ── Workers near machines ──
    const w1 = createPerson({ shirtColor: 0x336699 });
    w1.position.set(-8.5, 0.2, -5);
    w1.rotation.y = Math.PI / 4;
    g.add(w1);

    const w2 = createPerson({ shirtColor: 0x336699 });
    w2.position.set(-8.5, 0.2, 0);
    w2.rotation.y = -Math.PI / 6;
    g.add(w2);

    const w3 = createPerson({ shirtColor: 0x336699 });
    w3.position.set(-8.5, 0.2, 5);
    w3.rotation.y = Math.PI / 3;
    g.add(w3);

    // ── Seated worker at workstation ──
    const seated1 = createSeatedPerson({ shirtColor: 0x336699 });
    seated1.position.set(-4, 0.2, -5.4);
    g.add(seated1);

    // ── Forklift ──
    const forklift = createForklift();
    forklift.position.set(10, 0.2, 5);
    forklift.rotation.y = -Math.PI / 4;
    g.add(forklift);

    // ── Safety floor markings ──
    addFloorStripe(g, 0, 3, 14, 'z');       // Central aisle
    addFloorStripe(g, -6, 0, 12, 'x');      // CNC area boundary
    addFloorStripe(g, 10, 0, 8, 'z');       // Forklift zone
    addFloorStripe(g, 0, -8, 14, 'x');      // Near back shelves

    // ── Safety Signs ──
    const safetySign = createTextPlane('⚠ HARD HAT AREA', {
        worldW: 3, worldH: 0.8, fontSize: 36,
        bgColor: '#FFCC00', color: '#000000'
    });
    safetySign.position.set(-size.w / 2 + 0.4, 4, 0);
    safetySign.rotation.y = Math.PI / 2;
    g.add(safetySign);

    const exitSign = createTextPlane('EXIT →', {
        worldW: 2, worldH: 0.6, fontSize: 32,
        bgColor: '#00AA00', color: '#FFFFFF'
    });
    exitSign.position.set(0, size.h - 0.5, size.d / 2 - 0.3);
    g.add(exitSign);

    // ── Small office corner (right-front) ──
    addOfficeCorner(g, 11, 7, Math.PI);

    // ── Industry-specific signage ──
    addBuildingSign(g, 'CNC PRODUCTION ZONE', -size.w / 2 + 0.4, 6, -3, Math.PI / 2);

    // ── Architectural Facade & Loading Bay Equipment ──
    // Overhead High-Bay Motorized Roll-Up Loading Door
    const rollDoorMat = getMaterial('metal_dark');
    const rollDoor = new THREE.Mesh(new THREE.BoxGeometry(5.0, 4.4, 0.15), rollDoorMat);
    rollDoor.position.set(size.w / 2 - 0.05, 2.2, 4.0);
    rollDoor.rotation.y = Math.PI / 2;
    g.add(rollDoor);

    // Hazard yellow-and-black chevron header above roll door
    const chevronMat = getMaterial('yellow_safety');
    const chevron = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.4, 0.2), chevronMat);
    chevron.position.set(size.w / 2 + 0.02, 4.5, 4.0);
    chevron.rotation.y = Math.PI / 2;
    g.add(chevron);

    // Exterior Screw Air Compressor Enclosure on Side Concrete Pad
    const compGroup = new THREE.Group();
    compGroup.position.set(-size.w / 2 - 2.8, 0, -4);
    const compBody = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, 3.2), getMaterial('peb_blue'));
    compBody.position.y = 1.1;
    compGroup.add(compBody);
    const compLouver = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.4), getMaterial('metal_dark'));
    compLouver.position.set(-1.21, 1.1, 0);
    compLouver.rotation.y = -Math.PI / 2;
    compGroup.add(compLouver);
    g.add(compGroup);

    // Heavy Scrap Metal Skip Bin
    const skipMat = new THREE.MeshStandardMaterial({ color: 0x2A52BE, roughness: 0.6, metalness: 0.4 });
    const skip = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.4, 3.8), skipMat);
    skip.position.set(-size.w / 2 - 3.0, 0.7, 4.5);
    g.add(skip);

    // Interior Overhead Bridge Crane Gantry Rails
    const craneRailMat = getMaterial('yellow_safety');
    [-size.d / 2 + 2, size.d / 2 - 2].forEach(cz => {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(size.w - 2, 0.25, 0.2), craneRailMat);
        rail.position.set(0, size.h - 1.2, cz);
        g.add(rail);
    });
    // Bridge Crane Span
    const craneSpan = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.45, size.d - 4), craneRailMat);
    craneSpan.position.set(2, size.h - 1.0, 0);
    g.add(craneSpan);

    // Position building at layout coordinate
    g.position.copy(pos);
    g.userData.kinematic = { armGroup: roboticWelder.userData.armGroup, arcLight: roboticWelder.userData.arcLight };
    return g;
}


// ═══════════════════════════════════════════════════════════════
// INDUSTRY 2: TEXTILE & GARMENT
// ═══════════════════════════════════════════════════════════════
function createTextile() {
    const pos = LAYOUT.TEXTILE;
    const size = BUILDING_SIZES.TEXTILE;
    const g = new THREE.Group();

    // Building shell
    const shell = createBuilding(size.w, size.h, size.d, {
        name: INDUSTRY_NAMES.TEXTILE, wallType: 'pir_white', wallOpacity: 1.0, isFactory: true
    });
    g.add(shell);

    // ── Interior Lighting ──
    addInteriorLight(g, -6, size.h - 1, 0, 0.45);
    addInteriorLight(g, 6, size.h - 1, 0, 0.45);
    addInteriorLight(g, 0, size.h - 1, -4, 0.3);
    addInteriorLight(g, 0, size.h - 1, 5, 0.3);

    // ── 4 Sewing machines on tables (left production area) ──
    const sewingPositions = [
        [-8, -4], [-8, -1], [-8, 2], [-8, 5]
    ];
    sewingPositions.forEach(([x, z], i) => {
        // Table
        const table = createDesk(1.0, 0.6, 0.75);
        table.position.set(x, 0.2, z);
        g.add(table);

        // Sewing machine on table
        const machine = createMachine(0.8, 0.8, 0.6, 0x889988);
        machine.position.set(x, 0.95, z);
        g.add(machine);
    });

    // ── Workers at sewing machines ──
    const sewWorker1 = createSeatedPerson({ shirtColor: 0x996688 });
    sewWorker1.position.set(-6.5, 0.2, -4);
    g.add(sewWorker1);

    const sewWorker2 = createSeatedPerson({ shirtColor: 0x889966 });
    sewWorker2.position.set(-6.5, 0.2, -1);
    g.add(sewWorker2);

    const sewWorker3 = createSeatedPerson({ shirtColor: 0x668899 });
    sewWorker3.position.set(-6.5, 0.2, 2);
    g.add(sewWorker3);

    // ── Fabric storage shelves ──
    const fabricShelf1 = createShelf(3, 2, 0.8, 4);
    fabricShelf1.position.set(-2, 0.2, -size.d / 2 + 1.2);
    g.add(fabricShelf1);

    const fabricShelf2 = createShelf(3, 2, 0.8, 4);
    fabricShelf2.position.set(3, 0.2, -size.d / 2 + 1.2);
    g.add(fabricShelf2);

    // ── Fabric rolls (colorful cylinders on & near shelves) ──
    const fabricColors = [0xCC3333, 0x3366CC, 0x33AA66, 0xCC9933, 0x9933CC,
                          0xFF6688, 0x44BBCC, 0xFFAA33, 0x6633CC, 0x33CC99];
    for (let i = 0; i < 12; i++) {
        const roll = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.15, 0.8, 12),
            new THREE.MeshStandardMaterial({ color: fabricColors[i % fabricColors.length], roughness: 0.6 })
        );
        // Lay rolls horizontally on shelves and floor
        roll.rotation.x = Math.PI / 2;
        const shelfX = i < 6 ? -2 : 3;
        const row = i % 6;
        const shelfLevel = 0.5 + Math.floor(row / 3) * 0.55;
        const zOff = -size.d / 2 + 1.2;
        roll.position.set(shelfX - 1 + (row % 3) * 0.4, shelfLevel + 0.2, zOff);
        g.add(roll);
    }

    // ── Dual-Rail Rolling Garment Racks with Hanging Apparel ──
    const garmentRack1 = createGarmentRack();
    garmentRack1.position.set(2, 0.2, 4.8);
    g.add(garmentRack1);

    const garmentRack2 = createGarmentRack();
    garmentRack2.position.set(5.5, 0.2, 4.8);
    g.add(garmentRack2);

    // ── High-Capacity Fabric Bolt A-Frame Carousel ──
    const fabricCarousel = createFabricBoltCarousel();
    fabricCarousel.position.set(-2, 0.2, 5.5);
    g.add(fabricCarousel);

    // ── Industrial Vacuum Steam Pressing Station ──
    const steamPress = createSteamIroningStation();
    steamPress.position.set(-8, 0.2, 6.5);
    g.add(steamPress);

    // ── Cutting table (large desk, center) ──
    const cuttingTable = createDesk(2.5, 1.2, 0.9);
    cuttingTable.position.set(0, 0.2, 2);
    g.add(cuttingTable);

    // Fabric piece on cutting table
    const fabricPiece = new THREE.Mesh(
        new THREE.BoxGeometry(2.0, 0.02, 0.9),
        new THREE.MeshStandardMaterial({ color: 0x3366CC, roughness: 0.8 })
    );
    fabricPiece.position.set(0, 1.14, 2);
    g.add(fabricPiece);

    // Scissors / cutting tool
    const scissors = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.02, 0.06),
        getMaterial('metal')
    );
    scissors.position.set(0.8, 1.15, 2.2);
    scissors.rotation.y = 0.3;
    g.add(scissors);

    // ── 2 Design workstations (right side) ──
    const dws1 = createWorkstation({ monitorCount: 2 });
    dws1.position.set(8, 0.2, -4);
    g.add(dws1);

    const dws2 = createWorkstation({ monitorCount: 2 });
    dws2.position.set(8, 0.2, 0);
    g.add(dws2);

    // Designers seated
    const designer1 = createSeatedPerson({ shirtColor: 0xCC6699 });
    designer1.position.set(8, 0.2, -3.4);
    g.add(designer1);

    const designer2 = createSeatedPerson({ shirtColor: 0x6699CC });
    designer2.position.set(8, 0.2, 0.6);
    g.add(designer2);

    // ── Mannequins displaying garments ──
    for (let i = 0; i < 3; i++) {
        const mannequin = new THREE.Group();
        // Body
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xEEDDCC, roughness: 0.5 });
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.15, 0.6, 8), bodyMat);
        torso.position.y = 1.2;
        mannequin.add(torso);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), bodyMat);
        head.position.y = 1.6;
        mannequin.add(head);
        // Stand
        const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 6), getMaterial('metal'));
        stand.position.y = 0.45;
        mannequin.add(stand);
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.03, 10), getMaterial('metal'));
        mannequin.add(base);
        // Garment
        const garment = new THREE.Mesh(
            new THREE.CylinderGeometry(0.22, 0.28, 0.5, 8),
            new THREE.MeshStandardMaterial({ color: fabricColors[i * 3], roughness: 0.7 })
        );
        garment.position.y = 1.05;
        mannequin.add(garment);

        mannequin.position.set(5, 0.2, 4 + i * 1.5);
        g.add(mannequin);
    }

    // ── Color palette / swatch board on wall ──
    const swatchBoard = new THREE.Group();
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 6; c++) {
            const swatch = new THREE.Mesh(
                new THREE.BoxGeometry(0.3, 0.3, 0.02),
                new THREE.MeshStandardMaterial({ color: fabricColors[(r * 6 + c) % fabricColors.length], roughness: 0.6 })
            );
            swatch.position.set(c * 0.35, r * 0.35, 0);
            swatchBoard.add(swatch);
        }
    }
    swatchBoard.position.set(6, 3, -size.d / 2 + 0.4);
    g.add(swatchBoard);

    // ── Floor markings ──
    addFloorStripe(g, -4, 0, 14, 'z');
    addFloorStripe(g, 4, 0, 14, 'z');

    // ── Small office corner ──
    addOfficeCorner(g, 9, 6, Math.PI);

    // ── Industry signage ──
    addBuildingSign(g, 'DESIGN STUDIO', size.w / 2 - 0.4, 5, -2, -Math.PI / 2);
    addBuildingSign(g, 'PRODUCTION FLOOR', -size.w / 2 + 0.4, 5, 0, Math.PI / 2);

    // ── Architectural Facade & Textile Loading Bay ──
    // Raw Fabric Intake Dock Canopy with Weather Seal
    const canopyMat = getMaterial('navy');
    const texCanopy = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.25, 3.2), canopyMat);
    texCanopy.position.set(size.w / 2 + 1.6, 4.2, 3.0);
    g.add(texCanopy);

    const texRollDoor = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.6, 4.2), getMaterial('metal_dark'));
    texRollDoor.position.set(size.w / 2 - 0.05, 1.8, 3.0);
    g.add(texRollDoor);

    // Roof-Mounted Industrial Lint Cyclone Collector
    const lintGroup = new THREE.Group();
    lintGroup.position.set(-size.w / 2 + 4, size.h + 0.5, -size.d / 2 + 4);
    const lintBody = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.2, 2.2, 12), getMaterial('metal_light'));
    lintBody.position.y = 1.1;
    lintGroup.add(lintBody);
    const lintDuct = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 2.5, 8), getMaterial('metal'));
    lintDuct.rotation.z = Math.PI / 2;
    lintDuct.position.set(1.2, 1.8, 0);
    lintGroup.add(lintDuct);
    g.add(lintGroup);

    g.position.copy(pos);
    g.userData.kinematic = { rollGroup: fabricCarousel.userData.rollGroup };
    return g;
}


// ═══════════════════════════════════════════════════════════════
// INDUSTRY 3: FOOD PROCESSING
// ═══════════════════════════════════════════════════════════════
function createFoodProcessing() {
    const pos = LAYOUT.FOOD_PROCESSING;
    const size = BUILDING_SIZES.FOOD_PROCESSING;
    const g = new THREE.Group();

    const shell = createBuilding(size.w, size.h, size.d, {
        name: INDUSTRY_NAMES.FOOD_PROCESSING, wallType: 'pir_white', wallOpacity: 1.0, isFactory: true
    });
    g.add(shell);

    // ── Interior Lighting (brighter for food facility) ──
    addInteriorLight(g, -6, size.h - 1, 0, 0.5, 0xFFFFEE);
    addInteriorLight(g, 6, size.h - 1, 0, 0.5, 0xFFFFEE);
    addInteriorLight(g, 0, size.h - 1, -5, 0.4, 0xFFFFEE);
    addInteriorLight(g, 0, size.h - 1, 5, 0.4, 0xFFFFEE);

    // ── 2 Commercial Mixers ──
    const mixer1 = createMachine(1, 1.4, 0.8, 0x999999);
    mixer1.position.set(-8, 0.2, -4);
    g.add(mixer1);

    const mixer2 = createMachine(1, 1.4, 0.8, 0x999999);
    mixer2.position.set(-8, 0.2, 0);
    g.add(mixer2);

    // Mixer bowls on top
    [[-8, -4], [-8, 0]].forEach(([x, z]) => {
        const bowl = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.2, 0.3, 12),
            new THREE.MeshStandardMaterial({ color: 0xBBBBBB, roughness: 0.2, metalness: 0.8 })
        );
        bowl.position.set(x, 1.8, z);
        g.add(bowl);
    });

    // ── Packaging Line (long table with boxes) ──
    const packTable = createDesk(6, 1.0, 0.85);
    packTable.position.set(2, 0.2, -5);
    g.add(packTable);

    // Small boxes on packaging line
    const boxColors = [0xFFCC88, 0xFF9966, 0xFFDD99, 0xEEBB77];
    for (let i = 0; i < 10; i++) {
        const box = new THREE.Mesh(
            new THREE.BoxGeometry(0.25, 0.15, 0.2),
            new THREE.MeshStandardMaterial({ color: boxColors[i % 4], roughness: 0.7 })
        );
        box.position.set(2 - 2.5 + i * 0.5, 1.1, -5);
        g.add(box);
    }

    // ── Storage Shelves ──
    const fShelf1 = createShelf(2.5, 2, 0.6, 4);
    fShelf1.position.set(-3, 0.2, -size.d / 2 + 1);
    g.add(fShelf1);

    const fShelf2 = createShelf(2.5, 2, 0.6, 4);
    fShelf2.position.set(2, 0.2, -size.d / 2 + 1);
    g.add(fShelf2);

    // ── Quality Control Workstation ──
    const qcWs = createWorkstation({ monitorCount: 2 });
    qcWs.position.set(8, 0.2, -4);
    g.add(qcWs);

    // QC sign
    const qcSign = createTextPlane('QUALITY CONTROL', {
        worldW: 4, worldH: 0.8, fontSize: 34,
        bgColor: '#006633', color: '#FFFFFF'
    });
    qcSign.position.set(8, 3, -size.d / 2 + 0.4);
    g.add(qcSign);

    // QC person
    const qcPerson = createSeatedPerson({ shirtColor: 0xFFFFFF });
    qcPerson.position.set(8, 0.2, -3.4);
    g.add(qcPerson);

    // ── Workers in white shirts ──
    const fw1 = createPerson({ shirtColor: 0xFFFFFF });
    fw1.position.set(-6, 0.2, -4);
    fw1.rotation.y = Math.PI / 2;
    g.add(fw1);

    const fw2 = createPerson({ shirtColor: 0xFFFFFF });
    fw2.position.set(0, 0.2, -5);
    fw2.rotation.y = Math.PI;
    g.add(fw2);

    const fw3 = createPerson({ shirtColor: 0xFFFFFF });
    fw3.position.set(5, 0.2, 2);
    g.add(fw3);

    // ── Stainless Steel Work Tables ──
    for (let i = 0; i < 3; i++) {
        const steelTable = createDesk(2, 0.8, 0.9);
        steelTable.position.set(-4 + i * 4, 0.2, 3);
        g.add(steelTable);

        // Food items on tables
        for (let j = 0; j < 3; j++) {
            const container = new THREE.Mesh(
                new THREE.BoxGeometry(0.4, 0.15, 0.3),
                new THREE.MeshStandardMaterial({ color: 0xCCCCCC, roughness: 0.2, metalness: 0.7 })
            );
            container.position.set(-4 + i * 4 - 0.5 + j * 0.5, 1.15, 3);
            g.add(container);
        }
    }

    // ── Overhead Sanitary Stainless-Steel Transfer Piping Network ──
    const sanitaryPipes = createSanitaryPipeNetwork(size.w, size.d, size.h);
    g.add(sanitaryPipes);

    // ── Automated Inline Bottling & Rotary Capping Conveyor ──
    const bottlingLine = createBottlingLine(7);
    bottlingLine.position.set(2, 0.2, -1.5);
    g.add(bottlingLine);

    // ── Mobile Stainless Confectionery Speed Cooling Rack ──
    const coolingRack = createCoolingRack();
    coolingRack.position.set(-6, 0.2, 5.5);
    g.add(coolingRack);

    // ── Cold Storage Unit ──
    const coldStorage = new THREE.Group();
    const coldBody = new THREE.Mesh(
        new THREE.BoxGeometry(3, 2.5, 2),
        new THREE.MeshStandardMaterial({ color: 0x88AABB, roughness: 0.3, metalness: 0.5 })
    );
    coldBody.position.y = 1.25;
    coldStorage.add(coldBody);

    // Door handle
    const handle = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.5, 0.06),
        getMaterial('metal')
    );
    handle.position.set(0.8, 1.3, 1.02);
    coldStorage.add(handle);

    // Temperature display
    const tempDisplay = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.2, 0.03),
        new THREE.MeshStandardMaterial({ color: 0x0044FF, emissive: 0x0044FF, emissiveIntensity: 0.5 })
    );
    tempDisplay.position.set(-0.5, 2.0, 1.02);
    coldStorage.add(tempDisplay);

    // "COLD STORAGE" label
    const coldLabel = createTextPlane('-4°C', {
        worldW: 1.5, worldH: 0.5, fontSize: 36,
        bgColor: '#003366', color: '#66CCFF'
    });
    coldLabel.position.set(0, 2.6, 1.02);
    coldStorage.add(coldLabel);

    coldStorage.position.set(8, 0.2, 5);
    g.add(coldStorage);

    // ── Hygiene station (hand wash) ──
    const hygieneSign = createTextPlane('🧴 WASH HANDS', {
        worldW: 2.5, worldH: 0.6, fontSize: 30,
        bgColor: '#0066AA', color: '#FFFFFF'
    });
    hygieneSign.position.set(0, 4, size.d / 2 - 0.3);
    g.add(hygieneSign);

    // ── Floor markings ──
    addFloorStripe(g, -5, 0, 14, 'z');
    addFloorStripe(g, 5, 0, 14, 'z');
    addFloorStripe(g, 0, 6, 10, 'x');

    // ── Small office corner ──
    addOfficeCorner(g, -9, 6, 0);

    // ── Industry signage ──
    addBuildingSign(g, 'PROCESSING AREA', -size.w / 2 + 0.4, 5, -2, Math.PI / 2);

    // ── Architectural Facade & Food-Grade Bulk Silos ──
    // Twin Outdoor Vertical Stainless Steel Bulk Ingredient Silos (Liquid Sugar & Flour)
    const siloMat = new THREE.MeshStandardMaterial({ color: 0xD8DFE8, roughness: 0.2, metalness: 0.85 });
    [-size.w / 2 - 3.5].forEach(sx => {
        [-3.0, 3.0].forEach(sz => {
            const silo = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 7.5, 16), siloMat);
            silo.position.set(sx, 3.75, sz);
            g.add(silo);
            const cap = new THREE.Mesh(new THREE.ConeGeometry(1.65, 1.2, 16), getMaterial('metal_light'));
            cap.position.set(sx, 8.1, sz);
            g.add(cap);
        });
    });

    // Refrigerated Loading Dock with Inflatable Weather Seal Cushions
    const dockGroup = new THREE.Group();
    dockGroup.position.set(size.w / 2, 0, 0);
    const dockSeal = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4.4, 4.0), getMaterial('metal_dark'));
    dockSeal.position.set(0.15, 2.2, 0);
    dockGroup.add(dockSeal);
    const dockDoor = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3.8, 3.4), getMaterial('white'));
    dockDoor.position.set(-0.02, 2.0, 0);
    dockGroup.add(dockDoor);
    g.add(dockGroup);

    g.position.copy(pos);
    g.userData.kinematic = { capperHead: bottlingLine.userData.capperHead };
    return g;
}


// ═══════════════════════════════════════════════════════════════
// INDUSTRY 4: PRINTING & PACKAGING
// ═══════════════════════════════════════════════════════════════
function createPrinting() {
    const pos = LAYOUT.PRINTING;
    const size = BUILDING_SIZES.PRINTING;
    const g = new THREE.Group();

    const shell = createBuilding(size.w, size.h, size.d, {
        name: INDUSTRY_NAMES.PRINTING, wallType: 'peb_grey', wallOpacity: 1.0, isFactory: true
    });
    g.add(shell);

    // ── Interior Lighting ──
    addInteriorLight(g, -6, size.h - 1, 0, 0.5);
    addInteriorLight(g, 6, size.h - 1, 0, 0.5);
    addInteriorLight(g, 0, size.h - 1, -5, 0.35);
    addInteriorLight(g, 0, size.h - 1, 5, 0.35);

    // ── Full 4-Color (CMYK) Modular Offset Printing Press ──
    const cmykPress = createCMYKPrintingPress();
    cmykPress.position.set(-2, 0.2, 0);
    g.add(cmykPress);

    // ── Heavy Industrial Paper Reel Unwind Stand ──
    const unwindStand = createPaperReelUnwind();
    unwindStand.position.set(-6.2, 0.2, 0);
    g.add(unwindStand);

    // ── High-Precision Hydraulic Guillotine Paper Trimmer ──
    const guillotine = createGuillotineCutter();
    guillotine.position.set(2, 0.2, -6);
    g.add(guillotine);

    // ── 2 Large Printing Machines ──
    const printer1 = createMachine(3, 1.8, 1.5, 0x445566);
    printer1.position.set(-8, 0.2, -4);
    g.add(printer1);

    const printer2 = createMachine(3, 1.8, 1.5, 0x445566);
    printer2.position.set(-8, 0.2, 3);
    g.add(printer2);

    // Paper feed trays on printers
    [[-8, -4], [-8, 3]].forEach(([x, z]) => {
        const tray = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 0.08, 0.6),
            new THREE.MeshStandardMaterial({ color: 0xCCCCCC, roughness: 0.3, metalness: 0.5 })
        );
        tray.position.set(x + 1.5, 1.0, z);
        g.add(tray);

        // Stack of paper in tray
        const paper = new THREE.Mesh(
            new THREE.BoxGeometry(1.0, 0.15, 0.5),
            new THREE.MeshStandardMaterial({ color: 0xFAFAFA, roughness: 0.9 })
        );
        paper.position.set(x + 1.5, 1.15, z);
        g.add(paper);
    });

    // ── Label Printing Station ──
    const labelPrinter = createMachine(1, 1, 0.8, 0x667788);
    labelPrinter.position.set(-3, 0.2, -6);
    g.add(labelPrinter);

    // Label roll
    const labelRoll = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 0.4, 12),
        new THREE.MeshStandardMaterial({ color: 0xFFFFEE, roughness: 0.5 })
    );
    labelRoll.rotation.z = Math.PI / 2;
    labelRoll.position.set(-3, 1.5, -6);
    g.add(labelRoll);

    // ── 2 Graphic Design Workstations (dual monitors) ──
    const gws1 = createWorkstation({ monitorCount: 2, deskW: 1.6 });
    gws1.position.set(6, 0.2, -6);
    g.add(gws1);

    const gws2 = createWorkstation({ monitorCount: 2, deskW: 1.6 });
    gws2.position.set(6, 0.2, -2);
    g.add(gws2);

    // Designers
    const des1 = createSeatedPerson({ shirtColor: 0x445577 });
    des1.position.set(6, 0.2, -5.4);
    g.add(des1);

    const des2 = createSeatedPerson({ shirtColor: 0x554477 });
    des2.position.set(6, 0.2, -1.4);
    g.add(des2);

    // ── Paper Storage Shelves ──
    const paperShelf = createShelf(2, 2.5, 0.8, 5);
    paperShelf.position.set(8, 0.2, -size.d / 2 + 1.5);
    g.add(paperShelf);

    // Extra paper reams on floor
    for (let i = 0; i < 4; i++) {
        const ream = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.3 + Math.random() * 0.3, 0.5),
            new THREE.MeshStandardMaterial({ color: 0xFAFAFA, roughness: 0.9 })
        );
        ream.position.set(10 + (i % 2) * 0.7, 0.35, -size.d / 2 + 2 + Math.floor(i / 2) * 0.7);
        g.add(ream);
    }

    // ── 2 Workers near printers ──
    const pw1 = createPerson({ shirtColor: 0x334466 });
    pw1.position.set(-6, 0.2, -4);
    pw1.rotation.y = Math.PI / 2;
    g.add(pw1);

    const pw2 = createPerson({ shirtColor: 0x334466 });
    pw2.position.set(-6, 0.2, 3);
    pw2.rotation.y = -Math.PI / 4;
    g.add(pw2);

    // ── Stacks of printed material (on output tables) ──
    const outputTable1 = createDesk(2.0, 0.8, 0.85);
    outputTable1.position.set(2, 0.2, 4);
    g.add(outputTable1);

    const outputTable2 = createDesk(2.0, 0.8, 0.85);
    outputTable2.position.set(6, 0.2, 4);
    g.add(outputTable2);

    // Printed material stacks (colored flat boxes)
    const printColors = [0xCC4444, 0x4444CC, 0x44CC44, 0xCCCC44, 0xCC44CC, 0x44CCCC];
    [2, 6].forEach(x => {
        for (let j = 0; j < 4; j++) {
            const stack = new THREE.Mesh(
                new THREE.BoxGeometry(0.4, 0.04 + Math.random() * 0.08, 0.3),
                new THREE.MeshStandardMaterial({ color: printColors[(x + j) % printColors.length], roughness: 0.6 })
            );
            stack.position.set(x - 0.5 + j * 0.45, 1.1 + j * 0.05, 4);
            g.add(stack);
        }
    });

    // ── Color proof display on wall ──
    const colorProof = createTextPlane('CMYK PROOF OK', {
        worldW: 3, worldH: 0.8, fontSize: 32,
        bgColor: '#222244', color: '#FF66CC'
    });
    colorProof.position.set(-3, 4, -size.d / 2 + 0.4);
    g.add(colorProof);

    // ── Ink cartridge shelf ──
    const inkShelf = createShelf(1.5, 1.5, 0.4, 3);
    inkShelf.position.set(-3, 0.2, -size.d / 2 + 1);
    g.add(inkShelf);

    // Ink cartridges (colored cylinders)
    const inkColors = [0x000000, 0x00CCCC, 0xCC00CC, 0xCCCC00];
    inkColors.forEach((c, i) => {
        const cart = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.08, 0.25, 8),
            new THREE.MeshStandardMaterial({ color: c, roughness: 0.3 })
        );
        cart.position.set(-3 - 0.3 + i * 0.25, 1.0, -size.d / 2 + 1);
        g.add(cart);
    });

    // ── Floor markings ──
    addFloorStripe(g, -4, 0, 16, 'z');
    addFloorStripe(g, 3, 0, 16, 'z');

    // ── Small office corner ──
    addOfficeCorner(g, 9, 7, Math.PI);

    // ── Industry signage ──
    addBuildingSign(g, 'PRINT PRODUCTION', -size.w / 2 + 0.4, 5, 0, Math.PI / 2);

    // ── Architectural Facade & Heavy Paper Roll Intake Dock ──
    // Paper Roll Unloading Bay with Hydraulic Scissor Lift Frame
    const printDock = new THREE.Group();
    printDock.position.set(size.w / 2, 0, 2);
    const liftPlatform = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 4.0), getMaterial('yellow_safety'));
    liftPlatform.position.set(0.6, 0.9, 0);
    printDock.add(liftPlatform);
    const pRollDoor = new THREE.Mesh(new THREE.BoxGeometry(0.12, 4.2, 4.4), getMaterial('metal_dark'));
    pRollDoor.position.set(-0.05, 2.1, 0);
    printDock.add(pRollDoor);
    g.add(printDock);

    // Outdoor VOC Solvent Exhaust Stack with Thermal Oxidizer Unit
    const stackGroup = new THREE.Group();
    stackGroup.position.set(-size.w / 2 - 3.2, 0, 4);
    const oxidizer = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.5, 3.2), getMaterial('peb_grey'));
    oxidizer.position.y = 1.25;
    stackGroup.add(oxidizer);
    const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 7.5, 8), getMaterial('metal_light'));
    stack.position.set(0.6, 4.5, 0);
    stackGroup.add(stack);
    g.add(stackGroup);

    g.position.copy(pos);
    g.userData.kinematic = { paperReel: unwindStand.userData.paperReel };
    return g;
}


// ═══════════════════════════════════════════════════════════════
// INDUSTRY 5: FURNITURE & WOODWORK
// ═══════════════════════════════════════════════════════════════
function createFurniture() {
    const pos = LAYOUT.FURNITURE;
    const size = BUILDING_SIZES.FURNITURE;
    const g = new THREE.Group();

    const shell = createBuilding(size.w, size.h, size.d, {
        name: INDUSTRY_NAMES.FURNITURE, wallType: 'concrete_dark', wallOpacity: 1.0, isFactory: true
    });
    g.add(shell);

    // ── Interior Lighting ──
    addInteriorLight(g, -8, size.h - 1, 0, 0.45);
    addInteriorLight(g, 8, size.h - 1, 0, 0.45);
    addInteriorLight(g, 0, size.h - 1, -5, 0.35);
    addInteriorLight(g, 0, size.h - 1, 5, 0.35);

    // ── Central Cyclone Dust Extraction System & Overhead Ductwork ──
    const cyclone = createCycloneDustExtractor(size.h);
    cyclone.position.set(-13, 0.2, 5.5);
    g.add(cyclone);

    // ── Heavy-Duty Cantilever Timber Storage Racking ──
    const lumberRack = createLumberCantileverRack();
    lumberRack.position.set(6, 0.2, 4);
    g.add(lumberRack);

    // ── 2 Wood Cutting Machines ──
    const cutter1 = createMachine(2, 1.3, 1.2, 0x778866);
    cutter1.position.set(-10, 0.2, -4);
    g.add(cutter1);

    const cutter2 = createMachine(2, 1.3, 1.2, 0x778866);
    cutter2.position.set(-10, 0.2, 3);
    g.add(cutter2);

    // Circular saw blade (visual hint)
    [[-10, -4], [-10, 3]].forEach(([x, z]) => {
        const blade = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.3, 0.02, 24),
            new THREE.MeshStandardMaterial({ color: 0xAAAAAA, roughness: 0.1, metalness: 0.9 })
        );
        blade.rotation.x = Math.PI / 2;
        blade.position.set(x, 1.7, z + 0.7);
        g.add(blade);
    });

    // ── 3 Workbenches ──
    const benchPositions = [[-4, -4], [-4, 1], [-4, 6]];
    benchPositions.forEach(([x, z]) => {
        const bench = createDesk(2, 0.8, 0.85);
        bench.position.set(x, 0.2, z);
        g.add(bench);

        // Wood pieces on benches
        for (let i = 0; i < 2; i++) {
            const piece = new THREE.Mesh(
                new THREE.BoxGeometry(0.6 + Math.random() * 0.4, 0.06, 0.15),
                getMaterial('wood_light')
            );
            piece.position.set(x - 0.3 + i * 0.7, 1.1, z);
            piece.rotation.y = Math.random() * 0.3;
            g.add(piece);
        }
    });

    // ── Wood Storage Shelf ──
    const woodShelf = createShelf(3, 2.5, 0.8, 3);
    woodShelf.position.set(-10, 0.2, -size.d / 2 + 1.5);
    g.add(woodShelf);

    // Wood planks on shelf (long colored pieces)
    for (let i = 0; i < 8; i++) {
        const plank = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 0.04, 0.15),
            getMaterial(i % 2 === 0 ? 'wood' : 'wood_light')
        );
        plank.position.set(-10, 0.6 + Math.floor(i / 3) * 0.85 + 0.2, -size.d / 2 + 1.5 + (i % 3) * 0.2);
        g.add(plank);
    }

    // ── Partially assembled furniture piece (cabinet) ──
    const cabinet = new THREE.Group();
    // Side panels
    const panelMat = getMaterial('wood');
    const leftPanel = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.2, 0.5), panelMat);
    leftPanel.position.set(-0.4, 0.6, 0);
    cabinet.add(leftPanel);
    const rightPanel = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.2, 0.5), panelMat);
    rightPanel.position.set(0.4, 0.6, 0);
    cabinet.add(rightPanel);
    // Back panel
    const backPanel = new THREE.Mesh(new THREE.BoxGeometry(0.84, 1.2, 0.04), panelMat);
    backPanel.position.set(0, 0.6, -0.23);
    cabinet.add(backPanel);
    // Shelves
    for (let i = 0; i < 3; i++) {
        const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.04, 0.46), panelMat);
        shelf.position.set(0, 0.02 + i * 0.4, 0);
        cabinet.add(shelf);
    }
    // Top
    const topPanel = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.04, 0.54), getMaterial('wood_dark'));
    topPanel.position.set(0, 1.22, 0);
    cabinet.add(topPanel);

    cabinet.position.set(2, 0.2, 0);
    g.add(cabinet);

    // "In progress" sign near cabinet
    const wipSign = createTextPlane('WIP', {
        worldW: 1, worldH: 0.5, fontSize: 36,
        bgColor: '#CC6600', color: '#FFFFFF'
    });
    wipSign.position.set(2, 2.0, 0.5);
    g.add(wipSign);

    // ── 2 Design Workstations ──
    const fws1 = createWorkstation({ monitorCount: 2 });
    fws1.position.set(10, 0.2, -6);
    g.add(fws1);

    const fws2 = createWorkstation();
    fws2.position.set(10, 0.2, -2);
    g.add(fws2);

    // ── 3 Workers ──
    const fWorker1 = createPerson({ shirtColor: 0x886644 });
    fWorker1.position.set(-8, 0.2, -4);
    fWorker1.rotation.y = Math.PI / 3;
    g.add(fWorker1);

    const fWorker2 = createPerson({ shirtColor: 0x886644 });
    fWorker2.position.set(-2, 0.2, 1);
    fWorker2.rotation.y = -Math.PI / 2;
    g.add(fWorker2);

    const fWorker3 = createPerson({ shirtColor: 0x886644 });
    fWorker3.position.set(0, 0.2, 6);
    g.add(fWorker3);

    // Designer seated
    const fDesigner = createSeatedPerson({ shirtColor: 0x667755 });
    fDesigner.position.set(10, 0.2, -5.4);
    g.add(fDesigner);

    // ── Sawdust and wood shavings effect ──
    const shavingMat = new THREE.MeshStandardMaterial({ color: 0xC4A050, roughness: 0.95 });
    for (let i = 0; i < 30; i++) {
        const shaving = new THREE.Mesh(
            new THREE.BoxGeometry(0.08 + Math.random() * 0.12, 0.005, 0.04 + Math.random() * 0.08),
            shavingMat
        );
        // Scatter mostly near machines and workbenches
        const baseX = -6 + Math.random() * 8;
        const baseZ = -6 + Math.random() * 12;
        shaving.position.set(baseX, 0.22, baseZ);
        shaving.rotation.y = Math.random() * Math.PI;
        g.add(shaving);
    }

    // ── Finished furniture display (a simple table) ──
    const displayTable = new THREE.Group();
    const dtTop = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.05, 0.6), getMaterial('wood_dark'));
    dtTop.position.y = 0.7;
    displayTable.add(dtTop);
    const dtLegGeo = new THREE.BoxGeometry(0.06, 0.65, 0.06);
    [[-0.4, -0.22], [0.4, -0.22], [-0.4, 0.22], [0.4, 0.22]].forEach(([x, z]) => {
        const leg = new THREE.Mesh(dtLegGeo, getMaterial('wood'));
        leg.position.set(x, 0.325, z);
        displayTable.add(leg);
    });
    displayTable.position.set(6, 0.2, 5);
    g.add(displayTable);

    // "SHOWPIECE" tag
    const showTag = createTextPlane('DISPLAY', {
        worldW: 1.2, worldH: 0.4, fontSize: 28,
        bgColor: '#006633', color: '#FFFFFF'
    });
    showTag.position.set(6, 1.5, 5.5);
    g.add(showTag);

    // ── Tool rack on wall ──
    const toolRack = new THREE.Mesh(
        new THREE.BoxGeometry(2, 1.5, 0.08),
        new THREE.MeshStandardMaterial({ color: 0x556655, roughness: 0.7 })
    );
    toolRack.position.set(-6, 3, -size.d / 2 + 0.4);
    g.add(toolRack);

    // Tools (simple shapes)
    for (let i = 0; i < 5; i++) {
        const tool = new THREE.Mesh(
            new THREE.BoxGeometry(0.06, 0.4 + Math.random() * 0.3, 0.04),
            getMaterial('metal')
        );
        tool.position.set(-7 + i * 0.4, 3.0, -size.d / 2 + 0.5);
        g.add(tool);
    }

    // ── Floor markings ──
    addFloorStripe(g, -6, 0, 14, 'z');
    addFloorStripe(g, 5, 0, 14, 'z');

    // ── Small office corner ──
    addOfficeCorner(g, 10, 6, Math.PI);

    // ── Industry signage ──
    addBuildingSign(g, 'WOODWORKING SHOP', -size.w / 2 + 0.4, 5, 0, Math.PI / 2);

    // ── Architectural Facade, Sawdust Cyclone & Timber Shed ──
    // Outdoor Sawdust Cyclone Filtration Tower (8.5m high)
    const outdoorCyclone = new THREE.Group();
    outdoorCyclone.position.set(-size.w / 2 - 3.8, 0, -4);
    // 4 Support Legs
    for (let lx of [-1, 1]) {
        for (let lz of [-1, 1]) {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 4.5, 6), getMaterial('metal'));
            leg.position.set(lx * 0.9, 2.25, lz * 0.9);
            outdoorCyclone.add(leg);
        }
    }
    // Cyclone Cone & Upper Barrel
    const cone = new THREE.Mesh(new THREE.ConeGeometry(1.5, 2.2, 12), getMaterial('peb_blue'));
    cone.rotation.x = Math.PI;
    cone.position.y = 5.2;
    outdoorCyclone.add(cone);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 1.8, 12), getMaterial('peb_blue'));
    barrel.position.y = 7.1;
    outdoorCyclone.add(barrel);
    g.add(outdoorCyclone);

    // Covered Outdoor Timber Seasoning & Drying Shed
    const shed = new THREE.Group();
    shed.position.set(size.w / 2 + 3.2, 0, -3);
    const sRoof = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.2, 7.5), getMaterial('metal_dark'));
    sRoof.position.y = 3.6;
    shed.add(sRoof);
    // Timber stacks
    const timberStack = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.4, 6.5), getMaterial('wood_light'));
    timberStack.position.y = 1.2;
    shed.add(timberStack);
    g.add(shed);

    g.position.copy(pos);
    g.userData.kinematic = { impeller: cyclone.userData.impeller };
    return g;
}


// ═══════════════════════════════════════════════════════════════
// INDUSTRY 6: WHOLESALE & DISTRIBUTION
// ═══════════════════════════════════════════════════════════════
function createWholesale() {
    const pos = LAYOUT.WHOLESALE;
    const size = BUILDING_SIZES.WHOLESALE;
    const g = new THREE.Group();

    const shell = createBuilding(size.w, size.h, size.d, {
        name: INDUSTRY_NAMES.WHOLESALE, wallType: 'concrete_light', wallOpacity: 1.0, isFactory: true
    });
    g.add(shell);

    // ── Interior Lighting ──
    addInteriorLight(g, -8, size.h - 1, 0, 0.45);
    addInteriorLight(g, 8, size.h - 1, 0, 0.45);
    addInteriorLight(g, 0, size.h - 1, -6, 0.35);
    addInteriorLight(g, 0, size.h - 1, 6, 0.35);
    addInteriorLight(g, 0, size.h - 1, 0, 0.3);

    // ── 4 Large Product Storage Racks (arranged in rows) ──
    const rackPositions = [
        [-8, -4], [-8, 4], [-2, -4], [-2, 4]
    ];
    rackPositions.forEach(([x, z]) => {
        const rack = createShelf(3, 3, 1, 5);
        rack.position.set(x, 0.2, z);
        g.add(rack);
    });

    // Extra boxes stacked near racks
    const boxMats = [0x886644, 0x667788, 0x556655, 0x887766, 0x998877, 0x776688];
    for (let i = 0; i < 15; i++) {
        const bSize = 0.3 + Math.random() * 0.4;
        const box = new THREE.Mesh(
            new THREE.BoxGeometry(bSize, bSize, bSize),
            new THREE.MeshStandardMaterial({ color: boxMats[i % boxMats.length], roughness: 0.8 })
        );
        const rackIdx = i % 4;
        const [rx, rz] = rackPositions[rackIdx];
        box.position.set(
            rx + 2 + Math.random() * 1.5,
            0.2 + bSize / 2 + (i > 8 ? bSize : 0),
            rz + (Math.random() - 0.5) * 1.5
        );
        g.add(box);
    }

    // ── Barcode Scanning Station ──
    const barcodeWs = createWorkstation();
    barcodeWs.position.set(6, 0.2, -6);
    g.add(barcodeWs);

    // Barcode scanner device (on desk)
    const scanner = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.08, 0.2),
        new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.4, metalness: 0.3 })
    );
    scanner.position.set(6.3, 1.0, -6);
    g.add(scanner);

    // Red laser line from scanner
    const laser = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.005, 0.005),
        new THREE.MeshStandardMaterial({ color: 0xFF0000, emissive: 0xFF0000, emissiveIntensity: 2 })
    );
    laser.position.set(6.3, 1.03, -5.8);
    g.add(laser);

    // Scan station label
    const scanLabel = createTextPlane('SCAN STATION', {
        worldW: 2.5, worldH: 0.6, fontSize: 30,
        bgColor: '#003366', color: '#FFFFFF'
    });
    scanLabel.position.set(6, 2.5, -7);
    g.add(scanLabel);

    // ── Packaging / Dispatch Area (tables with boxes) ──
    const dispatchTable1 = createDesk(3, 1.0, 0.85);
    dispatchTable1.position.set(6, 0.2, 0);
    g.add(dispatchTable1);

    const dispatchTable2 = createDesk(3, 1.0, 0.85);
    dispatchTable2.position.set(6, 0.2, 4);
    g.add(dispatchTable2);

    // Packaging boxes on dispatch tables
    [0, 4].forEach(z => {
        for (let i = 0; i < 5; i++) {
            const pkg = new THREE.Mesh(
                new THREE.BoxGeometry(0.35, 0.25, 0.3),
                new THREE.MeshStandardMaterial({ color: 0xCC9966, roughness: 0.8 })
            );
            pkg.position.set(6 - 1.0 + i * 0.5, 1.1, z);
            g.add(pkg);
        }
    });

    // Packing tape dispenser
    const tapeDisp = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.1, 0.08),
        new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5 })
    );
    tapeDisp.position.set(7, 1.08, 0.3);
    g.add(tapeDisp);

    // ── Regional Commercial Delivery Box Truck at Loading Bay ──
    const deliveryTruck = createDeliveryTruck();
    deliveryTruck.position.set(0, 0, size.d / 2 + 5.5);
    deliveryTruck.rotation.y = Math.PI / 2; // Backed up to loading ramp
    g.add(deliveryTruck);

    // ── Heavy-Duty Hydraulic Manual Pallet Truck ──
    const palletJack = createPalletJack();
    palletJack.position.set(2, 0.2, 1);
    g.add(palletJack);

    // ── Drive-On Freight Floor Scale with Digital Weight Readout ──
    const floorScale = createDriveOnScale();
    floorScale.position.set(6, 0.2, 7);
    g.add(floorScale);

    // ── Loading Dock (open area at the back with ramp) ──
    // Ramp
    const rampGeo = new THREE.BoxGeometry(6, 0.15, 3);
    const ramp = new THREE.Mesh(rampGeo,
        new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.8 })
    );
    ramp.position.set(0, 0.3, size.d / 2 - 1);
    ramp.rotation.x = -0.08;
    g.add(ramp);

    // Dock bumpers
    const bumperGeo = new THREE.BoxGeometry(0.3, 0.6, 0.15);
    const bumperMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });
    [-2, 2].forEach(x => {
        const bumper = new THREE.Mesh(bumperGeo, bumperMat);
        bumper.position.set(x, 0.5, size.d / 2 - 0.2);
        g.add(bumper);
    });

    // "LOADING DOCK" sign
    const dockSign = createTextPlane('LOADING DOCK', {
        worldW: 4, worldH: 1, fontSize: 38,
        bgColor: '#CC6600', color: '#FFFFFF'
    });
    dockSign.position.set(0, 4, size.d / 2 - 0.1);
    g.add(dockSign);

    // Safety stripes on dock
    addFloorStripe(g, -3, size.d / 2 - 2, 6, 'x');
    addFloorStripe(g, 3, size.d / 2 - 2, 6, 'x');

    // ── 3 Workers ──
    const ww1 = createPerson({ shirtColor: 0xCC8833 });
    ww1.position.set(-5, 0.2, 0);
    ww1.rotation.y = Math.PI / 4;
    g.add(ww1);

    const ww2 = createPerson({ shirtColor: 0xCC8833 });
    ww2.position.set(4, 0.2, 2);
    ww2.rotation.y = -Math.PI / 3;
    g.add(ww2);

    const ww3 = createPerson({ shirtColor: 0xCC8833 });
    ww3.position.set(0, 0.2, 8);
    g.add(ww3);

    // ── Hand Carts / Trolleys ──
    const cart1 = createHandCart();
    cart1.position.set(-5, 0.2, -7);
    cart1.rotation.y = Math.PI / 6;
    g.add(cart1);

    const cart2 = createHandCart();
    cart2.position.set(2, 0.2, 7);
    cart2.rotation.y = -Math.PI / 3;
    g.add(cart2);

    // Box on cart1
    const cartBox = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.3, 0.4),
        new THREE.MeshStandardMaterial({ color: 0x997755, roughness: 0.8 })
    );
    cartBox.position.set(-5, 0.5, -7);
    g.add(cartBox);

    // ── Inventory Management Computers (2 workstations) ──
    const invWs1 = createWorkstation();
    invWs1.position.set(12, 0.2, -6);
    g.add(invWs1);

    const invWs2 = createWorkstation();
    invWs2.position.set(12, 0.2, -2);
    g.add(invWs2);

    // Inventory clerk
    const clerk1 = createSeatedPerson({ shirtColor: 0x336688 });
    clerk1.position.set(12, 0.2, -5.4);
    g.add(clerk1);

    const clerk2 = createSeatedPerson({ shirtColor: 0x336688 });
    clerk2.position.set(12, 0.2, -1.4);
    g.add(clerk2);

    // ── Pallet stacks ──
    for (let i = 0; i < 3; i++) {
        const pallet = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 0.08, 1.0),
            getMaterial('wood_light')
        );
        pallet.position.set(-12, 0.25 + i * 0.1, 0 + i * 2);
        g.add(pallet);

        // Boxes on pallets
        for (let j = 0; j < 4; j++) {
            const pBox = new THREE.Mesh(
                new THREE.BoxGeometry(0.5, 0.35, 0.45),
                new THREE.MeshStandardMaterial({ color: boxMats[j], roughness: 0.8 })
            );
            pBox.position.set(
                -12 + (j % 2 - 0.5) * 0.55,
                0.5 + i * 0.1 + Math.floor(j / 2) * 0.36,
                i * 2 + (Math.floor(j / 2) - 0.5) * 0.48
            );
            g.add(pBox);
        }
    }

    // ── Weighing scale ──
    const scale = new THREE.Group();
    const scalePlatform = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.06, 0.8),
        getMaterial('metal')
    );
    scalePlatform.position.y = 0.08;
    scale.add(scalePlatform);
    const scaleDisplay = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.2, 0.08),
        getMaterial('screen')
    );
    scaleDisplay.position.set(0, 0.5, -0.3);
    scale.add(scaleDisplay);
    const scalePole = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.5, 0.04),
        getMaterial('metal')
    );
    scalePole.position.set(0, 0.3, -0.35);
    scale.add(scalePole);
    scale.position.set(10, 0.2, 4);
    g.add(scale);

    // ── Floor markings ──
    addFloorStripe(g, -5, 0, 18, 'z');
    addFloorStripe(g, 4, 0, 18, 'z');
    addFloorStripe(g, 0, 0, 20, 'x');

    // ── Small office corner ──
    addOfficeCorner(g, 11, -8, 0);

    // ── Industry signage ──
    addBuildingSign(g, 'WAREHOUSE', -size.w / 2 + 0.4, 6, 0, Math.PI / 2);
    addBuildingSign(g, 'DISPATCH', size.w / 2 - 0.4, 6, 3, -Math.PI / 2);

    // ── Architectural Facade & Multi-Bay Recessed Loading Terrace ──
    // 3 Active Truck Loading Dock Bays with Overhead Sectional Doors & Levelers
    const dockTerrace = new THREE.Group();
    dockTerrace.position.set(-size.w / 2, 0, 0);

    for (let d = -1; d <= 1; d++) {
        const dz = d * 6.5;
        // Sectional overhead dock door with view windows
        const dDoor = new THREE.Mesh(new THREE.BoxGeometry(0.12, 4.4, 4.0), getMaterial('white'));
        dDoor.position.set(0.06, 2.2, dz);
        dockTerrace.add(dDoor);

        // Yellow dock door frame & guide numbers
        const dFrame = new THREE.Mesh(new THREE.BoxGeometry(0.18, 4.8, 4.4), getMaterial('yellow_safety'));
        dFrame.position.set(0.04, 2.4, dz);
        dockTerrace.add(dFrame);

        // Rubber impact dock bumpers
        [-2.3, 2.3].forEach(by => {
            const bumper = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.8, 0.25), getMaterial('metal_dark'));
            bumper.position.set(-0.25, 1.2, dz + by);
            dockTerrace.add(bumper);
        });
    }
    g.add(dockTerrace);

    // Staged Euro Pallets with Shrink-Wrapped Cargo Boxes
    const palletGroup = new THREE.Group();
    palletGroup.position.set(size.w / 2 + 2.5, 0, 4);
    for (let px = 0; px < 3; px++) {
        for (let pz = 0; pz < 2; pz++) {
            const pWood = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.15, 1.0), getMaterial('wood_light'));
            pWood.position.set(px * 1.5, 0.08, pz * 1.3);
            palletGroup.add(pWood);
            const cargo = new THREE.Mesh(
                new THREE.BoxGeometry(1.1, 1.4, 0.9),
                new THREE.MeshStandardMaterial({ color: 0xD0C4AC, roughness: 0.7 })
            );
            cargo.position.set(px * 1.5, 0.85, pz * 1.3);
            palletGroup.add(cargo);
        }
    }
    g.add(palletGroup);

    g.position.copy(pos);
    g.userData.kinematic = { handlePivot: palletJack.userData.handlePivot };
    return g;
}


// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT: createIndustries()
// ═══════════════════════════════════════════════════════════════
/**
 * Creates all 6 industry buildings, each positioned at their LAYOUT coordinate.
 * @returns {THREE.Group} A group containing all industry buildings.
 */
export function createIndustries() {
    const group = new THREE.Group();
    group.name = 'Industries';

    // Build each industry
    const manufacturing = createManufacturing();
    manufacturing.name = 'Industry_Manufacturing';
    group.add(manufacturing);

    const textile = createTextile();
    textile.name = 'Industry_Textile';
    group.add(textile);

    const foodProcessing = createFoodProcessing();
    foodProcessing.name = 'Industry_FoodProcessing';
    group.add(foodProcessing);

    const printing = createPrinting();
    printing.name = 'Industry_Printing';
    group.add(printing);

    const furniture = createFurniture();
    furniture.name = 'Industry_Furniture';
    group.add(furniture);

    const wholesale = createWholesale();
    wholesale.name = 'Industry_Wholesale';
    group.add(wholesale);

    // ── REGISTER ALL 6 INDUSTRY SHELLS FOR CLEAN PER-BUILDING CUTAWAYS ──
    function findShell(grp) {
        let roofGroup = null;
        let frontWalls = [];
        grp.traverse(child => {
            if (child.name && child.name.startsWith('RoofGroup_')) {
                roofGroup = child;
            }
            if (child.userData && child.userData.isWall && child.position.z > 0) {
                frontWalls.push(child);
            }
        });
        return { roofGroup, frontWalls };
    }

    const mShell = findShell(manufacturing);
    registerFacilityShell('manufacturing', {
        id: 'manufacturing',
        roofGroup: mShell.roofGroup,
        frontWalls: mShell.frontWalls
    });

    const tShell = findShell(textile);
    registerFacilityShell('textile', {
        id: 'textile',
        roofGroup: tShell.roofGroup,
        frontWalls: tShell.frontWalls
    });

    const fShell = findShell(foodProcessing);
    registerFacilityShell('food', {
        id: 'food',
        roofGroup: fShell.roofGroup,
        frontWalls: fShell.frontWalls
    });

    const pShell = findShell(printing);
    registerFacilityShell('printing', {
        id: 'printing',
        roofGroup: pShell.roofGroup,
        frontWalls: pShell.frontWalls
    });

    const fuShell = findShell(furniture);
    registerFacilityShell('furniture', {
        id: 'furniture',
        roofGroup: fuShell.roofGroup,
        frontWalls: fuShell.frontWalls
    });

    const wShell = findShell(wholesale);
    registerFacilityShell('wholesale', {
        id: 'wholesale',
        roofGroup: wShell.roofGroup,
        frontWalls: wShell.frontWalls
    });

    // ── TAG FOCAL MACHINERY FOR INTERACTIVE EQUIPMENT CARDS ──
    if (manufacturing.userData.kinematic && manufacturing.userData.kinematic.armGroup) {
        tagEquipment(manufacturing.userData.kinematic.armGroup, {
            name: '6-Axis Industrial Robotic Welding Arm',
            facility: 'Automotive & Manufacturing Plant',
            role: 'Automated Precision Chassis Fabrication',
            desc: 'High-speed robotic arm performing continuous gas metal arc welding on vehicle spaceframes.',
            connection: 'Streams weld duty cycles and thermal sensor metrics directly to UdyogCloud IoT endpoints.'
        });
    }

    if (textile.userData.kinematic && textile.userData.kinematic.rollGroup) {
        tagEquipment(textile.userData.kinematic.rollGroup, {
            name: 'Automated Fabric Roll Storage Carousel',
            facility: 'Textile & Garment Works',
            role: 'Material Storage & Inventory Retrieval',
            desc: 'Multi-tier automated rotating carousel managing raw denim, cotton, and synthetic textile rolls.',
            connection: 'Synchronized with UdyogCloud warehouse inventory and barcode lot databases.'
        });
    }

    if (foodProcessing.userData.kinematic && foodProcessing.userData.kinematic.capperHead) {
        tagEquipment(foodProcessing.userData.kinematic.capperHead, {
            name: 'Automated Rotary Jar Bottling & Capping Line',
            facility: 'Food Processing Facility',
            role: 'Liquid Filling, Capping & Vacuum Sealing',
            desc: 'Sanitary volumetric filling nozzles with automated rotary starwheel capper and vacuum check.',
            connection: 'Counts finished units and triggers automated dispatch reorders via cloud database.'
        });
    }

    if (printing.userData.kinematic && printing.userData.kinematic.paperReel) {
        tagEquipment(printing.userData.kinematic.paperReel, {
            name: '4-Color Commercial Offset Lithographic Press',
            facility: 'Commercial Printing Works',
            role: 'High-Speed Print Production',
            desc: 'Industrial sheet-fed litho press with automated ink fountain control and computerized plate registration.',
            connection: 'Pulls digital prepress raster files (RIP) directly from high-capacity Ceph storage.'
        });
    }

    if (furniture.userData.kinematic && furniture.userData.kinematic.impeller) {
        tagEquipment(furniture.userData.kinematic.impeller, {
            name: 'Central Industrial Cyclone Dust Extractor',
            facility: 'Precision Furniture Plant',
            role: 'Airborne Particulate Filtration & Wood Dust Safety',
            desc: 'High-volume centrifugal cyclone collector maintaining clean workshop air and collecting sawdust.',
            connection: 'Filter differential pressure and air quality monitored by UdyogCloud safety telemetry.'
        });
    }

    if (wholesale.userData.kinematic && wholesale.userData.kinematic.handlePivot) {
        tagEquipment(wholesale.userData.kinematic.handlePivot, {
            name: 'Hydraulic Freight Pallet Jack & Scale',
            facility: 'Wholesale & Logistics Hub',
            role: 'Internal Goods Movement & Weighing',
            desc: 'Mobile pallet transport truck equipped with digital load cells for immediate cargo weight verification.',
            connection: 'Transmits pallet weights and dispatch scans to shipping carrier APIs.'
        });
    }

    // ── KINEMATIC UPDATE LOOP (Strictly 1 focal mechanism per factory = 6 total) ──
    let animTime = 0;
    // Staggered telemetry pulse timers for each of the 6 factories
    const pulseTimers = [
        { timer: 1.5 }, // Manufacturing
        { timer: 3.2 }, // Textile
        { timer: 4.8 }, // Food Processing
        { timer: 2.2 }, // Printing
        { timer: 5.5 }, // Furniture
        { timer: 3.9 }  // Wholesale
    ];

    group.update = function(delta) {
        animTime += delta;

        // 1. Auto: robotic welder oscillating articulation + arc flicker
        const mK = manufacturing.userData.kinematic;
        if (mK && mK.armGroup) {
            mK.armGroup.rotation.y = Math.sin(animTime * 2.0) * 0.45;
            if (mK.arcLight) {
                mK.arcLight.intensity = Math.sin(animTime * 9.0) > 0.35 ? 1.4 : 0.15;
            }
        }
        // 2. Textile: continuous fabric roll winding
        const tK = textile.userData.kinematic;
        if (tK && tK.rollGroup) {
            tK.rollGroup.rotation.z += delta * 1.5;
        }
        // 3. Food: bottling starwheel capping indexing
        const fK = foodProcessing.userData.kinematic;
        if (fK && fK.capperHead) {
            fK.capperHead.rotation.y += delta * 1.4;
        }
        // 4. Printing: paper reel continuous unwind
        const pK = printing.userData.kinematic;
        if (pK && pK.paperReel) {
            pK.paperReel.rotation.x += delta * 1.8;
        }
        // 5. Furniture: cyclone dust extractor internal impeller rotation
        const fuK = furniture.userData.kinematic;
        if (fuK && fuK.impeller) {
            fuK.impeller.rotation.y += delta * 3.5;
        }
        // 6. Wholesale: pallet jack hydraulic pump stroke
        const wK = wholesale.userData.kinematic;
        if (wK && wK.handlePivot) {
            wK.handlePivot.rotation.z = Math.sin(animTime * 1.8) * 0.12;
        }

        // 7. Dispatch machine-triggered IoT data pulses to Data Center
        for (let i = 0; i < pulseTimers.length; i++) {
            pulseTimers[i].timer -= delta;
            if (pulseTimers[i].timer <= 0) {
                pulseTimers[i].timer = 4.5 + Math.random() * 3.0; // Staggered 4.5 to 7.5s interval
                if (window.UdyogCloudNetwork && window.UdyogCloudNetwork.triggerMachinePulse) {
                    window.UdyogCloudNetwork.triggerMachinePulse(i);
                }
            }
        }
    };

    return group;
}
