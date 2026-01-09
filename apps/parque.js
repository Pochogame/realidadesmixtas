(function(){
    let scene, camera, renderer, ambient, point, floor, camino;
    let rotar = true;
    let resizeHandler = null;
    let animateId = null;
    let rotateBtn = null;
    let rotateHandler = null;

    function crearBanca(x, z) {
        const asiento = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.3, 0.5),
            new THREE.MeshStandardMaterial({ color: 0x8B4513 })
        );
        asiento.position.set(x, -0.5, z);

        const pata1 = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.5, 0.2),
            new THREE.MeshStandardMaterial({ color: 0x5A3A1E })
        );
        pata1.position.set(x - 0.8, -0.9, z);

        const pata2 = pata1.clone();
        pata2.position.x = x + 0.8;

        scene.add(asiento, pata1, pata2);
    }

    function crearArbusto(x, z) {
        const arbusto = new THREE.Mesh(
            new THREE.SphereGeometry(0.7, 32, 32),
            new THREE.MeshStandardMaterial({ color: 0x2ECC71 })
        );
        arbusto.position.set(x, -0.8, z);
        scene.add(arbusto);
    }

    function crearArbol(x, z) {
        const tronco = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.2, 2),
            new THREE.MeshStandardMaterial({ color: 0x8B4513 })
        );
        tronco.position.set(x, 0, z);

        const copa = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 1.5, 1.5),
            new THREE.MeshStandardMaterial({ color: 0x1E7A1E })
        );
        copa.position.set(x, 1.5, z);

        scene.add(tronco, copa);
    }

    function crearRoca(x, z, escala = 1) {
        const rocaGeo = new THREE.IcosahedronGeometry(1, 0);
        const rocaMat = new THREE.MeshStandardMaterial({ color: 0x7A7A7A });
        const roca = new THREE.Mesh(rocaGeo, rocaMat);

        roca.scale.set(escala, escala * 0.7, escala);
        roca.position.set(x, -0.8, z);

        scene.add(roca);
    }

    function crearCercaLinea(x1, x2, z, saltoEntrada = null) {
        const postes = [];
        const madera = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const posteGeo = new THREE.BoxGeometry(0.2, 1, 0.2);

        for (let x = x1; x <= x2; x += 2) {
            if (saltoEntrada !== null && Math.abs(x - saltoEntrada) < 1.5) {
                continue;
            }
            const poste = new THREE.Mesh(posteGeo, madera);
            poste.position.set(x, -0.5, z);
            postes.push(poste);
        }

        const tablaGeo = new THREE.BoxGeometry((x2 - x1), 0.2, 0.15);

        const tabla1 = new THREE.Mesh(tablaGeo, madera);
        tabla1.position.set((x1 + x2) / 2, -0.3, z);

        const tabla2 = new THREE.Mesh(tablaGeo, madera);
        tabla2.position.set((x1 + x2) / 2, 0.3, z);

        scene.add(...postes, tabla1, tabla2);
    }

    function animate() {
        animateId = requestAnimationFrame(animate);
        if (rotar) scene.rotation.y += 0.003;
        renderer.render(scene, camera);
    }

    function disposeSceneObjects() {
        if (!scene) return;
        scene.traverse(function (obj) {
            if (obj.isMesh) {
                if (obj.geometry) {
                    try { obj.geometry.dispose(); } catch (e) { }
                }
                if (obj.material) {
                    try {
                        if (Array.isArray(obj.material)) obj.material.forEach(m => { try{ m.dispose(); }catch(e){} });
                        else obj.material.dispose();
                    } catch (e) { }
                }
            }
        });
    }

    window.appInit = function () {
        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.set(0, 5, 10);
        camera.lookAt(0, 0, 0);

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        ambient = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambient);

        point = new THREE.PointLight(0xffffff, 1);
        point.position.set(2, 5, 2);
        scene.add(point);

        const floorGeo = new THREE.PlaneGeometry(20, 20);
        const floorMat = new THREE.MeshStandardMaterial({ color: 0x4CAF50 });
        floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -1;
        scene.add(floor);

        const pathGeo = new THREE.PlaneGeometry(20, 3);
        const pathMat = new THREE.MeshStandardMaterial({ color: 0xA0A0A0 });
        camino = new THREE.Mesh(pathGeo, pathMat);
        camino.rotation.x = -Math.PI / 2;
        camino.position.set(0, -0.99, 0);
        scene.add(camino);

        crearBanca(-4, 2);
        crearBanca(4, -1);

        crearArbusto(-3, -3);
        crearArbusto(2, -4);
        crearArbusto(4, 3);

        crearArbol(-5, -2);
        crearArbol(5, 2);
        crearArbol(0, 4);

        crearRoca(-2, 3, 0.6);
        crearRoca(3, -2, 0.9);
        crearRoca(-4, -4, 1.2);

        crearCercaLinea(-9, 9, -9, 0);
        crearCercaLinea(-9, 9, 9);

        rotar = true;

        rotateBtn = document.getElementById("rotate");
        rotateHandler = () => {
            rotar = !rotar;
            if (rotateBtn) rotateBtn.textContent = rotar ? "desactivar" : "activar";
        };
        if (rotateBtn) rotateBtn.addEventListener("click", rotateHandler);

        resizeHandler = function () {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener("resize", resizeHandler);

        animate();
    };

    window.appDispose = function () {
        try {
            if (typeof animateId === 'number' && animateId !== null) cancelAnimationFrame(animateId);
        } catch (e) { }
        animateId = null;

        if (resizeHandler) {
            window.removeEventListener("resize", resizeHandler);
            resizeHandler = null;
        }

        if (rotateBtn && rotateHandler) {
            rotateBtn.removeEventListener("click", rotateHandler);
            rotateHandler = null;
            rotateBtn = null;
        }

        disposeSceneObjects();

        if (renderer && renderer.domElement && renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
        }

        scene = null;
        camera = null;
        renderer = null;
        ambient = null;
        point = null;
        floor = null;
        camino = null;
    };

})();
