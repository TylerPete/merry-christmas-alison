console.log("app.js loaded");

const input = document.getElementById("code");
const status = document.getElementById("status");
const panel = document.getElementById("panel");
const instruction = document.getElementById("instruction");
const slots = document.querySelectorAll(".evidence-slot");

/* --- AUDIO --- */

const audioStage1 = document.getElementById("audio-stage-1");
const audioStage2 = document.getElementById("audio-stage-2");
const audioStage3 = document.getElementById("audio-stage-3");

function playRandomly(audio, minDelay, maxDelay) {
    function schedule() {
        const delay = Math.random() * (maxDelay - minDelay) + minDelay;
        setTimeout(() => {
            audio.currentTime = 0;
            audio.play();
            schedule();
        }, delay);
    }
    schedule();
}

/* --- LOGIC --- */

const VALID_CODES = ["EMF-05", "UV-PRINT", "GHOST-ORB"];
let progress = 0;

input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;

    const value = input.value.trim().toUpperCase();
    input.value = "";

    if (!VALID_CODES.includes(value)) {
        status.textContent = "Status: Invalid authorization code";
        return;
    }

    const index = VALID_CODES.indexOf(value);
    const slot = slots[index];

    if (slot.classList.contains("verified")) {
        status.textContent = "Status: Evidence already logged";
        return;
    }

    /* --- VERIFY SLOT --- */

    slot.classList.add("verified");
    slot.querySelector(".slot-status").textContent = "VERIFIED";
    progress++;

    /* --- PROGRESSION STATES --- */

    if (progress === 1) {
        panel.classList.add("stage-1");
        document.body.classList.add("stage-1");
        status.textContent = "Status: Anomaly detected";
        playRandomly(audioStage1, 30000, 45000);
    }

    if (progress === 2) {
        panel.classList.add("stage-2");
        document.body.classList.add("stage-2");
        instruction.textContent = "Multiple anomalies confirmed.";
        status.textContent = "Status: Pattern emerging";
        playRandomly(audioStage2, 20000, 40000);
    }

    if (progress === 3) {
        panel.classList.add("stage-3");
        document.body.classList.add("stage-3");
        instruction.textContent =
            "Primary evidence complete. Secondary analysis required.";
        status.textContent =
            "Status: Manual communication recommended";

        audioStage3.play();

        input.disabled = true;
        input.placeholder = "Input locked";
    }
});
