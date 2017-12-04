import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  PointLight,
  AmbientLight
} from 'three'
import loop from 'raf-loop'
import WAGNER from '@superguigui/wagner'
import BloomPass from '@superguigui/wagner/src/passes/bloom/MultiPassBloomPass'
import FXAAPass from '@superguigui/wagner/src/passes/fxaa/FXAAPass'
import resize from 'brindille-resize'
import Torus from './objects/Torus'
import Cube from './objects/Cube'
import Sphere from './objects/Sphere'
import OrbitControls from './controls/OrbitControls'
import {
  gui
} from './utils/debug'

/* Custom settings */
const SETTINGS = {
  cube: true,
  sphere: false,
  torus: false
}

/* Init renderer and canvas */
const container = document.body
const renderer = new WebGLRenderer({
  antialias: true
})
renderer.setClearColor(0x323232)
container.style.overflow = 'hidden'
container.style.margin = 0
container.appendChild(renderer.domElement)

/* Composer for special effects */
const composer = new WAGNER.Composer(renderer)
const bloomPass = new BloomPass()
const fxaaPass = new FXAAPass()

/* Main scene and camera */
const scene = new Scene()
const camera = new PerspectiveCamera(50, resize.width / resize.height, 0.1, 1000)
const controls = new OrbitControls(camera, {
  element: renderer.domElement,
  distance: 10,
  phi: Math.PI * 0.5
})

/* Lights */
const frontLight = new PointLight(0xFFFFFF, 1)
const backLight = new PointLight(0xFFFFFF, 0.5)
const ambLight = new AmbientLight(0x404040)
scene.add(frontLight)
scene.add(backLight)
scene.add(ambLight)
frontLight.position.z = 20
backLight.position.z = -20

/* Actual content of the scene */
const torus = new Torus()
const cube = new Cube()
const sphere = new Sphere()
scene.add(sphere)

/* Various event listeners */
resize.addListener(onResize)

/* create and launch main loop */
const engine = loop(render)
engine.start()

/* some stuff with gui */
gui.add(SETTINGS, 'cube')
gui.add(SETTINGS, 'sphere')
gui.add(SETTINGS, 'torus')

/* -------------------------------------------------------------------------------- */

/**
  Resize canvas
*/
function onResize() {
  camera.aspect = resize.width / resize.height
  camera.updateProjectionMatrix()
  renderer.setSize(resize.width, resize.height)
  composer.setSize(resize.width, resize.height)
}

/**
  Render loop
*/
function render(dt) {

  controls.update()
  scene.children.map(T => {
    if (T === cube || T === sphere || T === torus)
      scene.remove(T)
  })

  if (SETTINGS.cube) {
    scene.add(cube)
  }

  if (SETTINGS.sphere) {
    scene.add(sphere)
  }

  if (SETTINGS.torus) {
    scene.add(torus)
  }

  scene.children.map(T => {
    T.rotation.x += 0.01
    T.rotation.y += 0.01
  })
  renderer.render(scene, camera)

}