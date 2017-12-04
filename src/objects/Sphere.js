import {
    Object3D,
    SphereBufferGeometry,
    MeshStandardMaterial,
    Mesh
} from 'three'

export default class Sphere extends Object3D {
    constructor() {
        super()

        const geometry = new SphereBufferGeometry(1, 32, 32);
        const material = new MeshStandardMaterial({
            color: 0xA197C9,
            roughness: 0.18,
            metalness: 0.5
        })
        const mesh = new Mesh(geometry, material)

        this.add(mesh)
    }
}