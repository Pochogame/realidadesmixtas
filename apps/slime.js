// app.js (módulo ES)
import * as THREE from 'https://unpkg.com/three@0.154.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.154.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.154.0/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://unpkg.com/three@0.154.0/examples/jsm/loaders/DRACOLoader.js';

let scene, camera, renderer, controls, mixer, clock;
let resizeHandler = null;

window.appInit = function(){
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xdddddd);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(2, 2, 4);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  // renderer.outputEncoding was removed; use outputColorSpace on newer three.js
  if ('outputColorSpace' in renderer) {
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  } else {
    renderer.outputEncoding = THREE.sRGBEncoding;
  }
  document.body.appendChild(renderer.domElement);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
  hemi.position.set(0, 20, 0);
  scene.add(hemi);

  const dir = new THREE.DirectionalLight(0xffffff, 1);
  dir.position.set(5, 10, 7.5);
  dir.castShadow = true;
  scene.add(dir);

  const grid = new THREE.GridHelper(10, 20, 0x888888, 0xcccccc);
  scene.add(grid);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1, 0);

  clock = new THREE.Clock();

  const loader = new GLTFLoader();
  loader.load('models/slime.glb', (gltf) => {
    const root = gltf.scene || gltf.scenes[0];
    root.position.set(0,0,0);
    scene.add(root);
    if (gltf.animations && gltf.animations.length){
      mixer = new THREE.AnimationMixer(root);
      const action = mixer.clipAction(gltf.animations[0]); action.play();
    }
  }, (xhr) => {
    console.log(`Model ${ (xhr.loaded / xhr.total * 100).toFixed(2) }% loaded`);
  }, (err)=>{ console.error('Error loading model:', err); });

  resizeHandler = function(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener('resize', resizeHandler);

  animate();
};

function animate(){
  requestAnimationFrame(animate);
  const delta = clock ? clock.getDelta() : 0;
  if (mixer) mixer.update(delta);
  if (controls) controls.update();
  if (renderer && scene && camera) renderer.render(scene, camera);
}

window.appDispose = function(){
  try{ if(clock) clock = null; }catch(e){}
  try{ if(controls) controls.dispose(); }catch(e){}
  if(resizeHandler){ window.removeEventListener('resize', resizeHandler); resizeHandler = null; }
  if(scene){ scene.traverse(function(obj){ if(obj.isMesh){ if(obj.geometry) try{obj.geometry.dispose();}catch(e){} if(obj.material) try{ if(Array.isArray(obj.material)) obj.material.forEach(m=>m.dispose()); else obj.material.dispose(); }catch(e){} } }); }
  if(renderer && renderer.domElement && renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
  scene = camera = renderer = controls = mixer = null;
};
