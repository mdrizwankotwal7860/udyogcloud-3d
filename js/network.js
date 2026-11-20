// ═══════════════════════════════════════════════════════════════
// js/network.js – Campus Network Infrastructure & Animated Data Streams
// Connecting 6 Industries to Central UdyogCloud Data Center
// Features: Fiber conduits, edge routers, microwave telemetry towers,
// and bidirectional moving glowing data particles
// ═══════════════════════════════════════════════════════════════
import * as THREE from 'three';
import {
    COLORS, LAYOUT, INDUSTRY_KEYS, INDUSTRY_NAMES, getMaterial,
    createTextPlane
} from './utils.js';

export function createNetwork() {
    const netGroup = new THREE.Group();
    netGroup.name = 'Network_Infrastructure';

    const dcPos = LAYOUT.DATACENTER; // (0, 0, 0)
    const dcNetCoreY = 2.0;

    // Conduits and particle system tracking arrays
    const pathways = [];
    const particleSystems = [];

    // Central Data Center Microwave Telemetry Antenna Mast
    const mastH = 22;
    const mast = new THREE.Group();
    mast.position.set(0, 18, 0); // On roof of DC

    const mastPole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.4, mastH, 8),
        getMaterial('metal')
    );
    mastPole.position.y = mastH / 2;
    mast.add(mastPole);

    // Cross-arms and microwave dish antennas
    for (let h = 8; h <= mastH - 2; h += 5) {
        const arm = new THREE.Mesh(
            new THREE.BoxGeometry(2.4, 0.1, 0.1),
            getMaterial('metal')
        );
        arm.position.y = h;
        mast.add(arm);

        const dish1 = new THREE.Mesh(
            new THREE.CylinderGeometry(0.6, 0.5, 0.15, 12),
            getMaterial('metal_light')
        );
        dish1.rotation.z = Math.PI / 2;
        dish1.position.set(1.2, h, 0);
        mast.add(dish1);

        const dish2 = new THREE.Mesh(
            new THREE.CylinderGeometry(0.6, 0.5, 0.15, 12),
            getMaterial('metal_light')
        );
        dish2.rotation.z = -Math.PI / 2;
        dish2.position.set(-1.2, h, 0);
        mast.add(dish2);
    }

    // Flashing red obstruction beacon at top of mast
    const beacon = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 8, 8),
        getMaterial('led_red')
    );
    beacon.position.y = mastH + 0.2;
    mast.add(beacon);

    netGroup.add(mast);

    // ─────────────────────────────────────────────────────────────
    // FIBER PATHWAYS & ANIMATED DATA STREAMS FOR EACH INDUSTRY
    // ─────────────────────────────────────────────────────────────
    INDUSTRY_KEYS.forEach((key, idx) => {
        const indPos = LAYOUT[key];
        const indName = INDUSTRY_NAMES[key];

        // 1. Edge Gateway Router Kiosk at Industry Building Entrance
        const routerKiosk = new THREE.Group();
        routerKiosk.position.set(indPos.x + 8, 0, indPos.z + 10);

        const rBox = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 1.4, 0.6),
            getMaterial('metal_dark')
        );
        rBox.position.y = 0.7;
        routerKiosk.add(rBox);

        // Router status LEDs
        for (let l = 0; l < 4; l++) {
            const led = new THREE.Mesh(
                new THREE.SphereGeometry(0.025, 4, 4),
                l % 2 === 0 ? getMaterial('led_blue') : getMaterial('led_green')
            );
            led.position.set(0, 1.2 - l * 0.1, 0.31);
            routerKiosk.add(led);
        }

        const rLabel = createTextPlane(`EDGE ROUTER\n10Gbps Uplink`, {
            worldW: 1.4,
            worldH: 0.5,
            fontSize: 20,
            bgColor: '#0A1628',
            color: '#00AAFF',
            canvasW: 256,
            canvasH: 96
        });
        rLabel.position.set(0, 1.7, 0);
        routerKiosk.add(rLabel);

        netGroup.add(routerKiosk);

        // 2. Ground-Aligned Fiber-Optic Utility Trench Curve from Industry to Central Data Center
        const startPoint = new THREE.Vector3(indPos.x, 0.45, indPos.z);
        const midPoint = new THREE.Vector3(
            indPos.x * 0.45,
            0.55, // Ground-aligned utility conduit corridor beside road
            indPos.z * 0.45
        );
        const endPoint = new THREE.Vector3(
            dcPos.x + (idx - 2.5) * 4,
            0.65,
            dcPos.z + 8
        );

        const curve = new THREE.CatmullRomCurve3([startPoint, midPoint, endPoint]);
        pathways.push(curve);

        // Physical glowing fiber cable geometry
        const tubeGeo = new THREE.TubeGeometry(curve, 48, 0.12, 6, false);
        const tubeMat = new THREE.MeshStandardMaterial({
            color: 0x0044aa,
            emissive: 0x002266,
            roughness: 0.3,
            metalness: 0.8,
            transparent: true,
            opacity: 0.75
        });
        const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
        netGroup.add(tubeMesh);

        // Glowing Core Laser Stream (Thin high-emissive line inside tube)
        const coreGeo = new THREE.TubeGeometry(curve, 48, 0.04, 4, false);
        const coreMat = new THREE.MeshBasicMaterial({
            color: 0x00e1ff,
            transparent: true,
            opacity: 0.95
        });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        netGroup.add(coreMesh);

        // 3. Moving Data Stream Particles (Bidirectional Packets)
        const particleCount = 28;
        const pGeo = new THREE.SphereGeometry(0.18, 6, 6);
        const pMatOut = new THREE.MeshBasicMaterial({ color: 0x00ffff }); // Uplink
        const pMatIn = new THREE.MeshBasicMaterial({ color: 0x00ff66 });  // Downlink

        const packetGroup = new THREE.Group();
        const packets = [];

        for (let p = 0; p < particleCount; p++) {
            const isUplink = p % 2 === 0;
            const pMesh = new THREE.Mesh(pGeo, isUplink ? pMatOut : pMatIn);
            const initialT = p / particleCount;
            packetGroup.add(pMesh);

            packets.push({
                mesh: pMesh,
                t: initialT,
                speed: 0.12 + (p % 4) * 0.02,
                forward: isUplink
            });
        }

        netGroup.add(packetGroup);
        particleSystems.push({ curve, packets });
    });

    // ─────────────────────────────────────────────────────────────
    // PHASE D: ANIMATION UPDATE & INTERACTIVE DATA SURGE CONTROLLER
    // ─────────────────────────────────────────────────────────────
    let surgeTimer = 0;
    const coreMeshes = netGroup.children.filter(c => c.material && c.material.color && c.material.color.getHex() === 0x00e1ff);

    // Pre-allocated Machine IoT Telemetry Pulses (12 pooled meshes)
    const pulseGeo = new THREE.SphereGeometry(0.32, 8, 8);
    const pulseMat = new THREE.MeshBasicMaterial({ color: 0xFFD700 }); // High-intensity gold
    const pulsePool = [];
    const pulseGroup = new THREE.Group();
    pulseGroup.name = 'Machine_IoT_Pulses';

    for (let i = 0; i < 12; i++) {
        const mesh = new THREE.Mesh(pulseGeo, pulseMat);
        mesh.visible = false;
        pulseGroup.add(mesh);
        pulsePool.push({
            mesh,
            active: false,
            curveIndex: 0,
            t: 0,
            speed: 0.32
        });
    }
    netGroup.add(pulseGroup);

    function triggerMachinePulse(curveIndex = 0) {
        if (curveIndex < 0 || curveIndex >= pathways.length) return;
        const available = pulsePool.find(p => !p.active);
        if (available) {
            available.active = true;
            available.curveIndex = curveIndex;
            available.t = 0;
            available.mesh.visible = true;
        }
    }

    function triggerSurge(duration = 4.0) {
        surgeTimer = duration;
        console.log('⚡ UdyogCloud Fiber Backbone: High-Speed Customer Data Surge Active');
    }

    function update(delta) {
        // Pulse obstruction beacon atop the central mast
        const time = Date.now() * 0.003;
        beacon.material.emissiveIntensity = 0.5 + Math.sin(time * 3) * 0.5;

        // Surge speed multiplier calculation
        let speedMult = 1.0;
        if (surgeTimer > 0) {
            surgeTimer -= delta;
            speedMult = 2.6; // High-speed replication burst
            coreMeshes.forEach(cm => {
                cm.scale.set(1.4, 1.4, 1.4);
            });
        } else {
            coreMeshes.forEach(cm => {
                cm.scale.set(1.0, 1.0, 1.0);
            });
        }

        // Animate all data packets traveling along fiber curves
        particleSystems.forEach(sys => {
            const { curve, packets } = sys;
            packets.forEach(pkt => {
                const effectiveSpeed = pkt.speed * speedMult;
                if (pkt.forward) {
                    pkt.t += effectiveSpeed * delta;
                } else {
                    pkt.t -= effectiveSpeed * delta;
                }
                pkt.t = ((pkt.t % 1) + 1) % 1;
                const safeT = Math.max(0, Math.min(1, pkt.t));

                const pos = curve.getPointAt(safeT);
                pkt.mesh.position.copy(pos);

                // Scale pulsation (boosted during surge)
                const baseScale = surgeTimer > 0 ? 1.4 : 1.0;
                const scale = (0.8 + 0.4 * Math.sin(safeT * Math.PI * 8)) * baseScale;
                pkt.mesh.scale.set(scale, scale, scale);
            });
        });

        // Animate machine-triggered IoT telemetry pulses along fiber curves
        pulsePool.forEach(pulse => {
            if (!pulse.active) return;
            const effectiveSpeed = pulse.speed * speedMult;
            pulse.t += effectiveSpeed * delta;
            if (pulse.t >= 1.0) {
                pulse.active = false;
                pulse.mesh.visible = false;
                // Signal NOC video wall telemetry in Operations Center
                if (window.UdyogCloudOps && window.UdyogCloudOps.recordTelemetryPulse) {
                    window.UdyogCloudOps.recordTelemetryPulse();
                }
            } else {
                const curve = pathways[pulse.curveIndex];
                if (curve) {
                    const safeT = Math.max(0, Math.min(1, pulse.t));
                    const pos = curve.getPointAt(safeT);
                    pulse.mesh.position.copy(pos);
                    const pScale = (1.1 + 0.3 * Math.sin(safeT * Math.PI * 8)) * (surgeTimer > 0 ? 1.5 : 1.0);
                    pulse.mesh.scale.set(pScale, pScale, pScale);
                }
            }
        });
    }

    return {
        group: netGroup,
        update,
        triggerSurge,
        triggerMachinePulse
    };
}

