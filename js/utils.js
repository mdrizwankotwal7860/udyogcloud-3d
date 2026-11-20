// ═══════════════════════════════════════════════════════════════
// js/utils.js – Shared utilities for UdyogCloud 3D Campus
// ═══════════════════════════════════════════════════════════════
import * as THREE from 'three';

// ─── BRAND COLORS ────────────────────────────────────────────
export const COLORS = {
    ELECTRIC_BLUE:  0x0066FF,
    DARK_NAVY:      0x0A1628,
    NAVY:           0x1A2744,
    WHITE:          0xFFFFFF,
    OFF_WHITE:      0xEEEEEE,
    SILVER:         0xC0C0C0,
    CHARCOAL:       0x36454F,
    STEEL:          0x71797E,
    GLASS_BLUE:     0x88CCFF,
    CONCRETE:       0x808080,
    CONCRETE_LIGHT: 0x999999,
    CONCRETE_DARK:  0x555555,
    LED_BLUE:       0x00AAFF,
    LED_GREEN:      0x00FF88,
    LED_RED:        0xFF3333,
    FLOOR_DARK:     0x2A2A2A,
    FLOOR_TILE:     0x555555,
    GRASS_GREEN:    0x2D5A27,
    ROAD_GREY:      0x333333,
    SIDEWALK:       0x888888,
    WOOD_LIGHT:     0xC4A35A,
    WOOD:           0x8B6914,
    WOOD_DARK:      0x654321,
    METAL_DARK:     0x2A2A2E,
    METAL_LIGHT:    0x888899,
    SCREEN_GLOW:    0x4488FF,
    SCREEN_GREEN:   0x33FF66,
    PARTICLE_BLUE:  0x00CCFF,
    YELLOW_SAFETY:  0xFFCC00,
};

// ─── CAMPUS LAYOUT (1 unit ≈ 1 meter, Y up) ─────────────────
export const LAYOUT = {
    DATACENTER:      new THREE.Vector3(   0, 0,    0),
    OPS_CENTER:      new THREE.Vector3(  80, 0,  -20),
    CUSTOMER_OFFICE: new THREE.Vector3(  80, 0,   40),
    MANUFACTURING:   new THREE.Vector3(-130, 0,  -90),
    TEXTILE:         new THREE.Vector3(-130, 0,   90),
    FOOD_PROCESSING: new THREE.Vector3(   0, 0, -140),
    PRINTING:        new THREE.Vector3(   0, 0,  140),
    FURNITURE:       new THREE.Vector3( 130, 0,  -90),
    WHOLESALE:       new THREE.Vector3( 130, 0,   90),
};

export const INDUSTRY_KEYS = [
    'MANUFACTURING','TEXTILE','FOOD_PROCESSING',
    'PRINTING','FURNITURE','WHOLESALE',
];

export const INDUSTRY_NAMES = {
    MANUFACTURING:   'Manufacturing',
    TEXTILE:         'Textile & Garment',
    FOOD_PROCESSING: 'Food Processing',
    PRINTING:        'Printing & Packaging',
    FURNITURE:       'Furniture & Woodwork',
    WHOLESALE:       'Wholesale & Distribution',
};

export const BUILDING_SIZES = {
    DATACENTER:      { w: 50, h: 18, d: 30 },
    OPS_CENTER:      { w: 35, h: 12, d: 22 },
    CUSTOMER_OFFICE: { w: 22, h: 10, d: 15 },
    MANUFACTURING:   { w: 35, h: 11, d: 24 },
    TEXTILE:         { w: 30, h: 10, d: 20 },
    FOOD_PROCESSING: { w: 28, h: 10, d: 20 },
    PRINTING:        { w: 30, h: 10, d: 22 },
    FURNITURE:       { w: 32, h: 10, d: 22 },
    WHOLESALE:       { w: 35, h: 12, d: 24 },
};

export const CAMPUS_RADIUS = 220;

