// Game State
let gameState = {
    tealScore: 0,
    whiteScore: 0,
    selectedTeam: null,
    theme: 'space',
    gameOver: false
};

// DOM Elements
const tealCard = document.getElementById('tealCard');
const whiteCard = document.getElementById('whiteCard');
const tealScoreEl = document.getElementById('tealScore');
const whiteScoreEl = document.getElementById('whiteScore');
const tealProgress = document.getElementById('tealProgress');
const whiteProgress = document.getElementById('whiteProgress');
const instruction = document.getElementById('instruction');
const scoreButtons = document.querySelectorAll('.score-button');
const washBtn = document.getElementById('washBtn');
const settingsBtn = document.getElementById('settingsBtn');
const resetBtn = document.getElementById('resetBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettings = document.getElementById('closeSettings');
const themeButtons = document.querySelectorAll('.theme-button');
const winOverlay = document.getElementById('winOverlay');
const winMessage = document.getElementById('winMessage');
const winSubtitle = document.getElementById('winSubtitle');
const shutoutMessage = document.getElementById('shutoutMessage');
const winBy2Message = document.getElementById('winBy2Message');
const restartAfterWin = document.getElementById('restartAfterWin');
const washPopup = document.getElementById('washPopup');
const washVideo = document.getElementById('washVideo');
const body = document.body;

// Load game state from localStorage
function loadGameState() {
    try {
        const saved = localStorage.getItem('washersGameState');
        if (saved) {
            const parsed = JSON.parse(saved);
            gameState.tealScore = parsed.tealScore || 0;
            gameState.whiteScore = parsed.whiteScore || 0;
            gameState.selectedTeam = null; // Don't restore selection
            gameState.theme = parsed.theme || 'space';
            updateDisplay();
            setTheme(gameState.theme);
        }
    } catch (e) {
        console.error('Error loading game state:', e);
    }
}

// Save game state to localStorage
function saveGameState() {
    try {
        localStorage.setItem('washersGameState', JSON.stringify({
            tealScore: gameState.tealScore,
            whiteScore: gameState.whiteScore,
            theme: gameState.theme
        }));
    } catch (e) {
        console.error('Error saving game state:', e);
    }
}

// Set theme
function setTheme(theme) {
    gameState.theme = theme;
    body.className = `theme-${theme}`;
    
    // Update active theme button
    themeButtons.forEach(btn => {
        if (btn.dataset.theme === theme) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update CSS variables based on theme
    const root = document.documentElement;
    if (theme === 'space') {
        root.style.setProperty('--bg-primary', 'var(--bg-primary-space)');
        root.style.setProperty('--accent', 'var(--accent-space)');
        root.style.setProperty('--glow', 'var(--glow-space)');
    } else if (theme === 'clouds') {
        root.style.setProperty('--bg-primary', 'var(--bg-primary-clouds)');
        root.style.setProperty('--accent', 'var(--accent-clouds)');
        root.style.setProperty('--glow', 'var(--glow-clouds)');
    } else if (theme === 'sunrise') {
        root.style.setProperty('--bg-primary', 'var(--bg-primary-sunrise)');
        root.style.setProperty('--accent', 'var(--accent-sunrise)');
        root.style.setProperty('--glow', 'var(--glow-sunrise)');
    }

    saveGameState();
}

// Update display
function updateDisplay() {
    tealScoreEl.textContent = gameState.tealScore;
    whiteScoreEl.textContent = gameState.whiteScore;
    
    // Update progress bars (0-21 scale)
    const tealPercent = (gameState.tealScore / 21) * 100;
    const whitePercent = (gameState.whiteScore / 21) * 100;
    tealProgress.style.width = Math.min(tealPercent, 100) + '%';
    whiteProgress.style.width = Math.min(whitePercent, 100) + '%';

    // Update team selection
    if (gameState.selectedTeam === 'teal') {
        tealCard.classList.add('selected');
        whiteCard.classList.remove('selected');
    } else if (gameState.selectedTeam === 'white') {
        whiteCard.classList.add('selected');
        tealCard.classList.remove('selected');
    } else {
        tealCard.classList.remove('selected');
        whiteCard.classList.remove('selected');
    }

    // Clear points button selection (no need to show selected state)
    scoreButtons.forEach(btn => {
        btn.classList.remove('selected');
    });

    // Update instruction text
    if (!gameState.selectedTeam) {
        instruction.textContent = 'Select a team to score';
        instruction.style.color = 'var(--glow)';
    } else {
        const teamName = gameState.selectedTeam.toUpperCase();
        instruction.textContent = `Select points for ${teamName} team`;
        instruction.style.color = gameState.selectedTeam === 'teal' ? '#00ffff' : '#ffffff';
    }

    saveGameState();
}

// Handle point button click
function handlePointClick(points) {
    if (gameState.gameOver) return;

    // WASH can be clicked anytime - no team selection needed
    if (points === 0) {
        showWashPopup();
        return;
    }

    // For number buttons, must have a team selected first
    if (!gameState.selectedTeam) {
        instruction.style.animation = 'none';
        setTimeout(() => {
            instruction.style.animation = 'scoreBounce 0.5s ease';
        }, 10);
        return;
    }

    // Add points to selected team
    if (gameState.selectedTeam === 'teal') {
        gameState.tealScore += points;
        tealScoreEl.classList.add('bounce');
        setTimeout(() => tealScoreEl.classList.remove('bounce'), 500);
    } else {
        gameState.whiteScore += points;
        whiteScoreEl.classList.add('bounce');
        setTimeout(() => whiteScoreEl.classList.remove('bounce'), 500);
    }

    // Clear selections for next round
    gameState.selectedTeam = null;

    updateDisplay();
    checkWin();
}

// Check win conditions
function checkWin() {
    const { tealScore, whiteScore } = gameState;
    let winner = null;
    let winType = '';

    // Shutout: 11+ with opponent at 0 (always ends game immediately)
    if (tealScore >= 11 && whiteScore === 0) {
        winner = 'teal';
        winType = 'Shutout!';
    } else if (whiteScore >= 11 && tealScore === 0) {
        winner = 'white';
        winType = 'Shutout!';
    }
    // Check for 21-20 scenario (flash WIN BY 2! warning)
    else if ((tealScore === 21 && whiteScore === 20) || (whiteScore === 21 && tealScore === 20)) {
        // Flash the WIN BY 2! message but continue the game
        flashWinBy2();
        // Don't end game, continue playing
        return;
    }
    // Actual win: First to 21 win by 2 (or higher)
    else if (tealScore >= 21 && tealScore - whiteScore >= 2) {
        winner = 'teal';
        winType = ''; // Regular win
    } else if (whiteScore >= 21 && whiteScore - tealScore >= 2) {
        winner = 'white';
        winType = ''; // Regular win
    }

    if (winner) {
        gameState.gameOver = true;
        showWinScreen(winner, winType);
    }
}

// Flash WIN BY 2! message for 1 second without ending the game
function flashWinBy2() {
    // Create a temporary overlay to show the message
    const flashOverlay = document.createElement('div');
    flashOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        z-index: 1500;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s ease;
    `;
    
    const flashMessage = document.createElement('div');
    flashMessage.className = 'win-by-2-message';
    flashMessage.textContent = 'WIN BY 2!';
    flashMessage.style.display = 'block';
    flashOverlay.appendChild(flashMessage);
    
    document.body.appendChild(flashOverlay);
    
    // Remove after 1 second
    setTimeout(() => {
        flashOverlay.style.animation = 'fadeOut 0.2s ease';
        setTimeout(() => {
            flashOverlay.remove();
        }, 200);
    }, 1000);
}

// Show win screen
function showWinScreen(winner, winType) {
    const teamName = winner.toUpperCase();
    winOverlay.className = `win-overlay active ${winner}`;
    
    // Reset message animations
    winMessage.style.animation = 'none';
    setTimeout(() => {
        winMessage.style.animation = '';
    }, 10);
    
    winMessage.textContent = `${teamName} WINS!`;
    
    // Show obnoxious shutout message if it's a shutout
    if (winType === 'Shutout!') {
        shutoutMessage.style.display = 'block';
        shutoutMessage.textContent = 'SHUTOUT!';
        winBy2Message.style.display = 'none';
        winSubtitle.textContent = `Final Score: ${gameState.tealScore} - ${gameState.whiteScore}`;
        winSubtitle.style.marginTop = '20px';
    } else {
        // Regular win (no special message, just final score)
        shutoutMessage.style.display = 'none';
        winBy2Message.style.display = 'none'; // Don't show WIN BY 2! on final win screen
        winSubtitle.textContent = `Final Score: ${gameState.tealScore} - ${gameState.whiteScore}`;
        winSubtitle.style.marginTop = '30px';
    }
    
    // Add victory particles
    createVictoryParticles(winner);
    
    // Create confetti after a short delay
    setTimeout(() => {
        createConfetti(winner);
    }, 300);
}

// Create victory particles that burst from the center
function createVictoryParticles(winner) {
    const colors = winner === 'teal' 
        ? ['#00ffff', '#0080ff', '#00ff80']
        : ['#ffffff', '#ffeb3b', '#ff9800'];
    
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 8px;
            height: 8px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: 50%;
            pointer-events: none;
            z-index: 1999;
            left: 50%;
            top: 50%;
            box-shadow: 0 0 10px currentColor;
        `;
        
        document.body.appendChild(particle);
        
        const angle = (Math.PI * 2 * i) / particleCount;
        const velocity = 200 + Math.random() * 100;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        let x = 50;
        let y = 50;
        let opacity = 1;
        const startTime = Date.now();
        const duration = 1000;
        
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                x += vx * 0.02;
                y += vy * 0.02;
                opacity = 1 - progress;
                
                particle.style.left = x + '%';
                particle.style.top = y + '%';
                particle.style.opacity = opacity;
                particle.style.transform = `scale(${1 - progress * 0.5})`;
                
                requestAnimationFrame(animate);
            } else {
                particle.remove();
            }
        }
        
        requestAnimationFrame(animate);
    }
}

