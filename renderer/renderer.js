const selectBtn = document.getElementById("selectVideo");
const extractBtn = document.getElementById("extract");
const translateBtn = document.getElementById("translate");
const outputDiv = document.getElementById("output");
const loadBtn = document.getElementById("loadBtn");
const saveBtn = document.getElementById("saveBtn");
const exportBtn = document.getElementById("exportBtn");
const statusText = document.getElementById("statusText");
const tableBody = document.querySelector("#subsTable tbody");
const preview = document.getElementById("preview");
const burnBtn = document.getElementById("burnBtn");   // NEW

let selectedVideo = null;
let transcriptionJsonPath = null;

// new tracking for Milestone 5
let lastExportedSrt = null;

// ------------------------------------------------------
// SELECT VIDEO
// ------------------------------------------------------
selectBtn.onclick = async () => {
  selectedVideo = await window.api.selectVideo();
  outputDiv.innerText = selectedVideo
    ? `Selected: ${selectedVideo}`
    : "No file selected";
};

// ------------------------------------------------------
// EXTRACT TRANSCRIPT
// ------------------------------------------------------
extractBtn.onclick = async () => {
  if (!selectedVideo) {
    alert("Select a video first!");
    return;
  }
  showLoading("Extracting transcript…");
  const result = await window.api.extractTranscript(selectedVideo);
  hideLoading();
  if (result.error) {
    alert(`Error: ${result.error}`);
  } else {
    transcriptionJsonPath = result;
    notify("Transcript extracted successfully ✔");
  }
};

// ------------------------------------------------------
// TRANSLATE TO ARABIC
// ------------------------------------------------------
translateBtn.onclick = async () => {
  if (!transcriptionJsonPath) {
    alert("Please extract the transcript first!");
    return;
  }
  showLoading("Translating to Arabic…");

  const result = await window.api.translateTranscript(transcriptionJsonPath);
  hideLoading();

  if (result.success) {
    notify("Arabic translation saved ✔");
  } else {
    alert("Error translating: " + result.error);
  }
};

// ------------------------------------------------------
let segments = [];        
let currentFilePath = null;

function setStatus(s) { statusText.innerText = s; }

function clearTable() {
  tableBody.innerHTML = "";
}

function renderTable() {
  clearTable();
  segments.forEach((seg, idx) => {
    const tr = document.createElement("tr");

    // index cell
    const tdIndex = document.createElement("td");
    tdIndex.innerText = idx + 1;
    tr.appendChild(tdIndex);

    // start time
    const tdStart = document.createElement("td");
    const inStart = document.createElement("input");
    inStart.type = "text";
    inStart.value = seg.timestamps?.from ?? seg.start ?? "";
    inStart.addEventListener("change", (e) => {
      seg.timestamps = seg.timestamps || {};
      seg.timestamps.from = e.target.value;
      updatePreview();
      markDirty();
    });
    tdStart.appendChild(inStart);
    tr.appendChild(tdStart);

    // end time
    const tdEnd = document.createElement("td");
    const inEnd = document.createElement("input");
    inEnd.type = "text";
    inEnd.value = seg.timestamps?.to ?? seg.end ?? "";
    inEnd.addEventListener("change", (e) => {
      seg.timestamps = seg.timestamps || {};
      seg.timestamps.to = e.target.value;
      updatePreview();
      markDirty();
    });
    tdEnd.appendChild(inEnd);
    tr.appendChild(tdEnd);

    // Arabic text
    const tdText = document.createElement("td");
    const ta = document.createElement("textarea");
    ta.className = "arabic";
    ta.rows = 2;
    ta.value = seg.text_ar ?? seg.text ?? "";
    ta.addEventListener("input", (e) => {
      seg.text_ar = e.target.value;
      updatePreview();
      markDirty();
    });
    tdText.appendChild(ta);
    tr.appendChild(tdText);

    tableBody.appendChild(tr);
  });

  updatePreview();
}

let isDirty = false;
function markDirty() {
  if (!isDirty) {
    isDirty = true;
    saveBtn.disabled = false;
    exportBtn.disabled = false;
  }
}

function updatePreview() {
  const previewText = segments.map((seg, i) => {
    const start = seg.timestamps?.from ?? seg.start ?? "";
    const end = seg.timestamps?.to ?? seg.end ?? "";
    const text = seg.text_ar ?? seg.text ?? "";
    return `${i + 1}. [${start} -> ${end}]\n${text}\n`;
  }).join("\n");
  preview.innerText = previewText;
}

async function loadTranslated() {
  setStatus("loading...");
  try {
    const res = await window.api.loadTranslated();
    if (!res || !res.success) {
      setStatus("load failed");
      alert("Failed to load translated file: " + (res?.error || "unknown"));
      return;
    }
    segments = res.data;
    currentFilePath = res.path;
    isDirty = false;
    saveBtn.disabled = true;
    exportBtn.disabled = false;
    renderTable();
    setStatus("loaded");
  } catch (err) {
    console.error(err);
    setStatus("error");
    alert("Error loading translated file: " + err);
  }
}

async function saveEdited() {
  if (!currentFilePath) {
    alert("No file currently loaded");
    return;
  }
  setStatus("saving...");
  try {
    const res = await window.api.saveEdited({ path: currentFilePath, data: segments });
    if (res.success) {
      isDirty = false;
      saveBtn.disabled = true;
      setStatus("saved");
      alert("Saved edited JSON:\n" + res.path);
    } else {
      setStatus("save failed");
      alert("Save failed: " + res.error);
    }
  } catch (err) {
    setStatus("error");
    alert("Save error: " + err);
  }
}

async function exportSrt() {
  setStatus("exporting...");
  try {
    const res = await window.api.exportSrt({ data: segments });
    if (res.success) {
      lastExportedSrt = res.path; // NEW
      burnBtn.disabled = false;   // enable burn button
      setStatus("exported");
      alert("SRT exported:\n" + res.path);
    } else {
      setStatus("export failed");
      alert("Export failed: " + res.error);
    }
  } catch (err) {
    setStatus("error");
    alert("Export error: " + err);
  }
}

loadBtn.addEventListener("click", loadTranslated);
saveBtn.addEventListener("click", saveEdited);
exportBtn.addEventListener("click", exportSrt);

// ------------------------------------------------------
// BURN SUBTITLES — Milestone 5
// ------------------------------------------------------
burnBtn.onclick = async () => {
  if (!selectedVideo) {
    alert("Select a video first!");
    return;
  }
  if (!segments || segments.length === 0) {
    alert("Export subtitles to SRT first!");
    return;
  }

  // Export SRT before burning
  const srtRes = await window.api.exportSrt({ data: segments });
  if (!srtRes.success) {
    alert("Failed to export SRT: " + srtRes.error);
    return;
  }

  showLoading("Burning subtitles into video…");
  const result = await window.api.burnVideo({ videoPath: selectedVideo, srtPath: srtRes.path });
  hideLoading();

  if (result.success) {
    notify("Burned video saved:\n" + result.path);
  } else {
    alert("Burn failed: " + result.error);
  }
};
// ------------------------------------------------------
function showLoading(message) {
  document.getElementById("loadingMessage").innerText = message || "Processing…";
  document.getElementById("loadingOverlay").style.display = "flex";
}

function hideLoading() {
  document.getElementById("loadingOverlay").style.display = "none";
}

function notify(msg) {
  statusText.innerText = msg;
  statusText.style.color = "#21a021";

  setTimeout(() => {
    statusText.innerText = "idle";
    statusText.style.color = "#555";
  }, 4000);
}
