// Unity WebGL Loader Patch
(function() {
    // Safe cacheControl function
    function safeCacheControl(config) {
        try {
            // Default caching strategy if no specific control is provided
            if (!config || typeof config.match !== 'function') {
                return {
                    headers: {
                        'Cache-Control': 'max-age=31536000'
                    }
                };
            }
            
            // Original caching logic
            const cacheHeader = config.match(/\bmax-age=(\d+)/) ? 
                { 'Cache-Control': config } : 
                { 'Cache-Control': 'max-age=31536000' };
            
            return { headers: cacheHeader };
        } catch (error) {
            console.warn('Cache control configuration failed', error);
            return {
                headers: {
                    'Cache-Control': 'max-age=31536000'
                }
            };
        }
    }

    // Modify the global createUnityInstance to use safe caching
    const originalCreateUnityInstance = window.createUnityInstance;
    
    window.createUnityInstance = function(canvas, config, progressCallback) {
        // Wrap the original configuration with safe defaults
        const safeConfig = {
            ...config,
            cacheControl: safeCacheControl
        };

        // Call the original function with modified config
        return originalCreateUnityInstance(canvas, safeConfig, progressCallback)
            .catch((error) => {
                console.error('Unity Instance Creation Failed:', error);
                // Provide a more informative error
                throw new Error(`Failed to load Unity WebGL content: ${error.message}`);
            });
    };
})();