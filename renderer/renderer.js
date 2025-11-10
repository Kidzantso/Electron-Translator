const selectBtn = document.getElementById("selectVideo");
const extractBtn = document.getElementById("extract");
const outputDiv = document.getElementById("output");

let selectedVideo = null;

selectBtn.onclick = async () => {
  selectedVideo = await window.api.selectVideo();
  outputDiv.innerText = selectedVideo ? `Selected: ${selectedVideo}` : "No file selected";
};

extractBtn.onclick = async () => {
  if (!selectedVideo) return alert("Select a video first!");
  outputDiv.innerText = "Extracting transcript...";
  const result = await window.api.extractTranscript(selectedVideo);
  if (result.error) {
    outputDiv.innerText = `Error: ${result.error}`;
  } else {
    outputDiv.innerText = `Transcript saved: ${result}`;
  }
};