// Create confetti effect
function createConfetti(winner) {
    // More vibrant, fun colors
    const colors = winner === 'teal' 
        ? ['#00ffff', '#0080ff', '#00ff80', '#00ffcc', '#40e0d0', '#00d4ff', '#80ffff', '#00bfff', '#00ced1']
        : ['#ffffff', '#ffeb3b', '#ff9800', '#ff6b6b', '#ffd700', '#ffb347', '#ffcccb', '#fffacd', '#ffe4b5'];
    
    // Create even more confetti for extra fun!
    for (let i = 0; i < 120; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        // Random starting position across the top
        confetti.style.left = Math.random() * 100 + '%';
        
        // Staggered animation delays for continuous effect
        confetti.style.animationDelay = Math.random() * 4 + 's';
        confetti.style.animationDuration = (Math.random() * 2 + 3) + 's';
        
        // Random color from palette
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // More varied sizes
        const size = Math.random() * 18 + 10;
        confetti.style.width = size + 'px';
        confetti.style.height = size + 'px';
        
        // Mix of shapes
        if (Math.random() > 0.6) {
            confetti.style.borderRadius = '50%';
        } else if (Math.random() > 0.5) {
            confetti.style.borderRadius = '30%';
        } else {
            confetti.style.borderRadius = '0%';
        }
        
        // Add initial rotation
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        
        winOverlay.appendChild(confetti);
        
        // Remove after animation completes
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.remove();
            }
        }, 7000);
    }
    
    // Create additional bursts at intervals
    let burstCount = 0;
    const burstInterval = setInterval(() => {
        if (burstCount >= 3 || !winOverlay.classList.contains('active')) {
            clearInterval(burstInterval);
            return;
        }
        
        // Create a small burst of confetti
        for (let i = 0; i < 30; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = (40 + Math.random() * 20) + '%'; // Center area
            confetti.style.animationDelay = '0s';
            confetti.style.animationDuration = (Math.random() * 2 + 2.5) + 's';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            
            const size = Math.random() * 15 + 8;
            confetti.style.width = size + 'px';
            confetti.style.height = size + 'px';
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0%';
            
            winOverlay.appendChild(confetti);
            
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.remove();
                }
            }, 5000);
        }
        
        burstCount++;
    }, 1500);
}

