// Optimized main.js
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
    const mouse = new THREE.Vector2();
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
    
    const neonGrid = createNeonGrid();
    scene.add(neonGrid);
    
    // Create text with optimizations
    let textMesh;
    const fontLoader = new FontLoader();
    
    // Only load 3D text on desktop
    if (window.innerWidth > 768) {
        fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
            // Use lower polygon count for better performance
            const textGeometry = new TextGeometry('SRET', {
                font: font,
                size: 1,
                height: 0.1, // Reduced depth
                curveSegments: 4, // Fewer segments = better performance
                bevelEnabled: false // Disable bevel for performance
            });
            
            // Optimize geometry
            textGeometry.computeBoundingBox();
            textGeometry.center();
            
            const textMaterial = new THREE.MeshBasicMaterial({
                color: 0x00ccff
            });
            
            textMesh = new THREE.Mesh(textGeometry, textMaterial);
            textMesh.position.z = -2;
            scene.add(textMesh);
        });
    }
    
    // Animation loop with performance optimizations
    function animate() {
        if (!isVisible) {
            animationFrameId = null;
            return; // Don't animate when not visible
        }
        
        // Rotate grid slowly for effect (minimal computation)
        if (neonGrid) {
            neonGrid.rotation.z += 0.001;
        }
        
        // Rotate text if it exists
        if (textMesh) {
            textMesh.rotation.y += 0.01;
        }
        
        // Use simplified rendering based on device capabilities
        if (composer && window.innerWidth > 768) {
            composer.render();
        } else {
            renderer.render(scene, camera);
        }
        
        animationFrameId = requestAnimationFrame(animate);
    }
    
    // Start animation
    animate();
};

// Language Switcher Functionality
const initLanguageSwitcher = () => {
    const trBtn = document.getElementById('tr-btn');
    const enBtn = document.getElementById('en-btn');
    const translatable = document.querySelectorAll('[data-tr][data-en]');
    
    if (!trBtn || !enBtn) return;
    
    // Set initial language
    const currentLang = localStorage.getItem('language') || 'tr';
    setLanguage(currentLang);
    
    trBtn.addEventListener('click', () => {
        setLanguage('tr');
    });
    
    enBtn.addEventListener('click', () => {
        setLanguage('en');
    });
    
    function setLanguage(lang) {
        localStorage.setItem('language', lang);
        
        if (lang === 'tr') {
            trBtn.classList.add('active');
            enBtn.classList.remove('active');
        } else {
            enBtn.classList.add('active');
            trBtn.classList.remove('active');
        }
        
        translatable.forEach(el => {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = el.dataset[lang];
            } else {
                el.textContent = el.dataset[lang];
            }
        });
    }
};

// Initialize all functionality when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize ThreeJS after a short delay for better page load
    setTimeout(initThreeJS, 500);
    
    // Initialize language switcher immediately
    initLanguageSwitcher();
    
    // Lazy load any images
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    if ('loading' in HTMLImageElement.prototype) {
        console.log('Browser supports native lazy loading');
    } else {
        console.log('Browser does not support native lazy loading');
        // Could add fallback lazy loading here if needed
    }
    
    // Add scroll reveal effects
    const serviceCards = document.querySelectorAll('.service-card');
    
    const handleIntersection = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Stop observing once visible
            }
        });
    };
    
    // Use IntersectionObserver for efficient scroll animations
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(handleIntersection, {
            root: null,
            threshold: 0.1
        });
        
        serviceCards.forEach(card => {
            observer.observe(card);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        serviceCards.forEach(card => {
            card.classList.add('visible');
        });
    }
    
    // Handle service cards details reveal
    serviceCards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('expanded');
        });
    });
    
    // Learn more button scroll
    const learnMoreBtn = document.getElementById('learn-more');
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', () => {
            document.getElementById('services').scrollIntoView({ 
                behavior: 'smooth' 
            });
        });
    }
});

export { initThreeJS, initLanguageSwitcher };
