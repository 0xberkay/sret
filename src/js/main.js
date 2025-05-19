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
    const createDigitalRain = () => {
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
    
    const digitalRain = createDigitalRain();
    
    // Create holographic projection
    const createHologram = () => {
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
    
    const hologram = createHologram();
    
    // Create floating platforms
    const platforms = [];
    const createPlatform = (x, y, z, size, color) => {
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
    };
    
    // Create several platforms
    createPlatform(-4, -1.5, -2, 2, 0x00ccff);
    createPlatform(4, -2, -3, 3, 0xff005b);
    createPlatform(0, -2.5, -5, 4, 0x00ccff);
    createPlatform(-3, -1, -4, 1.5, 0xff005b);
    createPlatform(3, -1.8, -1, 1, 0x00ccff);
    
    // Create cyberpunk city skyline silhouette
    const createCityscape = () => {
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
    
    const cityscape = createCityscape();
    
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
    let floatingLetters = [];
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
        const letters = ['S', 'R', 'E', 'T'];
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
        });
        
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
        reversedMesh.rotation.y = Math.PI; // Flip it 180 degrees
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
        const fragmentCount = 30;
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
        }
        
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
        setInterval(morphText, 10000);
        
        // Animation for floating "SRET" letters
        const animateFloatingLetters = (time) => {
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
        };
        
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
            if (typeof animateFloatingLetters === 'function') { // Ensure function exists
                animateFloatingLetters(time);
            }
            
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
                        morphingState = 0; // Back to normal
                        textMesh.scale.set(1, 1, 1); // Ensure full scale
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
                if (reversedMesh) reversedMesh.scale.set(pulse, pulse, pulse);
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

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
    initLanguageSwitcher();
    initSmoothScroll();
    
    // Add click event to CTA button
    const learnMoreBtn = document.getElementById('learn-more');
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', () => {
            const servicesSection = document.getElementById('services');
            window.scrollTo({
                top: servicesSection.offsetTop - 20,
                behavior: 'smooth'
            });
        });
    }
    
    // Monitor scroll to update active nav link
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('nav a');
        
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === '#' + current || (current === '' && href === '#')) {
                link.classList.add('active');
            }
        });
    });
});