// ═══════════════════════════════════════════════════════════════
// js/campus.js – Professional Industrial Technology Campus Environment
// Features: Zoned industrial parcels, multi-lane arterial roads with curbs,
// concrete sidewalks, security gatehouse, commercial truck weighbridge,
// realistic logistics semi-trucks, distant industrial horizon, and landscaping
// ═══════════════════════════════════════════════════════════════
import * as THREE from 'three';
import {
    COLORS, LAYOUT, BUILDING_SIZES, CAMPUS_RADIUS,
    getMaterial, createTextPlane, createTree, createStreetLight, createPerson,
    createContactShadow, createSemiTruck, createDeliveryVan,
    createWeighbridge, createSecurityGatehouse, createDistantWarehouse
} from './utils.js';

// ─── HELPER: Civil Road Segment with Raised Curbs & Sidewalks ───
function createRoadSegment(x1, z1, x2, z2, width = 8, withCurbs = true) {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const length = Math.sqrt(dx * dx + dz * dz);
    const angle = Math.atan2(dx, dz);

    const group = new THREE.Group();

    // 1. Asphalt Road Surface
    const road = new THREE.Mesh(
        new THREE.BoxGeometry(width, 0.1, length),
        getMaterial('road')
    );
    road.position.set((x1 + x2) / 2, 0.05, (z1 + z2) / 2);
    road.rotation.y = angle;
    road.receiveShadow = true;
    group.add(road);

    if (withCurbs) {
        const curbMat = getMaterial('curb');
        const swMat = getMaterial('sidewalk');
        const perpX = -dz / length;
        const perpZ = dx / length;

        // Raised concrete curbs (0.18m high, 0.35m wide)
        [-width / 2 - 0.18, width / 2 + 0.18].forEach(offset => {
            const curb = new THREE.Mesh(
                new THREE.BoxGeometry(0.35, 0.18, length),
                curbMat
            );
            curb.position.set(
                (x1 + x2) / 2 + perpX * offset,
                0.09,
                (z1 + z2) / 2 + perpZ * offset
            );
            curb.rotation.y = angle;
            curb.receiveShadow = true;
            group.add(curb);
        });

        // Pedestrian concrete sidewalks (1.8m wide)
        [-width / 2 - 1.25, width / 2 + 1.25].forEach(offset => {
            const sw = new THREE.Mesh(
                new THREE.BoxGeometry(1.8, 0.12, length),
                swMat
            );
            sw.position.set(
                (x1 + x2) / 2 + perpX * offset,
                0.06,
                (z1 + z2) / 2 + perpZ * offset
            );
            sw.rotation.y = angle;
            sw.receiveShadow = true;
            group.add(sw);
        });
    }

    return group;
}

// ─── HELPER: Dual Yellow Centerlines & Solid White Edge Markings ─
function createRoadMarkings(x1, z1, x2, z2, group, width = 8) {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const length = Math.sqrt(dx * dx + dz * dz);
    const angle = Math.atan2(dx, dz);
    const dashLen = 3.2;
    const gapLen = 2.4;
    const numDashes = Math.floor(length / (dashLen + gapLen));

    const yellowMat = new THREE.MeshStandardMaterial({
        color: 0xF4C430, roughness: 0.5, metalness: 0.05
    });
    const whiteMat = new THREE.MeshStandardMaterial({
        color: 0xEEF2F6, roughness: 0.5, metalness: 0.05
    });

    const dirX = dx / length;
    const dirZ = dz / length;
    const perpX = -dirZ;
    const perpZ = dirX;

    // Double yellow continuous or dashed center line
    for (let i = 0; i < numDashes; i++) {
        const t = (i * (dashLen + gapLen) + dashLen / 2) / length;
        if (t > 1) break;
        const cx = x1 + dx * t;
        const cz = z1 + dz * t;
        [-0.14, 0.14].forEach(off => {
            const dash = new THREE.Mesh(
                new THREE.BoxGeometry(0.12, 0.02, dashLen),
                yellowMat
            );
            dash.position.set(cx + perpX * off, 0.11, cz + perpZ * off);
            dash.rotation.y = angle;
            group.add(dash);
        });
    }

    // Solid white edge lines (both sides)
    const edgeOffset = width / 2 - 0.4;
    [-edgeOffset, edgeOffset].forEach(offset => {
        const edge = new THREE.Mesh(
            new THREE.BoxGeometry(0.14, 0.02, length - 0.4),
            whiteMat
        );
        edge.position.set(
            (x1 + x2) / 2 + perpX * offset,
            0.11,
            (z1 + z2) / 2 + perpZ * offset
        );
        edge.rotation.y = angle;
        group.add(edge);
    });
}

