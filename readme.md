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

## 🎨 Milestone 3: Subtitle Editor

This milestone adds:

* A **subtitle editor table** in the Electron UI.
* Ability to **load translated transcripts**, view timestamps, and edit Arabic text.
* Buttons to **save edited transcripts** and **export SRT files**.
* Proper **status messages** and a **loading overlay** when extracting or translating.
* Right-to-left layout for Arabic subtitles in the editor.

**Notes:**

* Editing preserves timestamps.
* Loading, saving, and exporting happen entirely from the Electron UI.

---

## 🔥 Milestone 4: Burning Subtitles

This milestone adds:

* Automatic conversion of exported SRT files into ASS format.
* Creation of a safe `C:/subs` directory if not already present.
* Copying subtitles into `C:/subs/test.ass`.
* Burning subtitles into the video using FFmpeg with the exact working command:

  ```bash
  ffmpeg -y -i "C:/Users/dodom/Downloads/JustCode - Made with Clipchamp.mp4" -vf "ass=C\\:\\\\subs\\\\test.ass" "C:/Users/dodom/Downloads/burned_test.mp4"
  ```

**Important Note:**  
Users must **watch where FFmpeg is located**. In our setup, we bundled FFmpeg inside `backend/ffmpeg/bin/ffmpeg.exe`. If FFmpeg is installed elsewhere, update the path in `burn.js` accordingly. The app will fail with `ENOENT` if the executable cannot be found.

---

## Features (Milestones 1-4)

* Select a video via the Electron UI.
* Automatic extraction of audio using FFmpeg.
* Whisper CLI generates transcription with timestamps.
* Translate the transcript to Arabic with timestamps.
* Load and edit Arabic subtitles in a table editor.
* Save edited transcripts and export as SRT files.
* Convert SRT → ASS and burn subtitles into video.
* Output JSONs: `transcription.json` and `transcription_ar.json` in `backend/whisper/output/`.

---

## Requirements

1. **Electron** (Node.js desktop app)
2. **Whisper CLI** (`whisper-cli.exe` and required DLLs)
3. **Whisper model** (e.g., `ggml-small.bin`)
4. **FFmpeg** (`ffmpeg.exe`) → ⚠️ Ensure the path is correct!
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
4. Click **Translate to Arabic**:

   * Runs the Python translation script.
   * Saves `transcription_ar.json` beside the original transcript.
5. Click **Load Translated Transcript** (Milestone 3):

   * Displays Arabic text in the editable subtitle table.
   * Allows saving edits and exporting as SRT.
6. Click **Burn Subtitles** (Milestone 4):

   * Converts `.srt` → `.ass`.
   * Copies into `C:/subs/test.ass`.
   * Runs FFmpeg with the exact escaped command.
   * Outputs `burned_test.mp4` in your Downloads folder.
7. Status messages appear during extraction, translation, editing, and burning.
8. A **loading overlay** shows when processing.

---

## Folder Structure

```
Translator/
├─ backend/
│  ├─ extract.js
│  ├─ translate.js
│  ├─ translate_transcription.py
│  ├─ burn.js
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
## 📝 Notes & Troubleshooting

- **FFmpeg Location**: The app relies on `ffmpeg.exe`. Make sure the path in `burn.js` matches where FFmpeg is installed on your system. If FFmpeg is not found, you’ll see an `ENOENT` error.  
- **Escaping Paths**: Subtitle paths must be escaped correctly for FFmpeg’s filter graph. That’s why we copy the `.ass` file into `C:/subs/test.ass` and use the exact format:  
  ```
  -vf "ass=C\\:\\\\subs\\\\test.ass"
  ```
- **Automatic Directory Creation**: The app will automatically create `C:/subs` if it doesn’t exist, so you don’t need to set it up manually.  
- **Output File**: The burned video is always saved as `burned_test.mp4` in your Downloads folder.  
- **Permissions**: Ensure you have write access to `C:/subs` and your Downloads folder. If not, run the app with appropriate permissions.  
- **Common Errors**:
  - `ENOENT`: FFmpeg not found — check the path in `burn.js`.
  - `Unable to parse option value ... as image size`: Path escaping issue — confirm the `.ass` file is copied into `C:/subs/test.ass`. : [Check this stackoverflow answer](https://stackoverflow.com/questions/71597897/unable-to-parse-option-value-xxx-srt-as-image-size-in-ffmpeg)
  - `Burn failed`: Usually indicates FFmpeg couldn’t process the command — check logs for details.

---
