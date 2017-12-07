import {
    Object3D,
    TextGeometry,
    MeshStandardMaterial,
    FontLoader,
    Mesh
} from 'three'

export default class Text extends Object3D {
    constructor(text) {
        super()
        //Score Model
        var loader = new FontLoader()

        var self = this
        loader.load('/fonts/Telegrama_Raw.json', function (font) {

            var geometry = new TextGeometry(text, {
                font: font,
                size: 0.5,
                height: 0.3,
                curveSegments: 0,
            })

            const material = new MeshStandardMaterial({
                color: 0xffffff,
                roughness: 0.6
            })

            const mesh = new Mesh(geometry, material)
            self.add(mesh)
        })        
    }

}