// Show WASH popup and display GIF with random movement
function showWashPopup() {
    // Clear team selection to start new round after dance
    gameState.selectedTeam = null;
    
    // Show GIF if available (no popup needed - the GIF is enough)
    if (washVideo) {
        // Clear any existing intervals
        if (window.washMoveInterval) {
            clearInterval(window.washMoveInterval);
        }
        
        // Reset GIF by reloading it (forces restart of animation)
        const originalSrc = washVideo.src;
        const timestamp = new Date().getTime();
        washVideo.src = '';
        setTimeout(() => {
            // Add timestamp to force reload
            washVideo.src = originalSrc.split('?')[0] + '?t=' + timestamp;
        }, 10);
        
        // Entry directions (coming into center)
        const entryDirections = [
            { left: '-20%', top: '50%' },   // From left
            { left: '120%', top: '50%' },   // From right
            { left: '50%', top: '-20%' },   // From top
            { left: '50%', top: '120%' },   // From bottom
            { left: '-20%', top: '-20%' },  // From top-left
            { left: '120%', top: '-20%' },  // From top-right
            { left: '-20%', top: '120%' },  // From bottom-left
            { left: '120%', top: '120%' }   // From bottom-right
        ];
        
        // Exit directions (leaving from center)
        const exitDirections = [
            { left: '-20%', top: '50%' },   // To left
            { left: '120%', top: '50%' },   // To right
            { left: '50%', top: '-20%' },   // To top
            { left: '50%', top: '120%' },   // To bottom
            { left: '-20%', top: '-20%' },  // To top-left
            { left: '120%', top: '-20%' },  // To top-right
            { left: '-20%', top: '120%' },  // To bottom-left
            { left: '120%', top: '120%' }   // To bottom-right
        ];
        
        // Pick random entry and exit directions (make sure they're different)
        let entryDir = entryDirections[Math.floor(Math.random() * entryDirections.length)];
        let exitDir = exitDirections[Math.floor(Math.random() * exitDirections.length)];
        
        // Make sure exit is different from entry
        while (exitDir.left === entryDir.left && exitDir.top === entryDir.top) {
            exitDir = exitDirections[Math.floor(Math.random() * exitDirections.length)];
        }
        
        // Center position
        const centerPos = { left: '50%', top: '50%' };
        
        // Set initial position (off-screen entry point)
        washVideo.style.left = entryDir.left;
        washVideo.style.top = entryDir.top;
        washVideo.style.transform = 'translate(-50%, -50%)';
        washVideo.style.transition = 'left 1.2s ease-in-out, top 1.2s ease-in-out';
        
        // Show GIF element
        washVideo.classList.add('playing');
        washVideo.style.display = 'block';
        
        // Force reflow to ensure initial position is set
        washVideo.offsetHeight;
        
        // Stage 1: Slide to center (1.2 seconds)
        setTimeout(() => {
            washVideo.style.left = centerPos.left;
            washVideo.style.top = centerPos.top;
        }, 10);
        
        // Stage 2: Pause in center (0.8 seconds)
        setTimeout(() => {
            // Ensure we're at center and remove transition for pause
            washVideo.style.left = centerPos.left;
            washVideo.style.top = centerPos.top;
            washVideo.style.transition = 'none';
        }, 1210);
        
        // Stage 3: Slide out in different direction (1.2 seconds)
        setTimeout(() => {
            washVideo.style.transition = 'left 1.2s ease-in-out, top 1.2s ease-in-out';
            washVideo.style.left = exitDir.left;
            washVideo.style.top = exitDir.top;
        }, 2010);
        
        // Auto-hide after animation completes and start new round
        setTimeout(() => {
            washVideo.classList.remove('playing');
            washVideo.style.display = 'none';
            // Reset transition and position for next time
            washVideo.style.transition = '';
            washVideo.style.left = '50%';
            washVideo.style.top = '50%';
            washVideo.style.transform = 'translate(-50%, -50%)';
            
            // Update display to show ready for next round (team selection cleared)
            updateDisplay();
        }, 3250); // Total: 1.2s entry + 0.8s pause + 1.2s exit + buffer
    } else {
        console.error('WASH GIF element not found');
        // Still update display even if GIF fails
        updateDisplay();
    }
}