// ─── MATERIAL FACTORY (cached) ───────────────────────────────
const _mc = {};
export function getMaterial(type) {
    if (_mc[type]) return _mc[type];
    const m = _matDef(type);
    _mc[type] = m;
    return m;
}
function _matDef(t) {
    switch (t) {
        case 'concrete':       return new THREE.MeshStandardMaterial({ color: 0x828A94, roughness: 0.82, metalness: 0.08 });
        case 'concrete_light': return new THREE.MeshStandardMaterial({ color: 0xADB6C0, roughness: 0.78, metalness: 0.08 });
        case 'concrete_dark':  return new THREE.MeshStandardMaterial({ color: 0x485058, roughness: 0.85, metalness: 0.10 });
        case 'metal':          return new THREE.MeshStandardMaterial({ color: 0x8894A2, roughness: 0.22, metalness: 0.88 });
        case 'metal_dark':     return new THREE.MeshStandardMaterial({ color: 0x22262C, roughness: 0.20, metalness: 0.92 });
        case 'metal_light':    return new THREE.MeshStandardMaterial({ color: 0xB0BAC6, roughness: 0.24, metalness: 0.82 });
        case 'glass':          return new THREE.MeshStandardMaterial({ color: 0x99D5FF, roughness: 0.08, metalness: 0.15, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
        case 'glass_dark':     return new THREE.MeshStandardMaterial({ color: 0x22354E, roughness: 0.08, metalness: 0.25, transparent: true, opacity: 0.55 });
        case 'floor':          return new THREE.MeshStandardMaterial({ color: 0x2C323A, roughness: 0.75, metalness: 0.20 });
        case 'floor_tile':     return new THREE.MeshStandardMaterial({ color: 0x586068, roughness: 0.65, metalness: 0.14 });
        case 'wood':           return new THREE.MeshStandardMaterial({ color: 0x8B6914, roughness: 0.70 });
        case 'wood_dark':      return new THREE.MeshStandardMaterial({ color: 0x654321, roughness: 0.75 });
        case 'wood_light':     return new THREE.MeshStandardMaterial({ color: 0xC4A35A, roughness: 0.65 });
        case 'white':          return new THREE.MeshStandardMaterial({ color: 0xF5F7FA, roughness: 0.40 });
        case 'navy':           return new THREE.MeshStandardMaterial({ color: 0x142236, roughness: 0.38, metalness: 0.35 });
        case 'blue_emissive':  return new THREE.MeshStandardMaterial({ color: 0x0066FF, emissive: 0x0066FF, emissiveIntensity: 0.5, roughness: 0.3, metalness: 0.5 });
        case 'screen':         return new THREE.MeshStandardMaterial({ color: 0x4488FF, emissive: 0x4488FF, emissiveIntensity: 0.6, roughness: 0.1 });
        case 'screen_green':   return new THREE.MeshStandardMaterial({ color: 0x33FF66, emissive: 0x33FF66, emissiveIntensity: 0.4, roughness: 0.1 });
        case 'led_blue':       return new THREE.MeshStandardMaterial({ color: 0x00AAFF, emissive: 0x00AAFF, emissiveIntensity: 1.0 });
        case 'led_green':      return new THREE.MeshStandardMaterial({ color: 0x00FF88, emissive: 0x00FF88, emissiveIntensity: 1.0 });
        case 'led_red':        return new THREE.MeshStandardMaterial({ color: 0xFF3333, emissive: 0xFF3333, emissiveIntensity: 1.0 });
        case 'grass':          return new THREE.MeshStandardMaterial({ color: 0x3A6E32, roughness: 0.92 });
        case 'grass_dark':     return new THREE.MeshStandardMaterial({ color: 0x2A5224, roughness: 0.95 });
        case 'road':           return new THREE.MeshStandardMaterial({ color: 0x22262C, roughness: 0.85, metalness: 0.08 });
        case 'sidewalk':       return new THREE.MeshStandardMaterial({ color: 0x8C949D, roughness: 0.78, metalness: 0.10 });
        case 'curb':           return new THREE.MeshStandardMaterial({ color: 0x9AA2AA, roughness: 0.75, metalness: 0.08 });
        case 'yellow_safety':  return new THREE.MeshStandardMaterial({ color: 0xFFCC00, roughness: 0.45, metalness: 0.20 });
        case 'asphalt':        return new THREE.MeshStandardMaterial({ color: 0x202428, roughness: 0.88, metalness: 0.06 });
        case 'peb_blue':       return new THREE.MeshStandardMaterial({ color: 0x1B4F8A, roughness: 0.35, metalness: 0.60 });
        case 'peb_grey':       return new THREE.MeshStandardMaterial({ color: 0x485058, roughness: 0.35, metalness: 0.55 });
        case 'pir_white':      return new THREE.MeshStandardMaterial({ color: 0xF2F5F8, roughness: 0.32, metalness: 0.18 });
        default:               return new THREE.MeshStandardMaterial({ color: 0xCCCCCC, roughness: 0.50 });
    }
}

// ─── PROCEDURAL SOFT GROUND CONTACT SHADOW DECAL ──────────────
let _cachedContactShadowTex = null;
function getContactShadowTexture() {
    if (_cachedContactShadowTex) return _cachedContactShadowTex;
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext('2d');
    const grad = ctx.createRadialGradient(64, 64, 8, 64, 64, 64);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.78)');
    grad.addColorStop(0.35, 'rgba(0, 0, 0, 0.48)');
    grad.addColorStop(0.70, 'rgba(0, 0, 0, 0.18)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    _cachedContactShadowTex = new THREE.CanvasTexture(c);
    return _cachedContactShadowTex;
}

/**
 * Creates an in-memory soft ambient contact shadow decal for buildings and structures
 * Anchors geometry to ground with zero dynamic shadow overhead
 */
export function createContactShadow(w, d, opacity = 0.85) {
    const geo = new THREE.PlaneGeometry(w, d);
    const mat = new THREE.MeshBasicMaterial({
        map: getContactShadowTexture(),
        transparent: true,
        opacity: opacity,
        depthWrite: false
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.02; // Placed 2cm above ground to prevent z-fighting
    return mesh;
}

// ─── TEXT HELPERS ─────────────────────────────────────────────

function nextPow2(v) { return Math.pow(2, Math.ceil(Math.log2(Math.max(v, 1)))); }

/** Sprite label (always faces camera) */
export function createTextSprite(text, opts = {}) {
    const { fontSize = 48, color = '#FFFFFF', bgColor = null, padding = 10 } = opts;
    const c = document.createElement('canvas');
    const x = c.getContext('2d');
    x.font = `bold ${fontSize}px 'Segoe UI',Arial,sans-serif`;
    const tw = x.measureText(text).width + padding * 2;
    const th = fontSize * 1.4 + padding * 2;
    c.width = nextPow2(tw); c.height = nextPow2(th);
    x.font = `bold ${fontSize}px 'Segoe UI',Arial,sans-serif`;
    if (bgColor) { x.fillStyle = bgColor; x.fillRect(0, 0, tw, th); }
    x.fillStyle = color; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(text, c.width / 2, c.height / 2);
    const tex = new THREE.CanvasTexture(c);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
    sp.scale.set(tw / 25, th / 25, 1);
    return sp;
}

/** Flat plane with text (positionable in 3D) */
export function createTextPlane(text, opts = {}) {
    const { fontSize = 56, color = '#FFFFFF', bgColor = '#0066FF',
            canvasW = 512, canvasH = 128, worldW = 10, worldH = 2.5 } = opts;
    const c = document.createElement('canvas');
    c.width = canvasW; c.height = canvasH;
    const x = c.getContext('2d');
    if (bgColor && bgColor !== 'transparent') { x.fillStyle = bgColor; x.fillRect(0, 0, canvasW, canvasH); }
    x.fillStyle = color;
    x.font = `bold ${fontSize}px 'Segoe UI',Arial,sans-serif`;
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(text, canvasW / 2, canvasH / 2);
    const tex = new THREE.CanvasTexture(c);
    const mat = new THREE.MeshStandardMaterial({
        map: tex, transparent: !bgColor || bgColor === 'transparent',
        roughness: 0.4, metalness: 0.1,
        emissive: new THREE.Color(bgColor && bgColor !== 'transparent' ? bgColor : 0x000000),
        emissiveIntensity: 0.3,
    });
    return new THREE.Mesh(new THREE.PlaneGeometry(worldW, worldH), mat);
}

/** Multi-line info panel (3D plane) */
export function createInfoPanel(lines, opts = {}) {
    const { canvasW = 512, canvasH = 512, worldW = 8, worldH = 8,
            bgColor = 'rgba(10,22,40,0.92)', titleColor = '#0066FF',
            textColor = '#AACCEE', fontSize = 26, titleSize = 34 } = opts;
    const c = document.createElement('canvas');
    c.width = canvasW; c.height = canvasH;
    const x = c.getContext('2d');
    x.fillStyle = bgColor; x.fillRect(0, 0, canvasW, canvasH);
    x.strokeStyle = '#0066FF'; x.lineWidth = 3;
    x.strokeRect(2, 2, canvasW - 4, canvasH - 4);
    let y = 30;
    lines.forEach((ln, i) => {
        const isT = i === 0;
        const fs = isT ? titleSize : fontSize;
        x.font = `${isT ? 'bold' : 'normal'} ${fs}px 'Segoe UI',Arial,sans-serif`;
        x.fillStyle = isT ? titleColor : textColor;
        x.textAlign = 'center';
        y += fs * 1.3;
        x.fillText(ln, canvasW / 2, y);
    });
    const tex = new THREE.CanvasTexture(c);
    return new THREE.Mesh(new THREE.PlaneGeometry(worldW, worldH),
        new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.3, emissive: 0x112244, emissiveIntensity: 0.2 }));
}

// ─── OBJECT HELPERS ──────────────────────────────────────────

/** Human figure (standing) */
export function createPerson(opts = {}) {
    const { shirtColor = 0x3366CC, pantsColor = 0x222233, skinColor = 0xDEA97F } = opts;
    const g = new THREE.Group();
    const skin = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.7 });
    const shirt = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.6 });
    const pants = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.6 });

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), skin);
    head.position.y = 1.62; g.add(head);
    // Hair
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.145, 8, 4, 0, Math.PI*2, 0, Math.PI*0.5),
        new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 }));
    hair.position.y = 1.65; g.add(hair);
    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.5, 0.22), shirt);
    torso.position.y = 1.2; g.add(torso);
    // Arms
    const armG = new THREE.BoxGeometry(0.11, 0.42, 0.14);
    [-0.28, 0.28].forEach(xp => { const a = new THREE.Mesh(armG, shirt); a.position.set(xp, 1.15, 0); g.add(a); });
    // Legs
    const legG = new THREE.BoxGeometry(0.14, 0.55, 0.16);
    [-0.1, 0.1].forEach(xp => { const l = new THREE.Mesh(legG, pants); l.position.set(xp, 0.57, 0); g.add(l); });
    // Shoes
    const shoeG = new THREE.BoxGeometry(0.14, 0.08, 0.2);
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 });
    [-0.1, 0.1].forEach(xp => { const s = new THREE.Mesh(shoeG, shoeMat); s.position.set(xp, 0.04, 0.02); g.add(s); });
    return g;
}

