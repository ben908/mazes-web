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

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
  powerPreference: "high-performance",
  precision: "highp"
})

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 4 * 1000);
const controls = new OrbitControls(camera, renderer.domElement);
scene.background = new THREE.Color('white');

controls.target.set(25, 0, 25);
camera.position.set(0, 20, 100);
controls.update();


const pointLight = new THREE.PointLight(0xffffff);
const lightHelper = new THREE.PointLightHelper(pointLight);
const gridHelper = new THREE.GridHelper(5000, 100);
const axesHelper = new THREE.AxesHelper(5000);
pointLight.position.set(0, 0, 0);
axesHelper.setColors(new THREE.Color(0xff0000), new THREE.Color(0x00ff00), new THREE.Color(0x0000ff))

let WALL_SIZE = 0.75
const TOTAL_WALL_SIZE = 1

const wall_geometry = new THREE.BoxBufferGeometry(WALL_SIZE, WALL_SIZE, WALL_SIZE);
const wall_material = new THREE.MeshBasicMaterial({
  color: 0xcccccc,
  opacity: 0.6,
  transparent: false,
  blending: THREE.CustomBlending,
  blendEquation: THREE.AddEquation,
  blendSrc: THREE.SrcAlphaFactor,
  blendDst: THREE.OneMinusSrcAlphaFactor,
  depthWrite: false,
  reflectivity: 0.0,
  // side: THREE.FrontSide,
  // wireframe: true
});

const sols_geometry = new THREE.BoxBufferGeometry(WALL_SIZE, WALL_SIZE, WALL_SIZE);
const sols_material = new THREE.MeshBasicMaterial({
  color: 0xD82929,
  opacity: 1,
  transparent: false,
  blending: THREE.CustomBlending,
  blendEquation: THREE.AddEquation,
  blendSrc: THREE.SrcAlphaFactor,
  blendDst: THREE.OneMinusSrcAlphaFactor,
  depthWrite: false,
  reflectivity: 0.0,
  // side: THREE.FrontSide
});


var allMeshes = []

function addMazeWalls(dims, maze_vec) {
  const x_with = (dims[0] * 2 + 1)
  const y_width = dims[1] * 2 + 1
  var mesh = new THREE.InstancedMesh(wall_geometry, wall_material, (dims[0] * 2 + 1) * (dims[1] * 2 + 1));

  allMeshes.push(mesh)
  scene.add(mesh);

  var dummy = new THREE.Object3D();

  for (var i = 0; i < 2 * dims[0] + 1; i++) {
    addCube(mesh, dummy, [i * TOTAL_WALL_SIZE, 0, 0], i)
  }

  for (var j = 0; j < 2 * dims[1] + 1; j++) {
    addCube(mesh, dummy, [0, 0, j * TOTAL_WALL_SIZE], j * (dims[0] * 2 + 1))
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
        addCube(mesh, dummy, [(x + 1) * TOTAL_WALL_SIZE, 0, y * TOTAL_WALL_SIZE], y * x_with + (x + 1))
      }
      //1, 0 = down wall s.getWallSide(0)
      if (s.getWallSide(1)) {
        addCube(mesh, dummy, [x * TOTAL_WALL_SIZE, 0, (y + 1) * TOTAL_WALL_SIZE], (y + 1) * x_with + x)
      }

      //1, 1 always has cube
      addCube(mesh, dummy, [(x + 1) * TOTAL_WALL_SIZE, 0, (y + 1) * TOTAL_WALL_SIZE], (y + 1) * x_with + (x + 1))
    }
  }
}


