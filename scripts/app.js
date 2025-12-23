console.log("app.js loaded");

/* --- DOM --- */

const input = document.getElementById("code");
const status = document.getElementById("status");
const panel = document.getElementById("panel");
const instruction = document.getElementById("instruction");
const slots = document.querySelectorAll(".evidence-slot");

/* --- AUDIO (OPTIONAL / SAFE) --- */

const audioStage1 = document.getElementById("audio-stage-1");
const audioStage2 = document.getElementById("audio-stage-2");
const audioStage3 = document.getElementById("audio-stage-3");

/* --- STORAGE KEYS --- */

const STORAGE_KEY = "phasmo_progress";

/* --- DATA --- */

const VALID_CODES = ["EMF-05", "UV-PRINT", "GHOST-ORB"];
let progress = 0;
let verifiedCodes = [];

/* --- AUDIO HELPERS --- */

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

/* --- INIT --- */

loadState();
restoreUI();