/** Seated person (simpler) */
export function createSeatedPerson(opts = {}) {
    const { shirtColor = 0x3366CC, pantsColor = 0x222233, skinColor = 0xDEA97F } = opts;
    const g = new THREE.Group();
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8),
        new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.7 }));
    head.position.y = 1.1; g.add(head);
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.4, 0.2),
        new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.6 }));
    torso.position.y = 0.8; g.add(torso);
    const legs = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.4),
        new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.6 }));
    legs.position.set(0, 0.55, 0.1); g.add(legs);
    return g;
}

/** Desk */
export function createDesk(w = 1.2, d = 0.6, h = 0.75) {
    const g = new THREE.Group();
    const top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.04, d), getMaterial('wood'));
    top.position.y = h; g.add(top);
    const legG = new THREE.BoxGeometry(0.04, h, 0.04);
    const legM = getMaterial('metal');
    const hw = w/2 - 0.05, hd = d/2 - 0.05;
    [[-hw,-hd],[hw,-hd],[-hw,hd],[hw,hd]].forEach(([x,z]) => {
        const l = new THREE.Mesh(legG, legM); l.position.set(x, h/2, z); g.add(l);
    });
    return g;
}

/** Office chair */
export function createChair() {
    const g = new THREE.Group();
    const dk = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5, metalness: 0.3 });
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.04, 0.42), dk);
    seat.position.y = 0.44; g.add(seat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.35, 0.04), dk);
    back.position.set(0, 0.66, -0.19); g.add(back);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.4, 6), getMaterial('metal'));
    pole.position.y = 0.22; g.add(pole);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.025, 8), getMaterial('metal'));
    base.position.y = 0.02; g.add(base);
    return g;
}

/** Computer monitor */
export function createMonitor(screenColor = COLORS.SCREEN_GLOW) {
    const g = new THREE.Group();
    const dk = getMaterial('metal_dark');
    // Bezel
    const bz = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.32, 0.025), dk);
    bz.position.y = 0.22; g.add(bz);
    // Screen face
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.27),
        new THREE.MeshStandardMaterial({ color: screenColor, emissive: screenColor, emissiveIntensity: 0.5, roughness: 0.1 }));
    scr.position.set(0, 0.22, 0.014); g.add(scr);
    // Stand
    const st = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.04), dk);
    st.position.y = 0; g.add(st);
    // Base
    const bs = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.01, 0.12), dk);
    bs.position.y = -0.06; g.add(bs);
    return g;
}

/** Large wall-mounted display */
export function createLargeDisplay(w = 2, h = 1.2, screenColor = COLORS.SCREEN_GLOW) {
    const g = new THREE.Group();
    const bz = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.06), getMaterial('metal_dark'));
    g.add(bz);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.1, h - 0.1),
        new THREE.MeshStandardMaterial({ color: screenColor, emissive: screenColor, emissiveIntensity: 0.4, roughness: 0.1 }));
    scr.position.z = 0.032; g.add(scr);
    return g;
}

/** Workstation combo: desk + chair + monitor + keyboard */
export function createWorkstation(opts = {}) {
    const { monitorCount = 1, deskW = 1.2 } = opts;
    const g = new THREE.Group();
    g.add(createDesk(deskW, 0.6, 0.75));
    for (let i = 0; i < monitorCount; i++) {
        const mon = createMonitor();
        const off = monitorCount > 1 ? (i - (monitorCount - 1) / 2) * 0.55 : 0;
        mon.position.set(off, 0.79, -0.15); g.add(mon);
    }
    // Keyboard
    const kb = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.015, 0.12), getMaterial('metal_dark'));
    kb.position.set(0, 0.76, 0.1); g.add(kb);
    const ch = createChair(); ch.position.set(0, 0, 0.55); g.add(ch);
    return g;
}

/** Server rack with LED-equipped units */
export function createServerRack(opts = {}) {
    const { h = 2.0, w = 0.6, d = 1.0, units = 8 } = opts;
    const g = new THREE.Group();
    // Cabinet
    const cab = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), getMaterial('metal_dark'));
    cab.position.y = h / 2; g.add(cab);
    // Units
    const uh = (h - 0.2) / units;
    for (let i = 0; i < units; i++) {
        const y = 0.1 + i * uh + uh / 2;
        const tray = new THREE.Mesh(new THREE.BoxGeometry(w - 0.06, uh * 0.7, 0.03),
            new THREE.MeshStandardMaterial({ color: 0x1A1A2E, roughness: 0.3, metalness: 0.8 }));
        tray.position.set(0, y, d / 2 - 0.01); g.add(tray);
        // LEDs
        [COLORS.LED_GREEN, COLORS.LED_BLUE, COLORS.LED_GREEN].forEach((c, j) => {
            const led = new THREE.Mesh(new THREE.SphereGeometry(0.01, 4, 4),
                new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 2 }));
            led.position.set(-w/2 + 0.07 + j * 0.035, y, d/2 + 0.005); g.add(led);
        });
    }
    return g;
}

