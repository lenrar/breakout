import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  SpotLight,
  AmbientLight,
  Vector3,
  Matrix4,
  Group,
  PCFSoftShadowMap,
  LightShadow
} from 'three'
import loop from 'raf-loop'
import WAGNER from '@superguigui/wagner'
import BloomPass from '@superguigui/wagner/src/passes/bloom/MultiPassBloomPass'
import FXAAPass from '@superguigui/wagner/src/passes/fxaa/FXAAPass'
import resize from 'brindille-resize'
import Torus from './objects/Torus'
import Cube from './objects/Cube'
import Sphere from './objects/Sphere'
import Plane from './objects/Plane'
import OrbitControls from './controls/OrbitControls'
import {
  gui
} from './utils/debug'

/* Custom settings */
const SETTINGS = {
  player: true,
  ball: true,
  background: true,
  bricks: true,
  walls: true
}

/* Constants */
const ROWS = 4
const COLUMNS = 6

/* Init renderer and canvas */
const container = document.body
const renderer = new WebGLRenderer({
  antialias: true
})
renderer.setClearColor(0x323232)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = PCFSoftShadowMap
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
const ambLight = new AmbientLight(0x444444)
scene.add(ambLight)

const frontLight = new SpotLight(0xffffff)
frontLight.position.set( 0, 1500, 1000 );
frontLight.target.position.set( 0, 0, 0 );
frontLight.castShadow = true
frontLight.shadow.mapSize.width = 1024
frontLight.shadow.mapSize.height = 1024
frontLight.shadow.camera.near = 500;
frontLight.shadow.camera.far = 4000;
frontLight.shadow.camera.fov = 30;
scene.add(frontLight)

/* Actual content of the scene */

// Background for Field
const background = new Plane()
background.receiveShadow = true;

// Bounding walls
const walls = new Group()
const leftWall = new Cube()
const rightWall = new Cube()
const upWall = new Cube()
const downWall = new Cube()

leftWall.applyMatrix(new Matrix4().makeScale(1, 20, 1))
leftWall.position.set(-8, 0, 0)
leftWall.children[0].material.color.set(0xff4c81)
leftWall.castShadow = true

rightWall.applyMatrix(new Matrix4().makeScale(1, 20, 1))
rightWall.position.set(8, 0, 0)
rightWall.children[0].material.color.set(0xff4c81)
rightWall.castShadow = true

upWall.applyMatrix(new Matrix4().makeScale(40, 1, 1))
upWall.position.set(0, 4.5, 0)
upWall.children[0].material.color.set(0xff4c81)
upWall.castShadow = true

downWall.applyMatrix(new Matrix4().makeScale(40, 2, 1))
downWall.position.set(0, -4.1, 0)
downWall.children[0].material.color.set(0xff4c81)
downWall.castShadow = true

walls.add(leftWall)
walls.add(rightWall)
walls.add(upWall)
walls.add(downWall)


// Player paddle
const player = new Cube()
const playerMat = new Matrix4()
playerMat.makeScale(4, 1, 1);
player.applyMatrix(playerMat);
player.position.y = -3
player.castShadow = true;

// Bricks
const bricks = new Group()
for (var i = 0; i < ROWS * COLUMNS; i++) {
  bricks.add(new Cube())
}
bricks.children.map((currElement, index) => {
  currElement.applyMatrix(playerMat);
  currElement.position.y -= Math.floor(index / COLUMNS) * 0.8
  currElement.position.x += index % COLUMNS * 2.5
})
bricks.position.x -= 6.25
bricks.position.y += 3.5
bricks.castShadow = true;

// Model for ball to play
const ball = new Sphere()
ball.castShadow = true;


//Make Ammo Models
const ammoMat = new Matrix4()
ammoMat.makeScale(0.5, 0.5, 0.5)
const ammo = new Group()
ammo.add(new Sphere())
ammo.add(new Sphere())
ammo.add(new Sphere())
ammo.children.map((currElement, index) => {
  currElement.applyMatrix(ammoMat);
  currElement.position.x += index * 0.2
})
ammo.position.x = -6
ammo.position.y = -3.8
ammo.position.z = 1
ammo.castShadow = true;


background.position.z = -0.15

scene.add(player)
scene.add(ball)
scene.add(background)
scene.add(bricks)
scene.add(ammo)
scene.add(walls)



/* Various event listeners */
resize.addListener(onResize)

/* create and launch main loop */
const engine = loop(render)
engine.start()

/* some stuff with gui */
gui.add(SETTINGS, 'player')
gui.add(SETTINGS, 'ball')
gui.add(SETTINGS, 'bricks')
gui.add(SETTINGS, 'background')
gui.add(SETTINGS, 'walls')

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
  player.visible = false
  ball.visible = false
  bricks.visible = false
  background.visible = false
  walls.visible = false


  if (SETTINGS.player) {
    player.visible = true
  }

  if (SETTINGS.ball) {
    ball.visible = true
  }

  if (SETTINGS.bricks) {
    bricks.visible = true
  }

  if (SETTINGS.background) {
    background.visible = true
  }

  if (SETTINGS.walls) {
    walls.visible = true
  }

  renderer.render(scene, camera)

}