import './style.css'

import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module'

import { createModule } from "./mazes"

const stats = Stats()
document.body.appendChild(stats.dom)

window.addEventListener('resize', onWindowResize, false);

const renderer = new THREE.WebGLRenderer( {
  canvas: document.querySelector('#bg'),
  powerPreference: "high-performance",
  precision: "highp"
} )

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 4 * 1000);
const controls = new OrbitControls( camera, renderer.domElement );
scene.background = new THREE.Color('white');

controls.target.set(25, 0, 25);
camera.position.set( 0, 20, 100 );
controls.update();


const pointLight = new THREE.PointLight(0xffffff);
const lightHelper = new THREE.PointLightHelper(pointLight);
const gridHelper = new THREE.GridHelper(500, 50); 
const axesHelper = new THREE.AxesHelper(5000);
pointLight.position.set(0, 0, 0);
axesHelper.setColors(new THREE.Color(0xff0000), new THREE.Color(0x00ff00), new THREE.Color(0x0000ff))
scene.add( axesHelper );
scene.add(lightHelper, gridHelper);

const geometry = new THREE.BoxBufferGeometry(1.2, 1.2, 1.2);
const material = new THREE.MeshBasicMaterial({
  color: 0x333333,
  opacity: 0.1,
  transparent: true,
});

const sols_geometry = new THREE.BoxBufferGeometry(1.2, 1.2, 1.2);
const sols_material = new THREE.MeshBasicMaterial({
  color: 0xD82929,
  opacity: 0.3,
  transparent: false,
  blendEquation: THREE.AdditiveBlending,
});


var allMeshes = []

function addMazeWalls(dims, maze_vec) { 
  const x_with = (dims[0] *2 +1)
  const y_width = dims[1] * 2 + 1
  var mesh = new THREE.InstancedMesh( geometry, material, (dims[0] * 2 + 1) * (dims[1] * 2 + 1));

  allMeshes.push(mesh)
  scene.add( mesh );

  var dummy = new THREE.Object3D();

  for (var i = 0; i < 2 * dims[0] + 1; i++) {
    addCube(mesh, dummy, [i * 1.2, 0, 0], i)
  }

  for (var j = 0; j < 2 * dims[1] + 1; j++) {
    addCube(mesh, dummy, [0, 0, j*1.2], j * (dims[0] * 2 + 1))
  }

  for (var j = 0; j < dims[1]; j++) {
    for (var i = 0; i < dims[0]; i++) {
      // console.log(maze_vec.size())
      var loc = dims[0] * j + i;
      var s = maze_vec.get(loc)
      let k = 0
      //0, 0 always empty
      var x = 2 * i + 1
      var y = 2 * j + 1
      //0, 1 = right wall s.getWallSide(1)
      if (s.getWallSide(0)) {
        addCube(mesh, dummy, [(x+1)*1.2, 0, y*1.2], y * x_with + (x + 1))
      }
      //1, 0 = down wall s.getWallSide(0)
      if (s.getWallSide(1)) {
        addCube(mesh, dummy, [x*1.2, 0, (y+1)*1.2], (y+1) * x_with + x)
      }

      //1, 1 always has cube
      addCube(mesh, dummy, [(x + 1)*1.2, 0, (y + 1)*1.2], (y+1) * x_with + (x + 1))
    }
  }
}

function addMazeSolution(dims, solution) {
  const x_with = (dims[0] *2 +1)
  const y_width = dims[1] * 2 + 1
  var mesh = new THREE.InstancedMesh( sols_geometry, sols_material, (solution.size()*2) + 1);

  allMeshes.push( mesh )
  scene.add( mesh );
  var curr_x = 1;
  var curr_y = 1;
  var vec = new THREE.Object3D();

  addCube(mesh, vec, [curr_x * 1.2, 0, curr_y * 1.2], solution.size() * 2)

  for (let i = 0; i < solution.size(); ++i) {
    let dir = solution.get(i);
    let index = i * 2
    if (dir == 0) {
      curr_x++;
      addCube(mesh, vec, [curr_x * 1.2, 0, curr_y * 1.2], index)
      
      curr_x++;
      addCube(mesh, vec, [curr_x * 1.2, 0, curr_y * 1.2], index + 1)

    } else if (dir == 1) {
      curr_x--
      addCube(mesh, vec, [curr_x * 1.2, 0, curr_y * 1.2], index)
      
      curr_x--;
      addCube(mesh, vec, [curr_x * 1.2, 0, curr_y * 1.2], index + 1)

    } else if (dir == 2) {
      curr_y++;
      addCube(mesh, vec, [curr_x * 1.2, 0, curr_y * 1.2], index)
      
      curr_y++;
      addCube(mesh, vec, [curr_x * 1.2, 0, curr_y * 1.2], index + 1)

    } else if (dir == 3) {
      curr_y--;
      addCube(mesh, vec, [curr_x * 1.2, 0, curr_y * 1.2], index)
      
      curr_y--;
      addCube(mesh, vec, [curr_x * 1.2, 0, curr_y * 1.2], index + 1)

    } else {
      throw Error("Should never execute")
    }
  }
}

function addCube(mesh, vec, position, index) {
  vec.position.x = position[0] 
  vec.position.y = position[1]
  vec.position.z = position[2]

  vec.updateMatrix()
  mesh.setMatrixAt(index, vec.matrix)
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

const params = {
  fancyGraphics: false,
  showMazeWalls: true,
  mazeWallOpacity: 0.1,
  showMazeSolution: true,
  mazeSolutionOpacity: 1,
  numDimensions: 2,
  generateNewMaze: generateNewMaze,
}

generateNewMaze();
init();
animate();

function animate() {

	requestAnimationFrame( animate );

	// required if controls.enableDamping or controls.autoRotate are set to true
	controls.update();
  stats.update();
	renderer.render( scene, camera );
}

function init() {
  const gui = new GUI()
  gui.add( params, 'fancyGraphics')
  gui.add( params, 'showMazeWalls' )
  gui.add( params, 'mazeWallOpacity', 0.0, 1.0, 0.01 )
  gui.add( params, 'showMazeSolution' );
  gui.add( params, 'mazeSolutionOpacity', 0.0, 1.0, 0.01 );
  gui.add( params, 'numDimensions', 2, 12, 1);
  gui.add( params, 'generateNewMaze');
  gui.open();

}

function generateNewMaze() {
  clean()
  createModule().then(({SquareMaze, Int1dVec}) => {
    // Hardcoded input values
    var dims = [20, 20]
  
  
    console.time("MazeGen")
    const test = new SquareMaze(2);
    const vec = new Int1dVec();
    for (let i = 0; i < dims.length; ++i) {
      vec.push_back(dims[i]);
    }
    test.makeMaze(vec);
    console.timeEnd("MazeGen")
    console.time("MazeSolve")
  
  
    const sols = test.solveMaze();
    const squares = test.getMaze();
    console.timeEnd("MazeSolve")
    console.time("MazeRender")
    addMazeWalls(dims, squares);
    addMazeSolution(dims, sols);
    console.timeEnd("MazeRender")
    console.log("\n")
  
    vec.delete();
    test.delete();
    sols.delete();
    squares.delete();
  });
}

function clean() {
  allMeshes.forEach( mesh => {
    scene.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.dispose();
    mesh.dispose();
  })
  allMeshes = []
}