import './style.css'

import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module'

import { createModule } from "./public/mazes.js"

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
const gridHelper = new THREE.GridHelper(5000, 100); 
const axesHelper = new THREE.AxesHelper(5000);
pointLight.position.set(0, 0, 0);
axesHelper.setColors(new THREE.Color(0xff0000), new THREE.Color(0x00ff00), new THREE.Color(0x0000ff))

const WALL_SIZE = 1

const wall_geometry = new THREE.BoxBufferGeometry(WALL_SIZE, WALL_SIZE, WALL_SIZE);
const wall_material = new THREE.MeshBasicMaterial({
  color: 0x333333,
  opacity: 0.1,
  transparent: true,
  blending: THREE.CustomBlending,
  blendEquation: THREE.AddEquation,
  blendSrc: THREE.SrcAlphaFactor,
  blendDst: THREE.OneMinusSrcAlphaFactor,
  depthWrite: false,
  reflectivity: 0.0,
  side: THREE.FrontSide
});

const sols_geometry = new THREE.BoxBufferGeometry(WALL_SIZE, WALL_SIZE, WALL_SIZE);
const sols_material = new THREE.MeshBasicMaterial({
  color: 0xD82929,
  opacity: 1,
  transparent: true,
  blending: THREE.CustomBlending,
  blendEquation: THREE.AddEquation,
  blendSrc: THREE.SrcAlphaFactor,
  blendDst: THREE.OneMinusSrcAlphaFactor,
  depthWrite: false,
  reflectivity: 0.0,
  side: THREE.FrontSide
});


var allMeshes = []

