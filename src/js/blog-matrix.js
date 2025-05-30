// Matrix Animation Script for Blog - Optimized for performance
(function() {
    // Wait for window to load completely and defer initialization
    let animationFrameId = null;
    let isVisible = true;
    
    // Initialize only when document is fully loaded
    window.addEventListener('load', function() {
        // Delay initialization for better initial page load
        setTimeout(initMatrix, 500);
    });
    
    // Page visibility API to pause animation when tab is not visible
    document.addEventListener('visibilitychange', function() {
        isVisible = document.visibilityState === 'visible';
        if (isVisible && !animationFrameId) {
            animate(); // Resume animation
        }
    });
    
    function initMatrix() {
        // Get the canvas element
        const canvas = document.getElementById('matrix-canvas');
        if (!canvas) {
            console.error('Matrix canvas not found!');
            return;
        }
        
        // Get canvas context
        const ctx = canvas.getContext('2d', { alpha: false }); // Optimization: disable alpha
        if (!ctx) {
            console.error('Could not get canvas context!');
            return;
        }
        
        // Reduced character set for faster rendering
        const chars = '01';
        
        // Set font size based on window size
        let fontSize = Math.max(10, Math.min(16, window.innerWidth / 100));
        
        // Variables for animation
        let columns = 0;
        let drops = [];
        
        // Throttled resize handler
        let resizeTimeout;
        window.addEventListener('resize', function() {
            // Debounce resize events
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(resizeCanvas, 200);
        });
        
        // Force canvas to fill the entire window
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            // No need to set CSS dimensions if they match the attributes
            
            // Adjust font size based on window width
            fontSize = Math.max(10, Math.min(16, window.innerWidth / 100));
            
            // Calculate columns based on fontSize - use fewer columns on mobile
            const densityFactor = window.innerWidth < 768 ? 1.5 : 1;
            columns = Math.floor(canvas.width / (fontSize * densityFactor));
            
            // Initialize drops - one drop per column with staggered positions
            drops = Array(columns).fill(0).map(() => 
                Math.floor(Math.random() * canvas.height / fontSize) - 
                Math.floor(Math.random() * 100)
            );
        }
        
        // Initial setup
        resizeCanvas();
        
        // Performance optimized animation function with higher opacity for better contrast with content
        function animate() {
            if (!isVisible) {
                animationFrameId = null;
                return; // Don't animate when not visible
            }
            
            // Semi-transparent black background (creates trail effect)
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Higher opacity for better content visibility
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw only every other column for better performance
            const skipFactor = window.innerWidth < 768 ? 3 : 2; // Skip more columns on mobile
            
            // Pre-set the common font
            ctx.font = `${fontSize}px Orbitron, monospace`;
            
            // For each column
            for (let i = 0; i < columns; i++) {
                // Skip columns for performance
                if (i % skipFactor !== 0) continue;
                
                // Random chance to skip rendering (further optimization)
                if (Math.random() > 0.8) continue;
                
                // Pick a random character
                const char = chars.charAt(Math.floor(Math.random() * chars.length));
                
                // Use simpler highlighting logic
                if (Math.random() > 0.98) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'; // Reduced brightness
                    // Only apply shadows to highlighted characters
                    ctx.shadowColor = 'rgba(0, 255, 170, 0.7)';
                    ctx.shadowBlur = 8;
                } else {
                    // Reduced variation for better performance and reduced opacity
                    ctx.fillStyle = 'rgba(0, 255, 170, 0.3)'; // More transparent for blog
                    // Disable shadows for non-highlighted characters
                    ctx.shadowBlur = 0;
                }
                
                // Draw character
                ctx.fillText(char, i * fontSize, drops[i] * fontSize);
                
                // Simplified fall speed calculation
                drops[i] += 0.7; // Slightly slower
                
                // Reset drop to top when it reaches bottom
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
            }
            
            // Request next frame
            animationFrameId = requestAnimationFrame(animate);
        }
        
        // Start animation
        animate();
    }
})(); 