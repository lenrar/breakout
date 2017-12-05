import {
  Object3D,
  BoxBufferGeometry,
  MeshStandardMaterial,
  Mesh
} from 'three'

export default class Cube extends Object3D {
  constructor() {
    super()

    const geometry = new BoxBufferGeometry(0.5, 0.5, 0.5, 0.5)
    const material = new MeshStandardMaterial({
      color: 0x515151
    })
    const mesh = new Mesh(geometry, material)

    this.add(mesh)
  }
}