/** Storage shelf with decorative boxes */
export function createShelf(w = 2, h = 2, d = 0.5, cnt = 4) {
    const g = new THREE.Group();
    const mat = getMaterial('metal');
    const upG = new THREE.BoxGeometry(0.04, h, 0.04);
    [[-w/2,-d/2],[w/2,-d/2],[-w/2,d/2],[w/2,d/2]].forEach(([x,z]) => {
        const u = new THREE.Mesh(upG, mat); u.position.set(x, h/2, z); g.add(u);
    });
    const shG = new THREE.BoxGeometry(w, 0.03, d);
    for (let i = 0; i <= cnt; i++) {
        const s = new THREE.Mesh(shG, mat); s.position.y = (i/cnt)*h; g.add(s);
    }
    // Boxes
    const bCols = [0x886644, 0x667788, 0x556655, 0x887766];
    for (let i = 1; i <= cnt; i++) {
        const y = (i/cnt)*h + 0.06;
        const n = 1 + Math.floor(Math.random()*3);
        for (let j = 0; j < n; j++) {
            const bw = 0.12 + Math.random()*0.2;
            const bh = 0.08 + Math.random()*0.08;
            const bx = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, d*0.75),
                new THREE.MeshStandardMaterial({ color: bCols[j%4], roughness: 0.8 }));
            bx.position.set(-w/2+0.15+j*(bw+0.08), y+bh/2, 0); g.add(bx);
        }
    }
    return g;
}

/** Generic industrial machine */
export function createMachine(w = 1.5, h = 1.2, d = 1, color = 0x556677) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d),
        new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.6 }));
    body.position.y = h/2; g.add(body);
    // Control panel
    const pnl = new THREE.Mesh(new THREE.BoxGeometry(w*0.35, h*0.25, 0.04), getMaterial('screen'));
    pnl.position.set(0, h*0.75, d/2 + 0.02); g.add(pnl);
    // Base
    const base = new THREE.Mesh(new THREE.BoxGeometry(w+0.08, 0.08, d+0.08), getMaterial('metal_dark'));
    base.position.y = 0.04; g.add(base);
    // Safety stripe
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(w+0.1, 0.04, 0.02), getMaterial('yellow_safety'));
    stripe.position.set(0, h*0.08, d/2+0.04); g.add(stripe);
    return g;
}

// ─── FACTORY ROOF MANAGEMENT & HOLOGRAPHIC X-RAY REGISTRY ────
export const FACTORY_ROOF_GROUPS = [];
export const FACTORY_SHELL_MESHES = [];

let _roofsCutaway = false;
let _xrayActive = false;

const _holographicXRayMat = new THREE.MeshStandardMaterial({
    color: 0x00E1FF,
    roughness: 0.15,
    metalness: 0.85,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
    side: THREE.DoubleSide,
    emissive: 0x0088CC,
    emissiveIntensity: 0.35
});

function applyShellStates() {
    FACTORY_SHELL_MESHES.forEach(mesh => {
        if (_xrayActive) {
            mesh.material = _holographicXRayMat;
        } else if (mesh.userData.originalMaterial) {
            mesh.material = mesh.userData.originalMaterial;
        }
        if (mesh.userData.isRoof) {
            mesh.visible = !_roofsCutaway;
        } else if (mesh.userData.isWall) {
            mesh.visible = true;
        }
    });
}

export function toggleFactoryRoofs() {
    _roofsCutaway = !_roofsCutaway;
    FACTORY_ROOF_GROUPS.forEach(rg => {
        rg.visible = !_roofsCutaway;
    });
    applyShellStates();
    return !_roofsCutaway;
}

export function setFactoryRoofsVisible(visible) {
    _roofsCutaway = !visible;
    FACTORY_ROOF_GROUPS.forEach(rg => {
        rg.visible = visible;
    });
    applyShellStates();
}

export function toggleHolographicXRay() {
    _xrayActive = !_xrayActive;
    applyShellStates();
    return _xrayActive;
}

export function isHolographicXRayActive() {
    return _xrayActive;
}

// ─── FLOATING FACILITY LABELS REGISTRY ────────────────────────
export const FLOATING_FACILITY_LABELS = [];

// ─── PER-FACILITY SHELL & CUTAWAY REGISTRY ────────────────────
export const REGISTERED_FACILITY_SHELLS = new Map();

// ─── INTERACTIVE EQUIPMENT REGISTRY ───────────────────────────
export const INTERACTIVE_EQUIPMENT_OBJECTS = [];

if (typeof window !== 'undefined') {
    window.FLOATING_FACILITY_LABELS = FLOATING_FACILITY_LABELS;
    window.REGISTERED_FACILITY_SHELLS = REGISTERED_FACILITY_SHELLS;
    window.INTERACTIVE_EQUIPMENT_OBJECTS = INTERACTIVE_EQUIPMENT_OBJECTS;
}

export function registerFacilityShell(id, data) {
    REGISTERED_FACILITY_SHELLS.set(id, data);
}

export function setFacilityInteriorCutaway(facilityId, isInterior) {
    const data = REGISTERED_FACILITY_SHELLS.get(facilityId);
    if (!data) return;

    if (data.roofGroup) {
        data.roofGroup.visible = !isInterior;
    }

    if (data.frontWalls && data.frontWalls.length > 0) {
        data.frontWalls.forEach(wall => {
            if (isInterior) {
                wall.visible = false;
            } else {
                wall.visible = true;
                if (wall.userData && wall.userData.originalMaterial) {
                    wall.material = wall.userData.originalMaterial;
                }
            }
        });
    }

    if (data.frontGlass) {
        data.frontGlass.visible = !isInterior;
    }
}

export function resetAllFacilityCutaways() {
    REGISTERED_FACILITY_SHELLS.forEach((data, id) => {
        setFacilityInteriorCutaway(id, false);
    });
}

