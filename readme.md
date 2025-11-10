# Auto-Burning Video Translator

A desktop app that takes a video, extracts its audio, generates a transcript using **Whisper**, translates it to Arabic, and burns the translation as subtitles. Users can also edit the translated text with timing before exporting.

---

## 🏁 Milestone 1: Transcript Extraction

This milestone focuses on:

- Selecting a video through a user-friendly UI.
- Automatic audio extraction from video (FFmpeg).
- Speech-to-text transcription using **Whisper**.
- Output JSON containing **timestamps and transcription only**.

Future milestones will cover translation, editing, and subtitle burning.

---

## Features (Milestone 1)

- Select a video via the Electron UI.
- Automatic extraction of audio from the video.
- Whisper CLI generates transcription with timestamps.
- Clean `transcription.json` output ready for translation.

---

## Requirements

1. **Electron** (Node.js desktop app)
2. **Whisper CLI** (`whisper-cli.exe` and required DLLs)
3. **Whisper model** (e.g., `ggml-small.bin`)
4. **FFmpeg** (`ffmpeg.exe`)

---

## Setup Instructions

```
npm init -y
npm install electron --save-dev
```

### 1. Install Whisper CLI

Download the latest release of **Whisper CLI**:

[Whisper CLI Releases](https://github.com/ggml-org/whisper.cpp/releases)

- Extract the release folder into your project:

```
backend/whisper/
```

- Ensure it contains:

```
whisper-cli.exe
whisper.dll
ggml.dll
other required DLLs
models/
```

---

### 2. Download Whisper Model

Choose a model from the official repository:

[Whisper Models on Hugging Face](https://huggingface.co/ggerganov/whisper.cpp/tree/main)

- Example: `ggml-small.bin`
- Place it inside the `backend/whisper/models/` folder.

---

### 3. Install FFmpeg

Go to the official Windows builds:

[FFmpeg Windows Builds](https://www.gyan.dev/ffmpeg/builds/)

- Download **Release Essentials** zip (latest version, 64-bit)
- Extract it inside your project:

```

backend/ffmpeg/

```

- The folder structure should be:

```

backend/ffmpeg/bin/ffmpeg.exe
backend/ffmpeg/doc/
backend/ffmpeg/presets/

````

---

### 4. Running the App

1. Open a terminal in your project folder.
2. Install dependencies:

```bash
npm install
````

3. Start Electron:

```bash
npm start
```

---

### 5. Usage

1. Click **Select Video** to choose your video file.
2. Click **Extract Transcript**.
3. The app will:

   * Extract audio using FFmpeg.
   * Run Whisper CLI to generate transcription.
   * Save `transcription.json` in `backend/whisper/output/`.
4. `transcription.json` contains only the **timestamps and text**.

---

### Notes

* Ensure `ffmpeg.exe` is correctly pointing to `backend/ffmpeg/bin/ffmpeg.exe`.
* Whisper CLI only accepts **audio files**. The app automatically extracts audio from video.
* This milestone does **not include translation** or subtitle burning yet.

---

### Folder Structure

```
Translator/
├─ backend/
│  ├─ extract.js
│  ├─ whisper/
│  │  ├─ whisper-cli.exe
│  │  ├─ whisper.dll
│  │  ├─ ggml.dll
│  │  ├─ <other dlls & files>
│  │  └─ models/
│  │      └─ ggml-small.bin
│  └─ ffmpeg/
│      └─ bin/
│          └─ ffmpeg.exe
├─ main.js
├─ preload.js
├─ renderer/
│  ├─ index.html
│  └─ renderer.js
└─ package.json
```
