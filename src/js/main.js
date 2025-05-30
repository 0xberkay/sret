import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

// Performance-optimized Three.js Animation
const initThreeJS = () => {
    // Create scene with less intensive fog
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.03);
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 5;
    
    // Create renderer with optimized settings
    const renderer = new THREE.WebGLRenderer({ 
        alpha: true, 
        antialias: false, // Disable antialiasing for performance
        powerPreference: 'high-performance',
        precision: 'mediump' // Use medium precision for better performance
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = false; // Disable shadows for better performance
    
    // Add renderer to DOM
    const container = document.getElementById('canvas-container');
    container.appendChild(renderer.domElement);
    
    // Handle window resize with debounce
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            if (composer) composer.setSize(window.innerWidth, window.innerHeight);
        }, 250);
    });
    
    // Page visibility API to pause animation when tab is not visible
    let isVisible = true;
    let animationFrameId = null;
    
    document.addEventListener('visibilitychange', function() {
        isVisible = document.visibilityState === 'visible';
        if (isVisible && !animationFrameId) {
            animate(); // Resume animation
        }
    });
    
    // Create ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Create directional light without shadows for performance
    const directionalLight = new THREE.DirectionalLight(0x00ccff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    // Create point light 
    const pointLight = new THREE.PointLight(0xff005b, 1, 100);
    pointLight.position.set(-5, 5, 2);
    scene.add(pointLight);

    // Simplified post-processing for better performance
    let composer;
    
    // Only use post-processing on desktop
    if (window.innerWidth > 768) {
        composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        
        // Add bloom effect with reduced quality
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.7, // strength
            0.4, // radius 
            0.8  // threshold - higher threshold means fewer elements bloom
        );
        composer.addPass(bloomPass);
    }
    
    // Simplified mouse interaction without expensive click events
    let mouse = new THREE.Vector2();
    let lastMoveTime = 0;
    
    // Throttled mouse move handler
    window.addEventListener('mousemove', (event) => {
        const now = Date.now();
        if (now - lastMoveTime < 100) return; // Only process every 100ms
        
        lastMoveTime = now;
        // Convert mouse position to normalized device coordinates (-1 to +1)
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });
    
    // Create optimized cyberpunk neon grid
    const createNeonGrid = () => {
        // Only create grid on desktop
        if (window.innerWidth < 768) return new THREE.Group();
        
        const gridSize = 40;
        const gridDivisions = 10; // Reduced divisions
        const gridGroup = new THREE.Group();
        
        // Create fewer grid lines
        // Horizontal lines
        const hGeometry = new THREE.BufferGeometry();
        const hVertices = [];
        
        for (let i = -gridSize/2; i <= gridSize/2; i += gridSize/gridDivisions) {
            hVertices.push(-gridSize/2, 0, i, gridSize/2, 0, i);
        }
        
        hGeometry.setAttribute('position', new THREE.Float32BufferAttribute(hVertices, 3));
        const hMaterial = new THREE.LineBasicMaterial({ 
            color: 0x00ccff,
            transparent: true,
            opacity: 0.3
        });
        
        const hLines = new THREE.LineSegments(hGeometry, hMaterial);
        gridGroup.add(hLines);
        
        // Vertical lines (using instance optimization)
        const vGeometry = new THREE.BufferGeometry();
        const vVertices = [];
        
        for (let i = -gridSize/2; i <= gridSize/2; i += gridSize/gridDivisions) {
            vVertices.push(i, 0, -gridSize/2, i, 0, gridSize/2);
        }
        
        vGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vVertices, 3));
        const vMaterial = new THREE.LineBasicMaterial({ 
            color: 0xff005b,
            transparent: true,
            opacity: 0.3
        });
        
        const vLines = new THREE.LineSegments(vGeometry, vMaterial);
        gridGroup.add(vLines);
        
        // Position grid below camera
        gridGroup.position.set(0, -10, 0);
        gridGroup.rotation.x = Math.PI / 2;
        
        return gridGroup;
    };
    
    // Create text with fewer details and polygons
    /*const createText = () => {
        const textGroup = new THREE.Group();
            
            const line = new THREE.Line(geometry, material);
            gridGroup.add(line);
        }
        
        gridGroup.position.y = -3;
        gridGroup.rotation.x = Math.PI / 2;
        scene.add(gridGroup);
        
        return gridGroup;
    };*/
    
    const neonGrid = createNeonGrid();
    
    // Create digital rain (Matrix-style) effect
    /* const createDigitalRain = () => {
        const rainGroup = new THREE.Group();
        const characters = "０１";
        const rainCount = 100;
        const fontLoader = new FontLoader();
        
        fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
            for (let i = 0; i < rainCount; i++) {
                const char = characters.charAt(Math.floor(Math.random() * characters.length));
                const charGeometry = new TextGeometry(char, {
                    font: font,
                    size: 0.2,
                    height: 0.05
                });
                
                const charMaterial = new THREE.MeshBasicMaterial({
                    color: 0x00ff66,
                    transparent: true,
                    opacity: Math.random() * 0.5 + 0.2
                });
                
                const charMesh = new THREE.Mesh(charGeometry, charMaterial);
                
                charMesh.position.set(
                    (Math.random() - 0.5) * 40,
                    (Math.random() - 0.5) * 40,
                    (Math.random() - 0.5) * 40
                );
                
                charMesh.userData = {
                    fallSpeed: Math.random() * 0.05 + 0.02,
                    initialY: charMesh.position.y,
                    fadeSpeed: Math.random() * 0.01 + 0.005
                };
                
                rainGroup.add(charMesh);
            }
        });
        
        scene.add(rainGroup);
        return rainGroup;
    };
    
    const digitalRain = createDigitalRain(); */
    
    // Create holographic projection
    /* const createHologram = () => {
        const holoGroup = new THREE.Group();
        
        // Create base cylinder
        const baseGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.1, 32);
        const baseMaterial = new THREE.MeshPhongMaterial({
            color: 0x00ccff,
            emissive: 0x00ccff,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.7
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = -2.5;
        holoGroup.add(base);
        
        // Create emission beams
        const beamGeometry = new THREE.CylinderGeometry(0.05, 0.05, 5, 8);
        const beamMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ccff,
            transparent: true,
            opacity: 0.3
        });
        
        for (let i = 0; i < 4; i++) {
            const beam = new THREE.Mesh(beamGeometry, beamMaterial);
            const angle = (i / 4) * Math.PI * 2;
            beam.position.x = Math.cos(angle) * 1.3;
            beam.position.z = Math.sin(angle) * 1.3;
            beam.position.y = -0.5;
            holoGroup.add(beam);
        }
        
        // Create scan lines
        const createScanLines = () => {
            const scanGroup = new THREE.Group();
            const scanCount = 20;
            const scanHeight = 4;
            const scanSpacing = scanHeight / scanCount;
            
            for (let i = 0; i < scanCount; i++) {
                const lineGeometry = new THREE.PlaneGeometry(3, 0.02);
                const lineMaterial = new THREE.MeshBasicMaterial({
                    color: 0x00ccff,
                    transparent: true,
                    opacity: 0.2,
                    side: THREE.DoubleSide
                });
                
                const line = new THREE.Mesh(lineGeometry, lineMaterial);
                line.position.y = -2 + (i * scanSpacing);
                scanGroup.add(line);
            }
            
            holoGroup.add(scanGroup);
            return scanGroup;
        };
        
        const scanLines = createScanLines();
        
        scene.add(holoGroup);
        return { holoGroup, scanLines, base };
    };
    
    const hologram = createHologram(); */
    
    // Create floating platforms
    // const platforms = [];
    /* const createPlatform = (x, y, z, size, color) => {
        const geometry = new THREE.BoxGeometry(size, 0.1, size);
        const material = new THREE.MeshPhongMaterial({ 
            color: color,
            transparent: true,
            opacity: 0.7,
            emissive: color,
            emissiveIntensity: 0.3
        });
        const platform = new THREE.Mesh(geometry, material);
        platform.position.set(x, y, z);
        platform.castShadow = true;
        platform.receiveShadow = true;
        scene.add(platform);
        platforms.push({
            mesh: platform,
            initialY: y,
            speed: Math.random() * 0.005 + 0.002
        });
    }; */
    
    // Create several platforms
    // createPlatform(-4, -1.5, -2, 2, 0x00ccff);
    // createPlatform(4, -2, -3, 3, 0xff005b);
    // createPlatform(0, -2.5, -5, 4, 0x00ccff);
    // createPlatform(-3, -1, -4, 1.5, 0xff005b);
    // createPlatform(3, -1.8, -1, 1, 0x00ccff);
    
    // Create cyberpunk city skyline silhouette
    /* const createCityscape = () => {
        const cityGroup = new THREE.Group();
        const buildingCount = 15;
        const cityWidth = 30;
        
        for (let i = 0; i < buildingCount; i++) {
            const buildingWidth = Math.random() * 1.5 + 0.5;
            const buildingDepth = Math.random() * 1.5 + 0.5;
            const buildingHeight = Math.random() * 5 + 2;
            
            const buildingGeometry = new THREE.BoxGeometry(buildingWidth, buildingHeight, buildingDepth);
            const buildingMaterial = new THREE.MeshPhongMaterial({
                color: 0x1a1a2e,
                emissive: 0x1a1a2e,
                transparent: true,
                opacity: 0.9
            });
            
            const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
            
            // Position buildings along the horizon
            building.position.x = (Math.random() - 0.5) * cityWidth;
            building.position.y = -3 + buildingHeight / 2;
            building.position.z = -15;
            
            // Add windows
            const windowCount = Math.floor(buildingHeight * 5);
            const windowSize = 0.1;
            
            for (let j = 0; j < windowCount; j++) {
                if (Math.random() > 0.7) { // Only some windows are lit
                    const windowGeometry = new THREE.PlaneGeometry(windowSize, windowSize);
                    const windowMaterial = new THREE.MeshBasicMaterial({
                        color: Math.random() > 0.5 ? 0x00ccff : 0xff005b,
                        side: THREE.DoubleSide,
                        transparent: true,
                        opacity: Math.random() * 0.8 + 0.2
                    });
                    
                    const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
                    
                    // Position window on the building face
                    const xPos = (Math.random() - 0.5) * (buildingWidth - windowSize);
                    const yPos = (Math.random() - 0.5) * (buildingHeight - windowSize);
                    
                    windowMesh.position.set(xPos, yPos, buildingDepth/2 + 0.01);
                    windowMesh.userData = {
                        blinkRate: Math.random() * 0.02,
                        time: Math.random() * 100
                    };
                    
                    building.add(windowMesh);
                }
            }
            
            cityGroup.add(building);
        }
        
        scene.add(cityGroup);
        return cityGroup;
    };
    
    const cityscape = createCityscape(); */
    
    // Create glowing wireframe sphere
    const sphereGeometry = new THREE.IcosahedronGeometry(15, 1);
    const sphereMaterial = new THREE.MeshBasicMaterial({
        color: 0x0066aa, 
        wireframe: true,
        transparent: true,
        opacity: 0.1
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);
    
    // Create text group to contain all text elements
    let textGroup = null;
    let textMesh = null;
    let reversedMesh = null;
    let edgesLines = null;
    // let floatingLetters = []; // Commented out
    let originalTextPositions = [];
    let textMaterial = null;
    let textExploded = false;
    
    // Function to explode text into fragments (called on click)
    const explodeText = () => {
        if (!textExploded && textGroup) {
            textExploded = true;
            
            // Store original positions for later restoration
            if (originalTextPositions.length === 0) {
                textGroup.traverse((child) => {
                    if (child.isObject3D) {
                        originalTextPositions.push({
                            object: child,
                            position: child.position.clone(),
                            rotation: child.rotation.clone()
                        });
                    }
                });
            }
            
            // Explode fragments
            textGroup.traverse((child) => {
                if (child.isObject3D) {
                    const direction = new THREE.Vector3(
                        Math.random() * 2 - 1,
                        Math.random() * 2 - 1,
                        Math.random() * 2 - 1
                    ).normalize();
                    
                    // Animate position
                    gsapLike(child.position, {
                        x: child.position.x + direction.x * (Math.random() * 5 + 3),
                        y: child.position.y + direction.y * (Math.random() * 5 + 3),
                        z: child.position.z + direction.z * (Math.random() * 5 + 3),
                        duration: 1.5
                    });
                    
                    // Animate rotation
                    gsapLike(child.rotation, {
                        x: Math.random() * Math.PI * 4,
                        y: Math.random() * Math.PI * 4,
                        z: Math.random() * Math.PI * 4,
                        duration: 1.5
                    });
                }
            });
            
            // Restore after animation completes
            setTimeout(() => {
                textExploded = false;
                
                // Restore original positions
                originalTextPositions.forEach((item) => {
                    gsapLike(item.object.position, {
                        x: item.position.x,
                        y: item.position.y,
                        z: item.position.z,
                        duration: 1
                    });
                    
                    gsapLike(item.object.rotation, {
                        x: item.rotation.x,
                        y: item.rotation.y,
                        z: item.rotation.z,
                        duration: 1
                    });
                });
            }, 3000);
        }
    };
    
    // Simple GSAP-like animation function
    const gsapLike = (object, params) => {
        const initialValues = {};
        const targetValues = {};
        const duration = params.duration || 1;
        const fps = 60;
        const totalFrames = duration * fps;
        let currentFrame = 0;
        
        for (const key in params) {
            if (key !== 'duration' && key !== 'ease' && object[key] !== undefined) {
                initialValues[key] = object[key];
                targetValues[key] = params[key];
            }
        }
        
        const animate = () => {
            if (currentFrame < totalFrames) {
                currentFrame++;
                const progress = currentFrame / totalFrames;
                
                for (const key in initialValues) {
                    object[key] = initialValues[key] + (targetValues[key] - initialValues[key]) * progress;
                }
                
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    };
    
    // Load font and create text geometry
    const loader = new FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
        // Create a group to hold all text elements
        textGroup = new THREE.Group();
        scene.add(textGroup);
        
        // Create "SRET" text with more advanced geometry
        const text = 'SRET';
        const textGeometry = new TextGeometry(text, {
            font: font,
            size: 0.8,
            height: 0.3, // More depth
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.05,
            bevelSize: 0.04,
            bevelOffset: 0,
            bevelSegments: 8
        });
        
        // Center text geometry
        textGeometry.computeBoundingBox();
        const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
        textGeometry.translate(-textWidth / 2, 0, 0);
        
        // Create a shader material with glowing effect
        textMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ccff,
            metalness: 0.9,
            roughness: 0.1,
            emissive: 0x00ccff,
            emissiveIntensity: 0.7
        });
        
        textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.castShadow = true;
        textGroup.add(textMesh);
        
        // Break down SRET into individual letters for more control
        /* const letters = ['S', 'R', 'E', 'T'];
        const individualLetters = [];
        let xOffset = -1.2;
        
        letters.forEach((letter, index) => {
            const letterGeometry = new TextGeometry(letter, {
                font: font,
                size: 0.6,
                height: 0.2,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 5
            });
            
            const letterMaterial = new THREE.MeshStandardMaterial({
                color: 0x00ccff,
                metalness: 0.8,
                roughness: 0.2,
                emissive: 0x00ccff,
                emissiveIntensity: 0.5
            });
            
            const letterMesh = new THREE.Mesh(letterGeometry, letterMaterial);
            letterMesh.position.set(xOffset + index * 0.8, -2, 0);
            letterMesh.scale.set(0, 0, 0); // Start invisible for animation
            letterMesh.userData = {
                targetY: Math.sin(index * 0.7) * 0.2,
                originalY: -2,
                floatSpeed: 0.5 + index * 0.2,
                rotateSpeed: 0.3 + index * 0.1,
                delayTime: index * 500
            };
            
            // Animate letter appearance
            setTimeout(() => {
                gsapLike(letterMesh.scale, {
                    x: 1,
                    y: 1,
                    z: 1,
                    duration: 1.5
                });
                
                gsapLike(letterMesh.position, {
                    y: 0,
                    duration: 1.5
                });
            }, letterMesh.userData.delayTime);
            
            textGroup.add(letterMesh);
            individualLetters.push(letterMesh);
        }); */
        
        // Create "TERS" text (reversed)
        const reversedText = 'TERS';
        const reversedGeometry = new TextGeometry(reversedText, {
            font: font,
            size: 0.8,
            height: 0.1,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.01,
            bevelSize: 0.01,
            bevelOffset: 0,
            bevelSegments: 3
        });
        
        // Center reversed text geometry
        reversedGeometry.computeBoundingBox();
        const reversedWidth = reversedGeometry.boundingBox.max.x - reversedGeometry.boundingBox.min.x;
        reversedGeometry.translate(-reversedWidth / 2, 0, -0.2);
        
        const reversedMaterial = new THREE.MeshStandardMaterial({
            color: 0xff005b,
            opacity: 0.5,
            transparent: true,
            metalness: 0.8,
            roughness: 0.2,
            emissive: 0xff005b,
            emissiveIntensity: 0.3
        });
        
        reversedMesh = new THREE.Mesh(reversedGeometry, reversedMaterial);
        // reversedMesh.rotation.y = Math.PI; // Flip it 180 degrees // COMMENTED OUT
        reversedMesh.castShadow = true;
        textGroup.add(reversedMesh);
        
        // Add glowing edges to text
        const edges = new THREE.EdgesGeometry(textGeometry);
        const edgesMaterial = new THREE.LineBasicMaterial({ 
            color: 0x00ffff,
            linewidth: 2,
            opacity: 0.7,
            transparent: true
        });
        edgesLines = new THREE.LineSegments(edges, edgesMaterial);
        textGroup.add(edgesLines);
        
        // Create text fragments for explosion effect
        /* const fragmentCount = 30;
        const fragments = [];
        
        for (let i = 0; i < fragmentCount; i++) {
            const scale = Math.random() * 0.3 + 0.1;
            const fragmentGeometry = new TextGeometry(text[Math.floor(Math.random() * text.length)], {
                font: font,
                size: scale,
                height: scale / 3,
                curveSegments: 4,
                bevelEnabled: true,
                bevelThickness: 0.01,
                bevelSize: 0.01,
                bevelOffset: 0,
                bevelSegments: 2
            });
            
            const fragmentMaterial = new THREE.MeshStandardMaterial({
                color: Math.random() > 0.5 ? 0x00ccff : 0xff005b,
                emissive: Math.random() > 0.5 ? 0x00ccff : 0xff005b,
                emissiveIntensity: 0.5,
                metalness: 0.8,
                roughness: 0.2,
                transparent: true,
                opacity: 0
            });
            
            const fragment = new THREE.Mesh(fragmentGeometry, fragmentMaterial);
            
            // Position randomly around the center text
            fragment.position.set(
                (Math.random() - 0.5) * 5,
                (Math.random() - 0.5) * 5,
                (Math.random() - 0.5) * 5
            );
            
            fragment.rotation.set(
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2
            );
            
            fragment.userData = {
                originalOpacity: 0,
                targetOpacity: Math.random() * 0.5 + 0.3,
                speed: Math.random() * 0.02 + 0.01,
                rotationSpeed: Math.random() * 0.02 + 0.01
            };
            
            textGroup.add(fragment);
            fragments.push(fragment);
        } */
        
        // Animation function for text morphing
        let morphingState = 0; // 0: normal, 1: morphing out, 2: morphed, 3: morphing in
        let morphTime = 0;
        let morphClock = Math.random() * 10 + 5; // Random time until first morph
        
        const morphText = () => {
            if (morphingState === 0 && !textExploded) {
                morphingState = 1; // Start morphing out
                morphTime = 0;
            }
        };
        
        // Schedule text morphing
        // setInterval(morphText, 10000); // Commented out
        
        // Animation for floating "SRET" letters
        /* const animateFloatingLetters = (time) => {
            individualLetters.forEach((letter, index) => {
                const userData = letter.userData;
                
                // Floating movement
                letter.position.y = 
                    Math.sin(time * userData.floatSpeed + index) * 0.2;
                    
                // Subtle rotation
                letter.rotation.x = Math.sin(time * 0.2) * 0.1;
                letter.rotation.y = Math.sin(time * 0.3 + index) * 0.1;
                
                // Pulsing scale
                const pulse = 1 + Math.sin(time * 0.5 + index * 0.5) * 0.05;
                letter.scale.set(pulse, pulse, pulse);
            });
        }; */
        
        // Animation variables
        let time = 0;
        let cameraAnimation = 0;
        let mouseEasing = {x: 0, y: 0};
        
        // Animation function
        function animate() {
            requestAnimationFrame(animate);
            
            time += 0.01;
            cameraAnimation += 0.002;
            
            // Animation for individual letters
            /* if (typeof animateFloatingLetters === 'function') { // Ensure function exists
                animateFloatingLetters(time);
            } */
            
            // Handle text morphing animation
            if (textMesh && reversedMesh && morphingState > 0) { // Ensure meshes exist
                morphTime += 0.01;
                
                if (morphingState === 1) { // Morphing out
                    textMesh.scale.set(
                        Math.max(0, 1 - morphTime),
                        Math.max(0, 1 - morphTime),
                        Math.max(0, 1 - morphTime)
                    );
                    reversedMesh.rotation.y = Math.PI + morphTime * Math.PI * 2;
                    reversedMesh.material.opacity = Math.max(0, 0.5 - morphTime * 0.5);
                    
                    if (morphTime >= 1) {
                        morphingState = 2;                        
                        morphTime = 0;
                    }
                } else if (morphingState === 2) { // Morphed state (example: pause)
                    if (morphTime >= 1.0) { // Stay morphed for 1 unit of time
                        morphingState = 3; // Transition to morphing in
                        morphTime = 0;
                    }
                } else if (morphingState === 3) { // Morphing in (restoring)
                    textMesh.scale.set(
                        Math.min(1, morphTime),
                        Math.min(1, morphTime),
                        Math.min(1, morphTime)
                    );
                    reversedMesh.rotation.y = Math.PI - morphTime * Math.PI * 2; // Reverse the rotation
                    reversedMesh.material.opacity = Math.min(0.5, morphTime * 0.5);
                    
                    if (morphTime >= 1) {
                        morphingState = 0;                        textMesh.scale.set(1, 1, 1);                        
                        reversedMesh.rotation.y = Math.PI; // Ensure correct rotation
                        reversedMesh.material.opacity = 0.5; // Ensure correct opacity
                    }
                }
            }
            
            // Smooth mouse movement
            mouseEasing.x += (mouse.x - mouseEasing.x) * 0.05; // Use 'mouse' which is updated
            mouseEasing.y += (mouse.y - mouseEasing.y) * 0.05;
            
            // Camera movement - gentle floating and responsive to mouse
            camera.position.x = Math.sin(cameraAnimation) * 0.5 + mouseEasing.x * 2;
            camera.position.y = Math.cos(cameraAnimation) * 0.5 + mouseEasing.y * 1;
            
            if (textGroup && textGroup.children.length > 0) { // Ensure textGroup is initialized and has content
                camera.lookAt(textGroup.position);
            } else {
                camera.lookAt(scene.position); // Fallback to scene center
            }
            
            // Main text animation (pulsing if not morphing and not exploded)
            if (textMesh && morphingState === 0 && !textExploded) {
                const pulse = 1 + Math.sin(time * 2) * 0.05; // Example pulse
                textMesh.scale.set(pulse, pulse, pulse);
                if (edgesLines) edgesLines.scale.set(pulse, pulse, pulse);
                if (reversedMesh) {
                    reversedMesh.scale.set(pulse, pulse, pulse);
                    
                    // Orbit and face center
                    const orbitRadius = 1.5; // Adjust as needed
                    const orbitSpeed = 0.3;  // Adjust as needed
                    reversedMesh.position.x = orbitRadius * Math.cos(time * orbitSpeed);
                    reversedMesh.position.z = orbitRadius * Math.sin(time * orbitSpeed);
                    // reversedMesh.position.y will remain its initial value relative to textGroup (likely 0)

                    // Target for lookAt: center of textGroup (0,0,0 in world, assuming textGroup is at origin),
                    // at reversedMesh's current world Y height.
                    let targetWorldPosition = new THREE.Vector3(0, 0, 0); 
                    // If textGroup could move: textGroup.getWorldPosition(targetWorldPosition);

                    let reversedMeshWorldPosition = new THREE.Vector3();
                    reversedMesh.getWorldPosition(reversedMeshWorldPosition);
                    targetWorldPosition.y = reversedMeshWorldPosition.y; // Keep it level with its current world Y

                    reversedMesh.lookAt(targetWorldPosition); // Orients local -Z axis towards target
                    reversedMesh.rotateY(Math.PI);          // Flips it so local +Z (text front) faces target
                }
            }

            // Render scene
            if (composer) {
                composer.render();
            } else {
                renderer.render(scene, camera);
            }
            
        } // Closes animate()
        
        animate(); // Starts the animation loop
    }); // Closes loader.load callback
}; // Closes initThreeJS function


