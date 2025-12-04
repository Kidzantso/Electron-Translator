// preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  // existing APIs you already had
  selectVideo: () => ipcRenderer.invoke("select-video"),
  extractTranscript: (videoPath) => ipcRenderer.invoke("extract-transcript", videoPath),
  translateTranscript: (jsonPath) => ipcRenderer.invoke("translate-transcript", jsonPath),

  // Milestone 3 APIs
  loadTranslated: () => ipcRenderer.invoke("load-translated"),
  saveEdited: (payload) => ipcRenderer.invoke("save-edited", payload),
  exportSrt: (payload) => ipcRenderer.invoke("export-srt", payload),
  openOutputFolder: () => ipcRenderer.invoke("open-output-folder"),
  burnVideo: (payload) => ipcRenderer.invoke("burn-video", payload)
});
