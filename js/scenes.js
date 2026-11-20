// ═══════════════════════════════════════════════════════════════
// js/scenes.js – 8-Scene Cinematic Presentation System
// Smooth camera transitions, focus targets, narration text & auto-play
// ═══════════════════════════════════════════════════════════════
import * as THREE from 'three';

export const SCENE_CONFIGS = [
    {
        id: 0,
        title: 'SCENE 1: UDYOGCLOUD INTRODUCTION',
        tagline: 'Affordable Cloud Infrastructure for Small Industries',
        description: 'Welcome to the UdyogCloud Industrial Technology Campus. A complete, professionally managed cloud ecosystem engineered specifically for small-scale manufacturers and commercial businesses across India.',
        camPos: new THREE.Vector3(0, 142, 215),
        target: new THREE.Vector3(0, 10, 5),
        duration: 2.8,
        focusElement: 'CAMPUS',
        facilityId: 'campus',
        headerTitle: 'UDYOGCLOUD INDUSTRIAL TECHNOLOGY CAMPUS',
        headerSubtitle: 'Ecosystem Overview • 6 Connected Industries & Central Cloud Core'
    },
    {
        id: 1,
        title: 'SCENE 2: INDUSTRIES & THEIR PROBLEMS',
        tagline: '6 Core Industries Struggling with Expensive IT Infrastructure',
        description: 'Automobile component manufacturing, textile & garments, food processing, commercial printing, furniture woodworking, and wholesale distribution. These small units face prohibitive on-premise server costs, data loss risks, and a lack of in-house cloud expertise.',
        camPos: new THREE.Vector3(-150, 95, 120),
        target: new THREE.Vector3(-60, 12, 0),
        duration: 3.2,
        focusElement: 'INDUSTRIES_OVERVIEW',
        facilityId: 'industries_overview',
        headerTitle: 'INDUSTRIES & THEIR APPLICATIONS',
        headerSubtitle: 'Explore Six Connected Industrial Facilities Across the Campus'
    },
    {
        id: 2,
        title: 'SCENE 3: CUSTOMER REGISTRATION',
        tagline: 'Frictionless 2-Minute Onboarding Without Complex Cloud Jargon',
        description: 'Inside the Customer Experience Center, small business owners register in minutes. Zero upfront hardware capital expenditure, zero complex DevOps licensing, and immediate access to cloud infrastructure.',
        camPos: new THREE.Vector3(112, 32, 78),
        target: new THREE.Vector3(80, 7, 40),
        duration: 3.0,
        focusElement: 'CUSTOMER_OFFICE',
        facilityId: 'registration',
        headerTitle: 'CUSTOMER REGISTRATION & ONBOARDING',
        headerSubtitle: 'Explore the Customer Experience & 7-Step Journey Center'
    },
    {
        id: 3,
        title: 'SCENE 4: CLOUD SERVICE SELECTION',
        tagline: 'Tailored Storage, Database & Virtualization Tiers',
        description: 'Customers choose right-sized packages: Starter (file sharing & daily backups), Growth (ERP & inventory databases), or Professional (high-performance compute & container swarms). Pay only for what you consume.',
        camPos: new THREE.Vector3(95, 34, 15),
        target: new THREE.Vector3(70, 8, 12),
        duration: 2.8,
        focusElement: 'PRICING_PLAZA',
        facilityId: 'services',
        headerTitle: 'CLOUD SERVICES & INFRASTRUCTURE TIERS',
        headerSubtitle: 'Tailored Storage, Database & Virtual Machine Allocations'
    },
    {
        id: 4,
        title: 'SCENE 5: CENTRAL DATA CENTER',
        tagline: 'Enterprise Tier-3 Architecture: Linux, KVM & Docker',
        description: 'Step up to the central UdyogCloud Enterprise Data Center. 4 full rows of high-density server racks, hardened Enterprise Linux kernels, isolated multi-tenant KVM virtualization, and automated Docker container orchestration on raised anti-static flooring.',
        camPos: new THREE.Vector3(0, 42, 88),
        target: new THREE.Vector3(0, 14, 0),
        duration: 3.5,
        focusElement: 'DATACENTER_HERO',
        facilityId: 'datacenter',
        headerTitle: 'UDYOGCLOUD DATA CENTER',
        headerSubtitle: 'Central Enterprise Cloud Infrastructure & Server Core'
    },
    {
        id: 5,
        title: 'SCENE 6: DATA MANAGEMENT & CONNECTIVITY',
        tagline: 'Dedicated 10Gbps Fiber Backbone & Bidirectional Streams',
        description: 'Real-time telemetry showing live bidirectional data packets pulsing between all 6 industrial customer plants and the central storage/database clusters. Instant file sync, automated backups, and low-latency ERP transactions.',
        camPos: new THREE.Vector3(-90, 110, 110),
        target: new THREE.Vector3(0, 12, 0),
        duration: 3.2,
        focusElement: 'NETWORK_CORE',
        facilityId: 'connectivity',
        headerTitle: 'CLOUD CONNECTIVITY & DATA BACKBONE',
        headerSubtitle: 'Real-Time Telemetry & Bidirectional Optical Fiber Corridors'
    },
    {
        id: 6,
        title: 'SCENE 7: CLOUD PROFESSIONALS & OPERATIONS',
        tagline: '24/7 Managed NOC Team Eliminates the Need for In-House IT',
        description: 'Inside the UdyogCloud Network Operations Center. Dedicated cloud engineers configure, patch, monitor, and back up each customer’s environment. Small industries gain full enterprise cloud reliability at small-business prices.',
        camPos: new THREE.Vector3(118, 36, 18),
        target: new THREE.Vector3(80, 8, -20),
        duration: 3.0,
        focusElement: 'OPS_CENTER',
        facilityId: 'operations',
        headerTitle: 'CLOUD OPERATIONS & 24/7 NOC CENTER',
        headerSubtitle: 'Enterprise Infrastructure Management & Customer Support Team'
    },
    {
        id: 7,
        title: 'SCENE 8: COMPLETE UDYOGCLOUD ECOSYSTEM',
        tagline: 'Empowering Small Industries Through Affordable Cloud Infrastructure',
        description: 'Returning to the panoramic aerial view of the complete, connected industrial campus. UdyogCloud bridges the digital divide for small manufacturers: accessible, professionally managed, and built for growth.',
        camPos: new THREE.Vector3(0, 142, 215),
        target: new THREE.Vector3(0, 10, 5),
        duration: 3.8,
        focusElement: 'ECOSYSTEM_OVERVIEW',
        facilityId: 'campus',
        headerTitle: 'COMPLETE UDYOGCLOUD ECOSYSTEM',
        headerSubtitle: 'Empowering Small-Scale Industries Through Managed Cloud Infrastructure'
    }
];

