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
        this.motherBoadrModel = null;

        // Lighting
        this.light = new THREE.DirectionalLight(0xffffff, 1);
        this.light.position.set(0.5, 1.0, 0.5).normalize();
        this.scene.add(this.light);

        // Grid Helper
        const grid = new THREE.GridHelper(10, 100, 0xffffff, 0x7b7b7b);
        grid.position.set(0, -0.2, 0)
        this.scene.add(grid);

        // Camera Setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0.2, 1);
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
        console.log([stats])
        if (stats) {
            this.stats.dom.style.position = 'relative'
            stats.appendChild(this.stats.dom)
        } else {
            document.body.appendChild(this.stats.dom);
        }

        // Load Motherboard Model
        this.loadMotherboard();
    }

    private async loadMotherboard(): Promise<void> {
        const loader = new GLTFLoader();
        try {
            const glb = await loader.loadAsync("./models/motherboard/source/motherboard.glb");
            this.motherBoadrModel = glb.scene;
            this.motherBoadrModel.position.set(-0.2, 0.2, -0.2);
            this.motherBoadrModel.scale.set(0.002, 0.002, 0.002);
            this.motherBoadrModel.rotation.set(Math.PI / 2, 0, 0);
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
        this.handGroup = new THREE.Group();

        const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x0ffff0 }); // Red spheres
        // Create spheres at each joint
        handData.right?.forEach((point) => {
            const sphereGeometry = new THREE.SphereGeometry(0.01, 16, 16); // Adjust size as needed
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.position.set(
                -(point.x - 0.5), // Invert X
                -(point.y - 1),   // Invert Y
                point.z           // Z remains the same
            );
            this.handGroup!.add(sphere);
        });


        this.handConnector.forEach((item) => {
            const points = item.map(
                (point) =>
                    new THREE.Vector3(
                        -(handData.right![point].x - 0.5), // Invert X
                        -(handData.right![point].y - 1), // Invert Y
                        handData.right![point].z // Z remains the same
                    )
            );
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(lineGeometry, this.lineMaterial);
            this.handGroup!.add(line);
        });
        this.scene.add(this.handGroup);
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
