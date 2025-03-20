import * as THREE from "three";
// @ts-expect-error OrbitControls does exist
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import Stats from "three/examples/jsm/libs/stats.module.js";

interface Point {
    x: number;
    y: number;
    z: number;
    visibility: number;
}

interface HandData {
    right: Point[] | null;
}

class ThreeBox {
    private scene: THREE.Scene;
    private light: THREE.DirectionalLight;
    private camera: THREE.PerspectiveCamera;
    private container: HTMLDivElement;
    private renderer: THREE.WebGLRenderer;
    private controls: OrbitControls;
    private lineMaterial: THREE.LineBasicMaterial;
    private handGroup: THREE.Group | null;
    // private handGroup: THREE.LineSegments | null;
    private motherBoadrModel: THREE.Group | null;
    private powerSupplyModel: THREE.Group | null;
    private monitor: THREE.Mesh | null;
    private buttonRed: THREE.Mesh | null;
    private buttonGreen: THREE.Mesh | null;
    private power: true | false;
    private powerChangeInProgress: true | false;

    private stats: Stats;
    private handGeometry: THREE.BufferGeometry | null;

    private handConnector = [
        [0, 1, 2, 3, 4],
        [0, 5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16],
        [5, 9, 13, 17],
        [0, 17, 18, 19, 20],
    ];

    constructor(canvas: HTMLCanvasElement, container: HTMLDivElement, stats: HTMLDivElement | null = null) {
        this.container = container;
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x999999);

        // Line material for hand tracking
        this.lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff });
        this.handGroup = null;
        this.handGeometry = null;

        // Lighting
        this.light = new THREE.DirectionalLight(0xffffff, 1);
        this.light.position.set(0.5, 1.0, 0.5).normalize();
        this.scene.add(this.light);

        // scope button 
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this.monitor = new THREE.Mesh(geometry, material);
        this.monitor.position.set(0.2, 0.3, -0.05);
        this.monitor.scale.set(0.13, 0.08, 0.01);

        this.buttonGreen = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
        this.buttonGreen.position.set(0.45, 0.3, -0.05);
        this.buttonGreen.scale.set(0.05, 0.04, 0.01);

        this.buttonRed = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0xff0000 }));
        this.buttonRed.position.set(0.45, 0.3, -0.05);
        this.buttonRed.scale.set(0.05, 0.04, 0.01);
        this.power = false;
        this.powerChangeInProgress = false;
        this.scene.add(this.buttonRed);


        // Grid Helper
        const grid = new THREE.GridHelper(10, 100, 0x000000, 0x7b7b7b);
        grid.position.set(0, -0.2, 0)
        this.scene.add(grid);

        // Camera Setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            1000
        );
        // this.camera.lookAt(new THREE.Vector3(2, 2, 2))
        this.camera.position.set(0, 0.6, 1);
        this.camera.rotation.y = Math.PI;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ canvas });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = false; // Disable shadows if unnecessary

        // Orbit Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Stats Monitor
        this.stats = new Stats();
        if (stats) {
            this.stats.dom.style.position = 'relative'
            stats.appendChild(this.stats.dom)
        } else {
            document.body.appendChild(this.stats.dom);
        }

        this.motherBoadrModel = null;
        this.loadMotherboard();
        this.powerSupplyModel = null;
        this.loadPowerSupply();
    }

    private async loadPowerSupply(): Promise<void> {
        const loader = new GLTFLoader();
        try {
            const glb = await loader.loadAsync("./models/power_supply_device.glb");
            this.powerSupplyModel = glb.scene;
            this.powerSupplyModel.position.set(0.3, 0.2, -0.2);
            // this.powerSupplyModel.scale.set(0.002, 0.002, 0.002);
            // this.powerSupplyModel.rotation.set(Math.PI / 2, 0, 0);
            this.scene.add(this.powerSupplyModel);
        } catch (error) {
            console.error("Error loading motherboard model:", error);
        }
    }
    private async loadMotherboard(): Promise<void> {
        const loader = new GLTFLoader();
        try {
            const glb = await loader.loadAsync("./models/motherboard.glb");
            this.motherBoadrModel = glb.scene;
            this.motherBoadrModel.position.set(-0.4, 0.2, 0);
            this.motherBoadrModel.scale.set(0.002, 0.002, 0.002);
            // this.motherBoadrModel.rotation.set(Math.PI / 2, 0, 0);
            this.scene.add(this.motherBoadrModel);
        } catch (error) {
            console.error("Error loading motherboard model:", error);
        }
    }

    public handleResize = (): void => {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    public setCameraPosition(x: number, y: number, z: number): void {
        this.camera.position.set(x, y, z);
    }

    public animate = (): void => {
        requestAnimationFrame(this.animate);
        if (this.power) {
            if (this.monitor) this.scene.add(this.monitor)
            if (this.buttonGreen) this.scene.add(this.buttonGreen)
            if (this.buttonRed) this.scene.remove(this.buttonRed);

        } else {
            if (this.monitor) this.scene.remove(this.monitor);
            if (this.buttonGreen) this.scene.remove(this.buttonGreen);
            if (this.buttonRed) this.scene.add(this.buttonRed)
        }
        this.stats.update();
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    };
    public removeHand = (): void => {
        if (this.handGroup) {
            this.handGroup.children.forEach((line) => {
                if (line instanceof THREE.Line) {
                    line.geometry.dispose();
                    if (Array.isArray(line.material)) {
                        line.material.forEach((material) => material.dispose());
                    } else {
                        line.material.dispose();
                    }
                }
            });
            this.scene.remove(this.handGroup);
            this.handGroup = null;
        }
    }

    public addHand = (handData: HandData): void => {
        this.removeHand();
        if (handData.right == null) return
        this.handGroup = new THREE.Group();

        const dHandData = handData.right.map(point => {
            return {
                x: -(point.x - 0.5), // Invert X
                y: -(point.y - 1), // Invert Y
                z: point.z
            }
        })

        const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x0ffff0 }); // Red spheres
        // Create spheres at each joint
        dHandData.forEach((point) => {
            const sphereGeometry = new THREE.SphereGeometry(0.01, 16, 16); // Adjust size as needed
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.position.set(point.x, point.y, point.z);
            this.handGroup!.add(sphere);
        });


        this.handConnector.forEach((item) => {
            const points = item.map(
                (point) =>
                    new THREE.Vector3(
                        dHandData[point].x,
                        dHandData[point].y,
                        dHandData[point].z,
                    )
            );
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(lineGeometry, this.lineMaterial);
            this.handGroup!.add(line);
        });
        this.scene.add(this.handGroup);
        const { x, y, z } = dHandData[8]
        if (x > 0.4 && x < 0.45 && y <= 0.3 && z <= -0.04) {
            if (!this.powerChangeInProgress) {
                this.power = !this.power
                console.log("POWER :", this.power)
                this.powerChangeInProgress = true;
                
                setTimeout(() => {
                    this.powerChangeInProgress = false; // Reset the flag after 2 seconds
                }, 2000);
            }
            
        }
        // console.table(dHandData[8])
    }

    public cleanup(): void {
        this.renderer.dispose();
        this.lineMaterial.dispose();
        this.handGeometry?.dispose();

        if (this.motherBoadrModel) {
            this.scene.remove(this.motherBoadrModel);
        }

        this.stats.dom.remove();
        this.controls.dispose();
    }
}

export default ThreeBox;
export type { Point, HandData };
