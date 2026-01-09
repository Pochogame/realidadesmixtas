(function(){
    let scene, camera, renderer, ambient, point, star;
    let animateId = null;
    let resizeHandler = null;

    function arbolNivel(y, scale){
        const geometry = new THREE.BoxGeometry(scale, scale, scale);
        const material = new THREE.MeshStandardMaterial({ color: 0x067D00 });
        const cubo = new THREE.Mesh(geometry, material);
        cubo.position.y = y;
        scene.add(cubo);
    }

    function crearTronco(){
        const tronco = new THREE.BoxGeometry(0.7,1.5, 0.7);
        const maTronco = new THREE.MeshStandardMaterial({color: 0x592200});
        const troncoMesh = new THREE.Mesh(tronco, maTronco);
        scene.add(troncoMesh);
    }

    function animate(){
        animateId = requestAnimationFrame(animate);
        scene.rotation.y += 0.01;
        renderer.render(scene, camera);
    }

    function disposeSceneObjects(){
        if(!scene) return;
        scene.traverse(function(obj){
            if(obj.isMesh){
                if(obj.geometry) try{ obj.geometry.dispose(); }catch(e){}
                if(obj.material) try{ if(Array.isArray(obj.material)) obj.material.forEach(m=>m.dispose()); else obj.material.dispose(); }catch(e){}
            }
        });
    }

    window.appInit = function(){
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0,2,10);

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        ambient = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambient);

        point = new THREE.PointLight(0xffffff, 1);
        point.position.set(2,3,2);
        scene.add(point);

        crearTronco();
        arbolNivel(0,4);
        arbolNivel(1.5,3);
        arbolNivel(3,2);

        star = new THREE.Mesh(new THREE.BoxGeometry(0.8,0.8,0.8), new THREE.MeshStandardMaterial({color:0xF4FF00}));
        star.position.y = 4;
        scene.add(star);

        resizeHandler = function(){
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', resizeHandler);

        animate();
    };

    window.appDispose = function(){
        try{ if(animateId) cancelAnimationFrame(animateId); }catch(e){}
        animateId = null;
        if(resizeHandler) { window.removeEventListener('resize', resizeHandler); resizeHandler = null; }
        disposeSceneObjects();
        if(renderer && renderer.domElement && renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
        scene = null; camera = null; renderer = null; ambient = null; point = null; star = null;
    };

})();
