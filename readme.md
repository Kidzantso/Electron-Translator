# Auto-Burning Video Translator

A desktop app that takes a video, extracts its audio, generates a transcript using **Whisper**, translates it to Arabic, and burns the translation as subtitles. Users can also edit the translated text with timing before exporting.

---

## 🏁 Milestone 1: Transcript Extraction

This milestone focuses on:

* Selecting a video through a user-friendly UI.
* Automatic audio extraction from video (FFmpeg).
* Speech-to-text transcription using **Whisper**.
* Output JSON containing **timestamps and transcription only**.

---

## 🏆 Milestone 2: Arabic Translation

This milestone adds:

* Automatic translation of the extracted transcript to **Arabic**.
* Saving the translated transcript as `transcription_ar.json` **beside the original transcript**.
* Using **Helsinki-NLP MarianMT** via Python and Transformers.
* The translation works seamlessly with the Electron UI using a button.

**Notes:**

* Translation preserves timestamps from the original transcription.
* Users do **not yet** edit subtitles; that comes in Milestone 3.

---

## Features (Milestone 1-2)

* Select a video via the Electron UI.
* Automatic extraction of audio from the video. 
* Whisper CLI generates transcription with timestamps.
* Clean transcription.json output ready for translation.
* Translate the transcript to Arabic with timestamps.
* Output `transcription_ar.json` in `backend/whisper/output/` beside `transcription.json`.

---

## Requirements

1. **Electron** (Node.js desktop app)
2. **Whisper CLI** (`whisper-cli.exe` and required DLLs)
3. **Whisper model** (e.g., `ggml-small.bin`)
4. **FFmpeg** (`ffmpeg.exe`)
5. **Python 3** with packages:

   ```bash
   pip install --upgrade pip
   pip install transformers sentencepiece torch
   pip install hf_xe
   ```
6. Optional (recommended to remove warnings):

   ```bash
   pip install sacremoses
   ```

---

## Setup Instructions

```
npm init -y 
npm install electron --save-dev
```

### 1. Install Whisper CLI

Download the latest release of **Whisper CLI**:

[Whisper CLI Releases](https://github.com/ggml-org/whisper.cpp/releases)

* Extract into `backend/whisper/`:

```
backend/whisper/
```

* Must contain:

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

* Example: `ggml-small.bin`
* Place inside:

```
backend/whisper/models/
```

---

### 3. Install FFmpeg

Official Windows builds:

[FFmpeg Windows Builds](https://www.gyan.dev/ffmpeg/builds/)

* Download **Release Essentials** zip (64-bit)
* Extract inside:

```
backend/ffmpeg/
```

* Folder structure:

```
backend/ffmpeg/bin/ffmpeg.exe
backend/ffmpeg/doc/
backend/ffmpeg/presets/
```

---

### 4. Install Python Dependencies

```bash
pip install --upgrade pip
pip install transformers sentencepiece torch
pip install hf_xe
# Optional: to remove warnings
pip install sacremoses
```

---

### 5. Running the App

1. Open a terminal in the project folder.
2. Install dependencies:

```bash
npm install
```

3. Start Electron:

```bash
npm start
```

---

### 6. Usage

1. Click **Select Video** to choose your video file.
2. Click **Extract Transcript**.
3. The app will:

   * Extract audio using FFmpeg.
   * Run Whisper CLI to generate transcription.
   * Save `transcription.json` in `backend/whisper/output/`.
4. Click **Translate to Arabic** (Milestone 2):

   * Runs the Python translation script.
   * Saves `transcription_ar.json` beside the original transcript.
5. Both JSON files contain **timestamps** for each segment.

---

### Notes

* Ensure `ffmpeg.exe` points to `backend/ffmpeg/bin/ffmpeg.exe`.
* Whisper CLI only accepts **audio files**; audio is extracted automatically.
* Milestone 2 **does not yet include subtitle editing or burning**.
* Python translation uses **CPU by default**; GPU can be enabled if available.

---

### Folder Structure

```
Translator/
├─ backend/
│  ├─ extract.js
│  ├─ translate.js
│  ├─ translate_transcription.py
│  ├─ whisper/
│  │  ├─ whisper-cli.exe
│  │  ├─ whisper.dll
│  │  ├─ ggml.dll
│  │  ├─ <other dlls & files>
│  │  ├─ output/
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
