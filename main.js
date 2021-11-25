import './style.css'

import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls'
import Stats from 'three/examples/jsm/libs/stats.module'

// import "./mazes"
import { createModule } from "./mazes"
// let MAZE = require('./mazes')

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
  opacity: 0.3,
  transparent: false,
  blendEquation: THREE.SubtractEquation,
  blendSrc: THREE.SrcColorFactor,
  blendDst: THREE.OneFactor
});


let size = 15;

var allMeshes = new THREE.Group();

function testAdd() {
  var mesh = new THREE.InstancedMesh( geometry, material, size * size * size );
  allMeshes.add(mesh)
  scene.add( mesh );

  var dummy = new THREE.Object3D();
  //max per mesh: 268435456
  for (var i = 0; i < size; i++) {
    for (var j = 0; j < size; j++) {
      for (var k = 0; k < size; k ++) {
        dummy.position.x = i*1.2;
        dummy.position.y = j*1.2;
        dummy.position.z = k*1.2;
        dummy.updateMatrix();
      
        mesh.setMatrixAt( size * size * i + j*size +k, dummy.matrix );
        // console.log(dummy.matrix);

      }
    }
  }
  // mesh.updateMatrix()
  // mesh.updateMatrixWorld()
  // mesh.updateWorldMatrix()
}
// testAdd()
// for (var i = 0; i < 2 * 15 + 1; i++) {
//   dummy.position.x = i*1.2;
//   dummy.position.y = 0
//   dummy.position.z = 0
//   dummy.updateMatrix();
//   mesh.setMatrixAt( size * i, dummy.matrix );
//   // console.log(dummy.matrix);
//   // console.log(size*i)
// }
// console.log(mesh);

function addMazeWalls(dims, maze_vec) { 
  const x_with = (dims[0] *2 +1)
  const y_width = dims[1] * 2 + 1
  var mesh = new THREE.InstancedMesh( geometry, material, (dims[0] * 2 + 1) * (dims[1] * 2 + 1));

  allMeshes.add(mesh)
  scene.add( mesh );

  var dummy = new THREE.Object3D();
  // for (let i = 0; i < maze_vec.size(); i++) {
  //   console.log(maze_vec.get(i).getWallSide(0))
  //   console.log(maze_vec.get(i).getWallSide(1))
  //   console.log()
  // }

  for (var i = 0; i < 2 * dims[0] + 1; i++) {
    dummy.position.x = i*1.2;
    dummy.position.y = 0
    dummy.position.z = 0
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix );
  }

  for (var j = 0; j < 2 * dims[1] + 1; j++) {
    dummy.position.z = j*1.2;
    dummy.position.x = 0
    dummy.position.y = 0
    dummy.updateMatrix();
    mesh.setMatrixAt(j * (dims[0] * 2 + 1), dummy.matrix );
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
        dummy.position.x = (x+1)*1.2;
        dummy.position.y = 0;
        dummy.position.z = y*1.2;
        dummy.updateMatrix();
    
        mesh.setMatrixAt(y * x_with + (x + 1), dummy.matrix);
      }
      //1, 0 = down wall s.getWallSide(0)
      if (s.getWallSide(1)) {
        dummy.position.x = x*1.2;
        dummy.position.y = 0;
        dummy.position.z = (y+1)*1.2;
        dummy.updateMatrix();
    
        mesh.setMatrixAt((y+1) * x_with + x, dummy.matrix );
      }

      //1, 1 always has cube
      dummy.position.x = (x + 1)*1.2;
      dummy.position.y = 0;
      dummy.position.z = (y + 1)*1.2;
      dummy.updateMatrix();
    
      mesh.setMatrixAt((y+1) * x_with + (x + 1), dummy.matrix );
    }
  }
}

createModule().then(({SquareMaze, Int1dVec}) => {
  // Hardcoded input values
  var dims = [200, 200]


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
  console.timeEnd("MazeRender")

  vec.delete();
  test.delete();
  sols.delete();
  squares.delete();
});

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

animate();

function animate() {

	requestAnimationFrame( animate );

	// required if controls.enableDamping or controls.autoRotate are set to true
	controls.update();
  stats.update();
	renderer.render( scene, camera );
}