export function tagEquipment(mesh, data) {
    if (!mesh) return;
    mesh.userData.isEquipment = true;
    mesh.userData.equipmentData = data;
    mesh.traverse(child => {
        if (child.isMesh) {
            child.userData.isEquipment = true;
            child.userData.equipmentData = data;
            if (!child.userData.originalMaterial) {
                child.userData.originalMaterial = child.material;
            }
            if (!INTERACTIVE_EQUIPMENT_OBJECTS.includes(child)) {
                INTERACTIVE_EQUIPMENT_OBJECTS.push(child);
            }
        }
    });
}

let _highlightedEquipment = null;
export function highlightEquipment(mesh, active) {
    if (_highlightedEquipment && _highlightedEquipment !== mesh) {
        _highlightedEquipment.traverse(c => {
            if (c.isMesh && c.userData.originalMaterial) {
                c.material = c.userData.originalMaterial;
            }
        });
        _highlightedEquipment = null;
    }

    if (mesh && active) {
        _highlightedEquipment = mesh;
        mesh.traverse(c => {
            if (c.isMesh) {
                c.material = new THREE.MeshStandardMaterial({
                    color: 0x00FF88,
                    emissive: 0x00FF88,
                    emissiveIntensity: 0.65,
                    roughness: 0.2,
                    metalness: 0.4
                });
            }
        });
    }
}

export function createFloatingFacilityLabel(data) {
    const group = new THREE.Group();
    group.name = `FloatingLabel_${data.id}`;
    group.userData.facilityId = data.id;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const r = 28;
    ctx.fillStyle = 'rgba(10, 22, 40, 0.94)';
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(canvas.width - r, 0);
    ctx.quadraticCurveTo(canvas.width, 0, canvas.width, r);
    ctx.lineTo(canvas.width, canvas.height - r);
    ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - r, canvas.height);
    ctx.lineTo(r, canvas.height);
    ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.fill();

    ctx.lineWidth = 8;
    ctx.strokeStyle = '#00AAFF';
    ctx.stroke();

    ctx.fillStyle = 'rgba(0, 255, 136, 0.2)';
    ctx.beginPath();
    ctx.rect(36, 20, 260, 40);
    ctx.fill();

    ctx.fillStyle = '#00FF88';
    ctx.font = 'bold 22px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('UDYOGCLOUD NODE', 166, 40);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 50px Segoe UI, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(data.name.toUpperCase(), 38, 122);

    ctx.fillStyle = '#88CCFF';
    ctx.font = '32px Segoe UI, sans-serif';
    ctx.fillText(data.subtitle || 'Connected Industrial Cloud Facility', 38, 190);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const mat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
        depthTest: false
    });

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(16, 4.0), mat);
    mesh.position.set(0, 0, 0);
    mesh.renderOrder = 999;
    group.add(mesh);

    const pinH = 4.2;
    const pinGeo = new THREE.CylinderGeometry(0.08, 0.08, pinH, 6);
    const pinMat = new THREE.MeshBasicMaterial({ color: 0x00AAFF, transparent: true, opacity: 0.75 });
    const pin = new THREE.Mesh(pinGeo, pinMat);
    pin.position.set(0, -2.0 - pinH / 2, 0);
    group.add(pin);

    const beaconGeo = new THREE.SphereGeometry(0.35, 8, 8);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0x00FF88 });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(0, -2.0 - pinH, 0);
    group.add(beacon);

    const elevation = (data.roofH || 15) + 7.5;
    group.position.set(data.pos.x, elevation, data.pos.z);

    FLOATING_FACILITY_LABELS.push(group);
    return group;
}

