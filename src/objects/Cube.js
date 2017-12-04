import { Object3D, BoxBufferGeometry, MeshStandardMaterial, Mesh} from 'three'

export default class Cube extends Object3D {
  constructor () {
    super()

    const geometry = new BoxBufferGeometry(1, 1, 1, 1)
    const material = new MeshStandardMaterial({color: 0xA197C9, roughness: 0.18, metalness: 0.5})
    const mesh = new Mesh(geometry, material)

    this.add(mesh)
  }
}
