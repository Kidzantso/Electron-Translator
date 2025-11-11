const selectBtn = document.getElementById("selectVideo");
const extractBtn = document.getElementById("extract");
const translateBtn = document.getElementById("translate");
const outputDiv = document.getElementById("output");

let selectedVideo = null;
let transcriptionJsonPath = null;

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

  outputDiv.innerText = "Extracting transcript...";

  const result = await window.api.extractTranscript(selectedVideo);

  if (result.error) {
    outputDiv.innerText = `Error: ${result.error}`;
  } else {
    // result = path to transcription.json
    transcriptionJsonPath = result;
    outputDiv.innerText = `Transcript saved at:\n${result}`;
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

  outputDiv.innerText = "Translating to Arabic...";

  const result = await window.api.translateTranscript(transcriptionJsonPath);

  if (result.success) {
    outputDiv.innerText = `✅ Arabic translation saved:\n${result.path}`;
  } else {
    outputDiv.innerText = `❌ Translation error: ${result.error}`;
  }
};