// Hide GIF if user clicks on it
if (washVideo) {
    washVideo.addEventListener('click', () => {
        washVideo.classList.remove('playing');
        washVideo.style.display = 'none';
        washVideo.style.transition = '';
        washVideo.style.left = '50%';
        washVideo.style.top = '50%';
        washVideo.style.transform = 'translate(-50%, -50%)';
        
        // Update display to show ready for next round
        updateDisplay();
    });
    
    // Handle GIF load error
    washVideo.addEventListener('error', () => {
        console.error('Failed to load WASH GIF. Check that assets/wash-video.gif exists.');
    });
}

// Reset game
function resetGame() {
    gameState.tealScore = 0;
    gameState.whiteScore = 0;
    gameState.selectedTeam = null;
    gameState.gameOver = false;
    winOverlay.classList.remove('active');
    shutoutMessage.style.display = 'none'; // Hide shutout message
    winBy2Message.style.display = 'none'; // Hide win by 2 message
    updateDisplay();
    
    // Clear confetti
    const confettiElements = winOverlay.querySelectorAll('.confetti');
    confettiElements.forEach(el => el.remove());
}

// Event Listeners
tealCard.addEventListener('click', () => {
    if (!gameState.gameOver) {
        gameState.selectedTeam = 'teal';
        updateDisplay();
    }
});

whiteCard.addEventListener('click', () => {
    if (!gameState.gameOver) {
        gameState.selectedTeam = 'white';
        updateDisplay();
    }
});

scoreButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        if (gameState.gameOver) return;
        const points = parseInt(btn.dataset.points);
        handlePointClick(points);
    });
});

settingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('active');
});

closeSettings.addEventListener('click', () => {
    settingsModal.classList.remove('active');
});

settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.classList.remove('active');
    }
});

themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        setTheme(theme);
    });
});

resetBtn.addEventListener('click', () => {
    if (confirm('Reset game? This will clear all scores.')) {
        resetGame();
    }
});

restartAfterWin.addEventListener('click', () => {
    resetGame();
});

// Initialize
loadGameState();
if (!gameState.theme) {
    setTheme('space');
}
updateDisplay();

// Save on page unload
window.addEventListener('beforeunload', saveGameState);

