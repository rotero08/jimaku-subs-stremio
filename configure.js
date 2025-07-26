function getConfigurePage(iconUrl) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jimaku Subtitles v2 - Configuration</title>
    <link rel="icon" type="image/png" href="${iconUrl}">
    <link rel="shortcut icon" type="image/png" href="${iconUrl}">
    <link rel="apple-touch-icon" href="${iconUrl}">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --bg-primary: #0a0a0a;
            --bg-secondary: #111111;
            --bg-tertiary: #1a1a1a;
            --border-primary: #333333;
            --border-secondary: #444444;
            --text-primary: #ffffff;
            --text-secondary: #b3b3b3;
            --text-muted: #666666;
            --accent-primary: #3b82f6;
            --accent-secondary: #1d4ed8;
            --accent-hover: #2563eb;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --shadow-light: rgba(0, 0, 0, 0.3);
            --shadow-medium: rgba(0, 0, 0, 0.5);
            --shadow-heavy: rgba(0, 0, 0, 0.7);
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            background: var(--bg-primary);
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-primary);
            overflow-x: hidden;
            position: relative;
        }
        
        /* Dark animated background */
        .bg-animation {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -2;
            background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-tertiary) 100%);
        }
        
        .bg-animation::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
                radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(99, 102, 241, 0.1) 0%, transparent 50%);
            animation: float 20s ease-in-out infinite;
        }
        
        @keyframes float {
            0%, 100% { 
                transform: translateY(0px) rotate(0deg); 
                opacity: 0.7;
            }
            33% { 
                transform: translateY(-20px) rotate(5deg); 
                opacity: 1;
            }
            66% { 
                transform: translateY(10px) rotate(-3deg); 
                opacity: 0.8;
            }
        }
        
        /* Floating particles */
        .particles {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            overflow: hidden;
        }
        
        .particle {
            position: absolute;
            background: rgba(59, 130, 246, 0.2);
            border-radius: 50%;
            animation: particleFloat 15s infinite linear;
        }
        
        @keyframes particleFloat {
            0% {
                transform: translateY(100vh) rotate(0deg);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(-100vh) rotate(360deg);
                opacity: 0;
            }
        }
        
        .main-container {
            background: var(--bg-secondary);
            border: 1px solid var(--border-primary);
            border-radius: 20px;
            padding: 48px;
            max-width: 600px;
            width: 90%;
            box-shadow: 0 25px 50px var(--shadow-heavy);
            position: relative;
            overflow: hidden;
            animation: slideInUp 0.8s ease-out;
        }
        
        @keyframes slideInUp {
            from {
                transform: translateY(60px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        .main-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, var(--accent-primary), var(--success), var(--accent-primary));
            animation: shimmer 3s ease-in-out infinite;
        }
        
        @keyframes shimmer {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            position: relative;
        }
        
        .logo-container {
            position: relative;
            margin: 0 auto 24px;
            width: 120px;
            height: 120px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .logo {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: url('${iconUrl}') center/cover;
            border: 3px solid var(--border-secondary);
            box-shadow: 0 15px 35px var(--shadow-medium);
            animation: logoFloat 6s ease-in-out infinite;
            position: relative;
            z-index: 2;
        }
        
        .logo-glow {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 140px;
            height: 140px;
            background: radial-gradient(circle, var(--accent-primary) 0%, transparent 70%);
            border-radius: 50%;
            opacity: 0.3;
            filter: blur(20px);
            animation: pulse 4s ease-in-out infinite;
        }
        
        @keyframes logoFloat {
            0%, 100% { 
                transform: translateY(0px) scale(1); 
            }
            50% { 
                transform: translateY(-10px) scale(1.05); 
            }
        }
        
        @keyframes pulse {
            0%, 100% { 
                transform: translate(-50%, -50%) scale(1);
                opacity: 0.3;
            }
            50% { 
                transform: translate(-50%, -50%) scale(1.2);
                opacity: 0.5;
            }
        }
        
        .title {
            font-size: 3rem;
            font-weight: 700;
            background: linear-gradient(135deg, var(--accent-primary), var(--success));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 12px;
            animation: titleGlow 3s ease-in-out infinite;
        }
        
        @keyframes titleGlow {
            0%, 100% { filter: brightness(1); }
            50% { filter: brightness(1.2); }
        }
        
        .subtitle {
            font-size: 1.1rem;
            color: var(--text-secondary);
            font-weight: 400;
            line-height: 1.6;
            margin-bottom: 16px;
            text-align: center;
        }
        
        .version-badge {
            display: inline-block;
            background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
            color: white;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 600;
            box-shadow: 0 8px 25px var(--shadow-light);
            animation: badgeFloat 4s ease-in-out infinite;
        }
        
        @keyframes badgeFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-3px); }
        }
        
        .form-section {
            margin-bottom: 32px;
        }
        
        .form-group {
            margin-bottom: 28px;
            position: relative;
        }
        
        .form-label {
            display: block;
            margin-bottom: 12px;
            font-weight: 600;
            font-size: 1rem;
            color: var(--text-primary);
            position: relative;
            padding-left: 32px;
        }
        
        .form-label i {
            position: absolute;
            left: 0;
            top: 2px;
            font-size: 1.2rem;
            color: var(--accent-primary);
        }
        
        .form-input {
            width: 100%;
            padding: 18px 24px;
            border: 2px solid var(--border-primary);
            border-radius: 12px;
            background: var(--bg-tertiary);
            color: var(--text-primary);
            font-size: 1rem;
            font-family: 'JetBrains Mono', monospace;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .form-input:focus {
            outline: none;
            border-color: var(--accent-primary);
            background: var(--bg-secondary);
            transform: translateY(-2px);
            box-shadow: 0 15px 35px var(--shadow-medium);
        }
        
        .form-input::placeholder {
            color: var(--text-muted);
            transition: color 0.3s ease;
        }
        
        .form-input:focus::placeholder {
            color: transparent;
        }
        
        .help-text {
            margin-top: 8px;
            font-size: 0.9rem;
            color: var(--text-muted);
            line-height: 1.5;
            padding-left: 32px;
        }
        
        .help-text a {
            color: var(--accent-primary);
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s ease;
        }
        
        .help-text a:hover {
            color: var(--accent-hover);
            text-decoration: underline;
        }
        
        .install-section {
            text-align: center;
            margin-top: 40px;
        }
        
        .install-button {
            background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
            border: none;
            padding: 18px 40px;
            border-radius: 50px;
            color: white;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 15px 35px var(--shadow-medium);
            position: relative;
            overflow: hidden;
        }
        
        .install-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
        }
        
        .install-button:hover::before {
            left: 100%;
        }
        
        .install-button:hover {
            transform: translateY(-4px) scale(1.05);
            box-shadow: 0 25px 50px var(--shadow-heavy);
            background: linear-gradient(135deg, var(--accent-hover), var(--accent-primary));
        }
        
        .install-button:active {
            transform: translateY(-2px) scale(1.02);
        }
        
        .install-button i {
            font-size: 1.3rem;
            animation: rocket 2s ease-in-out infinite;
        }
        
        .install-button .fa-spin {
            animation: spin 1s infinite linear !important;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        @keyframes rocket {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-3px); }
        }
        
        .status-indicator {
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-primary);
            padding: 12px 20px;
            border-radius: 50px;
            color: var(--text-secondary);
            font-size: 0.9rem;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
            animation: slideInRight 1s ease-out 0.5s both;
            box-shadow: 0 8px 25px var(--shadow-light);
        }
        
        @keyframes slideInRight {
            from {
                transform: translateX(100px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .status-dot {
            width: 8px;
            height: 8px;
            background: var(--success);
            border-radius: 50%;
            animation: pulse 2s ease-in-out infinite;
        }
        
        /* Mobile responsiveness */
        @media (max-width: 768px) {
            .main-container {
                padding: 32px 24px;
                margin: 20px;
            }
            
            .title {
                font-size: 2.2rem;
            }
            
            .subtitle {
                font-size: 1rem;
                text-align: center;
            }
            
            .logo {
                width: 80px;
                height: 80px;
            }
            
            .logo-container {
                width: 100px;
                height: 100px;
            }
            
            .notification {
                top: 20px;
                right: 20px;
                left: 20px;
                max-width: none;
                transform: translateY(-100%);
            }
            
            .notification-show {
                transform: translateY(0);
            }
        }
        
        /* Success animation */
        .success-animation {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
        }
        
        .success-confetti {
            position: absolute;
            width: 10px;
            height: 10px;
            background: var(--accent-primary);
            animation: confetti-fall 3s linear infinite;
        }
        
        @keyframes confetti-fall {
            to {
                transform: translateY(100vh) rotate(360deg);
            }
        }
        
        /* Notification styles */
        .notification {
            position: fixed;
            top: 30px;
            right: 30px;
            max-width: 400px;
            background: var(--bg-tertiary);
            border: 2px solid var(--border-secondary);
            border-radius: 12px;
            box-shadow: 0 25px 50px var(--shadow-heavy);
            z-index: 10000;
            transform: translateX(100%);
            transition: all 0.3s ease;
            backdrop-filter: blur(20px);
        }
        
        .notification-show {
            transform: translateX(0);
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 20px;
        }
        
        .notification-message {
            color: var(--text-primary);
            font-size: 0.9rem;
            line-height: 1.4;
            flex: 1;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: var(--text-secondary);
            font-size: 1.5rem;
            cursor: pointer;
            margin-left: 12px;
            transition: color 0.2s ease;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .notification-close:hover {
            color: var(--text-primary);
        }
        
        .notification-error {
            border-color: #ef4444;
        }
        
        .notification-error .notification-content::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 4px;
            background: #ef4444;
            border-radius: 12px 0 0 12px;
        }
        
        .notification-success {
            border-color: var(--success);
        }
        
        .notification-success .notification-content::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 4px;
            background: var(--success);
            border-radius: 12px 0 0 12px;
        }
        
        .notification-content {
            position: relative;
        }
    </style>
</head>
<body>
    <div class="bg-animation"></div>
    <div class="particles" id="particles"></div>
    
    <div class="main-container">
        <div class="header">
            <div class="logo-container">
                <div class="logo-glow"></div>
                <div class="logo"></div>
            </div>
            <h1 class="title">Jimaku Subtitles</h1>
            <p class="subtitle">
                Get Japanese subtitles for anime from Jimaku.cc community database. Works best with Kitsu anime addon for proper anime detection and metadata.
            </p>
            <span class="version-badge">v2.0.0</span>
        </div>
        
        <form id="configForm" class="form-section">
            <div class="form-group">
                <label for="jimakuApiKey" class="form-label">
                    <i class="fas fa-key"></i>
                    Jimaku.cc API Key (Required)
                </label>
                <input 
                    type="text" 
                    id="jimakuApiKey" 
                    name="jimakuApiKey" 
                    class="form-input"
                    placeholder="Enter your Jimaku.cc API key..."
                    spellcheck="false"
                >
                <div class="help-text">
                    Get your free API key at <a href="https://jimaku.cc/account" target="_blank">jimaku.cc/account</a> after signing up
                </div>
            </div>
            
            <div class="form-group">
                <label for="omdbApiKey" class="form-label">
                    <i class="fas fa-film"></i>
                    OMDb API Key (Optional)
                </label>
                <input 
                    type="text" 
                    id="omdbApiKey" 
                    name="omdbApiKey" 
                    class="form-input"
                    placeholder="Enter your OMDb API key..."
                    spellcheck="false"
                >
                <div class="help-text">
                    Get free key at <a href="https://omdbapi.com" target="_blank">omdbapi.com</a> for improved movie detection
                </div>
            </div>
        </form>
        
        <div class="install-section">
            <button type="button" class="install-button" onclick="installAddon()">
                <i class="fas fa-rocket"></i>
                Install Addon
            </button>
        </div>
    </div>
    
    <div class="status-indicator">
        <div class="status-dot"></div>
        <span>Server Online</span>
    </div>

    <script>
        // Create floating particles
        function createParticles() {
            const particlesContainer = document.getElementById('particles');
            const particleCount = 30;
            
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 15 + 's';
                particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
                particle.style.width = particle.style.height = (Math.random() * 3 + 1) + 'px';
                particlesContainer.appendChild(particle);
            }
        }
        
        // Success confetti animation
        function createConfetti() {
            const container = document.createElement('div');
            container.className = 'success-animation';
            document.body.appendChild(container);
            
            for (let i = 0; i < 50; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'success-confetti';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.animationDelay = Math.random() * 2 + 's';
                confetti.style.backgroundColor = \`hsl(\${Math.random() * 60 + 200}, 70%, 60%)\`;
                container.appendChild(confetti);
            }
            
            setTimeout(() => {
                document.body.removeChild(container);
            }, 3000);
        }
        
        // Show notification function
        function showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = \`notification notification-\${type}\`;
            notification.innerHTML = \`
                <div class="notification-content">
                    <span class="notification-message">\${message}</span>
                    <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
            \`;
            
            document.body.appendChild(notification);
            
            // Trigger entrance animation
            setTimeout(() => {
                notification.classList.add('notification-show');
            }, 100);
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.classList.remove('notification-show');
                    setTimeout(() => {
                        if (notification.parentElement) {
                            notification.remove();
                        }
                    }, 300);
                }
            }, 5000);
        }
        
        // Install addon function with API validation
        async function installAddon() {
            const jimakuApiKey = document.getElementById('jimakuApiKey').value.trim();
            const omdbApiKey = document.getElementById('omdbApiKey').value.trim();
            const installButton = document.querySelector('.install-button');
            
            if (!jimakuApiKey) {
                // Animate the required field
                const field = document.getElementById('jimakuApiKey');
                field.style.borderColor = '#ef4444';
                field.style.animation = 'shake 0.5s ease-in-out';
                
                showNotification('❌ Jimaku API key is required!', 'error');
                
                setTimeout(() => {
                    field.style.borderColor = 'var(--border-primary)';
                    field.style.animation = '';
                }, 1000);
                
                return;
            }
            
            // Show loading state
            const originalHTML = installButton.innerHTML;
            installButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Validating APIs...';
            installButton.disabled = true;
            installButton.style.opacity = '0.7';
            
            try {
                // Validate Jimaku API
                console.log('🔍 Validating Jimaku API key...');
                
                // Use our server as a proxy to avoid CORS issues
                const jimakuValidation = await fetch(\`/validate-jimaku?apikey=\${encodeURIComponent(jimakuApiKey)}\`);
                
                if (!jimakuValidation.ok) {
                    console.warn('⚠️ Validation endpoint failed, proceeding without validation');
                    // If validation fails, proceed anyway (fallback)
                } else {
                    const jimakuResult = await jimakuValidation.json();
                    
                    if (!jimakuResult.valid) {
                        if (jimakuResult.error && jimakuResult.error.includes('Rate limit')) {
                            // Special case for rate limits - treat as valid but show warning
                            showNotification('⚠️ Jimaku API rate limit reached, but key appears valid. Proceeding with installation.', 'success');
                        } else {
                            throw new Error('Invalid Jimaku API key');
                        }
                    }
                }
                
                // Validate OMDb API if provided
                if (omdbApiKey) {
                    console.log('🔍 Validating OMDb API key...');
                    const omdbValidation = await fetch(\`/validate-omdb?apikey=\${encodeURIComponent(omdbApiKey)}\`);
                    
                    if (omdbValidation.ok) {
                        const omdbResult = await omdbValidation.json();
                        
                        if (!omdbResult.valid) {
                            throw new Error('Invalid OMDb API key');
                        }
                    }
                }
                
                console.log('✅ API validation successful');
                
                const config = {
                    jimakuApiKey: jimakuApiKey,
                    omdbApiKey: omdbApiKey || ''
                };
                
                const encodedConfig = btoa(JSON.stringify(config));
                const installUrl = \`stremio://\${window.location.host}/\${encodedConfig}/manifest.json\`;
                
                // Success animation
                createConfetti();
                showNotification('🎉 APIs validated successfully! Installing addon...', 'success');
                
                // Try to open in Stremio
                window.location.href = installUrl;
                
            } catch (error) {
                console.error('❌ API validation failed:', error);
                
                // Show error notification
                let errorMessage = '';
                if (error.message.includes('Jimaku API') || error.message.includes('Invalid Jimaku')) {
                    errorMessage = '❌ Invalid Jimaku API key! Please check your key at jimaku.cc/account';
                    document.getElementById('jimakuApiKey').style.borderColor = '#ef4444';
                    document.getElementById('jimakuApiKey').style.animation = 'shake 0.5s ease-in-out';
                } else if (error.message.includes('OMDb API') || error.message.includes('Invalid OMDb')) {
                    errorMessage = '❌ Invalid OMDb API key! Please check your key at omdbapi.com';
                    document.getElementById('omdbApiKey').style.borderColor = '#ef4444';
                    document.getElementById('omdbApiKey').style.animation = 'shake 0.5s ease-in-out';
                } else if (error.message.includes('network') || error.message.includes('fetch')) {
                    errorMessage = '❌ Network error! Please check your internet connection and try again.';
                } else {
                    errorMessage = '❌ API validation failed! Please check your API keys and try again.';
                }
                
                showNotification(errorMessage, 'error');
                
                // Reset field colors after animation
                setTimeout(() => {
                    document.getElementById('jimakuApiKey').style.borderColor = 'var(--border-primary)';
                    document.getElementById('jimakuApiKey').style.animation = '';
                    document.getElementById('omdbApiKey').style.borderColor = 'var(--border-primary)';
                    document.getElementById('omdbApiKey').style.animation = '';
                }, 1000);
            } finally {
                // Reset button state
                installButton.innerHTML = originalHTML;
                installButton.disabled = false;
                installButton.style.opacity = '1';
            }
        }
        
        // Add shake animation for validation
        const style = document.createElement('style');
        style.textContent = \`
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
        \`;
        document.head.appendChild(style);
        
        // Initialize particles on load
        document.addEventListener('DOMContentLoaded', function() {
            createParticles();
        });
        
        // Add input validation and visual feedback
        document.getElementById('jimakuApiKey').addEventListener('input', function(e) {
            if (e.target.value.trim()) {
                e.target.style.borderColor = 'var(--accent-primary)';
            }
        });
        
        // Add enter key support
        document.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                installAddon();
            }
        });
    </script>
</body>
</html>
    `;
}

module.exports = { getConfigurePage };
