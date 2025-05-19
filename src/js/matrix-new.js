// Matrix Animation Script - Full background implementation
(function() {
    // Wait for window to load completely
    window.addEventListener('load', function() {
        initMatrix();
    });
    
    function initMatrix() {
        console.log('Initializing Matrix animation...');
        
        // Get the canvas element
        const canvas = document.getElementById('matrix-canvas');
        if (!canvas) {
            console.error('Matrix canvas not found!');
            return;
        }
        
        // Get canvas context
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('Could not get canvas context!');
            return;
        }
        
        // Characters for the Matrix effect
        const chars = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        
        // Set font size based on window size
        let fontSize = Math.max(10, Math.min(16, window.innerWidth / 100));
        
        // Force canvas to fill the entire window
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            // Apply via CSS as well to be sure
            canvas.style.width = window.innerWidth + 'px';
            canvas.style.height = window.innerHeight + 'px';
            
            console.log('Canvas resized to:', canvas.width, 'x', canvas.height);
            
            // Adjust font size based on window width
            fontSize = Math.max(10, Math.min(16, window.innerWidth / 100));
            
            // Calculate columns based on fontSize
            columns = Math.floor(canvas.width / fontSize);
            
            // Initialize drops - one drop per column
            drops = Array(columns).fill(0).map(() => 
                Math.floor(Math.random() * canvas.height / fontSize) - 
                Math.floor(Math.random() * 100) // Stagger start positions
            );
        }
        
        // Variables for animation
        let columns = 0;
        let drops = [];
        
        // Initial setup
        resizeCanvas();
        
        // Listen for resize
        window.addEventListener('resize', resizeCanvas);
        
        // Animation function
        function animate() {
            // Semi-transparent black background (creates trail effect)
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; // Lighter fade for more visible trails
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // For each column
            for (let i = 0; i < columns; i++) {
                // Only draw some columns for performance and aesthetics
                if (i % 2 === 0 && Math.random() > 0.1) {
                    // Pick a random character
                    const char = chars.charAt(Math.floor(Math.random() * chars.length));
                    
                    // Randomly highlight characters for effect
                    if (Math.random() > 0.98) {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'; // Brighter white for highlights
                        ctx.shadowColor = 'rgba(0, 204, 255, 0.9)';
                        ctx.shadowBlur = 10;
                    } else {
                        // Vary the brightness for depth
                        const brightness = Math.random() * 0.3 + 0.3; // Value between 0.3 and 0.6
                        ctx.fillStyle = `rgba(0, 204, 255, ${brightness})`;
                        ctx.shadowBlur = 0;
                    }
                    
                    // Set font and draw character
                    ctx.font = `${fontSize}px Orbitron, monospace`;
                    ctx.fillText(char, i * fontSize, drops[i] * fontSize);
                }
                
                // Add randomness to the fall speed for more organic look
                drops[i] += Math.random() * 0.5 + 0.5;
                
                // Reset drop to top when it reaches bottom
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
            }
            
            // Request next frame
            requestAnimationFrame(animate);
        }
        
        // Start animation
        console.log('Starting Matrix animation');
        animate();
    }
})();