function addMazeWalls3D(dims, maze) {
  const x_with = (dims[0] * 2 + 1)
  const y_width = dims[1] * 2 + 1

  var mesh = new THREE.InstancedMesh(wall_geometry, wall_material, (dims[0] * dims[1] * dims[2] * 8));

  allMeshes.push(mesh)
  scene.add(mesh);

  var dummy = new THREE.Object3D();
  const maze_vec = maze.getMaze()
  const indexToPoint = maze.getIndexToPointVector()

  for (let i = 0; i < maze_vec.size(); ++i) {
    let curSquare = maze_vec.get(i);
    let curPoint = indexToPoint.get(i);
    //0,0 always empty
    if (curSquare.getWallSide(0)) {
      addCube(mesh, dummy, [curPoint.get(0) * 2 + 1, -1 * curPoint.get(2) * 2, curPoint.get(1) * 2], 8 * i)
    }
    if (curSquare.getWallSide(1)) {
      addCube(mesh, dummy, [curPoint.get(0) * 2, -1 * curPoint.get(2) * 2, curPoint.get(1) * 2 + 1], 8 * i + 1)
    }
    if (curSquare.getWallSide(2)) {
      addCube(mesh, dummy, [curPoint.get(0) * 2, -1 * curPoint.get(2) * 2 - 1, curPoint.get(1) * 2], 8 * i + 2)
    }

    addCube(mesh, dummy, [curPoint.get(0) * 2 + 1, -1 * curPoint.get(2) * 2, curPoint.get(1) * 2 + 1], 8 * i + 3)
    addCube(mesh, dummy, [curPoint.get(0) * 2 + 1, -1 * curPoint.get(2) * 2 - 1, curPoint.get(1) * 2], 8 * i + 4)
    addCube(mesh, dummy, [curPoint.get(0) * 2 + 1, -1 * curPoint.get(2) * 2 - 1, curPoint.get(1) * 2 + 1], 8 * i + 5)
    addCube(mesh, dummy, [curPoint.get(0) * 2, -1 * curPoint.get(2) * 2 - 1, curPoint.get(1) * 2 + 1], 8 * i + 6)
  }

  maze_vec.delete()
  indexToPoint.delete()
}

function addMazeSolution(dims, solution) {
  const x_with = (dims[0] * 2 + 1)
  const y_width = dims[1] * 2 + 1
  var mesh = new THREE.InstancedMesh(sols_geometry, sols_material, (solution.size() * 2) + 1);

  allMeshes.push(mesh)
  scene.add(mesh);
  var curr_x = 1;
  var curr_y = 1;
  var vec = new THREE.Object3D();

  addCube(mesh, vec, [curr_x * TOTAL_WALL_SIZE, 0, curr_y * TOTAL_WALL_SIZE], solution.size() * 2)

  for (let i = 0; i < solution.size(); ++i) {
    let dir = solution.get(i);
    let index = i * 2
    if (dir == 0) {
      curr_x++;
      addCube(mesh, vec, [curr_x * TOTAL_WALL_SIZE, 0, curr_y * TOTAL_WALL_SIZE], index)

      curr_x++;
      addCube(mesh, vec, [curr_x * TOTAL_WALL_SIZE, 0, curr_y * TOTAL_WALL_SIZE], index + 1)

    } else if (dir == 1) {
      curr_x--
      addCube(mesh, vec, [curr_x * TOTAL_WALL_SIZE, 0, curr_y * TOTAL_WALL_SIZE], index)

      curr_x--;
      addCube(mesh, vec, [curr_x * TOTAL_WALL_SIZE, 0, curr_y * TOTAL_WALL_SIZE], index + 1)

    } else if (dir == 2) {
      curr_y++;
      addCube(mesh, vec, [curr_x * TOTAL_WALL_SIZE, 0, curr_y * TOTAL_WALL_SIZE], index)

      curr_y++;
      addCube(mesh, vec, [curr_x * TOTAL_WALL_SIZE, 0, curr_y * TOTAL_WALL_SIZE], index + 1)

    } else if (dir == 3) {
      curr_y--;
      addCube(mesh, vec, [curr_x * TOTAL_WALL_SIZE, 0, curr_y * TOTAL_WALL_SIZE], index)

      curr_y--;
      addCube(mesh, vec, [curr_x * TOTAL_WALL_SIZE, 0, curr_y * TOTAL_WALL_SIZE], index + 1)

    } else {
      throw Error("Should never execute")
    }
  }
}

