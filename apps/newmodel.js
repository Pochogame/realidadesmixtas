(function(){
    let scene, camera, renderer, ambient, point;
    let cuboA, cuboB, cuboC;
    let rotar = true;
    let resizeHandler = null;
    let animateId = null;

    function disposeSceneObjects(){
        if(!scene) return;
        scene.traverse(function(obj){
            if(obj.isMesh){
                if(obj.geometry) try{ obj.geometry.dispose(); }catch(e){}
                if(obj.material) try{ if(Array.isArray(obj.material)) obj.material.forEach(m=>m.dispose()); else obj.material.dispose(); }catch(e){}
            }
        });
    }

    function animate(){
        animateId = requestAnimationFrame(animate);
        if(rotar){
            scene.rotation.y += 0.01;
            if(cuboA) cuboA.rotation.y += -0.01;
            if(cuboB) cuboB.rotation.x += 0.01;
            if(cuboC) cuboC.rotation.z += -0.05;
        }
        renderer.render(scene, camera);
    }

    window.appInit = function(){
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 3;

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        ambient = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambient);
        point = new THREE.PointLight(0xffffff, 1);
        point.position.set(2,3,2);
        scene.add(point);

        const geometry = new THREE.BoxGeometry(1,1,1);
        cuboA = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({color:0xF4FF00}));
        cuboA.position.x = -2; scene.add(cuboA);
        const geometryX = new THREE.BoxGeometry(2,1,1);
        cuboB = new THREE.Mesh(geometryX, new THREE.MeshStandardMaterial({color:0xF4FF00}));
        cuboB.position.x = 0; scene.add(cuboB);
        const geometryY = new THREE.BoxGeometry(1,2,1);
        cuboC = new THREE.Mesh(geometryY, new THREE.MeshStandardMaterial({color:0xF4FF00}));
        cuboC.position.x = 2; scene.add(cuboC);

        document.getElementById("cuboColor").addEventListener("change", colorChangeHandler);
        document.getElementById("pointLight").addEventListener("input", pointLightHandler);
        document.getElementById("rotate").addEventListener("click", rotateHandler);

        resizeHandler = function(){
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', resizeHandler);

        animate();
    };

    function colorChangeHandler(e){
        const colorHex = e.target.value;
        if(cuboA) cuboA.material.color.set(colorHex);
        if(cuboB) cuboB.material.color.set(colorHex);
        if(cuboC) cuboC.material.color.set(colorHex);
    }
    function pointLightHandler(e){ if(point) point.intensity = parseFloat(e.target.value); }
    function rotateHandler(){ rotar = !rotar; document.getElementById("rotate").textContent = rotar ? "desactivar" : "activar"; }

    window.appDispose = function(){
        try{ if(animateId) cancelAnimationFrame(animateId); }catch(e){}
        animateId = null;
        if(resizeHandler){ window.removeEventListener('resize', resizeHandler); resizeHandler = null; }
        document.getElementById("cuboColor").removeEventListener("change", colorChangeHandler);
        document.getElementById("pointLight").removeEventListener("input", pointLightHandler);
        document.getElementById("rotate").removeEventListener("click", rotateHandler);
        disposeSceneObjects();
        if(renderer && renderer.domElement && renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
        scene = null; camera = null; renderer = null; ambient = null; point = null; cuboA = cuboB = cuboC = null;
    };

})();
