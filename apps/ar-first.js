// Convertido a módulo que expone appInit/appDispose (index loader cargará como module si corresponde)
import * as THREE from 'three';
import { ARButton } from '../js/ARButton.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.154.0/examples/jsm/loaders/GLTFLoader.js';

let camera, scene, renderer;
let controller;
let model;
let hitTestSource = null;
let hitTestSourceRequested = false;
let resizeHandler = null;

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function loadModel(){
    const loader = new GLTFLoader();
    loader.load('models/slime.glb', function (gltf) {
        model = gltf.scene;
        model.scale.set(0.1, 0.1, 0.1);
        model.visible = false;
        scene.add(model);
    }, undefined, function (err) {
        console.warn('Error loading model:', err);
    });
}

function onSelect(){
    if(!model) return;
    model.visible = true;
    model.position.setFromMatrixPosition(controller.matrixWorld);
}

function render(timestamp,frame) {
    if (frame) {
        const referenceSpace = renderer.xr.getReferenceSpace();
        const session = renderer.xr.getSession();

        if(!hitTestSourceRequested){
            session.requestReferenceSpace('viewer').then(function (viewerSpace) {
                session.requestHitTestSource({ space: viewerSpace }).then(function (source) {
                    hitTestSource = source;
                });
            });
            session.addEventListener('end', function (){
                hitTestSourceRequested = false;
                hitTestSource = null;
            });
            hitTestSourceRequested = true;
        }
        if (hitTestSource) {
            const hitTestResults = frame.getHitTestResults(hitTestSource);
            if (hitTestResults.length && model && !model.visible) {
                const hit = hitTestResults[0];
                const pose = hit.getPose(referenceSpace);
                model.position.set(pose.transform.position.x, pose.transform.position.y, pose.transform.position.z);
            }

        }
    }
    renderer.render(scene, camera);
}

window.appInit = function(){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);

    document.body.appendChild(ARButton.createButton(renderer, { requiredFeatures: ['hit-test'] }));

    const hemi = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(hemi);

    controller = renderer.xr.getController(0);
    controller.addEventListener('select', onSelect);
    scene.add(controller);

    loadModel();

    resizeHandler = onWindowResize;
    window.addEventListener('resize', resizeHandler);

    renderer.setAnimationLoop(render);
};

window.appDispose = function(){
    try{ renderer.setAnimationLoop(null); }catch(e){}
    try{ if(controller) controller.removeEventListener('select', onSelect); }catch(e){}
    if(resizeHandler) { window.removeEventListener('resize', resizeHandler); resizeHandler = null; }
    // dispose model and scene
    if(scene){
        scene.traverse(function(obj){ if(obj.isMesh){ if(obj.geometry) try{obj.geometry.dispose();}catch(e){} if(obj.material) try{ if(Array.isArray(obj.material)) obj.material.forEach(m=>m.dispose()); else obj.material.dispose(); }catch(e){} } });
    }
    if(renderer && renderer.domElement && renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    // remove ARButton (it appends a button to body)
    const btn = document.querySelector('.webxr-button');
    if(btn && btn.parentNode) btn.parentNode.removeChild(btn);
    scene = null; camera = null; renderer = null; controller = null; model = null; hitTestSource = null; hitTestSourceRequested = false;
};