// Language Switching
const initLanguageSwitcher = () => {
    const trBtn = document.getElementById('tr-btn');
    const enBtn = document.getElementById('en-btn');
    
    // Get all elements with data-tr and data-en attributes
    const translatable = document.querySelectorAll('[data-tr][data-en]');
    
    // Switch to Turkish
    trBtn.addEventListener('click', () => {
        translatable.forEach(element => {
            element.textContent = element.getAttribute('data-tr');
        });
        document.documentElement.lang = 'tr';
        trBtn.classList.add('active');
        enBtn.classList.remove('active');
    });
    
    // Switch to English
    enBtn.addEventListener('click', () => {
        translatable.forEach(element => {
            element.textContent = element.getAttribute('data-en');
        });
        document.documentElement.lang = 'en';
        enBtn.classList.add('active');
        trBtn.classList.remove('active');
    });
};

// Smooth scrolling for navigation
const initSmoothScroll = () => {
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Only prevent default if not home link
            if (link.getAttribute('href') !== '#') {
                e.preventDefault();
                
                // Remove active class from all links
                navLinks.forEach(l => l.classList.remove('active'));
                
                // Add active class to clicked link
                link.classList.add('active');
                
                // Get the target section
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                // Scroll to target section
                if (targetSection) {
                    window.scrollTo({
                        top: targetSection.offsetTop - 20,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
};

// Utility function to detect mobile devices
function isMobile() {
    return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (!isMobile()) {
        initThreeJS();
    } else {
        // Hide the canvas container on mobile for performance
        const canvasContainer = document.getElementById('canvas-container');
        if (canvasContainer) canvasContainer.style.display = 'none';
    }
    initLanguageSwitcher();
    initSmoothScroll();
    initPillButtons();
    initMobileMenu(); // Added mobile menu initialization
});

// Initialize mobile menu functionality
const initMobileMenu = () => {
    const menuButton = document.querySelector('.mobile-menu-button');
    const nav = document.querySelector('nav');
    const navLinks = document.querySelectorAll('nav ul li a');

    if (menuButton && nav) {
        menuButton.addEventListener('click', () => {
            menuButton.classList.toggle('active');
            nav.classList.toggle('active');
            // Toggle aria-expanded attribute for accessibility
            const isExpanded = menuButton.getAttribute('aria-expanded') === 'true' || false;
            menuButton.setAttribute('aria-expanded', !isExpanded);
        });

        // Close menu when a link is clicked (for single-page applications)
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (nav.classList.contains('active')) {
                    menuButton.classList.remove('active');
                    nav.classList.remove('active');
                    menuButton.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }
};

// Initialize pill buttons functionality
const initPillButtons = () => {
    const redPill = document.querySelector('.red-pill');
    const bluePill = document.querySelector('.blue-pill');
    const servicesSection = document.getElementById('services');
    
    // Add ripple effect to pills
    const addRippleEffect = (element) => {
        element.addEventListener('mousedown', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.className = 'pill-ripple';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            element.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    };
    
    if (redPill && bluePill) {
        // Add ripple effect to both pills
        addRippleEffect(redPill);
        addRippleEffect(bluePill);
        
        // Red pill takes you to services with an advanced futuristic effect
        redPill.addEventListener('click', () => {
            // Create pill animation effect
            const pillElement = redPill.cloneNode(true);
            pillElement.style.position = 'fixed';
            pillElement.style.zIndex = '1500';
            
            // Get position of the original pill button
            const pillRect = redPill.getBoundingClientRect();
            pillElement.style.top = `${pillRect.top}px`;
            pillElement.style.left = `${pillRect.left}px`;
            pillElement.style.width = `${pillRect.width}px`;
            pillElement.style.height = `${pillRect.height}px`;
            pillElement.style.transition = 'all 1.5s cubic-bezier(0.19, 1, 0.22, 1)';
            pillElement.style.transform = 'none';
            
            document.body.appendChild(pillElement);
            
            // Add digital particles around the pill
            const particlesContainer = document.createElement('div');
            particlesContainer.className = 'digital-particles';
            document.body.appendChild(particlesContainer);
            
            // Generate particles
            for (let i = 0; i < 40; i++) {
                const particle = document.createElement('div');
                particle.className = 'digital-particle';
                particle.style.left = `${pillRect.left + pillRect.width/2 + (Math.random() * 40 - 20)}px`;
                particle.style.top = `${pillRect.top + pillRect.height/2 + (Math.random() * 40 - 20)}px`;
                particlesContainer.appendChild(particle);
            }
            
            // Animate the pill to the center and scale it up
            setTimeout(() => {
                const viewportHeight = window.innerHeight;
                const viewportWidth = window.innerWidth;
                
                pillElement.style.top = `${viewportHeight / 2 - pillRect.height / 2}px`;
                pillElement.style.left = `${viewportWidth / 2 - pillRect.width / 2}px`;
                pillElement.style.transform = 'scale(3)';
                pillElement.classList.add('glitch-effect');
                
                // Create matrix effect overlay
                const overlay = document.createElement('div');
                overlay.className = 'matrix-overlay futuristic';
                document.body.appendChild(overlay);
                
                // Add digital matrix rain background
                const rainBackground = document.createElement('div');
                rainBackground.className = 'matrix-rain-background';
                document.body.appendChild(rainBackground);
                
                // Create Matrix-style falling characters
                for (let i = 0; i < 30; i++) {
                    const column = document.createElement('div');
                    column.className = 'rain-column';
                    column.style.left = `${Math.random() * 100}vw`;
                    column.style.opacity = `${Math.random() * 0.5 + 0.2}`;
                    column.style.animationDuration = `${Math.random() * 5 + 3}s`;
                    
                    // Add random matrix characters
                    let columnContent = '';
                    const chars = "10アカサタナハマヤラワイキシチニヒミリヰウクスツヌフムユルン";
                    const columnLength = Math.floor(Math.random() * 20) + 10;
                    for (let j = 0; j < columnLength; j++) {
                        columnContent += chars.charAt(Math.floor(Math.random() * chars.length)) + '<br>';
                    }
                    column.innerHTML = columnContent;
                    
                    rainBackground.appendChild(column);
                }
                
                // Add matrix digital glitch layer
                const glitchLayer = document.createElement('div');
                glitchLayer.className = 'matrix-glitch';
                document.body.appendChild(glitchLayer);
                
                // Add code rain effect
                const codeRain = document.createElement('div');
                codeRain.className = 'code-rain';
                overlay.appendChild(codeRain);
                
                // Create code characters
                for (let i = 0; i < 50; i++) {
                    const codeStream = document.createElement('div');
                    codeStream.className = 'code-stream';
                    codeStream.style.left = `${Math.random() * 100}vw`;
                    codeStream.style.animationDuration = `${Math.random() * 3 + 2}s`;
                    codeStream.style.animationDelay = `${Math.random() * 2}s`;
                    codeRain.appendChild(codeStream);
                }
                
                // Activate the matrix overlay with a delay
                setTimeout(() => {
                    overlay.classList.add('active');
                    
                    // Digital countdown animation
                    const countdown = document.createElement('div');
                    countdown.className = 'matrix-countdown';
                    countdown.textContent = '3';
                    document.body.appendChild(countdown);
                    
                    setTimeout(() => {
                        countdown.textContent = '2';
                        countdown.style.animation = 'none';
                        void countdown.offsetWidth; // Trigger reflow
                        countdown.style.animation = 'countdown-fade 0.8s ease-out forwards';
                        
                        setTimeout(() => {
                            countdown.textContent = '1';
                            countdown.style.animation = 'none';
                            void countdown.offsetWidth; // Trigger reflow
                            countdown.style.animation = 'countdown-fade 0.8s ease-out forwards';
                            
                            setTimeout(() => {
                                countdown.textContent = '0';
                                countdown.style.animation = 'none';
                                void countdown.offsetWidth; // Trigger reflow
                                countdown.style.animation = 'countdown-fade 0.8s ease-out forwards';
                                countdown.style.color = '#00ff99';
                                countdown.style.textShadow = '0 0 20px #00ff99, 0 0 40px #00ff99';
                                
                                // Flash and disintegrate pill - Matrix style
                                setTimeout(() => {
                                    pillElement.classList.add('disintegrate');
                                    
                                    // Generate matrix characters for explosion
                                    const matrixCharsContainer = document.createElement('div');
                                    matrixCharsContainer.className = 'matrix-chars-container';
                                    document.body.appendChild(matrixCharsContainer);
                                    
                                    // Create exploding matrix characters
                                    const pillCenter = {
                                        x: parseInt(pillElement.style.left) + parseInt(pillElement.style.width) / 2,
                                        y: parseInt(pillElement.style.top) + parseInt(pillElement.style.height) / 2
                                    };
                                    
                                    // Add matrix characters in a circular pattern
                                    const charCount = 120; // More characters for a denser effect
                                    const matrixChars = "10アカサタナハマヤラワイキシチニヒミリヰウクスツヌフムユルン";
                                    
                                    for (let i = 0; i < charCount; i++) {
                                        const char = document.createElement('div');
                                        char.className = 'matrix-char';
                                        char.textContent = matrixChars.charAt(Math.floor(Math.random() * matrixChars.length));
                                        
                                        // Calculate position on a circle
                                        const angle = (i / charCount) * Math.PI * 2;
                                        const distance = Math.random() * 30 + 20; // Random distance for more natural effect
                                        const x = pillCenter.x + Math.cos(angle) * distance;
                                        const y = pillCenter.y + Math.sin(angle) * distance;
                                        
                                        char.style.left = `${x}px`;
                                        char.style.top = `${y}px`;
                                        char.style.animationDelay = `${Math.random() * 0.5}s`;
                                        char.style.fontSize = `${Math.random() * 16 + 12}px`; // Various sizes
                                        
                                        matrixCharsContainer.appendChild(char);
                                    }
                                    
                                    // Add powerful shockwave effect
                                    const shockwave = document.createElement('div');
                                    shockwave.className = 'shockwave';
                                    document.body.appendChild(shockwave);
                                    
                                    // Add binary code pulse
                                    const binaryPulse = document.createElement('div');
                                    binaryPulse.className = 'binary-pulse';
                                    document.body.appendChild(binaryPulse);
                                    
                                    // Add a second delayed shockwave for layered effect
                                    setTimeout(() => {
                                        const secondShockwave = document.createElement('div');
                                        secondShockwave.className = 'shockwave delayed';
                                        document.body.appendChild(secondShockwave);
                                    }, 150);
                                    
                                    // Intensify the code rain
                                    const intensifyRain = document.createElement('div');
                                    intensifyRain.className = 'intensify-overlay';
                                    document.body.appendChild(intensifyRain);
                                    
                                    // Scroll to services after effect completes
                                    setTimeout(() => {
                                        servicesSection.scrollIntoView({ behavior: 'smooth' });
                                        
                                        // Clean up effects
                                        setTimeout(() => {
                                            overlay.classList.add('fade-out');
                                            rainBackground.style.opacity = '0';
                                            rainBackground.style.transition = 'opacity 1.5s ease-out';
                                            glitchLayer.style.opacity = '0';
                                            glitchLayer.style.transition = 'opacity 1.5s ease-out';
                                            
                                            // Complete cleanup after fade out
                                            setTimeout(() => {
                                                pillElement.remove();
                                                particlesContainer.remove();
                                                matrixCharsContainer.remove();
                                                shockwave.remove();
                                                countdown.remove();
                                                rainBackground.remove();
                                                glitchLayer.remove();
                                                
                                                if (document.querySelector('.shockwave.delayed')) {
                                                    document.querySelector('.shockwave.delayed').remove();
                                                }
                                                
                                                binaryPulse.remove();
                                                intensifyRain.remove();
                                                overlay.remove();
                                            }, 1500);
                                        }, 1200);
                                    }, 1200);
                                }, 1000);
                            }, 800);
                        }, 500);
                    }, 100);
                });
            });
        });
        
        // Blue pill triggers an Easter egg
        bluePill.addEventListener('click', () => {
            // Create a blue pill effect overlay
            const overlay = document.createElement('div');
            overlay.className = 'blue-pill-overlay';
            document.body.appendChild(overlay);
            
            setTimeout(() => {
                overlay.classList.add('active');
                
                // Display message
                const message = document.createElement('div');
                message.className = 'blue-pill-message';
                
                // Add language support for the message
                const trMessage = "Matrix'e bağlantı başarısız. Gerçekliğe dönülüyor...";
                const enMessage = "Connection to the Matrix failed. Returning to reality...";
                
                // Set correct language based on current language
                const currentLang = document.documentElement.lang;
                message.textContent = currentLang === 'en' ? enMessage : trMessage;
                message.setAttribute('data-tr', trMessage);
                message.setAttribute('data-en', enMessage);
                
                overlay.appendChild(message);
                
                // Remove effect after animation completes
                setTimeout(() => {
                    overlay.classList.remove('active');
                    setTimeout(() => {
                        overlay.remove();
                    }, 1000);
                }, 3000);
            }, 100);
        });
    }
};

// Cookie Consent Logic
document.addEventListener('DOMContentLoaded', () => {
    const cookieDialog = document.getElementById('cookie-consent-dialog');
    const acceptButton = document.getElementById('cookie-accept-btn');

    // Check if consent was already given
    if (!localStorage.getItem('cookieConsentGiven')) {
        if (cookieDialog) {
            cookieDialog.style.display = 'flex'; // Show the dialog
        }
    } else {
        // If consent already given, ensure gtag can be used if it exists
        if (typeof gtag === 'function') {
            // You might want to initialize or re-initialize analytics here if needed
            // For now, we assume gtag('config', 'YOUR_ID') in HTML is sufficient
        }
    }

    if (acceptButton && cookieDialog) {
        acceptButton.addEventListener('click', () => {
            localStorage.setItem('cookieConsentGiven', 'true');
            cookieDialog.style.display = 'none';
            // If Google Tag exists, ensure it's configured (it should already be by the HTML script)
            // This is more of a conceptual placement for any post-consent initializations
            if (typeof gtag === 'function') {
                // gtag('consent', 'update', { 'analytics_storage': 'granted' }); // If using consent mode V2
                console.log("Cookie consent given. Analytics should be active if configured.");
            }
        });
    }

    // Language switcher update for cookie dialog if present
    const updateCookieDialogLanguage = () => {
        if (cookieDialog && cookieDialog.style.display !== 'none') {
            const currentLang = localStorage.getItem('language') || 'tr';
            const pElement = cookieDialog.querySelector('p');
            const buttonElement = cookieDialog.querySelector('button');

            if (pElement) {
                pElement.textContent = pElement.getAttribute(`data-${currentLang}`);
            }
            if (buttonElement) {
                buttonElement.textContent = buttonElement.getAttribute(`data-${currentLang}`);
            }
        }
    };

    // Update cookie dialog language on initial load (if dialog is shown)
    if (cookieDialog && !localStorage.getItem('cookieConsentGiven')) {
        updateCookieDialogLanguage();
    }

    // Listen for language changes to update cookie dialog
    window.addEventListener('languageChanged', updateCookieDialogLanguage);
});



