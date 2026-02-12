document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    // --- State Management ---
    let currentScene = 0;
    const totalScenes = 7;
    const scenes = document.querySelectorAll('.scene');

    // --- Audio Elements ---
    const bgAudio = document.getElementById('bg-audio');
    const voiceNote = document.getElementById('voice-note');
    const playVoiceBtn = document.getElementById('btn-play-voice');

    // --- Background Management ---
    const bgImages = {
        1: 'imgs/first.png',
        2: 'imgs/second.png',
        3: 'imgs/third.png',
        4: 'imgs/fourth.png',
        5: 'imgs/fifth.png',
        6: 'imgs/sixth.png',
        7: 'imgs/seventh.png'
    };

    function changeBackground(sceneNum) {
        const bgUrl = bgImages[sceneNum];
        if (!bgUrl) return;

        // Find active and inactive layers
        const activeLayer = document.querySelector('.bg-layer.active');
        const inactiveLayer = document.querySelector('.bg-layer:not(.active)');

        if (inactiveLayer) {
            inactiveLayer.style.backgroundImage = `url('${bgUrl}')`;
            inactiveLayer.classList.add('active');
            if (activeLayer) {
                activeLayer.classList.remove('active');
            }
        }
    }

    // --- Scene Transition Function ---
    function goToScene(sceneNumber) {
        // Change background
        changeBackground(sceneNumber);

        // Fade out current scene
        const current = document.querySelector('.scene.active');
        if (current) {
            current.classList.remove('active');
            setTimeout(() => {
                current.style.display = 'none'; // Ensure it's gone from flow
            }, 1000); // Match CSS transition speed somewhat, or just rely on class removal
        }

        // Wait a bit, then show next scene
        setTimeout(() => {
            // Hide all scenes just in case
            scenes.forEach(s => s.style.display = 'none');

            const next = document.getElementById(`scene-${sceneNumber}`);
            if (next) {
                next.style.display = 'block';
                // Trigger reflow to restart CSS animations if needed
                void next.offsetWidth;
                next.classList.add('active');
            }

            // Safety check: Ensure bg music is playing in Scene 7
            if (sceneNumber === 7 && bgAudio && bgAudio.paused) {
                bgAudio.volume = 0.3; // Restore volume just in case
                bgAudio.play().catch(e => console.log("Scene 7 Audio Rescue:", e));
            }

        }, 1000);

        currentScene = sceneNumber;
    }

    // --- Audio Control Functions ---
    function clearFade(audio) {
        if (audio._fadeInterval) {
            clearInterval(audio._fadeInterval);
            audio._fadeInterval = null;
        }
    }

    function fadeIn(audio, targetVolume = 0.3, duration = 2000) {
        if (!audio) return;
        clearFade(audio);

        audio.volume = 0;
        audio.play().catch(e => console.log("Audio play failed:", e));

        const step = targetVolume / (duration / 50);
        audio._fadeInterval = setInterval(() => {
            if (audio.volume < targetVolume) {
                audio.volume = Math.min(audio.volume + step, targetVolume);
            } else {
                clearFade(audio);
            }
        }, 50);
    }

    function fadeOut(audio, duration = 2000) {
        if (!audio) return;
        clearFade(audio);

        const step = audio.volume / (duration / 50);
        audio._fadeInterval = setInterval(() => {
            if (audio.volume > 0) {
                audio.volume = Math.max(audio.volume - step, 0);
            } else {
                audio.pause();
                clearFade(audio);
            }
        }, 50);
    }

    // --- Scene 0: Opening Card ---
    const btnOpenCard = document.getElementById('btn-open-card');

    if (btnOpenCard) {
        btnOpenCard.addEventListener('click', () => {
            // Go directly to Scene 1
            goToScene(1);
        });
    }

    // --- Scene 1: Start ---
    const btnStart = document.getElementById('btn-start');
    if (btnStart) {
        btnStart.addEventListener('click', () => {
            // Start background music with fade in
            if (bgAudio) {
                fadeIn(bgAudio, 0.3, 3000);
            }
            goToScene(2);
        });
    }

    // --- Scene 2: Continue ---
    const btnScene2 = document.getElementById('btn-scene-2');
    if (btnScene2) {
        btnScene2.addEventListener('click', () => {
            goToScene(3);
        });
    }

    // --- Scene 3: Interactive Memories ---
    const memoryPoints = document.querySelectorAll('.memory-point');
    const memoryText = document.getElementById('memory-text');
    const btnScene3 = document.getElementById('btn-scene-3');
    let clickedPoints = 0;

    memoryPoints.forEach(point => {
        point.addEventListener('click', function () {
            // Show text
            const msg = this.getAttribute('data-msg');
            memoryText.textContent = msg;
            memoryText.classList.remove('visible');
            void memoryText.offsetWidth; // trigger reflow
            memoryText.classList.add('visible');

            // Mark as clicked
            if (!this.classList.contains('clicked')) {
                this.classList.add('clicked');
                clickedPoints++;
            }

            if (clickedPoints >= 3) {
                btnScene3.classList.remove('hidden');
                btnScene3.classList.add('visible');
            }
        });
    });

    if (btnScene3) {
        btnScene3.addEventListener('click', () => {
            goToScene(4);
        });
    }

    // --- Scene 4: Continue ---
    const btnScene4 = document.getElementById('btn-scene-4');
    if (btnScene4) {
        btnScene4.addEventListener('click', () => {
            goToScene(5);
        });
    }

    // --- Scene 5: Continue ---
    const btnScene5 = document.getElementById('btn-scene-5');
    if (btnScene5) {
        btnScene5.addEventListener('click', () => {
            goToScene(6);
        });
    }

    // --- Scene 6: Voice Note & Custom Player ---
    const btnScene6 = document.getElementById('btn-scene-6');
    const playerControlBtn = document.getElementById('player-control-btn');
    const seekSlider = document.getElementById('seek-slider');
    const currentTimeSpan = document.getElementById('current-time');
    const durationSpan = document.getElementById('duration');

    const formatTime = (secs) => {
        const minutes = Math.floor(secs / 60);
        const seconds = Math.floor(secs % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    if (voiceNote && bgAudio) {
        // --- Metadata Loaded ---
        voiceNote.addEventListener('loadedmetadata', () => {
            durationSpan.textContent = formatTime(voiceNote.duration);
            seekSlider.max = Math.floor(voiceNote.duration);
        });

        // --- Time Update ---
        let isDragging = false;

        voiceNote.addEventListener('timeupdate', () => {
            if (!isDragging) {
                seekSlider.value = Math.floor(voiceNote.currentTime);
                currentTimeSpan.textContent = formatTime(voiceNote.currentTime);
            }
        });

        // --- Seeking ---
        if (seekSlider) {
            seekSlider.addEventListener('mousedown', () => { isDragging = true; });
            seekSlider.addEventListener('touchstart', () => { isDragging = true; }, { passive: true });

            seekSlider.addEventListener('input', () => {
                currentTimeSpan.textContent = formatTime(seekSlider.value);
                // Optional: Update audio immediately for "scrubbing" effect 
                // But can check if user prefers smoothness or instant jump
                // voiceNote.currentTime = seekSlider.value;
            });

            seekSlider.addEventListener('change', () => {
                voiceNote.currentTime = seekSlider.value;
                isDragging = false;
            });

            seekSlider.addEventListener('mouseup', () => { isDragging = false; });
            seekSlider.addEventListener('touchend', () => { isDragging = false; });
        }

        // --- Play/Pause Toggle ---
        if (playerControlBtn) {
            playerControlBtn.addEventListener('click', () => {
                if (voiceNote.paused) {
                    voiceNote.play();
                } else {
                    voiceNote.pause();
                }
            });
        }

        // --- Speed Control ---
        const speedBtn = document.getElementById('speed-btn');
        const speedOptions = document.querySelectorAll('.speed-options span');

        if (speedBtn && speedOptions.length > 0) {
            speedOptions.forEach(option => {
                option.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent closing immediately if helpful, though hover handles visibility
                    const speed = parseFloat(option.getAttribute('data-speed'));
                    if (!isNaN(speed)) {
                        voiceNote.playbackRate = speed;
                        speedBtn.textContent = option.textContent;
                    }
                });
            });
        }

        // --- Voice Note Play Events ---
        voiceNote.addEventListener('play', () => {
            fadeOut(bgAudio, 1500);
            if (playerControlBtn) {
                playerControlBtn.classList.add('playing');
                playerControlBtn.querySelector('.icon').textContent = '❚❚';
            }
        });

        voiceNote.addEventListener('pause', () => {
            fadeIn(bgAudio, 0.3, 2000);
            if (playerControlBtn) {
                playerControlBtn.classList.remove('playing');
                playerControlBtn.querySelector('.icon').textContent = '▶';
            }
        });

        voiceNote.addEventListener('ended', () => {
            fadeIn(bgAudio, 0.3, 2000);
            if (playerControlBtn) {
                playerControlBtn.classList.remove('playing');
                playerControlBtn.querySelector('.icon').textContent = '▶';
            }
            // Show next button when voice note ends
            if (btnScene6) {
                setTimeout(() => {
                    btnScene6.classList.remove('hidden');
                    btnScene6.classList.add('visible');
                }, 1000);
            }
        });
    }

    if (btnScene6) {
        btnScene6.addEventListener('click', () => {
            goToScene(7);
        });
    }

    // --- Scene 7: Final ---
});