// ─── HELPER: Pedestrian Zebra Crosswalk ───────────────────────
function createCrosswalk(cx, cz, angle, width = 8.0, length = 3.5) {
    const cwGroup = new THREE.Group();
    cwGroup.position.set(cx, 0.11, cz);
    cwGroup.rotation.y = angle;

    const stripeMat = new THREE.MeshStandardMaterial({
        color: 0xFAFCFE, roughness: 0.55, metalness: 0.05
    });
    const numStripes = 8;
    const stripeW = 0.5;
    const spacing = (width - 0.6) / numStripes;

    for (let i = 0; i < numStripes; i++) {
        const sx = -width / 2 + 0.35 + i * spacing + stripeW / 2;
        const stripe = new THREE.Mesh(
            new THREE.BoxGeometry(stripeW, 0.018, length),
            stripeMat
        );
        stripe.position.set(sx, 0, 0);
        cwGroup.add(stripe);
    }

    // Transverse stop lines
    const stopBarMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.5 });
    [-length / 2 - 0.4, length / 2 + 0.4].forEach(zOff => {
        const stopLine = new THREE.Mesh(
            new THREE.BoxGeometry(width * 0.95, 0.018, 0.3),
            stopBarMat
        );
        stopLine.position.set(0, 0, zOff);
        cwGroup.add(stopLine);
    });

    return cwGroup;
}

// ─── HELPER: Simple Car ──────────────────────────────────────
function createCar(color = 0x3366AA) {
    const g = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.6 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 4.2), bodyMat);
    body.position.y = 0.45;
    g.add(body);
    const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.5, 2.0),
        new THREE.MeshStandardMaterial({ color: 0x88BBEE, roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.6 })
    );
    cabin.position.set(0, 0.9, -0.3);
    g.add(cabin);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
    const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 8);
    [[-0.9, 1.3], [-0.9, -1.3], [0.9, 1.3], [0.9, -1.3]].forEach(([x, z]) => {
        const w = new THREE.Mesh(wheelGeo, wheelMat);
        w.position.set(x, 0.3, z);
        w.rotation.z = Math.PI / 2;
        g.add(w);
    });
    return g;
}

// ─── HELPER: Park Bench ──────────────────────────────────────
function createBench() {
    const g = new THREE.Group();
    const woodMat = getMaterial('wood');
    const metalMat = getMaterial('metal');
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.06, 0.4), woodMat);
    seat.position.y = 0.45;
    g.add(seat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.35, 0.04), woodMat);
    back.position.set(0, 0.7, -0.18);
    back.rotation.x = -0.1;
    g.add(back);
    const legGeo = new THREE.BoxGeometry(0.06, 0.45, 0.4);
    [-0.6, 0.6].forEach(x => {
        const leg = new THREE.Mesh(legGeo, metalMat);
        leg.position.set(x, 0.22, 0);
        g.add(leg);
    });
    return g;
}

// ─── HELPER: Flagpole ────────────────────────────────────────
function createFlagpole(h = 10) {
    const g = new THREE.Group();
    const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.1, h, 8),
        getMaterial('metal_light')
    );
    pole.position.y = h / 2;
    g.add(pole);

    const flagMat = new THREE.MeshStandardMaterial({
        color: COLORS.ELECTRIC_BLUE,
        roughness: 0.4,
        side: THREE.DoubleSide
    });
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.5), flagMat);
    flag.position.set(1.3, h - 1.2, 0);
    g.add(flag);

    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.45, 0.3, 8),
        getMaterial('concrete')
    );
    base.position.y = 0.15;
    g.add(base);

    return g;
}

