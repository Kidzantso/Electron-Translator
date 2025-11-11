const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { extractTranscriptFromVideo } = require("./backend/extract");
const { translateTranscriptionToArabic } = require('./backend/translate');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadFile("renderer/index.html");
}

app.whenReady().then(createWindow);

ipcMain.handle("select-video", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "Videos", extensions: ["mp4", "mkv", "mov", "avi"] }]
  });
  if (result.canceled) return null;
  return result.filePaths[0];
});

ipcMain.handle("extract-transcript", async (event, videoPath) => {
  try {
    const transcriptionPath = await extractTranscriptFromVideo(videoPath);
    return transcriptionPath; // path to the clean JSON
  } catch (err) {
    console.error(err);
    return { error: err.message };
  }
});

// in main.js (require at top)

// add handler
ipcMain.handle("translate-transcript", async (event, transcriptionJsonPath) => {
  try {
    const outPath = await translateTranscriptionToArabic(transcriptionJsonPath);
    return { success: true, path: outPath };
  } catch (err) {
    console.error('Translation error', err);
    return { success: false, error: err.message };
  }
});
