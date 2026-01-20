import * as THREE from 'three';
import { ARButton } from '../js/ARButton.js';

let camera, scene, renderer;
let controller;
let resizeHandler = null;
let arButtonElement = null;

function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onSelect() {
    if (!scene || !controller) return;
    const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const material = new THREE.MeshBasicMaterial({ color: 0xf27f5d });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.setFromMatrixPosition(controller.matrixWorld);
    scene.add(cube);
}

function render() {
    if (renderer && scene && camera) renderer.render(scene, camera);
}

window.appInit = function(){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);

    // store reference to AR button so we can remove it on dispose
    arButtonElement = ARButton.createButton(renderer, { requiredFeatures: ['hit-test'] });

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    controller = renderer.xr.getController(0);
    controller.addEventListener('select', onSelect);
    scene.add(controller);

    resizeHandler = onWindowResize;
    window.addEventListener('resize', resizeHandler);

    renderer.setAnimationLoop(render);
};

window.appDispose = function(){
    try{ renderer.setAnimationLoop(null); }catch(e){}
    try{ if(controller) controller.removeEventListener('select', onSelect); }catch(e){}
    if(resizeHandler) { window.removeEventListener('resize', resizeHandler); resizeHandler = null; }
    if(scene){ scene.traverse(function(obj){ if(obj.isMesh){ if(obj.geometry) try{obj.geometry.dispose();}catch(e){} if(obj.material) try{ if(Array.isArray(obj.material)) obj.material.forEach(m=>m.dispose()); else obj.material.dispose(); }catch(e){} } }); }
    if(renderer && renderer.domElement && renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    try{ if(arButtonElement && arButtonElement.parentNode) arButtonElement.parentNode.removeChild(arButtonElement); }catch(e){}
    scene = null; camera = null; renderer = null; controller = null;
};