// ═════════════════════════════════════════════════════════════
//  MAIN EXPORT: CREATE CAMPUS INFRASTRUCTURE
// ═════════════════════════════════════════════════════════════
export function createCampus() {
    const campus = new THREE.Group();
    campus.name = 'Campus';

    // ─────────────────────────────────────────────────────────
    // 1) MASTER CAMPUS GROUND & ZONED INDUSTRIAL PLOTS
    // ─────────────────────────────────────────────────────────
    // Main campus turf plane (680 x 680 meters)
    const groundGeo = new THREE.PlaneGeometry(680, 680);
    const ground = new THREE.Mesh(groundGeo, getMaterial('grass'));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    campus.add(ground);

    // 1b) EXTENDED HORIZON TERRAIN (338m to 1400m radius to eliminate floating island look)
    const horizonGeo = new THREE.RingGeometry(338, 1400, 64, 4);
    const horizonMat = new THREE.MeshStandardMaterial({
        color: 0x586456,
        roughness: 0.95,
        metalness: 0.05
    });
    const horizon = new THREE.Mesh(horizonGeo, horizonMat);
    horizon.rotation.x = -Math.PI / 2;
    horizon.position.y = -0.05;
    horizon.receiveShadow = true;
    campus.add(horizon);

    // 1c) DISTANT INDUSTRIAL HORIZON SILHOUETTES & FABRIC
    // Surrounds the campus with realistic distant warehouses, silos, and towers
    const horizonGroup = new THREE.Group();
    horizonGroup.name = 'Distant_Industrial_Horizon';

    const distantBuildingConfigs = [
        { r: 560, a: 0.3,  w: 75, h: 22, d: 50, col: 0x626E7A },
        { r: 620, a: 0.8,  w: 90, h: 18, d: 60, col: 0x55606C },
        { r: 590, a: 1.4,  w: 65, h: 24, d: 45, col: 0x5A6672 },
        { r: 640, a: 2.1,  w: 80, h: 20, d: 55, col: 0x606C78 },
        { r: 580, a: 2.8,  w: 70, h: 25, d: 50, col: 0x586470 },
        { r: 630, a: 3.5,  w: 85, h: 19, d: 55, col: 0x525E6A },
        { r: 600, a: 4.1,  w: 70, h: 22, d: 48, col: 0x5E6A76 },
        { r: 650, a: 4.8,  w: 95, h: 21, d: 60, col: 0x56626E },
        { r: 570, a: 5.5,  w: 65, h: 26, d: 45, col: 0x64707C },
        { r: 610, a: 6.0,  w: 80, h: 20, d: 50, col: 0x586470 },
    ];
    distantBuildingConfigs.forEach(bc => {
        const b = createDistantWarehouse(bc.w, bc.h, bc.d, bc.col);
        const bx = Math.sin(bc.a) * bc.r;
        const bz = Math.cos(bc.a) * bc.r;
        b.position.set(bx, 0, bz);
        b.rotation.y = bc.a + Math.PI / 2;
        horizonGroup.add(b);
    });

    // Distant Industrial Bulk Silos (grain/cement storage clusters)
    const siloMat = getMaterial('concrete_light');
    [
        { x: -520, z: -350 }, { x: -480, z: -370 },
        { x: 500, z: 380 }, { x: 540, z: 360 }
    ].forEach(sp => {
        const silo = new THREE.Mesh(new THREE.CylinderGeometry(10, 10, 36, 16), siloMat);
        silo.position.set(sp.x, 18, sp.z);
        horizonGroup.add(silo);
        const cap = new THREE.Mesh(new THREE.ConeGeometry(10.2, 4, 16), getMaterial('metal_light'));
        cap.position.set(sp.x, 38, sp.z);
        horizonGroup.add(cap);
    });

    campus.add(horizonGroup);

    // 1d) HIGH-VOLTAGE POWER TRANSMISSION PYLONS
    const pylonGroup = new THREE.Group();
    pylonGroup.name = 'Utility_Power_Grid';
    const pylonMat = getMaterial('metal');
    const pylonCount = 8;
    const pylonRadius = 400;
    const pylonPositions = [];

    for (let p = 0; p < pylonCount; p++) {
        const pTheta = (p / pylonCount) * Math.PI * 2;
        const px = Math.sin(pTheta) * pylonRadius;
        const pz = Math.cos(pTheta) * pylonRadius;
        pylonPositions.push(new THREE.Vector3(px, 0, pz));

        const pylon = new THREE.Group();
        pylon.position.set(px, 0, pz);
        const pH = 44;
        const baseSpan = 7, topSpan = 2.2;
        for (let lx of [-1, 1]) {
            for (let lz of [-1, 1]) {
                const leg = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.12, 0.28, pH, 4),
                    pylonMat
                );
                leg.position.set(lx * (baseSpan + topSpan) / 4, pH / 2, lz * (baseSpan + topSpan) / 4);
                pylon.add(leg);
            }
        }
        for (let ch of [28, 35, 42]) {
            const armW = 14 - (ch - 28) * 0.9;
            const arm = new THREE.Mesh(new THREE.BoxGeometry(armW, 0.45, 0.45), pylonMat);
            arm.position.y = ch;
            pylon.add(arm);
            for (let ix of [-armW / 2 + 0.6, armW / 2 - 0.6]) {
                const ins = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 1.4, 6), getMaterial('metal_light'));
                ins.position.set(ix, ch - 0.7, 0);
                pylon.add(ins);
            }
        }
        const pylonBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 6), getMaterial('led_red'));
        pylonBeacon.position.y = pH + 0.4;
        pylon.add(pylonBeacon);
        pylonGroup.add(pylon);
    }

    const wireMat = new THREE.MeshBasicMaterial({ color: 0x334455 });
    for (let p = 0; p < pylonCount; p++) {
        const nextIdx = (p + 1) % pylonCount;
        const p1 = pylonPositions[p];
        const p2 = pylonPositions[nextIdx];
        for (let ch of [27.3, 34.3, 41.3]) {
            const mid = new THREE.Vector3(
                (p1.x + p2.x) / 2,
                ch - 5.0,
                (p1.z + p2.z) / 2
            );
            const lineCurve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(p1.x, ch, p1.z),
                mid,
                new THREE.Vector3(p2.x, ch, p2.z)
            ]);
            const wireGeo = new THREE.TubeGeometry(lineCurve, 20, 0.04, 4, false);
            pylonGroup.add(new THREE.Mesh(wireGeo, wireMat));
        }
    }
    campus.add(pylonGroup);

    // ─────────────────────────────────────────────────────────────
    // 1e) ZONED INDUSTRIAL PLOTS & CONCRETE STAGING APRONS
    // ─────────────────────────────────────────────────────────────
    const stagingAprons = new THREE.Group();
    stagingAprons.name = 'Industrial_Staging_Aprons';

    // Helper: Build heavy concrete staging apron with joints and hazard striping
    function addStagingApron(cx, cz, slabW, slabD) {
        const slab = new THREE.Mesh(
            new THREE.BoxGeometry(slabW, 0.06, slabD),
            getMaterial('concrete')
        );
        slab.position.set(cx, 0.03, cz);
        slab.receiveShadow = true;
        stagingAprons.add(slab);

        // Concrete expansion joint grid lines
        const jointMat = getMaterial('concrete_dark');
        const numJointsX = Math.floor(slabW / 12);
        for (let j = 1; j < numJointsX; j++) {
            const jx = cx - slabW / 2 + j * (slabW / numJointsX);
            const joint = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.07, slabD - 0.2), jointMat);
            joint.position.set(jx, 0.035, cz);
            stagingAprons.add(joint);
        }

        // Yellow loading safety perimeter striping
        const stripeMat = getMaterial('yellow_safety');
        const frontStripe = new THREE.Mesh(new THREE.BoxGeometry(slabW * 0.8, 0.015, 0.3), stripeMat);
        frontStripe.position.set(cx, 0.065, cz + slabD / 2 - 1.2);
        stagingAprons.add(frontStripe);
    }

    // 6 Factory Staging Aprons
    addStagingApron(LAYOUT.MANUFACTURING.x, LAYOUT.MANUFACTURING.z, 56, 44);
    addStagingApron(LAYOUT.TEXTILE.x, LAYOUT.TEXTILE.z, 52, 40);
    addStagingApron(LAYOUT.FOOD_PROCESSING.x, LAYOUT.FOOD_PROCESSING.z, 48, 40);
    addStagingApron(LAYOUT.PRINTING.x, LAYOUT.PRINTING.z, 50, 42);
    addStagingApron(LAYOUT.FURNITURE.x, LAYOUT.FURNITURE.z, 54, 42);
    addStagingApron(LAYOUT.WHOLESALE.x, LAYOUT.WHOLESALE.z, 58, 46);

    // Central Data Center Hero Plaza Slab
    const dcPlaza = new THREE.Mesh(
        new THREE.BoxGeometry(86, 0.08, 64),
        getMaterial('concrete_light')
    );
    dcPlaza.position.set(LAYOUT.DATACENTER.x, 0.04, LAYOUT.DATACENTER.z);
    dcPlaza.receiveShadow = true;
    stagingAprons.add(dcPlaza);

    // Operations Center & Customer Pavilion Commercial Plaza
    const opsPlaza = new THREE.Mesh(
        new THREE.BoxGeometry(76, 0.08, 86),
        getMaterial('concrete_light')
    );
    opsPlaza.position.set(80, 0.04, 10);
    opsPlaza.receiveShadow = true;
    stagingAprons.add(opsPlaza);

    campus.add(stagingAprons);

    // 1f) GROUND CONTACT SHADOWS (Anchors all 8 facilities to ground)
    const contactShadows = new THREE.Group();
    contactShadows.name = 'Ground_Contact_Shadows';
    contactShadows.add(createContactShadow(72, 48, 0.90)); // DC at (0,0,0)
    const opsShadow = createContactShadow(52, 38, 0.86);
    opsShadow.position.set(LAYOUT.OPS_CENTER.x, 0.02, LAYOUT.OPS_CENTER.z);
    contactShadows.add(opsShadow);
    const custShadow = createContactShadow(36, 26, 0.82);
    custShadow.position.set(LAYOUT.CUSTOMER_OFFICE.x, 0.02, LAYOUT.CUSTOMER_OFFICE.z);
    contactShadows.add(custShadow);

    [
        { key: 'MANUFACTURING',   w: 52, d: 40, op: 0.88 },
        { key: 'TEXTILE',         w: 46, d: 36, op: 0.86 },
        { key: 'FOOD_PROCESSING', w: 44, d: 36, op: 0.86 },
        { key: 'PRINTING',        w: 46, d: 38, op: 0.86 },
        { key: 'FURNITURE',       w: 48, d: 38, op: 0.86 },
        { key: 'WHOLESALE',       w: 52, d: 40, op: 0.88 },
    ].forEach(fs => {
        const fPos = LAYOUT[fs.key];
        const sMesh = createContactShadow(fs.w, fs.d, fs.op);
        sMesh.position.set(fPos.x, 0.02, fPos.z);
        contactShadows.add(sMesh);
    });
    campus.add(contactShadows);

    // ─────────────────────────────────────────────────────────────
    // 2) ARTERIAL ROAD NETWORK WITH CURBS & SIDEWALKS
    // ─────────────────────────────────────────────────────────────
    const roads = new THREE.Group();
    roads.name = 'Roads';

    // 2a) Central Ring Boulevard (radius ~44m, 10m wide with curbs)
    const ringRadius = 44;
    const ringSegments = 20;
    const ringPoints = [];
    for (let i = 0; i <= ringSegments; i++) {
        const theta = (i / ringSegments) * Math.PI * 2;
        ringPoints.push({
            x: Math.sin(theta) * ringRadius,
            z: Math.cos(theta) * ringRadius
        });
    }
    for (let i = 0; i < ringSegments; i++) {
        const p1 = ringPoints[i];
        const p2 = ringPoints[i + 1];
        roads.add(createRoadSegment(p1.x, p1.z, p2.x, p2.z, 10, true));
        createRoadMarkings(p1.x, p1.z, p2.x, p2.z, roads, 10);
    }

    // 2b) Radial Access Roads to 6 Factories (8m wide with curbs)
    const buildingPositions = {
        MANUFACTURING: LAYOUT.MANUFACTURING,
        TEXTILE: LAYOUT.TEXTILE,
        FOOD_PROCESSING: LAYOUT.FOOD_PROCESSING,
        PRINTING: LAYOUT.PRINTING,
        FURNITURE: LAYOUT.FURNITURE,
        WHOLESALE: LAYOUT.WHOLESALE,
    };
    Object.entries(buildingPositions).forEach(([key, pos]) => {
        const angle = Math.atan2(pos.x, pos.z);
        const ringX = Math.sin(angle) * ringRadius;
        const ringZ = Math.cos(angle) * ringRadius;
        roads.add(createRoadSegment(ringX, ringZ, pos.x, pos.z, 8, true));
        createRoadMarkings(ringX, ringZ, pos.x, pos.z, roads, 8);
    });

    // 2bb) Outer Connected Industrial Loop Road Linking All 6 Customer Facilities
    const outerLoopNodes = [
        LAYOUT.MANUFACTURING,   // (-130, 0, -90)
        LAYOUT.FOOD_PROCESSING, // (0, 0, -140)
        LAYOUT.FURNITURE,       // (130, 0, -90)
        LAYOUT.WHOLESALE,       // (130, 0, 90)
        LAYOUT.PRINTING,        // (0, 0, 140)
        LAYOUT.TEXTILE,         // (-130, 0, 90)
        LAYOUT.MANUFACTURING    // Loop closure
    ];
    for (let k = 0; k < outerLoopNodes.length - 1; k++) {
        const nA = outerLoopNodes[k];
        const nB = outerLoopNodes[k + 1];
        roads.add(createRoadSegment(nA.x, nA.z, nB.x, nB.z, 8, true));
        createRoadMarkings(nA.x, nA.z, nB.x, nB.z, roads, 8);
    }

    // 2c) Road to Operations & Customer Center Pavilion
    const opsAngle = Math.atan2(LAYOUT.OPS_CENTER.x, LAYOUT.OPS_CENTER.z);
    const opsRingX = Math.sin(opsAngle) * ringRadius;
    const opsRingZ = Math.cos(opsAngle) * ringRadius;
    roads.add(createRoadSegment(opsRingX, opsRingZ, 80, 10, 8, true));
    createRoadMarkings(opsRingX, opsRingZ, 80, 10, roads, 8);
    roads.add(createRoadSegment(80, 10, LAYOUT.OPS_CENTER.x, LAYOUT.OPS_CENTER.z, 6, true));
    roads.add(createRoadSegment(80, 10, LAYOUT.CUSTOMER_OFFICE.x, LAYOUT.CUSTOMER_OFFICE.z, 6, true));

    // 2d) South Main Entry Boulevard (14m dual carriageway from Gate to Ring Road)
    const gateZ = CAMPUS_RADIUS - 14;
    roads.add(createRoadSegment(0, ringRadius, 0, gateZ, 14, true));
    createRoadMarkings(0, ringRadius, 0, gateZ, roads, 14);

    // Landscaped central median along south entry boulevard
    const medianL = gateZ - ringRadius - 12;
    const median = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.22, medianL),
        getMaterial('curb')
    );
    median.position.set(0, 0.11, (ringRadius + gateZ) / 2);
    roads.add(median);

    // 2e) Pedestrian Zebra Crosswalks at Major Intersections
    roads.add(createCrosswalk(0, 195, 0, 14.0, 3.8));                  // Main Gate Security Crossing
    roads.add(createCrosswalk(0, ringRadius + 6, 0, 14.0, 3.5));         // South Ring Boulevard Junction
    roads.add(createCrosswalk(0, -ringRadius - 2, Math.PI / 2, 10.0, 3.2)); // North Boulevard Junction
    roads.add(createCrosswalk(opsRingX + 2, opsRingZ + 2, opsAngle + Math.PI / 2, 8.0, 3.0));

    campus.add(roads);

    // ─────────────────────────────────────────────────────────────
    // 3) LOGISTICS FLEET: ARTICULATED SEMI-TRUCKS & VANS
    // ─────────────────────────────────────────────────────────────
    const logisticsFleet = new THREE.Group();
    logisticsFleet.name = 'Logistics_Fleet';

    // 1. Semi-Truck docked at Wholesale & Distribution Loading Bay
    const wholesaleTruck = createSemiTruck(0x1B4F8A, 0xDCE2E8);
    wholesaleTruck.position.set(LAYOUT.WHOLESALE.x - 22, 0, LAYOUT.WHOLESALE.z + 4);
    wholesaleTruck.rotation.y = Math.PI / 2 + 0.15; // Turned slightly for realistic dock approach
    logisticsFleet.add(wholesaleTruck);

    // 2. Heavy Semi-Truck docked at Manufacturing / Automotive Bay
    const mfgTruck = createSemiTruck(0xC0392B, 0xE4E8EE);
    mfgTruck.position.set(LAYOUT.MANUFACTURING.x + 22, 0, LAYOUT.MANUFACTURING.z + 4);
    mfgTruck.rotation.y = -Math.PI / 2 - 0.1;
    logisticsFleet.add(mfgTruck);

    // 3. Commercial Delivery Box Van at Food Processing Loading Bay
    const foodVan = createDeliveryVan(0x2862B8);
    foodVan.position.set(LAYOUT.FOOD_PROCESSING.x - 16, 0, LAYOUT.FOOD_PROCESSING.z - 2);
    foodVan.rotation.y = Math.PI / 2;
    logisticsFleet.add(foodVan);

    // 4. Commercial Delivery Van at Printing & Packaging Bay
    const printVan = createDeliveryVan(0x1F4D85);
    printVan.position.set(LAYOUT.PRINTING.x + 16, 0, LAYOUT.PRINTING.z + 2);
    printVan.rotation.y = -Math.PI / 2;
    logisticsFleet.add(printVan);

    campus.add(logisticsFleet);

    // ─────────────────────────────────────────────────────────────
    // 4) SOUTH MAIN ENTRANCE SECURITY COMPLEX & WEIGHBRIDGE
    // ─────────────────────────────────────────────────────────────
    const gateComplex = new THREE.Group();
    gateComplex.name = 'Security_Gatehouse_Complex';

    // Main Security Gatehouse Building
    const gatehouse = createSecurityGatehouse();
    gatehouse.position.set(0, 0, gateZ - 2);
    gateComplex.add(gatehouse);

    // Commercial Truck Weighbridge Platform
    const weighbridge = createWeighbridge(18, 4.2);
    weighbridge.position.set(13, 0, gateZ - 8);
    gateComplex.add(weighbridge);

    // Entry Monument Sign on Concrete Planter
    const monumentBase = new THREE.Mesh(
        new THREE.BoxGeometry(16, 0.6, 2.2),
        getMaterial('concrete_dark')
    );
    monumentBase.position.set(-14, 0.3, gateZ - 6);
    gateComplex.add(monumentBase);

    const monumentSign = createTextPlane('UDYOGCLOUD INDUSTRIAL CAMPUS\nAffordable Cloud Infrastructure for Small Industries', {
        worldW: 15,
        worldH: 2.2,
        fontSize: 30,
        bgColor: '#0A1628',
        color: '#00AAFF',
        canvasW: 1024,
        canvasH: 192
    });
    monumentSign.position.set(-14, 1.8, gateZ - 6);
    gateComplex.add(monumentSign);

    campus.add(gateComplex);

    // ─────────────────────────────────────────────────────────────
    // 5) INDUSTRIAL RECTANGULAR PERIMETER SECURITY WALL & POSTS
    // ─────────────────────────────────────────────────────────────
    const perimeter = new THREE.Group();
    perimeter.name = 'Campus_Perimeter_Wall';
    const pWallMat = getMaterial('concrete');
    const pRailingMat = getMaterial('metal_dark');

    // Orthogonal perimeter wall segments (West, North, East, South wings)
    const wallSegmentsData = [
        // North boundary wall
        { x1: -210, z1: -210, x2: 210, z2: -210 },
        // East boundary wall
        { x1: 210, z1: -210, x2: 210, z2: 205 },
        // West boundary wall
        { x1: -210, z1: -210, x2: -210, z2: 205 },
        // South boundary west wing
        { x1: -210, z1: 205, x2: -18, z2: 205 },
        // South boundary east wing
        { x1: 18, z1: 205, x2: 210, z2: 205 },
    ];

    wallSegmentsData.forEach(seg => {
        const dx = seg.x2 - seg.x1, dz = seg.z2 - seg.z1;
        const len = Math.sqrt(dx * dx + dz * dz);
        const ang = Math.atan2(dx, dz);

        // Precast concrete lower plinth (1.1m high)
        const wall = new THREE.Mesh(new THREE.BoxGeometry(0.38, 1.1, len), pWallMat);
        wall.position.set((seg.x1 + seg.x2) / 2, 0.55, (seg.z1 + seg.z2) / 2);
        wall.rotation.y = ang;
        perimeter.add(wall);

        // Anti-climb dark metal security mesh railing on top
        const railing = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.9, len), pRailingMat);
        railing.position.set((seg.x1 + seg.x2) / 2, 1.55, (seg.z1 + seg.z2) / 2);
        railing.rotation.y = ang;
        perimeter.add(railing);

        // Structural concrete pillars along wall
        const numPillars = Math.floor(len / 24);
        for (let p = 0; p <= numPillars; p++) {
            const px = seg.x1 + (dx / numPillars) * p;
            const pz = seg.z1 + (dz / numPillars) * p;
            const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.55, 2.2, 0.55), getMaterial('concrete_dark'));
            pillar.position.set(px, 1.1, pz);
            perimeter.add(pillar);
        }
    });
    campus.add(perimeter);

    // ─────────────────────────────────────────────────────────────
    // 6) ORGANIZED CAR PARKING & ACCESSIBLE STALLS
    // ─────────────────────────────────────────────────────────────
    const parking = new THREE.Group();
    parking.name = 'Parking';

    const pMat = getMaterial('asphalt');
    const pLineMat = new THREE.MeshStandardMaterial({ color: 0xEEF2F6, roughness: 0.5 });
    const carColors = [0x1B4F8A, 0x8E2424, 0x2A2C30, 0xA0AAB4, 0x1E5E3A, 0x7A4E1E, 0x542E7A, 0xC4661E];

    function addParkingLot(cx, cz, lotW, lotD, numSpots, rotation = 0, fillRatio = 0.65) {
        const surface = new THREE.Mesh(new THREE.BoxGeometry(lotW, 0.08, lotD), pMat);
        surface.position.set(cx, 0.04, cz);
        surface.rotation.y = rotation;
        parking.add(surface);

        const spotWidth = lotW / numSpots;
        for (let i = 0; i <= numSpots; i++) {
            const lineX = -lotW / 2 + i * spotWidth;
            const line = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, lotD * 0.85), pLineMat);
            line.position.set(lineX, 0.1, 0);
            const lineWrap = new THREE.Group();
            lineWrap.add(line);
            lineWrap.position.set(cx, 0, cz);
            lineWrap.rotation.y = rotation;
            parking.add(lineWrap);
        }

        const carsToPlace = Math.floor(numSpots * fillRatio);
        for (let i = 0; i < carsToPlace; i++) {
            const localX = -lotW / 2 + (i + 0.5) * spotWidth;
            const car = createCar(carColors[i % carColors.length]);
            car.scale.set(0.55, 0.55, 0.55);
            car.position.set(localX, 0.08, 0);
            const carWrap = new THREE.Group();
            carWrap.add(car);
            carWrap.position.set(cx, 0, cz);
            carWrap.rotation.y = rotation;
            parking.add(carWrap);
        }
    }

    addParkingLot(-130, -65, 26, 12, 8, 0, 0.6);
    addParkingLot(-130, 65, 24, 12, 7, 0, 0.65);
    addParkingLot(-20, -140, 22, 12, 6, 0, 0.55);
    addParkingLot(20, 140, 24, 12, 7, 0, 0.6);
    addParkingLot(130, -65, 26, 12, 8, 0, 0.65);
    addParkingLot(130, 65, 28, 12, 8, 0, 0.7);
    addParkingLot(60, -20, 20, 12, 6, 0, 0.6);
    addParkingLot(60, 40, 18, 12, 5, 0, 0.6);

    campus.add(parking);

    // ─────────────────────────────────────────────────────────────
    // 7) STREETLIGHTS & CIVIL LANDSCAPING
    // ─────────────────────────────────────────────────────────────
    const streetlights = new THREE.Group();
    streetlights.name = 'Campus_Streetlights';

    // Double-headed high-efficiency LED lights along Ring Boulevard
    for (let i = 0; i < 16; i++) {
        const theta = (i / 16) * Math.PI * 2;
        const slR = ringRadius + 6.2;
        const sl = createStreetLight(6.5);
        sl.position.set(Math.sin(theta) * slR, 0, Math.cos(theta) * slR);
        sl.rotation.y = theta + Math.PI;
        streetlights.add(sl);
    }
    // Lights along South Entry Boulevard
    for (let z = ringRadius + 14; z < gateZ - 10; z += 24) {
        [-8.2, 8.2].forEach((x, idx) => {
            const sl = createStreetLight(6.5);
            sl.position.set(x, 0, z);
            sl.rotation.y = idx === 0 ? Math.PI / 2 : -Math.PI / 2;
            streetlights.add(sl);
        });
    }
    campus.add(streetlights);

    // Structured Conifer & Shade Tree Plantings
    const landscaping = new THREE.Group();
    landscaping.name = 'Campus_Landscaping';
    for (let i = 0; i < 24; i++) {
        const theta = (i / 24) * Math.PI * 2 + 0.12;
        const tR = ringRadius + 15;
        const tree = createTree(3.0 + (i % 3) * 0.5, 1.8 + (i % 2) * 0.4);
        tree.position.set(Math.sin(theta) * tR, 0, Math.cos(theta) * tR);
        landscaping.add(tree);
    }
    campus.add(landscaping);

    // ─────────────────────────────────────────────────────────────
    // 8) DECORATIVE PLAZAS & PEDESTRIAN AMENITIES
    // ─────────────────────────────────────────────────────────────
    const decor = new THREE.Group();
    decor.name = 'Plaza_Amenities';

    // Executive Flagpoles in front of Data Center
    [-12, 0, 12].forEach(x => {
        const fp = createFlagpole(12);
        fp.position.set(x, 0, 24);
        decor.add(fp);
    });

    // Park benches along landscaped walkways
    [
        { x: 22, z: 20, ry: 0 }, { x: -22, z: 20, ry: 0 },
        { x: 22, z: -20, ry: Math.PI }, { x: -22, z: -20, ry: Math.PI },
        { x: 0, z: 52, ry: 0 }
    ].forEach(bp => {
        const bench = createBench();
        bench.position.set(bp.x, 0, bp.z);
        bench.rotation.y = bp.ry;
        decor.add(bench);
    });

    campus.add(decor);

    return campus;
}
