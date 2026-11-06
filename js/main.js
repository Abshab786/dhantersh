// 🪔 Shubh Dhanteras Special Card Shuffle Game for Sizu from AB Shab

document.addEventListener('DOMContentLoaded', () => {
    const cardItems = document.querySelectorAll('.card-item');
    const shuffleBtn = document.getElementById('shuffleBtn');
    const gameStatus = document.getElementById('gameStatus');
    const mainGameScreen = document.getElementById('mainGameScreen');

    // Full Screen Winner Elements
    const celebrationScreen = document.getElementById('celebrationScreen');
    const finalRewardAmount = document.getElementById('finalRewardAmount');
    const confettiContainer = document.getElementById('confettiContainer');

    // Secret Master PIN Modal Elements
    const pinModal = document.getElementById('pinModal');
    const pinInput = document.getElementById('pinInput');
    const pinErrorMsg = document.getElementById('pinErrorMsg');
    const openPinModalBtn = document.getElementById('openPinModalBtn');
    const openPinModalBtnCel = document.getElementById('openPinModalBtnCel');
    const submitPinBtn = document.getElementById('submitPinBtn');
    const cancelPinBtn = document.getElementById('cancelPinBtn');

    // Secret PIN for AB Shab: 2712
    const SECRET_MASTER_PIN = '2712';

    // Dhanteras Cash Prizes
    let currentPrizes = [2000, 1500, 1000, 500];

    // Game States: 'PEEK' | 'SHUFFLING' | 'READY_TO_PICK' | 'REVEALED'
    let gameState = 'PEEK';

    // LocalStorage Permanent Key
    const KEY_SHUFFLED_GAME_PERMANENT = 'dhanteras_sizu_game_claimed_permanent';

    // Sound Synthesizer
    const playChimeSound = (freq = 523.25, duration = 0.4) => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + duration);

            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            // Audio context safely ignored
        }
    };

    // Update Card Display Values
    const updateCardValues = () => {
        currentPrizes.forEach((prize, index) => {
            const prizeEl = document.getElementById(`prize-${index}`);
            if (prizeEl) {
                prizeEl.textContent = `₹${prize.toLocaleString('en-IN')}`;
            }
        });
    };

    // Trigger Dynamic Confetti
    const launchConfetti = () => {
        if (!confettiContainer) return;
        confettiContainer.innerHTML = '';
        const colors = ['#ffd700', '#ff2a75', '#00ff87', '#ffffff', '#ff8c00', '#ff0055'];

        for (let i = 0; i < 65; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (Math.random() * 2.5 + 2) + 's';
            confetti.style.animationDelay = (Math.random() * 0.6) + 's';
            confetti.style.width = (Math.random() * 8 + 6) + 'px';
            confetti.style.height = (Math.random() * 12 + 8) + 'px';
            confettiContainer.appendChild(confetti);
        }
    };

    // Reset Game Function
    const performResetGame = () => {
        localStorage.removeItem(KEY_SHUFFLED_GAME_PERMANENT);
        gameState = 'PEEK';

        // Hide Celebration Screen & Show Main Game Screen
        if (celebrationScreen) celebrationScreen.classList.remove('active');
        if (mainGameScreen) mainGameScreen.classList.remove('fade-out');
        if (confettiContainer) confettiContainer.innerHTML = '';

        // Reset Cards UI
        cardItems.forEach(card => {
            card.classList.add('show-back');
            card.classList.remove('face-down', 'revealed', 'disabled', 'shuffle-anim-1', 'shuffle-anim-2', 'shuffle-anim-3', 'shuffle-anim-4');
        });

        // Reset Shuffle Button
        if (shuffleBtn) {
            shuffleBtn.disabled = false;
            shuffleBtn.textContent = '🔀 Shuffle Gifts!';
            shuffleBtn.style.opacity = '1';
        }

        if (gameStatus) {
            gameStatus.innerHTML = '👀 Take a peek at the cash prizes! Tap <strong>"Shuffle Gifts"</strong> to start.';
            gameStatus.style.borderColor = 'rgba(255, 215, 0, 0.35)';
            gameStatus.style.color = 'var(--gold)';
            gameStatus.style.background = 'rgba(255, 215, 0, 0.1)';
        }

        currentPrizes = [2000, 1500, 1000, 500];
        updateCardValues();
    };

    // Secret PIN Modal Handlers
    const openPinModal = () => {
        if (pinInput) pinInput.value = '';
        if (pinErrorMsg) pinErrorMsg.textContent = '';
        if (pinModal) pinModal.classList.add('active');
        if (pinInput) pinInput.focus();
    };

    const closePinModal = () => {
        if (pinModal) pinModal.classList.remove('active');
        if (pinInput) pinInput.value = '';
        if (pinErrorMsg) pinErrorMsg.textContent = '';
    };

    const verifyAndResetPin = () => {
        const enteredPin = pinInput ? pinInput.value.trim() : '';
        if (enteredPin === SECRET_MASTER_PIN || enteredPin === 'ABSHAB') {
            closePinModal();
            performResetGame();
            alert('✅ Master Reset Successful! Ready for new round.');
        } else {
            if (pinErrorMsg) pinErrorMsg.textContent = '❌ Incorrect Master PIN! Access Denied.';
            if (pinInput) pinInput.value = '';
        }
    };

    if (openPinModalBtn) openPinModalBtn.addEventListener('click', openPinModal);
    if (openPinModalBtnCel) openPinModalBtnCel.addEventListener('click', openPinModal);
    if (cancelPinBtn) cancelPinBtn.addEventListener('click', closePinModal);
    if (submitPinBtn) submitPinBtn.addEventListener('click', verifyAndResetPin);

    if (pinInput) {
        pinInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                verifyAndResetPin();
            }
        });
    }

    // 1. Initial State Check
    const initGame = () => {
        const savedData = localStorage.getItem(KEY_SHUFFLED_GAME_PERMANENT);

        if (savedData) {
            const parsed = JSON.parse(savedData);
            gameState = 'REVEALED';

            currentPrizes = parsed.prizes;
            updateCardValues();

            cardItems.forEach((card, idx) => {
                if (idx === parsed.selectedIndex) {
                    card.classList.add('revealed');
                } else {
                    card.classList.add('face-down', 'disabled');
                }
            });

            if (shuffleBtn) {
                shuffleBtn.disabled = true;
                shuffleBtn.textContent = '🔒 Gift Claimed!';
                shuffleBtn.style.opacity = '0.6';
            }

            // Show Winner Screen
            if (finalRewardAmount) {
                finalRewardAmount.textContent = `₹${Number(parsed.claimedValue).toLocaleString('en-IN')}`;
            }
            if (celebrationScreen) {
                celebrationScreen.classList.add('active');
                launchConfetti();
            }

            return;
        }

        // Default Peek Phase
        gameState = 'PEEK';
        cardItems.forEach(card => {
            card.classList.add('show-back');
            card.classList.remove('face-down', 'revealed', 'disabled');
        });
        updateCardValues();
    };

    // 2. Realistic 3D Shuffle Function
    const startShuffle = () => {
        if (gameState === 'SHUFFLING' || gameState === 'REVEALED') return;

        playChimeSound(440, 0.3);

        gameState = 'SHUFFLING';
        if (shuffleBtn) {
            shuffleBtn.disabled = true;
            shuffleBtn.textContent = '🔀 Shuffling Cards...';
        }

        if (gameStatus) {
            gameStatus.innerHTML = '🔀 <strong>Shuffling the Gift Cards...</strong> Watch carefully Sizu! ✨';
            gameStatus.style.borderColor = 'rgba(255, 215, 0, 0.5)';
            gameStatus.style.color = '#ffd700';
            gameStatus.style.background = 'rgba(255, 215, 0, 0.12)';
        }

        // Turn all cards face-down
        cardItems.forEach(card => {
            card.classList.remove('show-back', 'revealed', 'disabled');
            card.classList.add('face-down');
        });

        // Trigger multi-frame shuffle animation
        setTimeout(() => {
            cardItems.forEach((card, idx) => {
                card.classList.add(`shuffle-anim-${idx + 1}`);
            });
        }, 150);

        // Complete shuffle after 2.8s
        setTimeout(() => {
            for (let i = currentPrizes.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [currentPrizes[i], currentPrizes[j]] = [currentPrizes[j], currentPrizes[i]];
            }
            updateCardValues();

            cardItems.forEach((card, idx) => {
                card.classList.remove(`shuffle-anim-${idx + 1}`);
            });

            playChimeSound(659.25, 0.4);

            gameState = 'READY_TO_PICK';
            if (shuffleBtn) {
                shuffleBtn.disabled = true;
                shuffleBtn.textContent = '✨ Pick 1 Lucky Card Below! ✨';
                shuffleBtn.style.opacity = '1';
            }

            if (gameStatus) {
                gameStatus.innerHTML = '✨ <strong>Cards Shuffled!</strong> Sizu, tap <strong>1 Gift Card</strong> below to reveal your prize!';
                gameStatus.style.color = '#ff7ba4';
                gameStatus.style.borderColor = 'rgba(255, 42, 117, 0.4)';
                gameStatus.style.background = 'rgba(255, 42, 117, 0.12)';
            }
        }, 2800);
    };

    // 3. Card Selection Handler
    const selectCard = (selectedIndex) => {
        if (gameState !== 'READY_TO_PICK') {
            if (gameState === 'PEEK') {
                startShuffle();
            } else if (gameState === 'REVEALED') {
                const savedData = localStorage.getItem(KEY_SHUFFLED_GAME_PERMANENT);
                if (savedData) {
                    const parsed = JSON.parse(savedData);
                    alert(`❤️ Happy Dhanteras Sizu! You claimed your Dhanteras Gift of ₹${Number(parsed.claimedValue).toLocaleString('en-IN')} from AB Shab!`);
                }
            }
            return;
        }

        gameState = 'REVEALED';
        const wonAmount = currentPrizes[selectedIndex];
        playChimeSound(880, 0.6);

        // Save result
        localStorage.setItem(KEY_SHUFFLED_GAME_PERMANENT, JSON.stringify({
            selectedIndex: selectedIndex,
            claimedValue: wonAmount,
            prizes: currentPrizes
        }));

        cardItems.forEach((card, idx) => {
            if (idx === selectedIndex) {
                card.classList.add('revealed');
            } else {
                card.classList.add('disabled');
            }
        });

        // Transition to Winner Screen
        setTimeout(() => {
            if (mainGameScreen) mainGameScreen.classList.add('fade-out');

            if (finalRewardAmount) {
                finalRewardAmount.textContent = `₹${wonAmount.toLocaleString('en-IN')}`;
            }

            setTimeout(() => {
                if (celebrationScreen) celebrationScreen.classList.add('active');
                launchConfetti();
            }, 300);

        }, 700);
    };

    // 4. Attach Event Listeners
    if (shuffleBtn) {
        shuffleBtn.addEventListener('click', startShuffle);
    }

    cardItems.forEach((card, index) => {
        card.addEventListener('click', () => selectCard(index));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectCard(index);
            }
        });
    });

    // Run Initial Check
    initGame();
});