/** Building shell: walls, floor, roof, entrance, label */
export function createBuilding(w, h, d, opts = {}) {
    const { wallType = 'concrete', name = '', wallOpacity = 1.0, roofColor = 0x444444, isFactory = false } = opts;
    const g = new THREE.Group();
    const th = 0.25;

    let wallMat;
    if (wallOpacity < 1) {
        wallMat = new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.8,
            transparent: true, opacity: wallOpacity, side: THREE.DoubleSide });
    } else { wallMat = getMaterial(wallType); }

    // Floor
    const fl = new THREE.Mesh(new THREE.BoxGeometry(w, 0.2, d), getMaterial('floor'));
    fl.position.y = 0.1; fl.receiveShadow = true; g.add(fl);

    // Back wall
    const bw = new THREE.Mesh(new THREE.BoxGeometry(w, h, th), wallMat);
    bw.position.set(0, h/2+0.2, -d/2); g.add(bw);
    // Side walls
    const lw = new THREE.Mesh(new THREE.BoxGeometry(th, h, d), wallMat);
    lw.position.set(-w/2, h/2+0.2, 0); g.add(lw);
    const rw = new THREE.Mesh(new THREE.BoxGeometry(th, h, d), wallMat);
    rw.position.set(w/2, h/2+0.2, 0); g.add(rw);
    // Front wall with entrance
    const doorW = Math.min(w*0.2, 4);
    const sideW = (w-doorW)/2;
    const flL = new THREE.Mesh(new THREE.BoxGeometry(sideW, h, th), wallMat);
    flL.position.set(-(doorW/2+sideW/2), h/2+0.2, d/2); g.add(flL);
    const flR = new THREE.Mesh(new THREE.BoxGeometry(sideW, h, th), wallMat);
    flR.position.set( (doorW/2+sideW/2), h/2+0.2, d/2); g.add(flR);
    const flT = new THREE.Mesh(new THREE.BoxGeometry(doorW, h*0.15, th), wallMat);
    flT.position.set(0, h*0.925+0.2, d/2); g.add(flT);

    // Tag factory exterior walls for holographic X-Ray mode
    if (isFactory) {
        [bw, lw, rw, flL, flR, flT].forEach(m => {
            m.userData.isExteriorShell = true;
            m.userData.isWall = true;
            m.userData.originalMaterial = m.material;
            FACTORY_SHELL_MESHES.push(m);
        });
    }

    // Windows (glass strips on side walls)
    const winH = h * 0.3, winY = h * 0.55 + 0.2;
    const glassMat = getMaterial('glass');
    [[-w/2-0.01, 0], [w/2+0.01, 0]].forEach(([x]) => {
        const win = new THREE.Mesh(new THREE.PlaneGeometry(d*0.8, winH), glassMat);
        win.position.set(x, winY, 0);
        win.rotation.y = Math.PI/2;
        g.add(win);
    });
    // Front windows
    const fWinW = sideW * 0.6;
    [-(doorW/2+sideW/2), (doorW/2+sideW/2)].forEach(x => {
        const win = new THREE.Mesh(new THREE.PlaneGeometry(fWinW, winH), glassMat);
        win.position.set(x, winY, d/2+0.01);
        g.add(win);
    });

    // ── Roof Assembly & Dynamic Cutaway Container ──
    const roofGroup = new THREE.Group();
    roofGroup.name = `RoofGroup_${name || 'Building'}`;
    roofGroup.userData.isFactoryRoof = isFactory;

    // Preserved Original Flat Roof Geometry (Retained 100% for rollback, comparison & fallback)
    const originalFlatRoof = new THREE.Mesh(
        new THREE.BoxGeometry(w + 0.5, 0.2, d + 0.5),
        new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.7, metalness: 0.3 })
    );
    originalFlatRoof.position.y = h + 0.3;
    originalFlatRoof.receiveShadow = true;
    roofGroup.add(originalFlatRoof);
    roofGroup.userData.originalRoof = originalFlatRoof;

    if (isFactory) {
        // Flat roof is retained inside the container but hidden by default in favor of realistic sawtooth
        originalFlatRoof.visible = false;

        // Realistic Industrial Sawtooth Roof with Glazed North-Light Windows & Trusses
        const sawtoothGroup = new THREE.Group();
        sawtoothGroup.name = `SawtoothRoof_${name || 'Factory'}`;

        const bayCount = Math.max(3, Math.round(d / 4.8));
        const bayDepth = d / bayCount;
        const toothH = 2.4; // Height of sawtooth peak
        const metalMat = new THREE.MeshStandardMaterial({
            color: 0x223244,
            roughness: 0.65,
            metalness: 0.45
        });
        const frameMat = getMaterial('metal_dark');

        for (let b = 0; b < bayCount; b++) {
            const zStart = -d / 2 + b * bayDepth;
            const zEnd = zStart + bayDepth;
            const zPeak = zEnd; // Peak at the north ridge of each bay

            // 1) Glazed vertical north-light face
            const glassPanel = new THREE.Mesh(
                new THREE.BoxGeometry(w + 0.3, toothH, 0.08),
                glassMat
            );
            glassPanel.position.set(0, h + 0.2 + toothH / 2, zPeak);
            sawtoothGroup.add(glassPanel);

            // Steel window mullions across the glass panel
            const mullionCount = 5;
            for (let m = 0; m <= mullionCount; m++) {
                const mx = -(w / 2) + (m / mullionCount) * w;
                const mullion = new THREE.Mesh(
                    new THREE.BoxGeometry(0.06, toothH, 0.1),
                    frameMat
                );
                mullion.position.set(mx, h + 0.2 + toothH / 2, zPeak);
                sawtoothGroup.add(mullion);
            }

            // 2) Sloped corrugated industrial metal roof panel
            const slopeLength = Math.sqrt(bayDepth * bayDepth + toothH * toothH);
            const slopeAngle = Math.atan2(toothH, bayDepth);
            const slopePanel = new THREE.Mesh(
                new THREE.BoxGeometry(w + 0.5, 0.14, slopeLength),
                metalMat
            );
            slopePanel.position.set(
                0,
                h + 0.2 + toothH / 2,
                (zStart + zEnd) / 2
            );
            slopePanel.rotation.x = slopeAngle;
            slopePanel.receiveShadow = true;
            sawtoothGroup.add(slopePanel);

            // 3) Triangular side end-caps to close the saw-teeth on left and right
            for (let sideX of [-(w + 0.4) / 2, (w + 0.4) / 2]) {
                const triShape = new THREE.Shape();
                triShape.moveTo(0, 0);
                triShape.lineTo(bayDepth, 0);
                triShape.lineTo(bayDepth, toothH);
                triShape.closePath();

                const triGeo = new THREE.ShapeGeometry(triShape);
                const triMesh = new THREE.Mesh(triGeo, metalMat);
                triMesh.position.set(sideX, h + 0.2, zStart);
                triMesh.rotation.y = sideX > 0 ? -Math.PI / 2 : Math.PI / 2;
                sawtoothGroup.add(triMesh);
            }

            // 4) Industrial rotary turbine exhaust vent on the peak ridge
            const ventX = ((b % 2 === 0) ? -w * 0.25 : w * 0.25);
            const ventBase = new THREE.Mesh(
                new THREE.CylinderGeometry(0.35, 0.45, 0.4, 8),
                frameMat
            );
            ventBase.position.set(ventX, h + 0.2 + toothH + 0.2, zPeak - 0.2);
            sawtoothGroup.add(ventBase);

            const ventCowl = new THREE.Mesh(
                new THREE.SphereGeometry(0.4, 8, 6),
                metalMat
            );
            ventCowl.position.set(ventX, h + 0.2 + toothH + 0.5, zPeak - 0.2);
            sawtoothGroup.add(ventCowl);

            // 5) Exposed structural steel Warren truss beneath the tooth ridge
            const trussBar = new THREE.Mesh(
                new THREE.BoxGeometry(w, 0.12, 0.12),
                frameMat
            );
            trussBar.position.set(0, h + 0.1, zPeak);
            sawtoothGroup.add(trussBar);
        }

        // Perimeter coping trim around the roof edges
        const parapetFront = new THREE.Mesh(new THREE.BoxGeometry(w + 0.8, 0.35, 0.2), frameMat);
        parapetFront.position.set(0, h + 0.35, d / 2 + 0.1);
        sawtoothGroup.add(parapetFront);

        const parapetBack = new THREE.Mesh(new THREE.BoxGeometry(w + 0.8, 0.35, 0.2), frameMat);
        parapetBack.position.set(0, h + 0.35, -d / 2 - 0.1);
        sawtoothGroup.add(parapetBack);

        roofGroup.add(sawtoothGroup);
        roofGroup.userData.sawtoothRoof = sawtoothGroup;

        // Tag factory roof meshes for holographic X-Ray mode
        sawtoothGroup.traverse(child => {
            if (child.isMesh) {
                child.userData.isExteriorShell = true;
                child.userData.isRoof = true;
                child.userData.originalMaterial = child.material;
                FACTORY_SHELL_MESHES.push(child);
            }
        });

        FACTORY_ROOF_GROUPS.push(roofGroup);
    }

    g.add(roofGroup);
    g.userData.roof = roofGroup;
    g.userData.roofGroup = roofGroup;
    g.userData.walls = [bw, lw, rw, flL, flR, flT];
    g.userData.frontWalls = [flL, flR, flT];
    g.userData.buildingName = name;

    // Name label
    if (name) {
        const lbl = createTextPlane(name, { worldW: Math.min(w*0.65, 12), worldH: 1.5, fontSize: 46 });
        lbl.position.set(0, h+1.8, d/2+0.3); g.add(lbl);
    }
    return g;
}

