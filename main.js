const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const { extractTranscriptFromVideo } = require("./backend/extract");
const { translateTranscriptionToArabic } = require('./backend/translate');
const subtitleExporter = require(path.join(__dirname, "backend", "subtitle_exporter"));
const whisperOutputFolder = path.join(__dirname, "backend", "whisper", "output");
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
// ---------------------------------
// Load translated JSON
// ---------------------------------
ipcMain.handle("load-translated", async () => {
  // Ensure folder exists
  if (!fs.existsSync(whisperOutputFolder)) {
    return { success: false, error: "output folder not found: " + whisperOutputFolder };
  }
  return subtitleExporter.loadTranslated(whisperOutputFolder);
});

// ---------------------------------
// Save edited JSON
// payload: { path: <pathToFileOrNull>, data: segmentsArray }
// ---------------------------------
ipcMain.handle("save-edited", async (_, payload) => {
  try {
    const out = subtitleExporter.saveEdited(whisperOutputFolder, payload.path, payload.data);
    return out;
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ---------------------------------
// Export SRT
// payload: { data: segmentsArray }
// ---------------------------------
ipcMain.handle("export-srt", async (_, payload) => {
  try {
    const out = subtitleExporter.exportSrt(whisperOutputFolder, payload.data);
    return out;
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ---------------------------------
// Open output folder in OS file explorer
// ---------------------------------
ipcMain.handle("open-output-folder", async () => {
  try {
    if (!fs.existsSync(whisperOutputFolder)) fs.mkdirSync(whisperOutputFolder, { recursive: true });
    await shell.openPath(whisperOutputFolder);
    return { success: true, path: whisperOutputFolder };
  } catch (err) {
    return { success: false, error: err.message };
  }
});