export class SceneController {
    constructor(camera, controls, onSceneChangeCallback) {
        this.camera = camera;
        this.controls = controls;
        this.onSceneChange = onSceneChangeCallback;

        this.currentSceneIndex = 0;
        this.isTransitioning = false;
        this.transitionProgress = 0;
        this.transitionDuration = 2.5;

        this.startPos = new THREE.Vector3();
        this.targetPos = new THREE.Vector3();
        this.startLookAt = new THREE.Vector3();
        this.targetLookAt = new THREE.Vector3();

        this.isPlaying = false;
        this.playTimer = 0;
        this.sceneDuration = 8.0; // Auto-play dwell time per scene in seconds
    }

    goToScene(index, instant = false) {
        if (index < 0 || index >= SCENE_CONFIGS.length) return;
        const config = SCENE_CONFIGS[index];
        this.currentSceneIndex = index;

        if (instant) {
            this.camera.position.copy(config.camPos);
            this.controls.target.copy(config.target);
            this.controls.update();
            this.isTransitioning = false;
        } else {
            this.startPos.copy(this.camera.position);
            this.targetPos.copy(config.camPos);

            this.startLookAt.copy(this.controls.target);
            this.targetLookAt.copy(config.target);

            this.transitionDuration = config.duration || 2.5;
            this.transitionProgress = 0;
            this.isTransitioning = true;
        }

        if (this.onSceneChange) {
            this.onSceneChange(config);
        }
    }

    flyTo(camPos, target, duration = 2.5) {
        this.startPos.copy(this.camera.position);
        this.targetPos.copy(camPos);

        this.startLookAt.copy(this.controls.target);
        this.targetLookAt.copy(target);

        this.transitionDuration = duration;
        this.transitionProgress = 0;
        this.isTransitioning = true;
    }

    nextScene() {
        const nextIdx = (this.currentSceneIndex + 1) % SCENE_CONFIGS.length;
        this.goToScene(nextIdx);
    }

    prevScene() {
        const prevIdx = (this.currentSceneIndex - 1 + SCENE_CONFIGS.length) % SCENE_CONFIGS.length;
        this.goToScene(prevIdx);
    }

    togglePlay() {
        this.isPlaying = !this.isPlaying;
        this.playTimer = 0;
        return this.isPlaying;
    }

    update(delta) {
        // Handle smooth cubic camera transition
        if (this.isTransitioning) {
            this.transitionProgress += delta / this.transitionDuration;
            if (this.transitionProgress >= 1) {
                this.transitionProgress = 1;
                this.isTransitioning = false;
            }

            // Smooth easeInOutCubic
            const t = this.transitionProgress;
            const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

            this.camera.position.lerpVectors(this.startPos, this.targetPos, ease);
            this.controls.target.lerpVectors(this.startLookAt, this.targetLookAt, ease);
            this.controls.update();
        }

        // Handle auto-presentation slideshow
        if (this.isPlaying && !this.isTransitioning) {
            this.playTimer += delta;
            if (this.playTimer >= this.sceneDuration) {
                this.playTimer = 0;
                this.nextScene();
            }
        }
    }
}

