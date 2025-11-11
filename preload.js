// preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  selectVideo: () => ipcRenderer.invoke("select-video"),
  extractTranscript: (videoPath) => ipcRenderer.invoke("extract-transcript", videoPath),
  translateTranscript: (jsonPath) => ipcRenderer.invoke("translate-transcript", jsonPath)
});
