const countEl = document.getElementById("count");
const bridgeStatusEl = document.getElementById("bridgeStatus");
const lastEventEl = document.getElementById("lastEvent");

const testEventBtn = document.getElementById("testEventBtn");
const resetBtn = document.getElementById("resetBtn");

let lastMotionAt = 0;
const eventCooldownMs = 1200;
const pollIntervalMs = 1000;
let latestCount = 0;

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
  latestCount = data.count ?? 0;
  updateCount(latestCount);
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
    latestCount = data.count ?? 0;
    updateCount(latestCount);
    updateLastEvent(`Laatste event: ${source} om ${formatNow()}`);
  } catch (error) {
    updateLastEvent(`Fout bij tellen: ${error.message}`);
  }
}

async function resetCounter() {
  try {
    const data = await api("reset");
    latestCount = data.count ?? 0;
    updateCount(latestCount);
    updateLastEvent("Teller gereset.");
  } catch (error) {
    updateLastEvent(`Reset mislukt: ${error.message}`);
  }
}

async function syncCountFromServer() {
  try {
    const response = await fetch("api.php?action=get");
    if (!response.ok) {
      throw new Error(`API fout (${response.status})`);
    }

    const data = await response.json();
    const serverCount = data.count ?? 0;

    if (serverCount !== latestCount) {
      latestCount = serverCount;
      updateCount(latestCount);
      updateLastEvent(`Nieuwe fles gedetecteerd via bridge om ${formatNow()}`);
    }

    bridgeStatusEl.textContent = "Bridge status: verbonden (live updates actief).";
  } catch (error) {
    bridgeStatusEl.textContent = `Bridge status: geen verbinding (${error.message}).`;
  }
}

testEventBtn.addEventListener("click", () => registerBottle("testknop"));
resetBtn.addEventListener("click", resetCounter);

loadCount().catch((error) => {
  updateLastEvent(`Kon teller niet laden: ${error.message}`);
});

setInterval(syncCountFromServer, pollIntervalMs);