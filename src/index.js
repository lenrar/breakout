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
  Box3,
  CameraHelper,
  SpotLightHelper,
  FontLoader
} from 'three'
import loop from 'raf-loop'
import resize from 'brindille-resize'
import Torus from './objects/Torus'
import Cube from './objects/Cube'
import Sphere from './objects/Sphere'
import Plane from './objects/Plane'
import Text from './objects/Text'
import OrbitControls from './controls/OrbitControls'
// import {
//   gui
// } from './utils/debug'

/* Custom settings */
const SETTINGS = {
  player: true,
  ball: true,
  background: true,
  bricks: true,
  walls: true,
  ammo: true
}

/* some stuff with gui */
// gui.add(SETTINGS, 'player')
// gui.add(SETTINGS, 'ball')
// gui.add(SETTINGS, 'bricks')
// gui.add(SETTINGS, 'background')
// gui.add(SETTINGS, 'walls')
// gui.add(SETTINGS, 'ammo')

/* Constants */
const ROWS = 4
const COLUMNS = 6
const INITAMMO = 3
const PADDLESPEED = 0.04
const BALLSPEED = 0.04
const AR = 16 / 9 // Fixed so that it scales
var ballVelocity = new Vector3(0, 0, 0)
var playerVelocity = new Vector3(0, 0, 0)
var ammoCount = INITAMMO
var score = 0

/* Init renderer and canvas */
const container = document.body
const renderer = new WebGLRenderer({
  antialias: true
})
renderer.setClearColor(0x3DCCA2)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = PCFSoftShadowMap
container.style.overflow = 'hidden'
container.style.margin = 0
container.appendChild(renderer.domElement)

/* Main scene and camera */
const scene = new Scene()
const camera = new PerspectiveCamera(50, AR, 0.1, 1000)
const controls = new OrbitControls(camera, {
  element: renderer.domElement,
  distance: 10,
  phi: Math.PI * 0.5
})

const cameraHelper = new CameraHelper(camera)

/* Lights */
const amb = new AmbientLight(0x444444)
scene.add(amb)

const light = new SpotLight(0xffffff)
scene.add(light)
light.position.set(20, 50, 40)
light.castShadow = false
light.shadow.mapSize.width = 1024
light.shadow.mapSize.height = 1024
light.shadow.camera.near = 1
light.shadow.camera.far = 4000
light.shadow.camera.fov = 20


/* Actual content of the scene */

// Background for Field
const background = new Plane()
background.children[0].receiveShadow = true;
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
leftWall.children[0].receiveShadow = true
leftWall.castShadow = true
leftWall.name = 'left'

rightWall.applyMatrix(new Matrix4().makeScale(4, 20, 1))
rightWall.position.set(9, 0, 0)
rightWall.children[0].material.color.set(0xff4c81)
rightWall.children[0].receiveShadow = true
rightWall.castShadow = true
rightWall.name = 'right'

upWall.applyMatrix(new Matrix4().makeScale(40, 1.5, 1))
upWall.position.set(0, 4.7, 0)
upWall.children[0].material.color.set(0xff4c81)
upWall.children[0].receiveShadow = true
upWall.castShadow = true
upWall.name = 'up'

downWall.applyMatrix(new Matrix4().makeScale(40, 3, 1))
downWall.position.set(0, -4.5, 0)
downWall.children[0].material.color.set(0xff4c81)
downWall.children[0].receiveShadow = true
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
player.children[0].castShadow = true;