function addMazeWalls(dims, maze_vec) { 
  const x_with = (dims[0] *2 +1)
  const y_width = dims[1] * 2 + 1
  var mesh = new THREE.InstancedMesh( wall_geometry, wall_material, (dims[0] * 2 + 1) * (dims[1] * 2 + 1));

  allMeshes.push(mesh)
  scene.add( mesh );

  var dummy = new THREE.Object3D();

  for (var i = 0; i < 2 * dims[0] + 1; i++) {
    addCube(mesh, dummy, [i * WALL_SIZE, 0, 0], i)
  }

  for (var j = 0; j < 2 * dims[1] + 1; j++) {
    addCube(mesh, dummy, [0, 0, j*WALL_SIZE], j * (dims[0] * 2 + 1))
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
        addCube(mesh, dummy, [(x+1)*WALL_SIZE, 0, y*WALL_SIZE], y * x_with + (x + 1))
      }
      //1, 0 = down wall s.getWallSide(0)
      if (s.getWallSide(1)) {
        addCube(mesh, dummy, [x*WALL_SIZE, 0, (y+1)*WALL_SIZE], (y+1) * x_with + x)
      }

      //1, 1 always has cube
      addCube(mesh, dummy, [(x + 1)*WALL_SIZE, 0, (y + 1)*WALL_SIZE], (y+1) * x_with + (x + 1))
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

  addCube(mesh, vec, [curr_x * WALL_SIZE, 0, curr_y * WALL_SIZE], solution.size() * 2)

  for (let i = 0; i < solution.size(); ++i) {
    let dir = solution.get(i);
    let index = i * 2
    if (dir == 0) {
      curr_x++;
      addCube(mesh, vec, [curr_x * WALL_SIZE, 0, curr_y * WALL_SIZE], index)
      
      curr_x++;
      addCube(mesh, vec, [curr_x * WALL_SIZE, 0, curr_y * WALL_SIZE], index + 1)

    } else if (dir == 1) {
      curr_x--
      addCube(mesh, vec, [curr_x * WALL_SIZE, 0, curr_y * WALL_SIZE], index)
      
      curr_x--;
      addCube(mesh, vec, [curr_x * WALL_SIZE, 0, curr_y * WALL_SIZE], index + 1)

    } else if (dir == 2) {
      curr_y++;
      addCube(mesh, vec, [curr_x * WALL_SIZE, 0, curr_y * WALL_SIZE], index)
      
      curr_y++;
      addCube(mesh, vec, [curr_x * WALL_SIZE, 0, curr_y * WALL_SIZE], index + 1)

    } else if (dir == 3) {
      curr_y--;
      addCube(mesh, vec, [curr_x * WALL_SIZE, 0, curr_y * WALL_SIZE], index)
      
      curr_y--;
      addCube(mesh, vec, [curr_x * WALL_SIZE, 0, curr_y * WALL_SIZE], index + 1)

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
  showAxisHelper: false,
  showGridHelper: false,
  fancyGraphics: false,
  showMazeWalls: true,
  mazeWallOpacity: 0.1,
  showMazeSolution: true,
  mazeSolutionOpacity: 1,
  numDimensions: 2,
  generateNewMaze: generateNewMaze,
  updateCameraPositionOnNewGenerate: true
}

let dimParams = {
  dim1: 20,
  dim2: 20
}

let h;
let dimController;


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
  // gui.add( params, 'fancyGraphics').name("Fancy Graphics (2d Graphics Limit)").onChange( value => {
  //   if (value) {
  //     const prev = dimParams
  //     dimParams = {
  //       dim1: prev.dim1,
  //       dim2: prev.dim2
  //     }
  //     dimController.setValue(2)
  //     dimController.min(2)
  //     dimController.max(2)
  //   } else {
  //     dimController.min(2)
  //     dimController.max(12)
  //   }
  // }).updateDisplay()
  gui.add( params, 'showAxisHelper').onChange ( shouldShow => {
    if(shouldShow) {
      scene.add( axesHelper );
    } else {
      scene.remove(axesHelper);
    }
  })
  gui.add( params, 'showGridHelper').onChange( shouldShow => {
    shouldShow ? scene.add(gridHelper) : scene.remove(gridHelper)
  })
  gui.add( params, 'showMazeWalls' ).onChange( showWalls => {
    if (showWalls) {
      wall_material.opacity = params.mazeWallOpacity
    } else {
      wall_material.opacity = 0.0
    }
  }).updateDisplay()
  gui.add( params, 'showMazeSolution' ).onChange( showSols => {
    if (showSols) {
      sols_material.opacity = params.mazeSolutionOpacity
    } else {
      sols_material.opacity = 0.0
    }
  }).updateDisplay();
  gui.add( params, 'mazeWallOpacity', 0.0, 1.0, 0.01 ).onChange( value => {
    wall_material.opacity = value
  })
  gui.add( params, 'mazeSolutionOpacity', 0.0, 1.0, 0.01 ).onChange( value => {
    sols_material.opacity = value
  });
  dimController = gui.add( params, 'numDimensions', 2, 12, 1).onChange(/*TODO UPDATE dimPARAMS*/);
  gui.add( params, 'generateNewMaze');
  gui.add( params, 'updateCameraPositionOnNewGenerate')

  h = gui.addFolder( "Dimension Sizes" );

  h.add( dimParams, "dim1", 2, 400, 1 ).name( "Dim1" )
  h.add( dimParams, "dim2", 2, 400, 1 ).name( "Dim2" )
  gui.open();
}

function generateNewMaze() {
  clean()
  createModule().then(({SquareMaze, Int1dVec}) => {
    // Hardcoded input values
    var dims = []
    Object.entries(dimParams).forEach(([k,v]) => {
      dims.push(v)
  })
  
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
  if (params.updateCameraPositionOnNewGenerate) {
    controls.target.set(dimParams.dim1, 0, dimParams.dim2);
    camera.position.set(dimParams.dim1, (dimParams.dim2 + dimParams.dim1), dimParams.dim2);
    controls.update();
  }
}

function clean() {
  console.time("RenderCleanUp")
  allMeshes.forEach( mesh => {
    scene.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.dispose();
    mesh.dispose();
  })
  allMeshes = []
  console.timeEnd("RenderCleanUp")
}
