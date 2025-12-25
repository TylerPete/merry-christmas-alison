console.log("app.js loaded");

/* --- DOM --- */

const input = document.getElementById("code");
const status = document.getElementById("status");
const panel = document.getElementById("panel");
const instruction = document.getElementById("instruction");
const slots = document.querySelectorAll(".evidence-slot");

const finalInput = document.getElementById("final-code");
const finalReveal = document.getElementById("final-reveal");

/* --- AUDIO (OPTIONAL / SAFE) --- */

const audioStage1 = document.getElementById("audio-stage-1");
const audioStage2 = document.getElementById("audio-stage-2");
const audioStage3 = document.getElementById("audio-stage-3");
const audioPlanchette = document.getElementById("audio-planchette");


if (audioStage1) audioStage1.volume = 0.03; // static (very quiet)
if (audioStage2) audioStage2.volume = 0.03; // door knock
if (audioStage3) audioStage3.volume = 0.10; // whisper/breath

let audioUnlocked = false;

function unlockAudioOnce() {
    if (audioUnlocked) return;

    const audios = [
        audioStage1,
        audioStage2,
        audioStage3,
        audioPlanchette
    ];

    audios.forEach(audio => {
        if (!audio) return;

        audio.volume = 0;
        audio.play()
            .then(() => {
                audio.pause();
                audio.currentTime = 0;
                audio.volume = 0.30;
            })
            .catch(() => { });
    });

    audioUnlocked = true;

    console.log("🔊 Audio unlocked");
}

/* --- STORAGE KEYS --- */

const STORAGE_KEY = "phasmo_progress";

/* --- DATA --- */

const VALID_CODES = ["EMF-05", "UV-PRINT", "GHOST-ORB"];
let progress = 0;
let verifiedCodes = [];

/* --- AUDIO HELPERS --- */

let planchetteFadeTimeout = null;

function playRandomly(audio, minDelay, maxDelay) {
    if (!audio) return;

    function schedule() {
        const delay =
            Math.random() * (maxDelay - minDelay) + minDelay +
            Math.random() * 2000; // small jitter

        setTimeout(() => {
            if (!audio) return;
            audio.currentTime = 0;
            audio.play().catch(() => { });
            schedule();
        }, delay);
    }

    schedule();
}

function startPlanchetteSound(duration) {
    if (!audioPlanchette) return;

    // Create a brand-new audio instance every time
    const sound = audioPlanchette.cloneNode(true);

    sound.volume = 0.35;
    sound.currentTime = Math.random() * 0.12;

    console.log("▶️ Planchette sound playing");
    sound.play().catch(() => { });

    // Fade out near the end of movement
    const fadeTime = 300;
    setTimeout(() => {
        const step = sound.volume / (fadeTime / 50);
        const fade = setInterval(() => {
            sound.volume = Math.max(0, sound.volume - step);
            if (sound.volume <= 0.02) {
                sound.pause();
                clearInterval(fade);
            }
        }, 50);
    }, Math.max(0, duration - fadeTime));
}


function fadeOutAudio(audio, fadeTime = 400) {
    const step = audio.volume / (fadeTime / 50);

    const fade = setInterval(() => {
        audio.volume = Math.max(0, audio.volume - step);
        if (audio.volume <= 0.02) {
            audio.pause();
            audio.volume = 0.35;
            clearInterval(fade);
        }
    }, 50);
}


/* --- STORAGE --- */

function saveState() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ progress, verifiedCodes })
    );
}

function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
        const state = JSON.parse(raw);
        progress = state.progress || 0;
        verifiedCodes = state.verifiedCodes || [];
    } catch {
        console.warn("Failed to parse stored progress");
    }
}

/* --- UI RESTORE --- */

function restoreUI() {
    verifiedCodes.forEach((code) => {
        const index = VALID_CODES.indexOf(code);
        if (index === -1) return;

        const slot = slots[index];
        slot.classList.add("verified");
        slot.querySelector(".slot-status").textContent = "VERIFIED";
    });

    if (progress >= 1) {
        panel.classList.add("stage-1");
        document.body.classList.add("stage-1");
        status.textContent = "Status: Anomaly detected";
        playRandomly(audioStage1, 30000, 50000);
    }

    if (progress >= 2) {
        panel.classList.add("stage-2");
        document.body.classList.add("stage-2");
        instruction.textContent = "Multiple anomalies confirmed.";
        status.textContent = "Status: Pattern emerging";
        playRandomly(audioStage2, 20000, 45000);
    }

    if (progress >= 3) {
        panel.classList.add("stage-3");
        document.body.classList.add("stage-3");
        document.body.classList.add("ouija-active");
        loopOuijaPath(TEST_OUIJA_PATH);

        instruction.textContent =
            "Primary evidence complete. Secondary analysis required.";
        status.textContent =
            "Status: Manual communication recommended";

        input.disabled = true;
        input.placeholder = "Input locked";

        if (audioStage3) {
            audioStage3.play().catch(() => { });
        }
    }
}

/* --- INPUT HANDLER --- */