/** Simple tree */
export function createTree(trunkH = 2, crownR = 1.5) {
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, trunkH, 6),
        new THREE.MeshStandardMaterial({ color: 0x5C3A1E, roughness: 0.9 }));
    trunk.position.y = trunkH/2; g.add(trunk);
    const crown = new THREE.Mesh(new THREE.SphereGeometry(crownR, 8, 6),
        new THREE.MeshStandardMaterial({ color: 0x2D7A27, roughness: 0.9 }));
    crown.position.y = trunkH + crownR*0.6; g.add(crown);
    return g;
}

/** Street light */
export function createStreetLight(h = 6) {
    const g = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, h, 6), getMaterial('metal'));
    pole.position.y = h/2; g.add(pole);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.06, 0.25), getMaterial('metal'));
    arm.position.set(0.2, h, 0); g.add(arm);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6),
        new THREE.MeshStandardMaterial({ color: 0xFFEECC, emissive: 0xFFEECC, emissiveIntensity: 1 }));
    bulb.position.set(0.2, h-0.05, 0); g.add(bulb);
    return g;
}

/** Full-Scale Articulated Semi-Truck with 40ft Container Trailer */
export function createSemiTruck(cabColor = 0x1B4F8A, trailerColor = 0xDCE2E8) {
    const truck = new THREE.Group();
    truck.name = 'SemiTruck';

    const cabMat = new THREE.MeshStandardMaterial({ color: cabColor, roughness: 0.3, metalness: 0.7 });
    const trailerMat = new THREE.MeshStandardMaterial({ color: trailerColor, roughness: 0.5, metalness: 0.25 });
    const chromeMat = getMaterial('metal_light');
    const darkMat = getMaterial('metal_dark');
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x141618, roughness: 0.9 });
    const wheelRimMat = getMaterial('metal');
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x22354A, roughness: 0.1, metalness: 0.8 });

    // ── 1. TRACTOR CAB ──
    const cabGroup = new THREE.Group();
    cabGroup.position.set(0, 0, 5.2);

    // Cab lower body & engine hood
    const hood = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.4, 2.2), cabMat);
    hood.position.set(0, 1.3, 1.5);
    cabGroup.add(hood);

    // Radiator Grille
    const grille = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.0, 0.1), chromeMat);
    grille.position.set(0, 1.2, 2.65);
    cabGroup.add(grille);

    // Headlights
    [-0.8, 0.8].forEach(x => {
        const hl = new THREE.Mesh(
            new THREE.BoxGeometry(0.35, 0.2, 0.1),
            new THREE.MeshBasicMaterial({ color: 0xFFFFF0 })
        );
        hl.position.set(x, 0.9, 2.62);
        cabGroup.add(hl);
    });

    // Driver Sleeper Cabin
    const sleeper = new THREE.Mesh(new THREE.BoxGeometry(2.45, 2.4, 2.8), cabMat);
    sleeper.position.set(0, 2.2, -0.6);
    cabGroup.add(sleeper);

    // Aerodynamic Roof Fairing
    const fairing = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.8, 2.2), cabMat);
    fairing.position.set(0, 3.7, -0.7);
    cabGroup.add(fairing);

    // Windshield
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.9, 0.1), glassMat);
    windshield.position.set(0, 2.5, 0.82);
    windshield.rotation.x = -0.15;
    cabGroup.add(windshield);

    // Twin Vertical Chrome Exhaust Stacks
    [-1.15, 1.15].forEach(x => {
        const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.2, 8), chromeMat);
        pipe.position.set(x, 2.8, -1.9);
        cabGroup.add(pipe);
    });

    // Cylindrical Fuel Tanks
    [-1.25, 1.25].forEach(x => {
        const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 1.8, 12), chromeMat);
        tank.rotation.x = Math.PI / 2;
        tank.position.set(x, 0.7, -0.6);
        cabGroup.add(tank);
    });

    // Tractor Wheels (Front steer + rear tandem dual drive)
    const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.32, 12);
    function addWheel(x, z) {
        const w = new THREE.Mesh(wheelGeo, tireMat);
        w.rotation.z = Math.PI / 2;
        w.position.set(x, 0.5, z);
        const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.34, 8), wheelRimMat);
        rim.rotation.z = Math.PI / 2;
        rim.position.set(x, 0.5, z);
        cabGroup.add(w);
        cabGroup.add(rim);
    }
    // Front axle
    addWheel(-1.15, 1.8);
    addWheel(1.15, 1.8);
    // Rear tandem drive axles
    addWheel(-1.15, -1.2);
    addWheel(1.15, -1.2);
    addWheel(-1.15, -2.4);
    addWheel(1.15, -2.4);

    truck.add(cabGroup);

    // ── 2. 40FT SHIPPING CONTAINER TRAILER ──
    const trailerGroup = new THREE.Group();
    trailerGroup.position.set(0, 0, -1.6);

    // Trailer Main Container Box
    const containerL = 12.2, containerW = 2.5, containerH = 2.9;
    const container = new THREE.Mesh(
        new THREE.BoxGeometry(containerW, containerH, containerL),
        trailerMat
    );
    container.position.set(0, 2.65, 0);
    trailerGroup.add(container);

    // Container Corrugation Ribs
    const ribGeo = new THREE.BoxGeometry(0.04, containerH - 0.2, 0.08);
    for (let r = -containerL / 2 + 0.6; r <= containerL / 2 - 0.6; r += 0.6) {
        [-containerW / 2 - 0.02, containerW / 2 + 0.02].forEach(x => {
            const rib = new THREE.Mesh(ribGeo, darkMat);
            rib.position.set(x, 2.65, r);
            trailerGroup.add(rib);
        });
    }

    // Heavy Trailer Chassis Frame
    const chassis = new THREE.Mesh(
        new THREE.BoxGeometry(containerW - 0.2, 0.35, containerL + 0.4),
        darkMat
    );
    chassis.position.set(0, 1.05, 0);
    trailerGroup.add(chassis);

    // Landing Gear Support Legs (near front of trailer)
    [-0.9, 0.9].forEach(x => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.8, 0.12), darkMat);
        leg.position.set(x, 0.6, 3.8);
        trailerGroup.add(leg);
    });

    // Trailer Rear Tandem Dual Axles (at back)
    [-containerW / 2 + 0.1, containerW / 2 - 0.1].forEach(x => {
        [-4.2, -5.5].forEach(z => {
            const tw = new THREE.Mesh(wheelGeo, tireMat);
            tw.rotation.z = Math.PI / 2;
            tw.position.set(x, 0.5, z);
            trailerGroup.add(tw);
        });
    });

    // Rear Under-Ride Guard & Taillights
    const bumper = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.15, 0.15), darkMat);
    bumper.position.set(0, 0.6, -containerL / 2 - 0.1);
    trailerGroup.add(bumper);

    [-0.8, 0.8].forEach(x => {
        const tail = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.12, 0.05),
            new THREE.MeshBasicMaterial({ color: 0xFF2222 })
        );
        tail.position.set(x, 0.6, -containerL / 2 - 0.15);
        trailerGroup.add(tail);
    });

    truck.add(trailerGroup);
    return truck;
}

