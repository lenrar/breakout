import {
    Object3D,
    PlaneBufferGeometry,
    MeshStandardMaterial,
    Mesh
} from 'three'

export default class Plane extends Object3D {
    constructor() {
        super()

        const geometry = new PlaneBufferGeometry(20, 10, 32)
        const material = new MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.6            
        })
        const mesh = new Mesh(geometry, material)

        this.add(mesh)
    }
}