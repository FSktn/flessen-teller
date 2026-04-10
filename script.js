const countEl = document.getElementById("count");
const serialStatusEl = document.getElementById("serialStatus");
const lastEventEl = document.getElementById("lastEvent");

const connectSerialBtn = document.getElementById("connectSerialBtn");
const testEventBtn = document.getElementById("testEventBtn");
const resetBtn = document.getElementById("resetBtn");

let lastMotionAt = 0;
const eventCooldownMs = 1200;

// regels van de arduino die tellen als gedetecteerde fles
const MOTION_TOKENS = ["MOTION", "DETECTED", "1"];

// helper om php api acties aan te roepen
async function api(action) {
  const response = await fetch(`api.php?action=${encodeURIComponent(action)}`, {
    method: "POST"
  });

  if (!response.ok) {
    throw new Error(`API fout (${response.status})`);
  }

  return response.json();
}

async function loadCount() {
  const response = await fetch("api.php?action=get");
  const data = await response.json();
  updateCount(data.count ?? 0);
}

function updateCount(value) {
  countEl.textContent = String(value);
}

function updateLastEvent(text) {
  lastEventEl.textContent = text;
}

function canCountNow() {
  const now = Date.now();
  // cooldown voorkomt dubbele tellingen bij een lange detectie
  const allowed = now - lastMotionAt > eventCooldownMs;
  if (allowed) {
    lastMotionAt = now;
  }
  return allowed;
}

function formatNow() {
  return new Date().toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

async function registerBottle(source) {
  if (!canCountNow()) {
    return;
  }

  try {
    const data = await api("increment");
    updateCount(data.count ?? 0);
    updateLastEvent(`Laatste event: ${source} om ${formatNow()}`);
  } catch (error) {
    updateLastEvent(`Fout bij tellen: ${error.message}`);
  }
}

async function resetCounter() {
  try {
    const data = await api("reset");
    updateCount(data.count ?? 0);
    updateLastEvent("Teller gereset.");
  } catch (error) {
    updateLastEvent(`Reset mislukt: ${error.message}`);
  }
}

async function connectSerial() {
  if (!("serial" in navigator)) {
    serialStatusEl.textContent = "Seriele status: Web Serial wordt niet ondersteund in deze browser.";
    return;
  }

  try {
    const port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600 });
    serialStatusEl.textContent = "Seriele status: verbonden met Arduino.";

    const decoder = new TextDecoder();
    let buffer = "";
    const reader = port.readable.getReader();

    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || "";

      // verwerk complete seriele regels en reageer op motion tokens
      for (const rawLine of lines) {
        const line = rawLine.trim().toUpperCase();
        if (MOTION_TOKENS.some((token) => line.includes(token))) {
          await registerBottle("motion sensor");
        }
      }
    }
  } catch (error) {
    serialStatusEl.textContent = `Seriele status: fout (${error.message}).`;
  }
}

// koppel knoppen na het laden van het script
connectSerialBtn.addEventListener("click", connectSerial);
testEventBtn.addEventListener("click", () => registerBottle("testknop"));
resetBtn.addEventListener("click", resetCounter);

loadCount().catch((error) => {
  updateLastEvent(`Kon teller niet laden: ${error.message}`);
});