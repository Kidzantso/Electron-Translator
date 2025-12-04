const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

function escapeForFilterGraph(p) {
  return p
    .replace(/\\/g, "\\\\\\\\")   // \ → \\\\
    .replace(/:/g, "\\\\:")       // : → \\:
    .replace(/ /g, "\\\\ ");      // space → \\ 
}

function waitForFile(filePath, timeout = 3000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      if (fs.existsSync(filePath)) return resolve();
      if (Date.now() - start > timeout) return reject(new Error("ASS file not found after conversion"));
      setTimeout(check, 100);
    };
    check();
  });
}

async function burnSubtitles(videoPath, srtPath) {
  const ffmpegPath = path.join(__dirname, "ffmpeg", "bin", "ffmpeg.exe");

  // Convert SRT → ASS
  const assPath = srtPath.replace(/\.srt$/i, ".ass");
  await new Promise((resolve, reject) => {
    const convert = spawn(ffmpegPath, ["-y", "-i", srtPath, assPath]);
    convert.on("close", code => (code === 0 ? resolve() : reject(new Error("Conversion failed"))));
  });
  await waitForFile(assPath);

  // Ensure subs directory exists
  const subsDir = "C:/subs";
  if (!fs.existsSync(subsDir)) fs.mkdirSync(subsDir, { recursive: true });

  // Copy to safe file name
  const safeAss = path.join(subsDir, "test.ass");
  fs.copyFileSync(assPath, safeAss);

  // Escape for filter graph (double-escaped)
  const escapedAss = escapeForFilterGraph(safeAss);
  const filter = `ass=${escapedAss}`;

  // Output path fixed to burned_test.mp4
  const outPath = "C:/Users/dodom/Downloads/burned_test.mp4";

  // Build args with quotes
  const ffmpegArgs = [
    "-y",
    "-i", `"${videoPath.replace(/\\/g, "/")}"`,
    "-vf", `"${filter}"`,
    `"${outPath.replace(/\\/g, "/")}"`
  ];

  const fullCommand = `"${ffmpegPath}" ${ffmpegArgs.join(" ")}`;
  console.log("Executing:", fullCommand);

  await new Promise((resolve, reject) => {
    const ff = spawn(fullCommand, { shell: true });
    ff.stderr.on("data", d => console.log("ffmpeg:", d.toString()));
    ff.on("close", code => (code === 0 ? resolve() : reject(new Error("Burn failed"))));
  });

  return outPath;
}

module.exports = { burnSubtitles };