// Bricks
const bricks = new Group()
for (var i = 0; i < ROWS * COLUMNS; i++) {
  var brick = new Cube()
  brick.children[0].castShadow = true
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
bricks.castShadow = true

// Model for ball to play
const ball = new Sphere()
ball.position.x = -2.5
ball.castShadow = true


//Make Ammo Models
const ammoMat = new Matrix4()
ammoMat.makeScale(0.5, 0.5, 0.5)
const ammo = new Group()
for (var i = 0; i < ammoCount; i++) {
  var shot = new Sphere()
  shot.children[0].castShadow = true
  shot.name = i
  ammo.add(shot)
}
ammo.children.map((currElement, index) => {
  currElement.applyMatrix(ammoMat);
  currElement.position.x += index * 0.2
})
ammo.position.x = -6
ammo.position.y = -3.8
ammo.position.z = 1
ammo.castShadow = true;

//Text

var scoreText
updateScore()

scene.add(player)
scene.add(ball)
scene.add(background)
scene.add(bricks)
scene.add(ammo)
scene.add(walls)
scene.add(scoreText)

/* Various event listeners */
resize.addListener(onResize)
document.addEventListener('keydown', onKeyDown)
document.addEventListener('keyup', onKeyUp)


/* create and launch main loop */
const engine = loop(render)
engine.start()

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
  camera.aspect = AR
  camera.updateProjectionMatrix()
  renderer.setSize(resize.width, resize.height)
}

function onKeyUp() {
  if (playerVelocity.x < 0 && (event.keyCode == 65 || event.keyCode == 37)) {
    playerVelocity.x = 0
  }

  if (playerVelocity.x > 0 && (event.keyCode == 68 || event.keyCode == 39)) {
    playerVelocity.x = 0
  }
}

function onKeyDown() {

  //A = 65, D = 68, <- = 37, -> = 39
  if (event.keyCode == 65 || event.keyCode == 37) {
    playerVelocity.x = -PADDLESPEED
  }

  if (event.keyCode == 68 || event.keyCode == 39) {
    playerVelocity.x = PADDLESPEED
  }

  // Space = 32 
  if (event.keyCode == 32 && ballVelocity.length() == 0) {
    ballVelocity.y = -1
    ballVelocity.x = 1
    ballVelocity.setLength(BALLSPEED)
  }
}

// When no more bricks remain
function nextLevel() {
  player.position.x = 0
  ball.position.x = -2.5
  ball.position.y = 0

  // RESET BRICKS
  for (var i = bricks.children.length - 1; i >= 0; i--) {
    bricks.remove(bricks.children[i])
  }
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

  ballVelocity.setLength(0)
  playerVelocity.setLength(0)
}

// When you lose all three balls
function hardReset() {

  // RESET AMMO
  ammoCount = INITAMMO
  for (var i = 0; i < ammoCount; i++) {
    var shot = new Sphere()
    shot.name = i
    ammo.add(shot)
  }
  ammo.children.map((currElement, index) => {
    currElement.applyMatrix(ammoMat);
    currElement.position.x += index * 0.2
  })

  // RESET BRICKS
  for (var i = bricks.children.length - 1; i >= 0; i--) {
    bricks.remove(bricks.children[i])
  }
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

  score = 0
  console.log('score: ' + score)
  updateScore()
}

function updateScore() {
  scene.remove(scoreText)
  scoreText = new Text(score)
  scoreText.position.set(6, -4.4, 0)
  scene.add(scoreText)
}

// When you lose one ball
function reset() {
  player.position.x = 0
  ball.position.x = -2.5
  ball.position.y = 0
  ammoCount -= 1
  ammo.remove(ammo.getObjectByName(ammoCount))
  if (ammoCount == 0) {
    hardReset()
  }
  ballVelocity.setLength(0)
  playerVelocity.setLength(0)
}

/**
  Render loop
*/
function render(dt) {

  if(bricks.children.length == 0){
    nextLevel()
  }

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
      score++
      console.log('score: ' + score)
      updateScore()
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

  if (!playerBox.intersectsBox(rightBox) && playerVelocity.x > 0) {
    player.translateX(playerVelocity.x)
  }

  if (!playerBox.intersectsBox(leftBox) && playerVelocity.x < 0) {
    player.translateX(playerVelocity.x)
  }

  controls.update()
  player.visible = false
  ball.visible = false
  bricks.visible = false
  background.visible = false
  walls.visible = false
  ammo.visible = false


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

  if (SETTINGS.ammo) {
    ammo.visible = true
  }

  renderer.render(scene, camera)

}