input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;

    const value = input.value.trim().toUpperCase();
    input.value = "";

    if (!VALID_CODES.includes(value)) {
        status.textContent = "Status: Invalid authorization code";
        return;
    }

    if (verifiedCodes.includes(value)) {
        status.textContent = "Status: Evidence already logged";
        return;
    }

    const index = VALID_CODES.indexOf(value);
    const slot = slots[index];

    /* --- VERIFY --- */

    slot.classList.add("verified");
    slot.querySelector(".slot-status").textContent = "VERIFIED";

    verifiedCodes.push(value);
    progress++;

    saveState();

    /* --- PROGRESSION --- */

    if (progress === 1) {
        panel.classList.add("stage-1");
        document.body.classList.add("stage-1");
        status.textContent = "Status: Anomaly detected";
        playRandomly(audioStage1, 30000, 50000);
    }

    if (progress === 2) {
        panel.classList.add("stage-2");
        document.body.classList.add("stage-2");
        instruction.textContent = "Multiple anomalies confirmed.";
        status.textContent = "Status: Pattern emerging";
        playRandomly(audioStage2, 20000, 45000);
    }

    if (progress === 3) {
        panel.classList.add("stage-3");
        document.body.classList.add("stage-3");
        setTimeout(() => {
            document.body.classList.add("ouija-active");
            loopOuijaPath(TEST_OUIJA_PATH);
        }, 2500);

        instruction.textContent =
            "Primary evidence complete. Secondary analysis required.";
        status.textContent =
            "Status: Manual communication recommended";

        if (audioStage3) {
            audioStage3.play().catch(() => { });
        }

        input.disabled = true;
        input.placeholder = "Input locked";
    }
});


finalInput.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;

    const value = finalInput.value.trim().toUpperCase();

    if (value !== "REVEAL") {
        finalInput.value = "";
        return;
    }

    triggerFinalReveal();
});



/* ========================= */
/* OUIJA PLANCHETTE ENGINE */
/* ========================= */

const planchette = document.getElementById("planchette");

/**
 * Move planchette to a normalized board position.
 * x, y = percentages (0–100)
 * rotation = degrees
 * duration = milliseconds
 */
function movePlanchette(x, y, rotation = 0, duration = 2500) {
    if (!planchette) return;

    planchette.style.transitionDuration = `${duration}ms`;
    planchette.style.left = `${x}%`;
    planchette.style.top = `${y}%`;
    planchette.style.setProperty("--rot", `${rotation}deg`);

}

/**
 * Promise-based delay helper
 */
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}



// /* ========================= */
// /* PLANCHETTE MICRO JITTER */
// /* ========================= */

// let jitterInterval = null;

// function startMicroJitter(element) {
//     if (jitterInterval) return;

//     let offsetX = 0;
//     let offsetY = 0;

//     // Disable smoothing so jitter is visible
//     element.style.setProperty("--transform-time", "0ms");

//     jitterInterval = setInterval(() => {
//         offsetX += (Math.random() - 0.5) * 5;
//         offsetY += (Math.random() - 0.5) * 5;

//         offsetX = Math.max(-3, Math.min(3, offsetX));
//         offsetY = Math.max(-3, Math.min(3, offsetY));

//         element.style.setProperty("--jx", `${offsetX}px`);
//         element.style.setProperty("--jy", `${offsetY}px`);
//     }, 80);
// }


// function stopMicroJitter(element) {
//     clearInterval(jitterInterval);
//     jitterInterval = null;

//     element.style.setProperty("--jx", "0px");
//     element.style.setProperty("--jy", "0px");

//     // Restore smooth motion
//     element.style.setProperty("--transform-time", "2.5s");
// }



/**
 * Runs a sequence of planchette movements
 * Path format:
 * { x, y, rotate, pause }
 */
async function runOuijaPath(path) {
    for (const step of path) {
        const duration = step.duration || 2500;

        movePlanchette(
            step.x,
            step.y,
            step.rotate || 0,
            duration
        );

        // 🔊 START SOUND EXACTLY WITH MOTION
        startPlanchetteSound(duration);

        // Movement time (no jitter)
        await wait(duration);

    }
}

/* ========================= */
/* OUIJA LOOP CONTROLLER */
/* ========================= */

async function loopOuijaPath(path, endPause = 4000) {
    while (true) {
        await runOuijaPath(path);
        await wait(endPause);
    }
}


function triggerFinalReveal() {
    console.log("✨ Final reveal unlocked");

    // Stop Ouija motion if you want
    // (optional — loopOuijaPath runs forever otherwise)
    // location.reload(); OR add a stop flag if desired

    document.body.classList.add("reveal-active");

    // Hide Ouija input
    finalInput.blur();
}



/* ========================= */
/* TEST PATH (SAFE TO EDIT) */
/* ========================= */

const TEST_OUIJA_PATH = [
    { x: 38, y: 62, rotate: 0, pause: 800 },
    { x: 41, y: 44, rotate: 0, pause: 800 },
    { x: 64, y: 58, rotate: 0, pause: 800 },
    { x: 14, y: 53, rotate: 0, pause: 800 },
    { x: 70, y: 49, rotate: 0, pause: 1200 }
];


/* --- INIT --- */

["pointerdown", "touchstart", "mousedown", "keydown"].forEach(event => {
    window.addEventListener(event, unlockAudioOnce, { once: true });
});

loadState();
restoreUI();