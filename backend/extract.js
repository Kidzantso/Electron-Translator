const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const whisperDir = path.join(__dirname, "whisper");
const ffmpegDir = path.join(__dirname, "ffmpeg");

function extractAudio(videoPath) {
  return new Promise((resolve, reject) => {
    const audioPath = path.join(whisperDir, "temp_audio.wav");

    // FFmpeg is inside ffmpeg/bin
    const ffmpegExe = path.join(ffmpegDir, "bin", "ffmpeg.exe");
    const args = ["-i", videoPath, "-vn", "-ac", "1", "-ar", "16000", audioPath];

    const ffmpeg = spawn(ffmpegExe, args);

    ffmpeg.stderr.on("data", data => console.log(data.toString()));
    ffmpeg.on("close", code => {
      if (code === 0) resolve(audioPath);
      else reject(new Error("FFmpeg audio extraction failed"));
    });
  });
}

function runWhisper(audioPath) {
  return new Promise((resolve, reject) => {
    const whisperExe = path.join(whisperDir, "whisper-cli.exe");
    const modelPath = path.join(whisperDir, "models", "ggml-small.bin");
    const outputFolder = path.join(whisperDir, "output");

    if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder);

    const outputFile = path.join(outputFolder, "output");

    const args = [
      "--model", modelPath,
      "--file", audioPath,
      "--output-json",
      "--output-file", outputFile
    ];

    const proc = spawn(whisperExe, args, { cwd: whisperDir });

    proc.stdout.on("data", data => console.log(data.toString()));
    proc.stderr.on("data", data => console.error(data.toString()));

    proc.on("close", code => {
      if (code === 0) {
        const fullJsonPath = path.join(outputFolder, "output.json");
        const transcriptionPath = path.join(outputFolder, "transcription.json");

        // Read the full JSON and keep only transcription
        const raw = fs.readFileSync(fullJsonPath, "utf-8");
        const data = JSON.parse(raw);
        const transcriptionOnly = data.transcription;

        fs.writeFileSync(transcriptionPath, JSON.stringify(transcriptionOnly, null, 2), "utf-8");

        // Clean up temp audio
        if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);

        resolve(transcriptionPath); // return the clean transcription path
      } else {
        reject(new Error(`Whisper exited with code ${code}`));
      }
    });
  });
}

async function extractTranscriptFromVideo(videoPath) {
  try {
    const audioPath = await extractAudio(videoPath);
    const transcriptionJsonPath = await runWhisper(audioPath);
    return transcriptionJsonPath;
  } catch (err) {
    throw err;
  }
}

module.exports = { extractTranscriptFromVideo };
