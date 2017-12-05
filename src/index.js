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
  LightShadow,
  Box3
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
const PADDLESPEED = 0.5
const BALLSPEED = 0.04
var ballVelocity = new Vector3(0, 0, 0)

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
frontLight.position.set(0, 1500, 1000);
frontLight.target.position.set(0, 0, 0);
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
background.position.z = -0.15

// Bounding walls
const walls = new Group()
const leftWall = new Cube()
const rightWall = new Cube()
const upWall = new Cube()
const downWall = new Cube()

leftWall.applyMatrix(new Matrix4().makeScale(4, 20, 1))
leftWall.position.set(-9, 0, 0)
leftWall.children[0].material.color.set(0xff4c81)
leftWall.castShadow = true
leftWall.name = 'left'

rightWall.applyMatrix(new Matrix4().makeScale(4, 20, 1))
rightWall.position.set(9, 0, 0)
rightWall.children[0].material.color.set(0xff4c81)
rightWall.castShadow = true
rightWall.name = 'right'

upWall.applyMatrix(new Matrix4().makeScale(40, 1.5, 1))
upWall.position.set(0, 4.7, 0)
upWall.children[0].material.color.set(0xff4c81)
upWall.castShadow = true
upWall.name = 'up'

downWall.applyMatrix(new Matrix4().makeScale(40, 3, 1))
downWall.position.set(0, -4.5, 0)
downWall.children[0].material.color.set(0xff4c81)
downWall.castShadow = true
downWall.name = 'down'

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
  var brick = new Cube()
  brick.name = i
  bricks.add(brick)
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
ball.position.x = -2.5
ball.castShadow = true


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



scene.add(player)
scene.add(ball)
scene.add(background)
scene.add(bricks)
scene.add(ammo)
scene.add(walls)



/* Various event listeners */
resize.addListener(onResize)
document.addEventListener('keydown', onKeyDown)

/* create and launch main loop */
const engine = loop(render)
engine.start()

/* some stuff with gui */
gui.add(SETTINGS, 'player')
gui.add(SETTINGS, 'ball')
gui.add(SETTINGS, 'bricks')
gui.add(SETTINGS, 'background')
gui.add(SETTINGS, 'walls')

/* setup math for physics */
var playerBox = new Box3().setFromObject(player)
var ballBox = new Box3().setFromObject(ball)
var leftBox = new Box3().setFromObject(walls.getObjectByName('left'))
var rightBox = new Box3().setFromObject(walls.getObjectByName('right'))
var upBox = new Box3().setFromObject(walls.getObjectByName('up'))
var downBox = new Box3().setFromObject(walls.getObjectByName('down'))
var bricksBox = []
bricks.children.forEach((currElement, index) => {
  bricksBox.push(new Box3().setFromObject(currElement))
})

var playerCenter = playerBox.getCenter()
var ballCenter = ballBox.getCenter()
var brickCenter = bricksBox[0].getCenter()

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

function onKeyDown() {
  //A = 65, D = 68, <- = 37, -> = 39
  if (!playerBox.intersectsBox(leftBox) && (event.keyCode == 65 || event.keyCode == 37)) {
    player.position.x -= PADDLESPEED
  }

  if (!playerBox.intersectsBox(rightBox) && (event.keyCode == 68 || event.keyCode == 39)) {
    player.position.x += PADDLESPEED
  }

  // Space = 32 
  if (event.keyCode == 32 && ballVelocity.length() == 0) {
    ballVelocity.y = -1
    ballVelocity.x = 1
    ballVelocity.setLength(BALLSPEED)
  }
}

function reset() {
  player.position.x = 0
  ball.position.x = -2.5
  ball.position.y = 0
  ballVelocity.setLength(0)


}

/**
  Render loop
*/
function render(dt) {

  //Update Math
  playerBox = new Box3().setFromObject(player)
  ballBox = new Box3().setFromObject(ball)
  bricksBox = []
  bricks.children.forEach((currElement, index) => {
    currElement.name = index
    bricksBox.push(new Box3().setFromObject(currElement))
  })

  //Update ball velocity

  // If this collides with the paddle, then reverse y
  if (ballBox.intersectsBox(playerBox)) {
    playerCenter = playerBox.getCenter()
    ballCenter = ballBox.getCenter()
    ballVelocity = ballCenter.sub(playerCenter)
    ballVelocity.setLength(BALLSPEED)
  }

  // If it collides with any of the bricks, remove the brick and reverse y
  bricks.children.forEach((currElement, index) => {
    i = currElement.name
    if (bricksBox[i].intersectsBox(ballBox)) {
      brickCenter = bricksBox[i].getCenter()
      ballCenter = ballBox.getCenter()
      ballVelocity = ballCenter.sub(brickCenter)
      ballVelocity.setLength(BALLSPEED)
      bricks.remove(bricks.getObjectByName(i))
    }
  })

  // if it collides with a side wall, reverse x, otherwise reverse y
  if (ballBox.intersectsBox(leftBox) || ballBox.intersectsBox(rightBox)) {
    ballVelocity.x *= -1
  }

  if (ballBox.intersectsBox(upBox)) {
    ballVelocity.y *= -1
  }

  if (ballBox.intersectsBox(downBox)) {
    reset()
  }



  // If this collides with any of the bricks, remove the brick and apply opposite velocity

  //Update positions
  ball.translateX(ballVelocity.x)
  ball.translateY(ballVelocity.y)
  ball.translateZ(ballVelocity.z)

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