import './style.css'

import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls'
import Stats from 'three/examples/jsm/libs/stats.module'

import "./mazes"

createModule().then(({SquareMaze, Int1dVec}) => {
  // Hardcoded input values
  console.time("maze")
  const test = new SquareMaze(6);
  const vec = new Int1dVec();
  vec.push_back(5);
  vec.push_back(11);
  vec.push_back(5);
  vec.push_back(15);
  vec.push_back(15);
  vec.push_back(16);

  test.makeMaze(vec);
  const sols = test.solveMaze();
  console.timeEnd("maze")
  vec.delete();
  test.delete();
  sols.delete();
  // Perform computation
  // document.getElementById("answer").innerHTML = root.toFixed(2);
});

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

function animate() {

	requestAnimationFrame( animate );

	// required if controls.enableDamping or controls.autoRotate are set to true
	controls.update();
  stats.update();
	// renderer.render( scene, camera );
}


const pointLight = new THREE.PointLight(0xffffff);
const lightHelper = new THREE.PointLightHelper(pointLight);
const gridHelper = new THREE.GridHelper(500, 50); 
const axesHelper = new THREE.AxesHelper(5000);
pointLight.position.set(0, 0, 0);
axesHelper.setColors(new THREE.Color(0xff0000), new THREE.Color(0x00ff00), new THREE.Color(0x0000ff))
scene.add( axesHelper );
scene.add(lightHelper, gridHelper);

const geometry = new THREE.BoxGeometry(.1, .1, .1);
const material = new THREE.MeshBasicMaterial({
  color: 0x333333,
  opacity: 0.3,
  transparent: true,
});

let size = 150;
var mesh = new THREE.InstancedMesh( geometry, material, size * size * size );
//max per mesh: 268435456
scene.add( mesh );

var dummy = new THREE.Object3D();

for (var i = 0; i < size; i++) {
  for (var j = 0; j < size; j++) {
    for (var k = 0; k < size; k ++) {
      dummy.position.x = i*1.2;
      dummy.position.y = j*1.2;
      dummy.position.z = k*1.2;
      dummy.updateMatrix();
    
      mesh.setMatrixAt( size * size * i + j*size +k, dummy.matrix );
    }
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

animate();