function addMazeSolution3D(dims, solution) {
  var mesh = new THREE.InstancedMesh(sols_geometry, sols_material, (solution.size() * 2) + 1);

  allMeshes.push(mesh)
  scene.add(mesh);
  var curr_x = 0;
  var curr_y = 0;
  var curr_z = 0;
  var vec = new THREE.Object3D();

  addCube(mesh, vec, [curr_x * TOTAL_WALL_SIZE, 0, curr_y * TOTAL_WALL_SIZE], solution.size() * 2)

  for (let i = 0; i < solution.size(); ++i) {
    let dir = solution.get(i);
    let index = i * 2
    if (dir == 0) {
      curr_x++;
      addCube(mesh, vec, [curr_x * TOTAL_WALL_SIZE, curr_z * TOTAL_WALL_SIZE, curr_y * TOTAL_WALL_SIZE], index)

      curr_x++;
      addCube(mesh, vec, [curr_x * TOTAL_WALL_SIZE, curr_z * TOTAL_WALL_SIZE, curr_y * TOTAL_WALL_SIZE], index + 1)

    } else if (dir == 1) {
      curr_x--
      addCube(mesh, vec, [curr_x * TOTAL_WALL_SIZE, curr_z * TOTAL_WALL_SIZE, curr_y * TOTAL_WALL_SIZE], index)

      curr_x--;
      addCube(mesh, vec, [curr_x * TOTAL_WALL_SIZE, curr_z * TOTAL_WALL_SIZE, curr_y * TOTAL_WALL_SIZE], index + 1)

    } else if (dir == 2) {
      curr_y++;
      addCube(mesh, vec, [curr_x * TOTAL_WALL_SIZE, curr_z * TOTAL_WALL_SIZE, curr_y * TOTAL_WALL_SIZE], index)

      curr_y++;
      addCube(mesh, vec, [curr_x * TOTAL_WALL_SIZE, curr_z * TOTAL_WALL_SIZE, curr_y * TOTAL_WALL_SIZE], index + 1)

    } else if (dir == 3) {
      curr_y--;
      addCube(mesh, vec, [curr_x * TOTAL_WALL_SIZE, curr_z * TOTAL_WALL_SIZE, curr_y * TOTAL_WALL_SIZE], index)

      curr_y--;
      addCube(mesh, vec, [curr_x * TOTAL_WALL_SIZE, curr_z * TOTAL_WALL_SIZE, curr_y * TOTAL_WALL_SIZE], index + 1)

    } else if (dir == 4) {
      curr_z--;
      addCube(mesh, vec, [curr_x * TOTAL_WALL_SIZE, curr_z * TOTAL_WALL_SIZE, curr_y * TOTAL_WALL_SIZE], index)

      curr_z--;
      addCube(mesh, vec, [curr_x * TOTAL_WALL_SIZE, curr_z * TOTAL_WALL_SIZE, curr_y * TOTAL_WALL_SIZE], index + 1)

    } else if (dir == 5) {
      curr_z++;
      addCube(mesh, vec, [curr_x * TOTAL_WALL_SIZE, curr_z * TOTAL_WALL_SIZE, curr_y * TOTAL_WALL_SIZE], index)

      curr_z++;
      addCube(mesh, vec, [curr_x * TOTAL_WALL_SIZE, curr_z * TOTAL_WALL_SIZE, curr_y * TOTAL_WALL_SIZE], index + 1)

    } else {
      console.log("Higher Dimesnion Rendering Has not been implemented yet.\nCurrent render is slice of higher dimension plane")
      // throw Error("Should never execute")
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
  renderer.setSize(window.innerWidth, window.innerHeight);
}

const params = {
  showAxisHelper: false,
  showGridHelper: false,
  fancyGraphics: false,
  showMazeWalls: true,
  mazeWallOpacity: 0.1,
  showMazeSolution: true,
  mazeSolutionOpacity: 1,
  cubeSideLength: 0.75,
  generateNewMaze: generateNewMaze,
  updateCameraPositionOnNewGenerate: true
}

let dimParams = {
  dim1: 20,
  dim2: 20,
  dim3: 0,
  dim4: 0,
  dim5: 0,
  dim6: 0,
}

let h;
let dimController;


generateNewMaze();
init();
animate();

function animate() {

  requestAnimationFrame(animate);

  // required if controls.enableDamping or controls.autoRotate are set to true
  controls.update();
  stats.update();
  renderer.render(scene, camera);
}

function init() {
  const gui = new GUI()
  gui.add(params, 'showAxisHelper').onChange(shouldShow => {
    if (shouldShow) {
      scene.add(axesHelper);
    } else {
      scene.remove(axesHelper);
    }
  })
  gui.add(params, 'showGridHelper').onChange(shouldShow => {
    shouldShow ? scene.add(gridHelper) : scene.remove(gridHelper)
  })
  gui.add(params, 'showMazeWalls').onChange(showWalls => {
    if (showWalls) {
      wall_material.opacity = params.mazeWallOpacity
    } else {
      wall_material.opacity = 0.0
    }
  }).updateDisplay()
  gui.add(params, 'showMazeSolution').onChange(showSols => {
    if (showSols) {
      sols_material.opacity = params.mazeSolutionOpacity
    } else {
      sols_material.opacity = 0.0
    }
  }).updateDisplay();
  gui.add(params, 'mazeWallOpacity', 0.0, 1.0, 0.01).onChange(value => {
    wall_material.opacity = value
  })
  gui.add(params, 'mazeSolutionOpacity', 0.0, 1.0, 0.01).onChange(value => {
    sols_material.opacity = value
  });
  gui.add(params, 'cubeSideLength', 0.01, 1.0, 0.01).onChange(value => {
    let desired_size = value
    let cur_size = WALL_SIZE;
    let scale = desired_size / cur_size
    WALL_SIZE = desired_size
    sols_geometry.scale(scale, scale, scale)
    wall_geometry.scale(scale, scale, scale)
  });


  gui.add(params, 'generateNewMaze');
  gui.add(params, 'updateCameraPositionOnNewGenerate')

  h = gui.addFolder("Dimension Sizes");

  h.add(dimParams, "dim1", 0, 200, 1).name("Dim1")
  h.add(dimParams, "dim2", 0, 200, 1).name("Dim2")
  h.add(dimParams, "dim3", 0, 200, 1).name("Dim3")
  h.add(dimParams, "dim4", 0, 200, 1).name("Dim4")
  h.add(dimParams, "dim5", 0, 200, 1).name("Dim5")
  h.add(dimParams, "dim6", 0, 200, 1).name("Dim6")


  gui.open();
}

function generateNewMaze() {
  clean()
  createModule().then(({ SquareMaze, Int1dVec }) => {
    var dims = []
    let total = 1
    Object.entries(dimParams).forEach(([k, v]) => {
      if (v != 0) {
        dims.push(v)
        total *= v
      }
    })
    if (total > 250000) {
      if (!confirm("WARNING \nYou are trying to solve a maze with " + total.toLocaleString()
        + " positions which has at least " + (total * 5).toLocaleString()
        + " walls cubes that would be rendered."
        + "\nMazes with more than " + (1000000).toLocaleString()
        + " expected walls will not generate walls no matter what"
        + "\nThis action will take an expected time of: "
        + (2 * total / 1000000).toLocaleString() + " seconds."
        + "\n(time estimate based on testing on 10th Gen Intel i7)"
        + "\nDo you wish to continue?")) {
        console.log("Maze gen terminated");
        return
      }
    }

    console.time("MazeGen")
    const maze = new SquareMaze(dims.length);
    const vec = new Int1dVec();
    for (let i = 0; i < dims.length; ++i) {
      vec.push_back(dims[i]);
    }
    maze.makeMaze(vec);
    console.timeEnd("MazeGen")
    console.time("MazeSolve")


    const sols = maze.solveMaze();
    const squares = maze.getMaze();
    console.timeEnd("MazeSolve")
    console.time("MazeRender");

    if (vec.size() == 2) {
      addMazeWalls(dims, squares);
      addMazeSolution(dims, sols);
    } else {
      if (total * 5 <= 1000000) {
        addMazeWalls3D(dims, maze);
      }
      addMazeSolution3D(dims, sols);
    }

    console.timeEnd("MazeRender")
    console.log("\n")

    vec.delete();
    maze.delete();
    sols.delete();
    squares.delete();
  });
  if (params.updateCameraPositionOnNewGenerate) {
    controls.target.set(dimParams.dim1, -1 * dimParams.dim3, dimParams.dim2);
    camera.position.set(dimParams.dim1, (dimParams.dim2 + dimParams.dim1), dimParams.dim2);
    controls.update();
  }
}

function clean() {
  console.time("RenderCleanUp")
  allMeshes.forEach(mesh => {
    scene.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.dispose();
    mesh.dispose();
  })
  allMeshes = []
  console.timeEnd("RenderCleanUp")
}