/** Commercial Delivery Box Van */
export function createDeliveryVan(vanColor = 0x2A62B6) {
    const van = new THREE.Group();
    van.name = 'DeliveryVan';

    const bodyMat = new THREE.MeshStandardMaterial({ color: vanColor, roughness: 0.35, metalness: 0.5 });
    const cargoMat = new THREE.MeshStandardMaterial({ color: 0xECEFF2, roughness: 0.5, metalness: 0.1 });
    const darkMat = getMaterial('metal_dark');
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x141618, roughness: 0.9 });

    // Driver Cab
    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.9, 2.2), bodyMat);
    cab.position.set(0, 1.4, 2.0);
    van.add(cab);

    // Windshield
    const windshield = new THREE.Mesh(
        new THREE.BoxGeometry(1.9, 0.8, 0.1),
        new THREE.MeshStandardMaterial({ color: 0x22354A, roughness: 0.1, metalness: 0.8 })
    );
    windshield.position.set(0, 1.7, 3.12);
    windshield.rotation.x = -0.2;
    van.add(windshield);

    // Cargo Box
    const cargoBox = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.3, 4.4), cargoMat);
    cargoBox.position.set(0, 1.8, -1.1);
    van.add(cargoBox);

    // Wheels
    const wGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.25, 12);
    [[-1.0, 2.1], [1.0, 2.1], [-1.0, -1.8], [1.0, -1.8]].forEach(([x, z]) => {
        const w = new THREE.Mesh(wGeo, tireMat);
        w.rotation.z = Math.PI / 2;
        w.position.set(x, 0.4, z);
        van.add(w);
    });

    return van;
}

/** Commercial Truck Weighbridge Scale Platform */
export function createWeighbridge(length = 18, width = 4.0) {
    const wb = new THREE.Group();
    wb.name = 'Weighbridge';

    // Concrete recessed foundation
    const pitMat = getMaterial('concrete_dark');
    const pit = new THREE.Mesh(new THREE.BoxGeometry(width + 0.8, 0.25, length + 0.8), pitMat);
    pit.position.y = 0.1;
    wb.add(pit);

    // Steel weighing deck
    const deckMat = new THREE.MeshStandardMaterial({ color: 0x48525E, roughness: 0.5, metalness: 0.7 });
    const deck = new THREE.Mesh(new THREE.BoxGeometry(width, 0.18, length), deckMat);
    deck.position.y = 0.22;
    wb.add(deck);

    // Yellow safety guide curbs on sides
    const curbMat = getMaterial('yellow_safety');
    [-width / 2 + 0.15, width / 2 - 0.15].forEach(x => {
        const curb = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.35, length), curbMat);
        curb.position.set(x, 0.38, 0);
        wb.add(curb);
    });

    // Digital readout scale kiosk
    const kioskGroup = new THREE.Group();
    kioskGroup.position.set(width / 2 + 1.2, 0, 0);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.2, 6), getMaterial('metal'));
    post.position.y = 1.1;
    kioskGroup.add(post);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.2), getMaterial('navy'));
    head.position.y = 2.1;
    kioskGroup.add(head);
    const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(0.65, 0.35),
        new THREE.MeshBasicMaterial({ color: 0x00FF88 })
    );
    screen.position.set(0, 2.1, 0.11);
    kioskGroup.add(screen);
    wb.add(kioskGroup);

    return wb;
}

/** Security Gatehouse Complex with Rising Arm Boom Barriers */
export function createSecurityGatehouse() {
    const g = new THREE.Group();
    g.name = 'SecurityGatehouseComplex';

    // Gatehouse building
    const bW = 6.0, bH = 3.6, bD = 3.8;
    const base = new THREE.Mesh(new THREE.BoxGeometry(bW, 0.4, bD), getMaterial('concrete_dark'));
    base.position.y = 0.2;
    g.add(base);

    const walls = new THREE.Mesh(new THREE.BoxGeometry(bW - 0.2, bH, bD - 0.2), getMaterial('white'));
    walls.position.y = 0.4 + bH / 2;
    g.add(walls);

    // Tinted security inspection windows
    const winMat = new THREE.MeshStandardMaterial({ color: 0x1A334E, roughness: 0.1, metalness: 0.8 });
    const winFront = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 1.4), winMat);
    winFront.position.set(0, 2.2, bD / 2);
    g.add(winFront);
    const winBack = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 1.4), winMat);
    winBack.position.set(0, 2.2, -bD / 2);
    winBack.rotation.y = Math.PI;
    g.add(winBack);

    // Overhanging canopy roof
    const roof = new THREE.Mesh(new THREE.BoxGeometry(bW + 2.0, 0.35, bD + 2.0), getMaterial('navy'));
    roof.position.y = 0.4 + bH + 0.18;
    g.add(roof);

    // Motorized Boom Barriers (Inbound & Outbound)
    [-bW / 2 - 0.6, bW / 2 + 0.6].forEach((x, idx) => {
        const housing = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.1, 0.5), getMaterial('yellow_safety'));
        housing.position.set(x, 0.55, 0);
        g.add(housing);

        // Barrier arm (4m long red/white striped)
        const armL = 4.2;
        const arm = new THREE.Mesh(
            new THREE.BoxGeometry(armL, 0.1, 0.06),
            new THREE.MeshStandardMaterial({ color: 0xEE2222, roughness: 0.4 })
        );
        const armDir = idx === 0 ? -1 : 1;
        arm.position.set(x + (armDir * armL) / 2, 0.95, 0);
        g.add(arm);
    });

    return g;
}

/** Distant Background Warehouse Silhouette for Seamless Horizon */
export function createDistantWarehouse(w = 60, h = 18, d = 45, color = 0x687482) {
    const g = new THREE.Group();
    const bMat = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.1 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bMat);
    body.position.y = h / 2;
    g.add(body);

    // Simple gabled roof
    const roofGeo = new THREE.ConeGeometry(w * 0.72, 4.0, 4);
    const roof = new THREE.Mesh(roofGeo, getMaterial('concrete_dark'));
    roof.position.y = h + 2.0;
    roof.rotation.y = Math.PI / 4;
    g.add(roof);

    return g;
}


