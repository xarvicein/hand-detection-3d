import * as THREE from "three";
// @ts-expect-error OrbitControls doeas exist
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

interface Point {
    x: number;
    y: number;
    z: number;
    visibility: number;
}

interface HandData {
    right: { landmarks: Point[] } | null;
}

class ThreeBox {
    private scene: THREE.Scene;
    private light: THREE.DirectionalLight;
    private grid: THREE.GridHelper;
    private camera: THREE.PerspectiveCamera;
    private container: HTMLDivElement;
    private renderer: THREE.WebGLRenderer;
    private controls: OrbitControls;
    private lineMaterial: THREE.LineBasicMaterial;
    private handGroup: THREE.Group | null;
    private handConnector = [
        [0, 1, 2, 3, 4],
        [0, 5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16],
        [5, 9, 13, 17],
        [0, 17, 18, 19, 20],
    ];

    constructor(canvas: HTMLCanvasElement, container: HTMLDivElement) {
        this.container = container
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x999999);
        this.lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff }); // Blue lines
        this.handGroup = null;
        this.light = new THREE.DirectionalLight(0xffffff, 1);
        this.light.position.set(0.5, 1.0, 0.5).normalize();
        this.grid = new THREE.GridHelper(10, 100, 0xffffff, 0x7b7b7b);
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            1000
        );
        // this.camera.rotation.x = Math.PI;
        this.camera.rotation.y = Math.PI;
        this.camera.position.set(0, 1, 1);
        this.renderer = new THREE.WebGLRenderer({ canvas: canvas });
        this.renderer.setSize(
            this.container.clientWidth,
            this.container.clientHeight
        );

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        window.addEventListener("resize", this.handleResize);

        this.scene.add(this.light);
        this.scene.add(this.camera);
        this.scene.add(this.grid);

    }
    private handleResize = (): void => {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(
            this.container.clientWidth,
            this.container.clientHeight
        );
    };

    public setCameraPosition = (x: number, y: number, z: number): void => {
        this.camera.position.set(x, y, z)
    }

    public animate = (): void => {
        this.scene.add(this.grid)
        this.scene.add(this.light)

        requestAnimationFrame(this.animate);
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    public removeHand = (): void => {
        if (this.handGroup) {
            this.scene.remove(this.handGroup);
            this.handGroup = null;
        }
    }

    public addHand = (handData: HandData): void => {
        // this.scene.clear()


        if (this.handGroup) {
            this.scene.remove(this.handGroup);
            this.handGroup = null;
        }
        this.handGroup = new THREE.Group();
        this.handConnector.forEach((item) => {
            const points = item.map(
                (point) =>
                    new THREE.Vector3(
                        -(handData.right!.landmarks[point].x - 0.5), // Invert X
                        -(handData.right!.landmarks[point].y - 1), // Invert Y
                        handData.right!.landmarks[point].z // Z remains the same
                    )
            );
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(lineGeometry, this.lineMaterial);
            this.handGroup!.add(line);
        });
        this.scene.add(this.handGroup);
    }

    public cleanup = (): void => {
        window.removeEventListener("resize", this.handleResize);
        this.renderer.dispose();
        this.lineMaterial.dispose();
    }

}

export default ThreeBox;
export type {Point, HandData}